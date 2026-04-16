'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'nl' | 'en';

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const translations = {
  nl: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      projects: 'Projecten',
      tasks: 'Taken',
      quality: 'Kwaliteit',
      bcm: 'BCM',
      capa: 'CAPA',
      settings: 'Instellingen',
      logout: 'Uitloggen',
    },
    // Common
    common: {
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      create: 'Aanmaken',
      loading: 'Laden...',
      saving: 'Opslaan...',
      search: 'Zoeken...',
      filter: 'Filteren',
      all: 'Alle',
      none: 'Geen',
      yes: 'Ja',
      no: 'Nee',
      close: 'Sluiten',
      open: 'Open',
      back: 'Terug',
      next: 'Volgende',
      add: 'Toevoegen',
      remove: 'Verwijderen',
      confirm: 'Bevestigen',
      view: 'Bekijken',
      export: 'Exporteren',
      copy: 'Kopiëren',
      copied: 'Gekopieerd!',
      share: 'Delen',
      download: 'Downloaden',
      print: 'Afdrukken',
      noData: 'Geen gegevens gevonden',
      required: 'Verplicht',
      optional: 'Optioneel',
      description: 'Beschrijving',
      title: 'Titel',
      status: 'Status',
      priority: 'Prioriteit',
      type: 'Type',
      owner: 'Eigenaar',
      dueDate: 'Deadline',
      createdAt: 'Aangemaakt',
      updatedAt: 'Bijgewerkt',
      actions: 'Acties',
      comments: 'Opmerkingen',
      attachments: 'Bijlagen',
      tags: 'Tags',
      reference: 'Referentie',
    },
    // Status labels
    status: {
      todo: 'Te doen',
      in_progress: 'In uitvoering',
      review: 'In review',
      done: 'Klaar',
      blocked: 'Geblokkeerd',
      open: 'Open',
      closed: 'Gesloten',
      verified: 'Geverifieerd',
      identified: 'Geïdentificeerd',
      assessed: 'Beoordeeld',
      mitigated: 'Gemitigeerd',
      accepted: 'Geaccepteerd',
    },
    // Priority labels
    priority: {
      low: 'Laag',
      medium: 'Medium',
      high: 'Hoog',
      critical: 'Kritiek',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welkom terug',
      overview: 'Overzicht',
      activeProjects: 'Actieve projecten',
      openTasks: 'Open taken',
      qualityIssues: 'Kwaliteitsproblemen',
      highRisks: 'Hoge risico\'s',
      recentActivity: 'Recente activiteit',
      quickActions: 'Snelle acties',
      newProject: 'Nieuw project',
      newTask: 'Nieuwe taak',
      newQuality: 'Nieuwe bevinding',
      newBCM: 'Nieuw risico',
    },
    // Projects
    projects: {
      title: 'Projecten',
      new: 'Nieuw project',
      name: 'Projectnaam',
      startDate: 'Startdatum',
      endDate: 'Einddatum',
      budget: 'Budget',
      category: 'Categorie',
      noProjects: 'Geen projecten gevonden',
      createFirst: 'Maak je eerste project aan',
      daysLeft: 'dagen resterend',
      overdue: 'Verstreken',
      onTrack: 'Op schema',
      atRisk: 'Risico',
      details: 'Projectdetails',
      tasks: 'Taken',
      quality: 'Kwaliteit',
      timeline: 'Tijdlijn',
      members: 'Leden',
    },
    // Tasks
    tasks: {
      title: 'Taken',
      new: 'Nieuwe taak',
      noTasks: 'Geen taken gevonden',
      types: {
        measure: 'Maatregelen',
        action: 'Acties',
        task: 'Taken',
        milestone: 'Mijlpalen',
      },
    },
    // Quality
    quality: {
      title: 'Kwaliteitsmanagement',
      new: 'Nieuw item',
      noItems: 'Geen kwaliteitsitems gevonden',
      types: {
        non_conformity: 'Non-conformiteit',
        improvement: 'Verbeterpunt',
        audit_finding: 'Auditbevinding',
        capa: 'CAPA',
        kpi: 'KPI',
      },
      stats: {
        nonConformities: 'Non-conformiteiten',
        improvements: 'Verbeteringen',
        capas: 'CAPA\'s',
        auditFindings: 'Auditbevindingen',
      },
    },
    // BCM
    bcm: {
      title: 'Business Continuity Management',
      new: 'Nieuw item',
      noItems: 'Geen BCM items gevonden',
      createFirst: 'Registreer je eerste risico',
      riskMatrix: 'Risicomatrix',
      riskScore: 'Risicoscore',
      probability: 'Kans',
      impact: 'Impact',
      riskLevel: {
        low: 'Laag',
        medium: 'Medium',
        high: 'Hoog',
        critical: 'Kritiek',
      },
      types: {
        risk: 'Risico',
        business_impact: 'Business Impact Analyse',
        recovery_plan: 'Herstelplan',
        crisis_procedure: 'Crisisprocedure',
        test_exercise: 'Testscenario',
      },
      highRisk: 'Hoog risico',
      filters: {
        all: 'Alle',
        highRisk: '🔴 Hoog risico',
        risks: 'Risico\'s',
        recoveryPlans: 'Herstelplannen',
        crisisProcedures: 'Crisisprocedures',
      },
    },
    // CAPA
    capa: {
      title: 'CAPA',
      subtitle: 'Corrigerende en Preventieve Acties',
      new: 'Nieuwe CAPA',
      noItems: 'Geen CAPA\'s gevonden',
      reference: 'Referentie',
      source: 'Bron',
      rootCause: 'Grondoorzaak',
      correction: 'Correctie',
      verification: 'Verificatie',
      closure: 'Afsluiting',
      stages: {
        initiation: 'Initiatie',
        riskAssessment: 'Risicobeoordeling',
        rootCauseAnalysis: 'Oorzakenanalyse',
        actionPlan: 'Actieplan',
        verification30: '30d Verificatie',
        verification60: '60d Verificatie',
        verification90: '90d Verificatie',
        closure: 'Afsluiting',
      },
    },
    // Export
    export: {
      title: 'Exporteren',
      exportPDF: 'Exporteer als PDF',
      exportExcel: 'Exporteer als Excel',
      copyTable: 'Kopieer tabel',
      shareEmail: 'Deel via e-mail',
      generating: 'Genereren...',
      success: 'Export geslaagd',
    },
  },

  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      tasks: 'Tasks',
      quality: 'Quality',
      bcm: 'BCM',
      capa: 'CAPA',
      settings: 'Settings',
      logout: 'Logout',
    },
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      loading: 'Loading...',
      saving: 'Saving...',
      search: 'Search...',
      filter: 'Filter',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      open: 'Open',
      back: 'Back',
      next: 'Next',
      add: 'Add',
      remove: 'Remove',
      confirm: 'Confirm',
      view: 'View',
      export: 'Export',
      copy: 'Copy',
      copied: 'Copied!',
      share: 'Share',
      download: 'Download',
      print: 'Print',
      noData: 'No data found',
      required: 'Required',
      optional: 'Optional',
      description: 'Description',
      title: 'Title',
      status: 'Status',
      priority: 'Priority',
      type: 'Type',
      owner: 'Owner',
      dueDate: 'Due date',
      createdAt: 'Created',
      updatedAt: 'Updated',
      actions: 'Actions',
      comments: 'Comments',
      attachments: 'Attachments',
      tags: 'Tags',
      reference: 'Reference',
    },
    // Status labels
    status: {
      todo: 'To do',
      in_progress: 'In progress',
      review: 'In review',
      done: 'Done',
      blocked: 'Blocked',
      open: 'Open',
      closed: 'Closed',
      verified: 'Verified',
      identified: 'Identified',
      assessed: 'Assessed',
      mitigated: 'Mitigated',
      accepted: 'Accepted',
    },
    // Priority labels
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      overview: 'Overview',
      activeProjects: 'Active projects',
      openTasks: 'Open tasks',
      qualityIssues: 'Quality issues',
      highRisks: 'High risks',
      recentActivity: 'Recent activity',
      quickActions: 'Quick actions',
      newProject: 'New project',
      newTask: 'New task',
      newQuality: 'New finding',
      newBCM: 'New risk',
    },
    // Projects
    projects: {
      title: 'Projects',
      new: 'New project',
      name: 'Project name',
      startDate: 'Start date',
      endDate: 'End date',
      budget: 'Budget',
      category: 'Category',
      noProjects: 'No projects found',
      createFirst: 'Create your first project',
      daysLeft: 'days remaining',
      overdue: 'Overdue',
      onTrack: 'On track',
      atRisk: 'At risk',
      details: 'Project details',
      tasks: 'Tasks',
      quality: 'Quality',
      timeline: 'Timeline',
      members: 'Members',
    },
    // Tasks
    tasks: {
      title: 'Tasks',
      new: 'New task',
      noTasks: 'No tasks found',
      types: {
        measure: 'Measures',
        action: 'Actions',
        task: 'Tasks',
        milestone: 'Milestones',
      },
    },
    // Quality
    quality: {
      title: 'Quality Management',
      new: 'New item',
      noItems: 'No quality items found',
      types: {
        non_conformity: 'Non-conformity',
        improvement: 'Improvement',
        audit_finding: 'Audit finding',
        capa: 'CAPA',
        kpi: 'KPI',
      },
      stats: {
        nonConformities: 'Non-conformities',
        improvements: 'Improvements',
        capas: 'CAPAs',
        auditFindings: 'Audit findings',
      },
    },
    // BCM
    bcm: {
      title: 'Business Continuity Management',
      new: 'New item',
      noItems: 'No BCM items found',
      createFirst: 'Register your first risk',
      riskMatrix: 'Risk matrix',
      riskScore: 'Risk score',
      probability: 'Probability',
      impact: 'Impact',
      riskLevel: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
      },
      types: {
        risk: 'Risk',
        business_impact: 'Business Impact Analysis',
        recovery_plan: 'Recovery plan',
        crisis_procedure: 'Crisis procedure',
        test_exercise: 'Test exercise',
      },
      highRisk: 'High risk',
      filters: {
        all: 'All',
        highRisk: '🔴 High risk',
        risks: 'Risks',
        recoveryPlans: 'Recovery plans',
        crisisProcedures: 'Crisis procedures',
      },
    },
    // CAPA
    capa: {
      title: 'CAPA',
      subtitle: 'Corrective and Preventive Actions',
      new: 'New CAPA',
      noItems: 'No CAPAs found',
      reference: 'Reference',
      source: 'Source',
      rootCause: 'Root cause',
      correction: 'Correction',
      verification: 'Verification',
      closure: 'Closure',
      stages: {
        initiation: 'Initiation',
        riskAssessment: 'Risk assessment',
        rootCauseAnalysis: 'Root cause analysis',
        actionPlan: 'Action plan',
        verification30: '30d Verification',
        verification60: '60d Verification',
        verification90: '90d Verification',
        closure: 'Closure',
      },
    },
    // Export
    export: {
      title: 'Export',
      exportPDF: 'Export as PDF',
      exportExcel: 'Export as Excel',
      copyTable: 'Copy table',
      shareEmail: 'Share via email',
      generating: 'Generating...',
      success: 'Export successful',
    },
  },
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

type TranslationValue = string | Record<string, unknown>;
type TranslationsType = typeof translations.nl;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationsType;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('nl');

  useEffect(() => {
    const stored = localStorage.getItem('pure-locale') as Locale;
    if (stored === 'nl' || stored === 'en') setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('pure-locale', l);
    document.documentElement.lang = l;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// ─── LANGUAGE TOGGLE COMPONENT ────────────────────────────────────────────────

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === 'nl' ? 'en' : 'nl')}
      title={locale === 'nl' ? 'Switch to English' : 'Schakel naar Nederlands'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: '14px' }}>{locale === 'nl' ? '🇧🇪' : '🇬🇧'}</span>
      <span>{locale === 'nl' ? 'NL' : 'EN'}</span>
    </button>
  );
}
