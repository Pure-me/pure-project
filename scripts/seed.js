const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const dir = path.dirname(DB_PATH);

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

async function seed() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  const userId = id();
  const p1 = id(), p2 = id(), p3 = id();

  const db = {
    users: [
      {
        id: userId,
        name: 'Joeri',
        email: 'joltenfreiter@gmail.com',
        passwordHash,
        role: 'admin',
        createdAt: now(),
      }
    ],
    projects: [
      {
        id: p1, name: 'ISO 9001 Certificering', ownerId: userId, teamMembers: [],
        description: 'Implementatie van het kwaliteitsmanagementsysteem conform ISO 9001:2015',
        status: 'active', priority: 'high', progress: 65,
        startDate: '2026-01-01', endDate: '2026-06-30',
        tags: ['Kwaliteit', 'ISO', 'Certificering'],
        createdAt: now(), updatedAt: now(),
      },
      {
        id: p2, name: 'IT Infrastructuur Upgrade', ownerId: userId, teamMembers: [],
        description: 'Modernisering van de IT-infrastructuur inclusief cloud migratie',
        status: 'planning', priority: 'medium', progress: 20,
        startDate: '2026-03-01', endDate: '2026-12-31',
        tags: ['IT', 'Cloud', 'Infrastructuur'],
        createdAt: now(), updatedAt: now(),
      },
      {
        id: p3, name: 'Business Continuity Plan 2026', ownerId: userId, teamMembers: [],
        description: 'Opstellen en testen van het bedrijfscontinuïteitsplan',
        status: 'active', priority: 'critical', progress: 40,
        startDate: '2026-02-01', endDate: '2026-05-31',
        tags: ['BCM', 'Continuïteit', 'Risico'],
        createdAt: now(), updatedAt: now(),
      },
    ],
    tasks: [
      {
        id: id(), projectId: p1, title: 'Interne audit Q1 uitvoeren', description: 'Volledige interne audit conform ISO 9001 checklist',
        type: 'task', status: 'in_progress', priority: 'high',
        assigneeId: userId, reporterId: userId,
        dueDate: '2026-04-20', tags: ['Audit'], attachments: [],
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), projectId: p1, title: 'Managementreview voorbereiden', description: 'Agenda en input voor de managementreview bijeenkomst',
        type: 'action', status: 'todo', priority: 'medium',
        assigneeId: userId, reporterId: userId,
        dueDate: '2026-04-30', tags: ['Management'], attachments: [],
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), projectId: p2, title: 'Cloud provider selecteren', description: 'Offerteaanvraag bij Azure, AWS en Google Cloud',
        type: 'milestone', status: 'todo', priority: 'high',
        assigneeId: userId, reporterId: userId,
        dueDate: '2026-05-15', tags: ['Cloud'], attachments: [],
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), projectId: p3, title: 'BIA updaten voor alle processen', description: 'Business Impact Analyse updaten op basis van nieuwe bedrijfsprocessen',
        type: 'measure', status: 'review', priority: 'critical',
        assigneeId: userId, reporterId: userId,
        dueDate: '2026-04-10', tags: ['BIA', 'BCM'], attachments: [],
        createdAt: now(), updatedAt: now(),
      },
    ],
    documents: [
      {
        id: id(), projectId: p1, title: 'Kwaliteitshandboek v3.0', type: 'procedure',
        content: 'Kwaliteitshandboek conform ISO 9001:2015...', version: '3.0',
        status: 'approved', ownerId: userId, tags: ['ISO', 'Kwaliteit'],
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), projectId: p3, title: 'Business Continuity Plan', type: 'policy',
        content: 'BCP document...', version: '1.2',
        status: 'review', ownerId: userId, tags: ['BCM'],
        createdAt: now(), updatedAt: now(),
      },
    ],
    qualityItems: [
      {
        id: id(), projectId: p1, title: 'Documenten niet up-to-date in kwaliteitssysteem', type: 'non_conformity',
        status: 'open', severity: 'major', description: 'Meerdere werkinstructies zijn niet bijgewerkt na proceswijziging.',
        assigneeId: userId, dueDate: '2026-04-25',
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), projectId: p1, title: 'Automatische documentcontrole implementeren', type: 'improvement',
        status: 'in_progress', severity: 'minor', description: 'Implementeer automatische herinneringen voor documentrevisies.',
        assigneeId: userId, dueDate: '2026-05-31',
        createdAt: now(), updatedAt: now(),
      },
    ],
    bcmItems: [
      {
        id: id(), title: 'Uitval kritieke IT-systemen', type: 'risk',
        status: 'assessed', likelihood: 3, impact: 5,
        description: 'Volledige uitval van ERP-systeem door technisch falen of cyberaanval.',
        mitigationPlan: 'Redundante infrastructuur, dagelijkse backups, DR-plan getest elk kwartaal.',
        recoveryTimeObjective: '4 uur', recoveryPointObjective: '1 uur',
        ownerId: userId, reviewDate: '2026-06-30',
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), title: 'Brand in datacentrum', type: 'risk',
        status: 'mitigated', likelihood: 1, impact: 5,
        description: 'Branddoorbreken in het on-premise datacentrum.',
        mitigationPlan: 'Branddetectie, off-site backups, colocation overeenkomst.',
        recoveryTimeObjective: '24 uur', ownerId: userId, reviewDate: '2026-12-31',
        createdAt: now(), updatedAt: now(),
      },
      {
        id: id(), title: 'Kritieke leverancier valt weg', type: 'risk',
        status: 'identified', likelihood: 2, impact: 4,
        description: 'Primaire leverancier gaat failliet of kan niet meer leveren.',
        mitigationPlan: 'Alternatieve leveranciers geïdentificeerd, voorraadbuffer aangehouden.',
        ownerId: userId, reviewDate: '2026-09-30',
        createdAt: now(), updatedAt: now(),
      },
    ],
    notifications: [
      {
        id: id(), userId, title: 'Welkom bij Pure Project!',
        message: 'Je werkomgeving is klaar. Maak je eerste project aan of vraag de AI om een overzicht.',
        type: 'success', read: false,
        createdAt: now(),
      },
      {
        id: id(), userId, title: 'BIA review deadline nadert',
        message: 'De Business Impact Analyse voor "Business Continuity Plan 2026" moet worden afgerond.',
        type: 'warning', read: false,
        createdAt: now(),
      },
    ],
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log('✅ Database geseed!');
  console.log('📧 Login: joltenfreiter@gmail.com');
  console.log('🔑 Wachtwoord: admin123');
}

seed().catch(console.error);
