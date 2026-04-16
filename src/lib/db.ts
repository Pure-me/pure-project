/**
 * Pure Project — Database Layer
 * ─────────────────────────────
 * Backed by Supabase (PostgreSQL).
 * Falls back to JSON file if NEXT_PUBLIC_SUPABASE_URL is not set (local dev).
 *
 * All public functions are async and return typed results.
 */

import crypto from 'crypto';

// ─── Runtime detection ────────────────────────────────────────────────────────
const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co');

// Lazy-load to avoid crashing when Supabase env vars are absent
function getAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabaseAdmin } = require('./supabase');
  return supabaseAdmin;
}

// ─── Prefix mapping ───────────────────────────────────────────────────────────
export const SHORT_ID_PREFIX = {
  project: 'PRJ', measure: 'MES', action: 'ACT', task: 'TSK', milestone: 'MIL',
  non_conformity: 'NC', improvement: 'IMP', audit_finding: 'AUD', capa: 'CAPA',
  kpi: 'KPI', category: 'CAT', bcm: 'BCM',
} as const;

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  language?: 'nl' | 'en';
  createdAt: string;
}

export interface Category {
  id: string;
  shortId: string;
  name: string;
  type: 'workstream' | 'department' | 'other';
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  type?: 'comment' | 'status_change' | 'attachment';
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  shortId: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  categoryId?: string;
  ownerId: string;
  teamMembers: string[];
  startDate: string;
  endDate: string;
  progress: number;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkItem {
  id: string;
  shortId: string;
  type: 'measure' | 'action' | 'task' | 'milestone';
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  parentType?: 'project' | 'measure' | 'action' | 'non_conformity' | 'bcm';
  parentId?: string;
  linkedToType?: 'non_conformity' | 'bcm';
  linkedToId?: string;
  categoryId?: string;
  assigneeId?: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface QualityItem {
  id: string;
  shortId: string;
  type: 'non_conformity' | 'improvement' | 'audit_finding' | 'capa' | 'kpi';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'critical';
  categoryId?: string;
  projectId?: string;
  ownerId?: string;
  dueDate?: string;
  closedAt?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface BCMItem {
  id: string;
  shortId: string;
  type: 'risk' | 'threat' | 'continuity_plan' | 'recovery_plan' | 'exercise' | 'bcp_action';
  title: string;
  description: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  categoryId?: string;
  ownerId?: string;
  probability?: number;
  impact?: number;
  rtoHours?: number;
  rpoHours?: number;
  dueDate?: string;
  reviewDate?: string;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export type CAPASource = 'customer_complaint' | 'external_audit' | 'external_supplier' | 'incident' | 'internal_audit' | 'management_review' | 'process_issue' | 'reportable_event' | 'other';
export type CAPAStage = 'initiation' | 'risk_assessment' | 'correction' | 'rca' | 'action_plan' | 'verification' | 'closure';
export type CAPAStatus = 'open' | 'in_progress' | 'verification' | 'closed' | 'unsuccessful';

export interface CAPAAction {
  id: string;
  description: string;
  ownerName: string;
  ownerJobTitle?: string;
  dueDate: string;
  completedDate?: string;
  status: 'open' | 'in_progress' | 'completed';
}

export interface VerificationCheck {
  checkNumber: 1 | 2 | 3;
  description: string;
  method: string;
  methodOther?: string;
  dateDone?: string;
  verdict?: 'ok' | 'not_ok';
  notes?: string;
}

export interface CAPA {
  id: string;
  shortId: string;
  stage: CAPAStage;
  status: CAPAStatus;
  initiationDate: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedByJobTitle: string;
  department: string;
  scope: string;
  categoryId?: string;
  source: CAPASource;
  sourceReference: string;
  sourceOtherDescription?: string;
  nonconformityDescription: string;
  ownerName: string;
  ownerJobTitle: string;
  assignmentDate: string;
  planDueDate: string;
  capaTeam: string;
  riskCustomer: string;
  riskCompany: string;
  riskProcess: string;
  correction: string;
  correctionDueDate?: string;
  rcaMethods: string[];
  rcaMethodOther?: string;
  rcaDescription: string;
  rootCause: string;
  actionPlanType: 'corrective' | 'preventive' | '';
  actions: CAPAAction[];
  verificationPlan: string;
  verificationResponsibleName: string;
  verificationStartDate?: string;
  verificationChecks: VerificationCheck[];
  conclusion: string;
  validationConfirmed: boolean;
  isSuccessful?: boolean;
  newCapaId?: string;
  closureDate?: string;
  closedByName?: string;
  closedByJobTitle?: string;
  comments: Comment[];
  attachments: Attachment[];
  linkedQualityItemId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}

// ─── ID generation ────────────────────────────────────────────────────────────
export function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Supabase row mappers ─────────────────────────────────────────────────────
// Convert snake_case DB rows → camelCase app types

function mapProfile(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    passwordHash: '', // not exposed from Supabase profiles
    role: row.role as User['role'],
    avatar: row.avatar_url as string | undefined,
    language: (row.language as 'nl' | 'en') || 'nl',
    createdAt: row.created_at as string,
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    shortId: row.short_id as string,
    name: row.name as string,
    type: row.type as Category['type'],
    color: row.color as string,
    description: row.description as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapProject(row: Record<string, unknown>, comments: Comment[] = [], attachments: Attachment[] = []): Project {
  return {
    id: row.id as string,
    shortId: row.short_id as string,
    name: row.name as string,
    description: row.description as string || '',
    status: row.status as Project['status'],
    priority: row.priority as Project['priority'],
    categoryId: row.category_id as string | undefined,
    ownerId: row.owner_id as string || '',
    teamMembers: (row.team_members as string[]) || [],
    startDate: row.start_date as string || '',
    endDate: row.end_date as string || '',
    progress: row.progress as number || 0,
    tags: (row.tags as string[]) || [],
    comments,
    attachments,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapWorkItem(row: Record<string, unknown>, comments: Comment[] = [], attachments: Attachment[] = []): WorkItem {
  return {
    id: row.id as string,
    shortId: row.short_id as string,
    type: row.type as WorkItem['type'],
    title: row.title as string,
    description: row.description as string || '',
    status: row.status as WorkItem['status'],
    priority: row.priority as WorkItem['priority'],
    projectId: row.project_id as string | undefined,
    parentType: row.parent_type as WorkItem['parentType'],
    parentId: row.parent_id as string | undefined,
    linkedToType: row.linked_to_type as WorkItem['linkedToType'],
    linkedToId: row.linked_to_id as string | undefined,
    categoryId: row.category_id as string | undefined,
    assigneeId: row.assignee_id as string | undefined,
    dueDate: row.due_date as string | undefined,
    completedAt: row.completed_at as string | undefined,
    tags: (row.tags as string[]) || [],
    comments,
    attachments,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapQualityItem(row: Record<string, unknown>, comments: Comment[] = [], attachments: Attachment[] = []): QualityItem {
  return {
    id: row.id as string,
    shortId: row.short_id as string,
    type: row.type as QualityItem['type'],
    title: row.title as string,
    description: row.description as string || '',
    status: row.status as QualityItem['status'],
    priority: row.priority as QualityItem['priority'],
    categoryId: row.category_id as string | undefined,
    projectId: row.project_id as string | undefined,
    ownerId: row.owner_id as string | undefined,
    dueDate: row.due_date as string | undefined,
    closedAt: row.closed_at as string | undefined,
    rootCause: row.root_cause as string | undefined,
    correctiveAction: row.corrective_action as string | undefined,
    preventiveAction: row.preventive_action as string | undefined,
    tags: (row.tags as string[]) || [],
    comments,
    attachments,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapBCMItem(row: Record<string, unknown>, comments: Comment[] = [], attachments: Attachment[] = []): BCMItem {
  return {
    id: row.id as string,
    shortId: row.short_id as string,
    type: row.type as BCMItem['type'],
    title: row.title as string,
    description: row.description as string || '',
    status: row.status as BCMItem['status'],
    priority: row.priority as BCMItem['priority'],
    categoryId: row.category_id as string | undefined,
    ownerId: row.owner_id as string | undefined,
    probability: row.probability as number | undefined,
    impact: row.impact as number | undefined,
    rtoHours: row.rto_hours as number | undefined,
    rpoHours: row.rpo_hours as number | undefined,
    dueDate: row.due_date as string | undefined,
    reviewDate: row.review_date as string | undefined,
    tags: (row.tags as string[]) || [],
    comments,
    attachments,
    link: row.link as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapComment(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    authorId: row.author_id as string || '',
    authorName: row.author_name as string || '',
    text: row.text as string,
    type: (row.type as Comment['type']) || 'comment',
    createdAt: row.created_at as string,
  };
}

function mapAttachment(row: Record<string, unknown>): Attachment {
  return {
    id: row.id as string,
    filename: row.filename as string,
    storedName: row.stored_name as string,
    mimeType: row.mime_type as string,
    size: row.size_bytes as number || 0,
    url: row.url as string,
    uploadedBy: row.uploaded_by as string || '',
    uploadedByName: row.uploaded_by_name as string || '',
    createdAt: row.created_at as string,
  };
}

function mapCAPAAction(row: Record<string, unknown>): CAPAAction {
  return {
    id: row.id as string,
    description: row.description as string || '',
    ownerName: row.owner_name as string || '',
    ownerJobTitle: row.owner_job_title as string | undefined,
    dueDate: row.due_date as string || '',
    completedDate: row.completed_date as string | undefined,
    status: row.status as CAPAAction['status'],
  };
}

function mapVerificationCheck(row: Record<string, unknown>): VerificationCheck {
  return {
    checkNumber: row.check_number as 1 | 2 | 3,
    description: row.description as string || '',
    method: row.method as string || 'meeting',
    methodOther: row.method_other as string | undefined,
    dateDone: row.date_done as string | undefined,
    verdict: row.verdict as VerificationCheck['verdict'],
    notes: row.notes as string | undefined,
  };
}

function mapCAPA(
  row: Record<string, unknown>,
  actions: CAPAAction[] = [],
  checks: VerificationCheck[] = [],
  comments: Comment[] = [],
  attachments: Attachment[] = []
): CAPA {
  return {
    id: row.id as string,
    shortId: row.short_id as string,
    stage: row.stage as CAPAStage,
    status: row.status as CAPAStatus,
    initiationDate: row.initiation_date as string || '',
    initiatedBy: row.initiated_by as string || '',
    initiatedByName: row.initiated_by_name as string || '',
    initiatedByJobTitle: row.initiated_by_job_title as string || '',
    department: row.department as string || '',
    scope: row.scope as string || '',
    categoryId: row.category_id as string | undefined,
    source: row.source as CAPASource,
    sourceReference: row.source_reference as string || '',
    sourceOtherDescription: row.source_other_description as string | undefined,
    nonconformityDescription: row.nonconformity_description as string || '',
    ownerName: row.owner_name as string || '',
    ownerJobTitle: row.owner_job_title as string || '',
    assignmentDate: row.assignment_date as string || '',
    planDueDate: row.plan_due_date as string || '',
    capaTeam: row.capa_team as string || '',
    riskCustomer: row.risk_customer as string || '',
    riskCompany: row.risk_company as string || '',
    riskProcess: row.risk_process as string || '',
    correction: row.correction as string || '',
    correctionDueDate: row.correction_due_date as string | undefined,
    rcaMethods: (row.rca_methods as string[]) || [],
    rcaMethodOther: row.rca_method_other as string | undefined,
    rcaDescription: row.rca_description as string || '',
    rootCause: row.root_cause as string || '',
    actionPlanType: (row.action_plan_type as CAPA['actionPlanType']) || '',
    actions,
    verificationPlan: row.verification_plan as string || '',
    verificationResponsibleName: row.verification_responsible_name as string || '',
    verificationStartDate: row.verification_start_date as string | undefined,
    verificationChecks: checks.length > 0 ? checks : [
      { checkNumber: 1, description: '', method: 'meeting' },
      { checkNumber: 2, description: '', method: 'meeting' },
      { checkNumber: 3, description: '', method: 'meeting' },
    ],
    conclusion: row.conclusion as string || '',
    validationConfirmed: row.validation_confirmed as boolean || false,
    isSuccessful: row.is_successful as boolean | undefined,
    newCapaId: row.new_capa_id as string | undefined,
    closureDate: row.closure_date as string | undefined,
    closedByName: row.closed_by_name as string | undefined,
    closedByJobTitle: row.closed_by_job_title as string | undefined,
    comments,
    attachments,
    linkedQualityItemId: row.linked_quality_item_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Short ID helper ──────────────────────────────────────────────────────────
async function nextShortId(prefix: string): Promise<string> {
  const db = getAdmin();
  const { data, error } = await db.rpc('next_short_id', { prefix });
  if (error) throw new Error(`Short ID generation failed: ${error.message}`);
  return data as string;
}

// ─── Comments & Attachments helper ───────────────────────────────────────────
async function getComments(entityType: string, entityId: string): Promise<Comment[]> {
  const db = getAdmin();
  const { data } = await db
    .from('comments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: true });
  return (data || []).map(mapComment);
}

async function getAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
  const db = getAdmin();
  const { data } = await db
    .from('attachments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: true });
  return (data || []).map(mapAttachment);
}

// ─── ══════════════════════════════════════════════════════════════════════════
// ─── USER FUNCTIONS
// ─── ══════════════════════════════════════════════════════════════════════════

export async function getAllUsers(): Promise<User[]> {
  const db = getAdmin();
  const { data, error } = await db.from('profiles').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(mapProfile);
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getAdmin();
  const { data } = await db.from('profiles').select('*').eq('id', id).single();
  return data ? mapProfile(data) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getAdmin();
  const { data } = await db.from('profiles').select('*').eq('email', email).single();
  return data ? mapProfile(data) : null;
}

export async function createUser(userData: { name: string; email: string; passwordHash: string; role: User['role'] }): Promise<User> {
  // In Supabase mode, user creation goes via Auth signup
  // This function is kept for compatibility but delegates to Supabase Auth
  const db = getAdmin();
  // Create auth user
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email: userData.email,
    password: userData.passwordHash, // caller should pass plain password in Supabase mode
    email_confirm: true,
    user_metadata: { name: userData.name, role: userData.role },
  });
  if (authError) throw authError;
  // Profile is auto-created by trigger
  const profile = await findUserById(authData.user.id);
  if (!profile) throw new Error('Profile creation failed');
  return profile;
}

export async function updateUserLanguage(userId: string, language: 'nl' | 'en'): Promise<void> {
  const db = getAdmin();
  await db.from('profiles').update({ language }).eq('id', userId);
}

// ─── CATEGORY FUNCTIONS ───────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const db = getAdmin();
  const { data, error } = await db.from('categories').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapCategory);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getAdmin();
  const { data } = await db.from('categories').select('*').eq('id', id).single();
  return data ? mapCategory(data) : null;
}

export async function createCategory(input: Omit<Category, 'id' | 'shortId' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const db = getAdmin();
  const shortId = await nextShortId('CAT');
  const { data, error } = await db.from('categories').insert({
    short_id: shortId,
    name: input.name,
    type: input.type,
    color: input.color,
    description: input.description || null,
  }).select().single();
  if (error) throw error;
  return mapCategory(data);
}

export async function updateCategory(id: string, input: Partial<Category>): Promise<Category | null> {
  const db = getAdmin();
  const { data, error } = await db.from('categories').update({
    ...(input.name && { name: input.name }),
    ...(input.type && { type: input.type }),
    ...(input.color && { color: input.color }),
    ...(input.description !== undefined && { description: input.description }),
  }).eq('id', id).select().single();
  if (error) throw error;
  return data ? mapCategory(data) : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = getAdmin();
  const { error } = await db.from('categories').delete().eq('id', id);
  return !error;
}

// ─── PROJECT FUNCTIONS ────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const db = getAdmin();
  const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const projects: Project[] = [];
  for (const row of data || []) {
    const [comments, attachments] = await Promise.all([
      getComments('project', row.id),
      getAttachments('project', row.id),
    ]);
    projects.push(mapProject(row, comments, attachments));
  }
  return projects;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = getAdmin();
  const { data } = await db.from('projects').select('*').eq('id', id).single();
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('project', id),
    getAttachments('project', id),
  ]);
  return mapProject(data, comments, attachments);
}

export async function createProject(input: Omit<Project, 'id' | 'shortId' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>): Promise<Project> {
  const db = getAdmin();
  const shortId = await nextShortId('PRJ');
  const { data, error } = await db.from('projects').insert({
    short_id: shortId,
    name: input.name,
    description: input.description || '',
    status: input.status || 'planning',
    priority: input.priority || 'medium',
    category_id: input.categoryId || null,
    owner_id: input.ownerId || null,
    team_members: input.teamMembers || [],
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    progress: input.progress || 0,
    tags: input.tags || [],
  }).select().single();
  if (error) throw error;
  return mapProject(data, [], []);
}

export async function updateProject(id: string, input: Partial<Project>): Promise<Project | null> {
  const db = getAdmin();
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) update.status = input.status;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.categoryId !== undefined) update.category_id = input.categoryId || null;
  if (input.ownerId !== undefined) update.owner_id = input.ownerId || null;
  if (input.teamMembers !== undefined) update.team_members = input.teamMembers;
  if (input.startDate !== undefined) update.start_date = input.startDate || null;
  if (input.endDate !== undefined) update.end_date = input.endDate || null;
  if (input.progress !== undefined) update.progress = input.progress;
  if (input.tags !== undefined) update.tags = input.tags;
  const { data, error } = await db.from('projects').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('project', id),
    getAttachments('project', id),
  ]);
  return mapProject(data, comments, attachments);
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = getAdmin();
  const { error } = await db.from('projects').delete().eq('id', id);
  return !error;
}

// ─── WORK ITEM FUNCTIONS ──────────────────────────────────────────────────────

export async function getAllWorkItems(): Promise<WorkItem[]> {
  const db = getAdmin();
  const { data, error } = await db.from('work_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const items: WorkItem[] = [];
  for (const row of data || []) {
    const [comments, attachments] = await Promise.all([
      getComments('work_item', row.id),
      getAttachments('work_item', row.id),
    ]);
    items.push(mapWorkItem(row, comments, attachments));
  }
  return items;
}

export async function getWorkItemsByProject(projectId: string): Promise<WorkItem[]> {
  const db = getAdmin();
  const { data, error } = await db.from('work_items').select('*').eq('project_id', projectId).order('created_at');
  if (error) throw error;
  const items: WorkItem[] = [];
  for (const row of data || []) {
    const [comments, attachments] = await Promise.all([
      getComments('work_item', row.id),
      getAttachments('work_item', row.id),
    ]);
    items.push(mapWorkItem(row, comments, attachments));
  }
  return items;
}

export async function getWorkItemById(id: string): Promise<WorkItem | null> {
  const db = getAdmin();
  const { data } = await db.from('work_items').select('*').eq('id', id).single();
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('work_item', id),
    getAttachments('work_item', id),
  ]);
  return mapWorkItem(data, comments, attachments);
}

export async function createWorkItem(input: Omit<WorkItem, 'id' | 'shortId' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>): Promise<WorkItem> {
  const db = getAdmin();
  const prefixMap: Record<string, string> = { measure: 'MES', action: 'ACT', task: 'TSK', milestone: 'MIL' };
  const shortId = await nextShortId(prefixMap[input.type] || 'TSK');
  const { data, error } = await db.from('work_items').insert({
    short_id: shortId,
    type: input.type,
    title: input.title,
    description: input.description || '',
    status: input.status || 'todo',
    priority: input.priority || 'medium',
    project_id: input.projectId || null,
    parent_type: input.parentType || null,
    parent_id: input.parentId || null,
    linked_to_type: input.linkedToType || null,
    linked_to_id: input.linkedToId || null,
    category_id: input.categoryId || null,
    assignee_id: input.assigneeId || null,
    due_date: input.dueDate || null,
    tags: input.tags || [],
  }).select().single();
  if (error) throw error;
  return mapWorkItem(data, [], []);
}

export async function updateWorkItem(id: string, input: Partial<WorkItem>): Promise<WorkItem | null> {
  const db = getAdmin();
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) update.status = input.status;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.projectId !== undefined) update.project_id = input.projectId || null;
  if (input.parentType !== undefined) update.parent_type = input.parentType || null;
  if (input.parentId !== undefined) update.parent_id = input.parentId || null;
  if (input.categoryId !== undefined) update.category_id = input.categoryId || null;
  if (input.assigneeId !== undefined) update.assignee_id = input.assigneeId || null;
  if (input.dueDate !== undefined) update.due_date = input.dueDate || null;
  if (input.completedAt !== undefined) update.completed_at = input.completedAt || null;
  if (input.tags !== undefined) update.tags = input.tags;
  const { data, error } = await db.from('work_items').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('work_item', id),
    getAttachments('work_item', id),
  ]);
  return mapWorkItem(data, comments, attachments);
}

