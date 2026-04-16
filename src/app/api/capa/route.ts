import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllCAPAs, createCAPA, findUserById } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  return NextResponse.json(await getAllCAPAs());
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });

  const body = await req.json();
  const fullUser = await findUserById(user.id);

  // Calculate planDueDate: 15 working days from today
  const initDate = new Date();
  let workdays = 0;
  const planDate = new Date(initDate);
  while (workdays < 15) {
    planDate.setDate(planDate.getDate() + 1);
    const day = planDate.getDay();
    if (day !== 0 && day !== 6) workdays++;
  }

  const capa = await createCAPA({
    stage: 'initiation',
    status: 'open',
    initiationDate: new Date().toISOString().split('T')[0],
    initiatedBy: user.id,
    initiatedByName: body.initiatedByName || fullUser?.name || user.name,
    initiatedByJobTitle: body.initiatedByJobTitle || '',
    department: body.department || '',
    scope: body.scope || '',
    categoryId: body.categoryId,
    source: body.source || 'internal_audit',
    sourceReference: '', // auto-generated in createCAPA as CAPA-YYYY-XXX
    sourceOtherDescription: body.sourceOtherDescription,
    nonconformityDescription: body.nonconformityDescription || '',
    ownerName: body.ownerName || fullUser?.name || user.name,
    ownerJobTitle: body.ownerJobTitle || '',
    assignmentDate: new Date().toISOString().split('T')[0],
    planDueDate: body.planDueDate || planDate.toISOString().split('T')[0],
    capaTeam: body.capaTeam || '',
    riskCustomer: '', riskCompany: '', riskProcess: '',
    correction: '', correctionDueDate: undefined,
    rcaMethods: [], rcaDescription: '', rcaMethodOther: undefined,
    rootCause: '',
    actionPlanType: '',
    verificationPlan: '', verificationResponsibleName: '',
    verificationStartDate: undefined,
    conclusion: '', validationConfirmed: false,
  });

  return NextResponse.json(capa, { status: 201 });
}
