import { getSession } from '@/lib/auth';
import { getAllProjects, getAllWorkItems, getAllQualityItems, getAllBCMItems } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const [projects, tasks, quality, bcm] = await Promise.all([
    getAllProjects(),
    getAllWorkItems(),
    getAllQualityItems(),
    getAllBCMItems(),
  ]);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: tasks.length,
    openTasks: tasks.filter(t => t.status !== 'done').length,
    overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    criticalTasks: tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length,
    openQuality: quality.filter(q => q.status === 'open').length,
    highRisks: bcm.filter(b => (b.probability ?? 0) * (b.impact ?? 0) >= 12 && b.status !== 'mitigated').length,
  };

  const recentProjects = projects.slice(0, 5);
  const urgentTasks = tasks
    .filter(t => t.status !== 'done' && (t.priority === 'critical' || t.priority === 'high'))
    .slice(0, 6);

  return (
    <DashboardClient
      user={{ name: user.name, role: user.role }}
      stats={stats}
      recentProjects={recentProjects}
      urgentTasks={urgentTasks}
    />
  );
}
