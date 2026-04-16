import { notFound } from 'next/navigation';
import { getProjectById, getWorkItemsByProject, getAllQualityItems, getAllCategories } from '@/lib/db';
import ProjectDetailClient from './ProjectDetailClient';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, allItems, quality, categories] = await Promise.all([
    getProjectById(id),
    getWorkItemsByProject(id),
    getAllQualityItems(),
    getAllCategories(),
  ]);

  if (!project) notFound();

  const measures   = allItems.filter(w => w.type === 'measure');
  const actions    = allItems.filter(w => w.type === 'action');
  const tasks      = allItems.filter(w => w.type === 'task');
  const milestones = allItems.filter(w => w.type === 'milestone');
  const projectQuality = quality.filter(q => q.projectId === id);

  return (
    <ProjectDetailClient
      project={project}
      measures={measures}
      actions={actions}
      tasks={tasks}
      milestones={milestones}
      quality={projectQuality}
      categories={categories}
      allItems={allItems}
    />
  );
}