export async function deleteWorkItem(id: string): Promise<boolean> {
  const db = getAdmin();
  const { error } = await db.from('work_items').delete().eq('id', id);
  return !error;
}

// ─── QUALITY ITEM FUNCTIONS ───────────────────────────────────────────────────

export async function getAllQualityItems(): Promise<QualityItem[]> {
  const db = getAdmin();
  const { data, error } = await db.from('quality_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const items: QualityItem[] = [];
  for (const row of data || []) {
    const [comments, attachments] = await Promise.all([
      getComments('quality_item', row.id),
      getAttachments('quality_item', row.id),
    ]);
    items.push(mapQualityItem(row, comments, attachments));
  }
  return items;
}

export async function getQualityItemById(id: string): Promise<QualityItem | null> {
  const db = getAdmin();
  const { data } = await db.from('quality_items').select('*').eq('id', id).single();
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('quality_item', id),
    getAttachments('quality_item', id),
  ]);
  return mapQualityItem(data, comments, attachments);
}

export async function createQualityItem(input: Omit<QualityItem, 'id' | 'shortId' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>): Promise<QualityItem> {
  const db = getAdmin();
  const prefixMap: Record<string, string> = { non_conformity: 'NC', improvement: 'IMP', audit_finding: 'AUD', capa: 'CAPA', kpi: 'KPI' };
  const shortId = await nextShortId(prefixMap[input.type] || 'NC');
  const { data, error } = await db.from('quality_items').insert({
    short_id: shortId,
    type: input.type,
    title: input.title,
    description: input.description || '',
    status: input.status || 'open',
    priority: input.priority || 'medium',
    category_id: input.categoryId || null,
    project_id: input.projectId || null,
    owner_id: input.ownerId || null,
    due_date: input.dueDate || null,
    root_cause: input.rootCause || null,
    corrective_action: input.correctiveAction || null,
    preventive_action: input.preventiveAction || null,
    tags: input.tags || [],
  }).select().single();
  if (error) throw error;
  return mapQualityItem(data, [], []);
}

