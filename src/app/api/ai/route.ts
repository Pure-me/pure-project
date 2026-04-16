import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getAllProjects, getAllWorkItems, getAllQualityItems, getAllBCMItems,
  getWorkItemById, getQualityItemById, getBCMItemById,
  getProjectById, updateWorkItem, updateQualityItem, updateBCMItem, addWorkItemComment,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });

  const { message } = await req.json();
  const msg = message.toLowerCase();

  // ─── COMMAND DETECTION: update via short ID ───────────────────────────────
  const shortIdPattern = /\b(PRJ|MES|ACT|TSK|MIL|NC|IMP|AUD|CAPA|KPI|BCM)-\d{3,}\b/gi;
  const foundIds = message.match(shortIdPattern);

  if (foundIds && foundIds.length > 0) {
    const shortId = foundIds[0].toUpperCase();
    const prefix = shortId.split('-')[0];

    const statusMap: Record<string, string> = {
      'todo': 'todo', 'te doen': 'todo',
      'bezig': 'in_progress', 'in behandeling': 'in_progress',
      'review': 'review', 'in review': 'review',
      'klaar': 'done', 'done': 'done', 'voltooid': 'done', 'afgerond': 'done',
      'geblokkeerd': 'blocked', 'blocked': 'blocked',
      'open': 'open', 'gesloten': 'closed', 'closed': 'closed',
      'gemitigeerd': 'mitigated', 'mitigated': 'mitigated',
      'beoordeeld': 'assessed', 'geïdentificeerd': 'identified', 'geaccepteerd': 'accepted',
    };

    const newStatus = Object.entries(statusMap).find(([keyword]) => msg.includes(keyword))?.[1];
    const isComment = msg.includes('opmerking') || msg.includes('comment') || msg.includes('noteer') || msg.includes('voeg toe');
    const commentText = isComment ? message.replace(/.*?(?:opmerking|comment|noteer|voeg toe)[^:]*:?\s*/i, '').trim() : null;

    // Look up by scanning all items for matching shortId
    if (['MES', 'ACT', 'TSK', 'MIL'].includes(prefix)) {
      const allItems = await getAllWorkItems();
      const item = allItems.find(i => i.shortId.toUpperCase() === shortId);
      if (!item) return NextResponse.json({ response: `❌ Item **${shortId}** niet gevonden.` });

      if (isComment && commentText) {
        await addWorkItemComment(item.id, user.id, user.name, commentText);
        return NextResponse.json({ response: `💬 Opmerking toegevoegd aan **${shortId} — ${item.title}**:\n"${commentText}"` });
      } else if (newStatus) {
        await updateWorkItem(item.id, { status: newStatus as 'todo' | 'in_progress' | 'review' | 'done' | 'blocked', ...(newStatus === 'done' ? { completedAt: new Date().toISOString() } : {}) });
        return NextResponse.json({ response: `✅ **${shortId} — ${item.title}** bijgewerkt naar status: **${newStatus}**` });
      } else {
        return NextResponse.json({ response: `🔍 **${shortId} — ${item.title}**\n\nType: ${item.type}\nStatus: ${item.status}\nPrioriteit: ${item.priority}\nDeadline: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString('nl-BE') : 'geen'}\nOpmerkingen: ${item.comments?.length ?? 0}` });
      }
    } else if (['NC', 'IMP', 'AUD', 'CAPA', 'KPI'].includes(prefix)) {
      const allQ = await getAllQualityItems();
      const item = allQ.find(i => i.shortId.toUpperCase() === shortId);
      if (!item) return NextResponse.json({ response: `❌ Kwaliteitsitem **${shortId}** niet gevonden.` });

      if (newStatus) {
        await updateQualityItem(item.id, { status: newStatus as 'open' | 'in_progress' | 'closed' | 'verified', ...(newStatus === 'closed' ? { closedAt: new Date().toISOString() } : {}) });
        return NextResponse.json({ response: `✅ **${shortId} — ${item.title}** bijgewerkt naar: **${newStatus}**` });
      } else {
        return NextResponse.json({ response: `🔍 **${shortId} — ${item.title}**\n\nType: ${item.type}\nStatus: ${item.status}\nPrioriteit: ${item.priority}\nDeadline: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString('nl-BE') : 'geen'}` });
      }
    } else if (prefix === 'BCM') {
      const allBCM = await getAllBCMItems();
      const item = allBCM.find(i => i.shortId.toUpperCase() === shortId);
      if (!item) return NextResponse.json({ response: `❌ BCM item **${shortId}** niet gevonden.` });

      if (newStatus) {
        await updateBCMItem(item.id, { status: newStatus as 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'closed' });
        return NextResponse.json({ response: `✅ **${shortId} — ${item.title}** bijgewerkt naar: **${newStatus}**` });
      } else {
        const score = (item.probability ?? 0) * (item.impact ?? 0);
        return NextResponse.json({ response: `🛡️ **${shortId} — ${item.title}**\n\nType: ${item.type}\nStatus: ${item.status}\nRisicoscore: ${score}/25` });
      }
    } else if (prefix === 'PRJ') {
      const allP = await getAllProjects();
      const project = allP.find(p => p.shortId.toUpperCase() === shortId);
      if (!project) return NextResponse.json({ response: `❌ Project **${shortId}** niet gevonden.` });
      return NextResponse.json({ response: `📋 **${shortId} — ${project.name}**\n\nStatus: ${project.status}\nVoortgang: ${project.progress}%\nEinddatum: ${project.endDate ? new Date(project.endDate).toLocaleDateString('nl-BE') : 'geen'}\n\nGa naar /dashboard/projects/${project.id} voor het volledige overzicht.` });
    }
  }

  // ─── REGULAR INTELLIGENCE ─────────────────────────────────────────────────
  const [projects, workItems, quality, bcm] = await Promise.all([
    getAllProjects(),
    getAllWorkItems(),
    getAllQualityItems(),
    getAllBCMItems(),
  ]);

  const activeProjects = projects.filter(p => p.status === 'active');
  const delayedProjects = projects.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.status === 'active');
  const overdueItems = workItems.filter(w => w.dueDate && new Date(w.dueDate) < new Date() && w.status !== 'done');
  const criticalItems = workItems.filter(w => w.priority === 'critical' && w.status !== 'done');
  const openQuality = quality.filter(q => q.status === 'open');
  const highRisks = bcm.filter(b => (b.probability ?? 0) * (b.impact ?? 0) >= 12 && b.status !== 'mitigated');

  let response = '';

  if (msg.includes('status') || msg.includes('overzicht') || msg.includes('samenvatting')) {
    response = `📊 **Pure Project Status Overzicht**\n\n`;
    response += `**Projecten:** ${projects.length} totaal · ${activeProjects.length} actief · ${delayedProjects.length} vertraagd\n`;
    response += `**Werk items:** ${workItems.length} totaal · ${overdueItems.length} te laat · ${criticalItems.length} kritiek\n`;
    response += `**Kwaliteit:** ${openQuality.length} open bevindingen\n`;
    response += `**Risico's:** ${highRisks.length} hoge risico's\n\n`;
    if (delayedProjects.length > 0) response += `⚠️ **Vertraagd:** ${delayedProjects.map(p => `${p.shortId} ${p.name}`).join(', ')}\n`;
    if (overdueItems.length > 0) response += `🔴 **Te laat:** ${overdueItems.slice(0, 3).map(w => `${w.shortId} ${w.title}`).join(', ')}${overdueItems.length > 3 ? ` +${overdueItems.length - 3}` : ''}\n`;
    if (!response.includes('⚠️') && !response.includes('🔴')) response += `✅ Alles loopt op schema!\n`;
    response += `\n💡 Gebruik een ID (bijv. "${workItems[0]?.shortId || 'ACT-001'}") om een item op te vragen of bij te werken.`;

  } else if (msg.includes('risico') || msg.includes('bcm') || msg.includes('continuïteit')) {
    response = `🛡️ **Business Continuity** — ${bcm.length} items · ${highRisks.length} hoog risico\n\n`;
    if (highRisks.length > 0) {
      response += highRisks.slice(0, 3).map(r => `🔴 **${r.shortId}** ${r.title} (score ${(r.probability ?? 0) * (r.impact ?? 0)}/25)`).join('\n');
      response += `\n\n💡 Gebruik "update ${highRisks[0]?.shortId} status naar gemitigeerd" om te updaten.`;
    } else response += `✅ Geen kritieke risico's.`;

  } else if (msg.includes('kwaliteit') || msg.includes('nc') || msg.includes('audit') || msg.includes('capa')) {
    response = `🔍 **Kwaliteitsmanagement** — ${quality.length} items · ${openQuality.length} open\n\n`;
    const crit = quality.filter(q => q.priority === 'critical' && q.status !== 'closed');
    if (crit.length > 0) {
      response += crit.map(q => `🔴 **${q.shortId}** ${q.title}`).join('\n');
      response += `\n\n💡 Gebruik "update ${crit[0]?.shortId} status naar in behandeling" om te starten.`;
    } else response += `✅ Geen kritieke kwaliteitsafwijkingen.`;

  } else if (msg.includes('project')) {
    response = `📋 **Projecten** — ${activeProjects.length} actief\n\n`;
    activeProjects.forEach(p => {
      const e = p.progress >= 75 ? '🟢' : p.progress >= 40 ? '🟡' : '🔴';
      response += `${e} **${p.shortId}** ${p.name} — ${p.progress}%\n`;
    });

  } else if (msg.includes('aanbevel') || msg.includes('advies') || msg.includes('wat moet')) {
    response = `🤖 **Pure AI Aanbevelingen voor vandaag**\n\n`;
    const s = [];
    if (overdueItems.length > 0) s.push(`📌 ${overdueItems.length} achterstallige items: begin bij ${overdueItems[0].shortId} — ${overdueItems[0].title}`);
    if (criticalItems.length > 0) s.push(`🔴 ${criticalItems.length} kritieke items wachten op opvolging`);
    if (openQuality.length > 2) s.push(`🔍 ${openQuality.length} open kwaliteitsitems`);
    if (highRisks.length > 0) s.push(`🛡️ ${highRisks.length} hoge risico's zonder mitigatie`);
    if (delayedProjects.length > 0) s.push(`⏰ ${delayedProjects[0].shortId} ${delayedProjects[0].name} is vertraagd — herplan einddatum`);
    if (s.length === 0) s.push('✅ Alles loopt prima!', '📊 Ideaal moment voor een kwaliteitsreview', '🎯 Overweeg een team stand-up');
    response += s.join('\n');

  } else {
    response = `Hallo ${user.name}! 👋\n\n`;
    response += `**${projects.length}** projecten · **${workItems.filter(w => w.status !== 'done').length}** open items · **${openQuality.length}** kwaliteitsitems · **${bcm.length}** BCM items\n\n`;
    response += `**Commando's die ik begrijp:**\n`;
    response += `• Vraag naar een item: "wat is de status van ${workItems[0]?.shortId || 'ACT-001'}?"\n`;
    response += `• Update status: "update ${workItems[0]?.shortId || 'ACT-001'} naar klaar"\n`;
    response += `• Voeg opmerking toe: "voeg opmerking toe aan ${workItems[0]?.shortId || 'TSK-001'}: verificatie gedaan"\n`;
    response += `• Vraag overzicht: "geef me een statusoverzicht"\n`;
    response += `• Aanbevelingen: "wat moet ik vandaag doen?"`;
  }

  // suppress unused import warnings
  void getWorkItemById; void getQualityItemById; void getBCMItemById; void getProjectById;

  return NextResponse.json({ response });
}