export async function updateQualityItem(id: string, input: Partial<QualityItem>): Promise<QualityItem | null> {
  const db = getAdmin();
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) {
    update.status = input.status;
    if (input.status === 'closed' || input.status === 'verified') update.closed_at = now();
  }
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.categoryId !== undefined) update.category_id = input.categoryId || null;
  if (input.projectId !== undefined) update.project_id = input.projectId || null;
  if (input.ownerId !== undefined) update.owner_id = input.ownerId || null;
  if (input.dueDate !== undefined) update.due_date = input.dueDate || null;
  if (input.rootCause !== undefined) update.root_cause = input.rootCause;
  if (input.correctiveAction !== undefined) update.corrective_action = input.correctiveAction;
  if (input.preventiveAction !== undefined) update.preventive_action = input.preventiveAction;
  if (input.tags !== undefined) update.tags = input.tags;
  const { data, error } = await db.from('quality_items').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('quality_item', id),
    getAttachments('quality_item', id),
  ]);
  return mapQualityItem(data, comments, attachments);
}

export async function deleteQualityItem(id: string): Promise<boolean> {
  const db = getAdmin();
  const { error } = await db.from('quality_items').delete().eq('id', id);
  return !error;
}

// ─── BCM ITEM FUNCTIONS ───────────────────────────────────────────────────────

export async function getAllBCMItems(): Promise<BCMItem[]> {
  const db = getAdmin();
  const { data, error } = await db.from('bcm_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const items: BCMItem[] = [];
  for (const row of data || []) {
    const [comments, attachments] = await Promise.all([
      getComments('bcm_item', row.id),
      getAttachments('bcm_item', row.id),
    ]);
    items.push(mapBCMItem(row, comments, attachments));
  }
  return items;
}

export async function getBCMItemById(id: string): Promise<BCMItem | null> {
  const db = getAdmin();
  const { data } = await db.from('bcm_items').select('*').eq('id', id).single();
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('bcm_item', id),
    getAttachments('bcm_item', id),
  ]);
  return mapBCMItem(data, comments, attachments);
}

export async function createBCMItem(input: Omit<BCMItem, 'id' | 'shortId' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>): Promise<BCMItem> {
  const db = getAdmin();
  const shortId = await nextShortId('BCM');
  const { data, error } = await db.from('bcm_items').insert({
    short_id: shortId,
    type: input.type,
    title: input.title,
    description: input.description || '',
    status: input.status || 'identified',
    priority: input.priority || 'medium',
    category_id: input.categoryId || null,
    owner_id: input.ownerId || null,
    probability: input.probability || null,
    impact: input.impact || null,
    rto_hours: input.rtoHours || null,
    rpo_hours: input.rpoHours || null,
    due_date: input.dueDate || null,
    review_date: input.reviewDate || null,
    tags: input.tags || [],
    link: input.link || null,
  }).select().single();
  if (error) throw error;
  return mapBCMItem(data, [], []);
}

export async function updateBCMItem(id: string, input: Partial<BCMItem>): Promise<BCMItem | null> {
  const db = getAdmin();
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) update.status = input.status;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.probability !== undefined) update.probability = input.probability;
  if (input.impact !== undefined) update.impact = input.impact;
  if (input.rtoHours !== undefined) update.rto_hours = input.rtoHours;
  if (input.rpoHours !== undefined) update.rpo_hours = input.rpoHours;
  if (input.dueDate !== undefined) update.due_date = input.dueDate || null;
  if (input.reviewDate !== undefined) update.review_date = input.reviewDate || null;
  if (input.link !== undefined) update.link = input.link || null;
  if (input.tags !== undefined) update.tags = input.tags;
  const { data, error } = await db.from('bcm_items').update(update).eq('id', id).select().single();
  if (error) throw error;
  if (!data) return null;
  const [comments, attachments] = await Promise.all([
    getComments('bcm_item', id),
    getAttachments('bcm_item', id),
  ]);
  return mapBCMItem(data, comments, attachments);
}

export async function deleteBCMItem(id: string): Promise<boolean> {
  const db = getAdmin();
  const { error } = await db.from('bcm_items').delete().eq('id', id);
  return !error;
}

// ─── CAPA FUNCTIONS ───────────────────────────────────────────────────────────

export async function getAllCAPAs(): Promise<CAPA[]> {
  const db = getAdmin();
  const { data, error } = await db.from('capas').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const capas: CAPA[] = [];
  for (const row of data || []) {
    const [actions, checks, comments, attachments] = await Promise.all([
      db.from('capa_actions').select('*').eq('capa_id', row.id).order('sort_order').then((r: {data: unknown[] | null}) => (r.data || []).map(a => mapCAPAAction(a as Record<string, unknown>))),
      db.from('capa_verification_checks').select('*').eq('capa_id', row.id).order('check_number').then((r: {data: unknown[] | null}) => (r.data || []).map(c => mapVerificationCheck(c as Record<string, unknown>))),
      getComments('capa', row.id),
      getAttachments('capa', row.id),
    ]);
    capas.push(mapCAPA(row, actions, checks, comments, attachments));
  }
  return capas;
}

export async function getCAPAById(id: string): Promise<CAPA | null> {
  const db = getAdmin();
  const { data } = await db.from('capas').select('*').eq('id', id).single();
  if (!data) return null;
  const [actions, checks, comments, attachments] = await Promise.all([
    db.from('capa_actions').select('*').eq('capa_id', id).order('sort_order').then((r: {data: unknown[] | null}) => (r.data || []).map(a => mapCAPAAction(a as Record<string, unknown>))),
    db.from('capa_verification_checks').select('*').eq('capa_id', id).order('check_number').then((r: {data: unknown[] | null}) => (r.data || []).map(c => mapVerificationCheck(c as Record<string, unknown>))),
    getComments('capa', id),
    getAttachments('capa', id),
  ]);
  return mapCAPA(data, actions, checks, comments, attachments);
}

export async function createCAPA(input: Omit<CAPA, 'id' | 'shortId' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'actions' | 'verificationChecks'>): Promise<CAPA> {
  const db = getAdmin();
  const shortId = await nextShortId('CAPAF');
  const year = new Date().getFullYear();
  const seq = shortId.split('-').pop() || '001';
  const sourceRef = input.sourceReference || `CAPA-${year}-${seq}`;

  const { data, error } = await db.from('capas').insert({
    short_id: shortId,
    stage: input.stage || 'initiation',
    status: input.status || 'open',
    initiation_date: input.initiationDate || new Date().toISOString().split('T')[0],
    initiated_by: input.initiatedBy || null,
    initiated_by_name: input.initiatedByName || '',
    initiated_by_job_title: input.initiatedByJobTitle || '',
    department: input.department || '',
    scope: input.scope || '',
    category_id: input.categoryId || null,
    source: input.source || 'internal_audit',
    source_reference: sourceRef,
    source_other_description: input.sourceOtherDescription || null,
    nonconformity_description: input.nonconformityDescription || '',
    owner_name: input.ownerName || '',
    owner_job_title: input.ownerJobTitle || '',
    assignment_date: input.assignmentDate || null,
    plan_due_date: input.planDueDate || null,
    capa_team: input.capaTeam || '',
    risk_customer: '', risk_company: '', risk_process: '',
    correction: '', rca_methods: [], rca_description: '',
    root_cause: '', action_plan_type: '',
    verification_plan: '', verification_responsible_name: '',
    conclusion: '', validation_confirmed: false,
  }).select().single();
  if (error) throw error;

  // Insert default verification checks
  await db.from('capa_verification_checks').insert([
    { capa_id: data.id, check_number: 1, description: '', method: 'meeting' },
    { capa_id: data.id, check_number: 2, description: '', method: 'meeting' },
    { capa_id: data.id, check_number: 3, description: '', method: 'meeting' },
  ]);

  return mapCAPA(data, [], [
    { checkNumber: 1, description: '', method: 'meeting' },
    { checkNumber: 2, description: '', method: 'meeting' },
    { checkNumber: 3, description: '', method: 'meeting' },
  ], [], []);
}

export async function updateCAPA(id: string, input: Partial<CAPA>): Promise<CAPA | null> {
  const db = getAdmin();

  // Handle CAPA actions separately
  if (input.actions !== undefined) {
    await db.from('capa_actions').delete().eq('capa_id', id);
    if (input.actions.length > 0) {
      await db.from('capa_actions').insert(
        input.actions.map((a, i) => ({
          id: a.id || generateId(),
          capa_id: id,
          description: a.description,
          owner_name: a.ownerName,
          owner_job_title: a.ownerJobTitle || null,
          due_date: a.dueDate || null,
          completed_date: a.completedDate || null,
          status: a.status,
          sort_order: i,
        }))
      );
    }
  }

  // Handle verification checks separately
  if (input.verificationChecks !== undefined) {
    for (const check of input.verificationChecks) {
      await db.from('capa_verification_checks').upsert({
        capa_id: id,
        check_number: check.checkNumber,
        description: check.description || '',
        method: check.method || 'meeting',
        method_other: check.methodOther || null,
        date_done: check.dateDone || null,
        verdict: check.verdict || null,
        notes: check.notes || null,
      }, { onConflict: 'capa_id,check_number' });
    }
  }

  // Update main CAPA fields
  const update: Record<string, unknown> = {};
  if (input.stage !== undefined) update.stage = input.stage;
  if (input.status !== undefined) update.status = input.status;
  if (input.initiationDate !== undefined) update.initiation_date = input.initiationDate;
  if (input.initiatedByName !== undefined) update.initiated_by_name = input.initiatedByName;
  if (input.initiatedByJobTitle !== undefined) update.initiated_by_job_title = input.initiatedByJobTitle;
  if (input.department !== undefined) update.department = input.department;
  if (input.scope !== undefined) update.scope = input.scope;
  if (input.categoryId !== undefined) update.category_id = input.categoryId || null;
  if (input.source !== undefined) update.source = input.source;
  if (input.sourceReference !== undefined) update.source_reference = input.sourceReference;
  if (input.sourceOtherDescription !== undefined) update.source_other_description = input.sourceOtherDescription || null;
  if (input.nonconformityDescription !== undefined) update.nonconformity_description = input.nonconformityDescription;
  if (input.ownerName !== undefined) update.owner_name = input.ownerName;
  if (input.ownerJobTitle !== undefined) update.owner_job_title = input.ownerJobTitle;
  if (input.assignmentDate !== undefined) update.assignment_date = input.assignmentDate || null;
  if (input.planDueDate !== undefined) update.plan_due_date = input.planDueDate || null;
  if (input.capaTeam !== undefined) update.capa_team = input.capaTeam;
  if (input.riskCustomer !== undefined) update.risk_customer = input.riskCustomer;
  if (input.riskCompany !== undefined) update.risk_company = input.riskCompany;
  if (input.riskProcess !== undefined) update.risk_process = input.riskProcess;
  if (input.correction !== undefined) update.correction = input.correction;
  if (input.correctionDueDate !== undefined) update.correction_due_date = input.correctionDueDate || null;
  if (input.rcaMethods !== undefined) update.rca_methods = input.rcaMethods;
  if (input.rcaMethodOther !== undefined) update.rca_method_other = input.rcaMethodOther || null;
  if (input.rcaDescription !== undefined) update.rca_description = input.rcaDescription;
  if (input.rootCause !== undefined) update.root_cause = input.rootCause;
  if (input.actionPlanType !== undefined) update.action_plan_type = input.actionPlanType;
  if (input.verificationPlan !== undefined) update.verification_plan = input.verificationPlan;
  if (input.verificationResponsibleName !== undefined) update.verification_responsible_name = input.verificationResponsibleName;
  if (input.verificationStartDate !== undefined) update.verification_start_date = input.verificationStartDate || null;
  if (input.conclusion !== undefined) update.conclusion = input.conclusion;
  if (input.validationConfirmed !== undefined) update.validation_confirmed = input.validationConfirmed;
  if (input.isSuccessful !== undefined) update.is_successful = input.isSuccessful;
  if (input.newCapaId !== undefined) update.new_capa_id = input.newCapaId || null;
  if (input.closureDate !== undefined) update.closure_date = input.closureDate || null;
  if (input.closedByName !== undefined) update.closed_by_name = input.closedByName || null;
  if (input.closedByJobTitle !== undefined) update.closed_by_job_title = input.closedByJobTitle || null;
  if (input.linkedQualityItemId !== undefined) update.linked_quality_item_id = input.linkedQualityItemId || null;

  if (Object.keys(update).length > 0) {
    const { error } = await db.from('capas').update(update).eq('id', id);
    if (error) throw error;
  }

  return getCAPAById(id);
}

// ─── COMMENT FUNCTIONS ────────────────────────────────────────────────────────

export async function addComment(
  entityType: 'project' | 'work_item' | 'quality_item' | 'bcm_item' | 'capa',
  entityId: string,
  authorId: string,
  authorName: string,
  text: string,
  type: Comment['type'] = 'comment'
): Promise<Comment> {
  const db = getAdmin();
  const { data, error } = await db.from('comments').insert({
    entity_type: entityType,
    entity_id: entityId,
    author_id: authorId || null,
    author_name: authorName,
    text,
    type,
  }).select().single();
  if (error) throw error;
  return mapComment(data);
}

// Legacy aliases kept for backward-compat with existing API routes
export async function addProjectComment(id: string, authorId: string, authorName: string, text: string, type?: Comment['type']) {
  return addComment('project', id, authorId, authorName, text, type);
}
export async function addWorkItemComment(id: string, authorId: string, authorName: string, text: string, type?: Comment['type']) {
  return addComment('work_item', id, authorId, authorName, text, type);
}
export async function addQualityComment(id: string, authorId: string, authorName: string, text: string, type?: Comment['type']) {
  return addComment('quality_item', id, authorId, authorName, text, type);
}
export async function addBCMComment(id: string, authorId: string, authorName: string, text: string, type?: Comment['type']) {
  return addComment('bcm_item', id, authorId, authorName, text, type);
}
export async function addCAPAComment(id: string, authorId: string, authorName: string, text: string, type?: Comment['type']) {
  return addComment('capa', id, authorId, authorName, text, type);
}

// ─── ATTACHMENT FUNCTIONS ─────────────────────────────────────────────────────

export async function addAttachment(
  entityType: 'project' | 'work_item' | 'quality_item' | 'bcm_item' | 'capa',
  entityId: string,
  att: Omit<Attachment, 'id' | 'createdAt'>
): Promise<Attachment> {
  const db = getAdmin();
  const { data, error } = await db.from('attachments').insert({
    entity_type: entityType,
    entity_id: entityId,
    filename: att.filename,
    stored_name: att.storedName,
    mime_type: att.mimeType,
    size_bytes: att.size,
    storage_path: att.storedName,
    url: att.url,
    uploaded_by: att.uploadedBy || null,
    uploaded_by_name: att.uploadedByName,
  }).select().single();
  if (error) throw error;
  return mapAttachment(data);
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const db = getAdmin();
  const { error } = await db.from('attachments').delete().eq('id', id);
  return !error;
}

// Legacy aliases
export async function addProjectAttachment(id: string, att: Omit<Attachment, 'id' | 'createdAt'>) {
  return addAttachment('project', id, att);
}
export async function addWorkItemAttachment(id: string, att: Omit<Attachment, 'id' | 'createdAt'>) {
  return addAttachment('work_item', id, att);
}
export async function addQualityAttachment(id: string, att: Omit<Attachment, 'id' | 'createdAt'>) {
  return addAttachment('quality_item', id, att);
}
export async function addBCMAttachment(id: string, att: Omit<Attachment, 'id' | 'createdAt'>) {
  return addAttachment('bcm_item', id, att);
}
export async function addCAPAAttachment(id: string, att: Omit<Attachment, 'id' | 'createdAt'>) {
  return addAttachment('capa', id, att);
}

// ─── NOTIFICATION FUNCTIONS ───────────────────────────────────────────────────

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const db = getAdmin();
  const { data, error } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as string,
    title: row.title as string,
    message: row.message as string || '',
    entityType: row.entity_type as string | undefined,
    entityId: row.entity_id as string | undefined,
    read: row.read as boolean,
    createdAt: row.created_at as string,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = getAdmin();
  await db.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = getAdmin();
  await db.from('notifications').update({ read: true }).eq('user_id', userId);
}

// ─── Keep compatibility with any code still importing these as sync ───────────
// (will be removed once all API routes are updated to await)
export { USE_SUPABASE };
