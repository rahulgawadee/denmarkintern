'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  MessageSquare,
  Building2,
  Users,
  Sparkles,
  FileText,
  Handshake,
} from 'lucide-react';
import EmployerQuickForm from '@/components/forms/EmployerQuickForm';
import EmployerFullForm from '@/components/forms/EmployerFullForm';

const brandName = 'Øresund Talent';
const briefTemplateHref = '/downloads/oresund-brief-template.txt';

const sharedInitialValues = {
  companyName: '',
  cvr: '',
  website: '',
  companyAddress: '',
  industry: '',
  companySize: '',
  primaryContactName: '',
  primaryContactTitle: '',
  email: '',
  phone: '',
  preferredLanguage: '',
  areas: [],
  otherArea: '',
  topTasks: [],
  tools: [],
  otherTools: '',
  expectedDeliverables: [],
  accessLevel: [],
  ndaRequired: '',
  workMode: '',
  onsiteLocation: '',
  onsiteExpectation: '',
  weeklyHours: '',
  duration: '',
  startWindow: '',
  supervisionCapacity: '',
  remoteTools: [],
  equipment: [],
  academicLevel: '',
  fieldsOfStudy: [],
  languages: [],
  mustHaveSkills: [],
  niceToHaveSkills: [],
  softSkills: [],
  workAuthorization: '',
  drivingLicense: '',
  internsPlanned: '',
  interviewFormat: [],
  interviewAvailability: '',
  decisionSpeed: '',
  budget: '',
  priorityCriteria: [],
  diversityNotes: '',
  accessibility: '',
  authorized: false,
  consent: false,
  acceptPolicies: false,
  preferredDocs: [],
  attachments: [],
  additionalNotes: '',
};

const formStepsEn = [
  {
    title: 'A. Company & Contact',
    description: 'Capture the essentials so we can recognise your organisation immediately.',
    fields: [
      {
        name: 'companyName',
        label: 'Company name',
        type: 'text',
        placeholder: 'Example ApS',
        required: true,
      },
      {
        name: 'cvr',
        label: 'CVR (Company registration number)',
        type: 'text',
        placeholder: '12345678',
        required: true,
        validator: 'cvr',
      },
      {
        name: 'website',
        label: 'Website',
        type: 'url',
        placeholder: 'https://yourcompany.dk',
      },
      {
        name: 'companyAddress',
        label: 'Company address',
        type: 'text',
        placeholder: 'Street, postcode, city, country',
        required: true,
      },
      {
        name: 'industry',
        label: 'Industry',
        type: 'select',
        options: [
          { value: 'tech', label: 'Tech' },
          { value: 'saas', label: 'SaaS' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'retail', label: 'Retail' },
          { value: 'consulting', label: 'Consulting' },
          { value: 'public_ngo', label: 'Public / NGO' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        name: 'companySize',
        label: 'Company size',
        type: 'radio',
        options: [
          { value: '1-10', label: '1–10' },
          { value: '11-50', label: '11–50' },
          { value: '51-200', label: '51–200' },
          { value: '201-500', label: '201–500' },
          { value: '501+', label: '501+' },
        ],
        required: true,
      },
      {
        name: 'primaryContactName',
        label: 'Primary contact name',
        type: 'text',
        placeholder: 'Name',
        required: true,
      },
      {
        name: 'primaryContactTitle',
        label: 'Primary contact title',
        type: 'text',
        placeholder: 'Title',
        required: true,
      },
      {
        name: 'email',
        label: 'Email address',
        type: 'email',
        placeholder: 'name@company.dk',
        required: true,
        validator: 'email',
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'text',
        placeholder: '+45 12 34 56 78',
        required: true,
      },
      {
        name: 'preferredLanguage',
        label: 'Preferred communication language',
        type: 'radio',
        options: [
          { value: 'en', label: 'English' },
          { value: 'da', label: 'Danish' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'B. Role & Project Scope',
    description: 'Tell us what success looks like so we can align the shortlist.',
    fields: [
      {
        name: 'areas',
        label: 'Which area needs an intern?',
        type: 'checkbox-group',
        options: [
          { value: 'business', label: 'Business & Marketing (Social, Content, SEO, Paid Ads, CRM, Events)' },
          { value: 'tech', label: 'Tech & Data (Frontend, Backend, QA, Data Analysis, BI, ML (junior))' },
          { value: 'design', label: 'Design & Product (UX, UI, Product Research, Graphic, Motion)' },
          { value: 'operations', label: 'Operations & Supply (Operations, Procurement support, Logistics)' },
          { value: 'people', label: 'People & Admin (HR support, Talent sourcing, Office Ops)' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        name: 'otherArea',
        label: 'If "Other", describe briefly',
        type: 'text',
        placeholder: 'e.g. Sustainability reporting',
      },
      {
        name: 'topTasks',
        label: 'Top 3 tasks you want done',
        type: 'chips',
        placeholder: 'Add task and press Enter',
        helpText: 'Use short action-oriented phrases. Max 3.',
        required: true,
        max: 3,
      },
      {
        name: 'tools',
        label: 'Tools / stack candidates should know',
        type: 'checkbox-group',
        options: [
          { value: 'sheets', label: 'Excel / Google Sheets' },
          { value: 'powerpoint', label: 'PowerPoint' },
          { value: 'hubspot', label: 'HubSpot' },
          { value: 'ga4', label: 'Google Analytics 4' },
          { value: 'ads', label: 'Meta / Google Ads' },
          { value: 'figma', label: 'Figma' },
          { value: 'adobe', label: 'Adobe CC' },
          { value: 'jira', label: 'Jira' },
          { value: 'github', label: 'GitHub' },
          { value: 'python', label: 'Python' },
          { value: 'sql', label: 'SQL' },
          { value: 'notion', label: 'Notion' },
          { value: 'asana', label: 'Asana' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        name: 'otherTools',
        label: 'Other tools or platforms',
        type: 'text',
        placeholder: 'List any additional tooling expectations',
      },
      {
        name: 'expectedDeliverables',
        label: 'Expected deliverables / outcomes',
        type: 'checkbox-group',
        options: [
          { value: 'campaign', label: 'Campaign live' },
          { value: 'report', label: 'Report' },
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'prototype', label: 'Prototype' },
          { value: 'code', label: 'Code feature' },
          { value: 'testPlan', label: 'Test plan' },
          { value: 'processDoc', label: 'Process document' },
        ],
        required: true,
      },
      {
        name: 'accessLevel',
        label: 'Access & confidentiality',
        type: 'checkbox-group',
        options: [
          { value: 'public', label: 'Public docs only' },
          { value: 'internalRead', label: 'Internal read-only' },
          { value: 'internalWrite', label: 'Internal write access' },
          { value: 'clientData', label: 'Client data access' },
        ],
        required: true,
      },
      {
        name: 'ndaRequired',
        label: 'NDA required?',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'C. Logistics & Timing',
    description: 'Outline timing, availability, and collaboration preferences.',
    fields: [
      {
        name: 'workMode',
        label: 'Work mode',
        type: 'radio',
        options: [
          { value: 'onsite', label: 'On-site (Greater Copenhagen)' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'remote', label: 'Remote' },
        ],
        required: true,
      },
      {
        name: 'onsiteLocation',
        label: 'On-site location (if relevant)',
        type: 'text',
        placeholder: 'City / postcode / address',
      },
      {
        name: 'onsiteExpectation',
        label: 'On-site expectation',
        type: 'radio',
        options: [
          { value: '0', label: '0 days per week' },
          { value: '1-2', label: '1–2 days per week' },
          { value: '3+', label: '3+ days per week' },
        ],
        required: true,
      },
      {
        name: 'weeklyHours',
        label: 'Weekly hours',
        type: 'radio',
        options: [
          { value: '8-15', label: '8–15' },
          { value: '16-20', label: '16–20' },
          { value: '21-30', label: '21–30' },
          { value: '31-37', label: '31–37' },
        ],
        required: true,
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'radio',
        options: [
          { value: '8-12', label: '8–12 weeks' },
          { value: '13-16', label: '13–16 weeks' },
          { value: '17-24', label: '17–24 weeks' },
          { value: '25+', label: '25+ weeks' },
        ],
        required: true,
      },
      {
        name: 'startWindow',
        label: 'Preferred start window',
        type: 'radio',
        options: [
          { value: 'asap', label: 'ASAP' },
          { value: '2-4weeks', label: '2–4 weeks' },
          { value: '1-2months', label: '1–2 months' },
          { value: 'specific', label: 'Specific date' },
        ],
        required: true,
      },
      {
        name: 'supervisionCapacity',
        label: 'Supervision capacity (time for mentoring)',
        type: 'radio',
        options: [
          { value: '1-2h', label: '1–2h per week' },
          { value: '3-5h', label: '3–5h per week' },
          { value: '6h+', label: '6h+ per week' },
        ],
        required: true,
      },
      {
        name: 'remoteTools',
        label: 'Remote collaboration tools',
        type: 'checkbox-group',
        options: [
          { value: 'teams', label: 'Microsoft Teams' },
          { value: 'meet', label: 'Google Meet' },
          { value: 'slack', label: 'Slack' },
          { value: 'jira', label: 'Jira' },
          { value: 'github', label: 'GitHub' },
          { value: 'notion', label: 'Notion' },
          { value: 'asana', label: 'Asana' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        name: 'equipment',
        label: 'Equipment provided',
        type: 'checkbox-group',
        options: [
          { value: 'laptop', label: 'Laptop' },
          { value: 'software', label: 'Software licences' },
          { value: 'workspace', label: 'Desk / workspace' },
          { value: 'none', label: 'None / bring own' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'D. Candidate Profile',
    description: 'Clarify the profile so we surface the right Swedish talent.',
    fields: [
      {
        name: 'academicLevel',
        label: 'Academic level',
        type: 'radio',
        options: [
          { value: 'bachelor', label: 'Bachelor' },
          { value: 'master', label: 'Master' },
          { value: 'higherVocational', label: 'Higher vocational' },
          { value: 'recentGrad', label: 'Recent graduate (≤12 months)' },
        ],
        required: true,
      },
      {
        name: 'fieldsOfStudy',
        label: 'Field(s) of study',
        type: 'checkbox-group',
        options: [
          { value: 'business', label: 'Business' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'economics', label: 'Economics' },
          { value: 'computerScience', label: 'Computer Science / IT' },
          { value: 'data', label: 'Data / Analytics' },
          { value: 'design', label: 'Design' },
          { value: 'engineering', label: 'Engineering' },
          { value: 'logistics', label: 'Logistics / Supply' },
          { value: 'hr', label: 'HR' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        name: 'languages',
        label: 'Languages for daily work',
        type: 'checkbox-group',
        options: [
          { value: 'english', label: 'English (B2+)' },
          { value: 'swedish', label: 'Swedish' },
          { value: 'danish', label: 'Danish' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        name: 'mustHaveSkills',
        label: 'Must-have skills',
        type: 'chips',
        placeholder: 'Add skill and press Enter',
        helpText: 'Max 5 priorities.',
        required: true,
        max: 5,
      },
      {
        name: 'niceToHaveSkills',
        label: 'Nice-to-have skills',
        type: 'chips',
        placeholder: 'Add skill and press Enter',
        helpText: 'Optional – helps us calibrate the shortlist.',
        max: 5,
      },
      {
        name: 'softSkills',
        label: 'Soft skills',
        type: 'checkbox-group',
        options: [
          { value: 'proactive', label: 'Proactive' },
          { value: 'detail', label: 'Detail-oriented' },
          { value: 'analytical', label: 'Analytical' },
          { value: 'creative', label: 'Creative' },
          { value: 'communicator', label: 'Clear communicator' },
          { value: 'team', label: 'Team player' },
          { value: 'independent', label: 'Independent' },
          { value: 'fastLearner', label: 'Fast learner' },
        ],
        required: true,
      },
      {
        name: 'workAuthorization',
        label: 'Work authorisation constraints',
        type: 'radio',
        options: [
          { value: 'eea', label: 'EU / EEA only' },
          { value: 'any', label: 'Any' },
          { value: 'na', label: 'Not applicable (remote)' },
        ],
        required: true,
      },
      {
        name: 'drivingLicense',
        label: 'Driving licence required?',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'E. Preferences & Screening',
    description: 'Fine-tune how we engage, interview, and calibrate your shortlist.',
    fields: [
      {
        name: 'internsPlanned',
        label: 'How many interns do you plan to host?',
        type: 'radio',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3+', label: '3+' },
        ],
        required: true,
      },
      {
        name: 'interviewFormat',
        label: 'Interview format',
        type: 'checkbox-group',
        options: [
          { value: 'video', label: 'Video' },
          { value: 'onsite', label: 'On-site' },
          { value: 'task', label: 'Task-based (small assignment)' },
          { value: 'pair', label: 'Pair-session' },
        ],
        required: true,
      },
      {
        name: 'interviewAvailability',
        label: 'Interview availability (date + time windows)',
        type: 'text',
        placeholder: 'e.g. Tuesdays & Thursdays 13:00–16:00',
        required: true,
      },
      {
        name: 'decisionSpeed',
        label: 'Decision speed',
        type: 'radio',
        options: [
          { value: '48h', label: '24–48h' },
          { value: '3-5d', label: '3–5 days' },
          { value: '1-2w', label: '1–2 weeks' },
        ],
        required: true,
      },
      {
        name: 'budget',
        label: 'Budget / allowance',
        type: 'radio',
        options: [
          { value: 'none', label: 'No stipend' },
          { value: '<2000', label: '< DKK 2,000' },
          { value: '2000-4999', label: 'DKK 2,000–4,999' },
          { value: '5000-7999', label: 'DKK 5,000–7,999' },
          { value: '8000+', label: '≥ DKK 8,000' },
          { value: 'tbd', label: 'Not decided / Other' },
        ],
        required: true,
      },
      {
        name: 'priorityCriteria',
        label: 'Priority criteria',
        type: 'checkbox-group',
        options: [
          { value: 'earliestStart', label: 'Earliest start' },
          { value: 'specificTools', label: 'Specific tool / stack' },
          { value: 'onsitePresence', label: 'On-site presence' },
          { value: 'longDuration', label: 'Long duration' },
          { value: 'independence', label: 'High independence' },
          { value: 'languageFit', label: 'Language fit' },
        ],
        required: true,
      },
      {
        name: 'diversityNotes',
        label: 'Diversity & inclusion considerations (optional)',
        type: 'textarea',
        placeholder: 'Share any goals or constraints we should respect.',
      },
      {
        name: 'accessibility',
        label: 'Accessibility accommodations available',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'tbd', label: 'To be discussed' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'F. Compliance, Consent & Extras',
    description: 'Wrap up with the essentials so we can move fast together.',
    fields: [
      {
        name: 'authorized',
        label: 'I am authorised to engage interns or run this process',
        type: 'checkbox',
        required: true,
      },
      {
        name: 'consent',
        label: `I consent to be contacted by ${brandName} about this inquiry`,
        type: 'checkbox',
        required: true,
      },
      {
        name: 'acceptPolicies',
        label: 'I accept the Privacy Policy & Terms',
        type: 'checkbox',
        required: true,
      },
      {
        name: 'preferredDocs',
        label: 'Preferred legal docs',
        type: 'checkbox-group',
        options: [
          { value: 'ours', label: 'Our template' },
          { value: 'company', label: 'Company template' },
          { value: 'tbd', label: 'TBD' },
        ],
        required: true,
      },
      {
        name: 'attachments',
        label: 'Attachments (optional)',
        type: 'file',
        helpText: 'Upload project brief, role description, brand guide, NDA (PDF/DOCX/PPTX, ≤10MB each).',
      },
      {
        name: 'additionalNotes',
        label: 'Additional notes',
        type: 'textarea',
        placeholder: 'Anything else we should know? Links welcome.',
      },
    ],
    note: 'Your answers help us route the right Swedish candidates quickly. Use TBD if something is still being finalised.',
  },
];

const formStepsDa = [
  {
    title: 'A. Virksomhed & kontakt',
    description: 'Del det vigtigste, så vi hurtigt forstår jeres setup.',
    fields: [
      {
        name: 'companyName',
        label: 'Virksomhedsnavn',
        type: 'text',
        placeholder: 'Eksempel ApS',
        required: true,
      },
      {
        name: 'cvr',
        label: 'CVR-nummer (8 cifre)',
        type: 'text',
        placeholder: '12345678',
        required: true,
        validator: 'cvr',
      },
      {
        name: 'website',
        label: 'Website',
        type: 'url',
        placeholder: 'https://jeresvirksomhed.dk',
      },
      {
        name: 'companyAddress',
        label: 'Adresse',
        type: 'text',
        placeholder: 'Vej, postnr., by, land',
        required: true,
      },
      {
        name: 'industry',
        label: 'Branche',
        type: 'select',
        options: [
          { value: 'tech', label: 'Tech' },
          { value: 'saas', label: 'SaaS' },
          { value: 'manufacturing', label: 'Produktion' },
          { value: 'retail', label: 'Detail' },
          { value: 'consulting', label: 'Konsulent' },
          { value: 'public_ngo', label: 'Offentlig / NGO' },
          { value: 'other', label: 'Andet' },
        ],
        required: true,
      },
      {
        name: 'companySize',
        label: 'Virksomhedsstørrelse',
        type: 'radio',
        options: [
          { value: '1-10', label: '1–10' },
          { value: '11-50', label: '11–50' },
          { value: '51-200', label: '51–200' },
          { value: '201-500', label: '201–500' },
          { value: '501+', label: '501+' },
        ],
        required: true,
      },
      {
        name: 'primaryContactName',
        label: 'Primær kontakt (navn)',
        type: 'text',
        placeholder: 'Navn',
        required: true,
      },
      {
        name: 'primaryContactTitle',
        label: 'Primær kontakt (titel)',
        type: 'text',
        placeholder: 'Titel',
        required: true,
      },
      {
        name: 'email',
        label: 'E-mailadresse',
        type: 'email',
        placeholder: 'navn@virksomhed.dk',
        required: true,
        validator: 'email',
      },
      {
        name: 'phone',
        label: 'Telefon',
        type: 'text',
        placeholder: '+45 12 34 56 78',
        required: true,
      },
      {
        name: 'preferredLanguage',
        label: 'Foretrukket sprog i dialogen',
        type: 'radio',
        options: [
          { value: 'da', label: 'Dansk' },
          { value: 'en', label: 'Engelsk' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'B. Rolle & projekt-scope',
    description: 'Beskriv opgaven, så vi kan ramme match og forventninger.',
    fields: [
      {
        name: 'areas',
        label: 'Hvilket område har brug for en praktikant?',
        type: 'checkbox-group',
        options: [
          { value: 'business', label: 'Business & Marketing (SoMe, Content, SEO, Paid Ads, CRM, Events)' },
          { value: 'tech', label: 'Tech & Data (Frontend, Backend, QA, Dataanalyse, BI, ML (junior))' },
          { value: 'design', label: 'Design & Produkt (UX, UI, Produktresearch, Grafisk, Motion)' },
          { value: 'operations', label: 'Drift & Supply (Operations, Indkøbssupport, Logistik)' },
          { value: 'people', label: 'People & Admin (HR-support, Talent sourcing, Office Ops)' },
          { value: 'other', label: 'Andet' },
        ],
        required: true,
      },
      {
        name: 'otherArea',
        label: 'Hvis "Andet", beskriv kort',
        type: 'text',
        placeholder: 'fx Bæredygtighedsrapportering',
      },
      {
        name: 'topTasks',
        label: 'Top 3 opgaver I vil have løst',
        type: 'chips',
        placeholder: 'Tilføj opgave og tryk Enter',
        helpText: 'Hold det kort og handlingsorienteret. Max 3.',
        required: true,
        max: 3,
      },
      {
        name: 'tools',
        label: 'Værktøjer / stack kandidaten skal kende',
        type: 'checkbox-group',
        options: [
          { value: 'sheets', label: 'Excel / Google Sheets' },
          { value: 'powerpoint', label: 'PowerPoint' },
          { value: 'hubspot', label: 'HubSpot' },
          { value: 'ga4', label: 'Google Analytics 4' },
          { value: 'ads', label: 'Meta / Google Ads' },
          { value: 'figma', label: 'Figma' },
          { value: 'adobe', label: 'Adobe CC' },
          { value: 'jira', label: 'Jira' },
          { value: 'github', label: 'GitHub' },
          { value: 'python', label: 'Python' },
          { value: 'sql', label: 'SQL' },
          { value: 'notion', label: 'Notion' },
          { value: 'asana', label: 'Asana' },
          { value: 'other', label: 'Andet' },
        ],
        required: true,
      },
      {
        name: 'otherTools',
        label: 'Andre værktøjer eller platforme',
        type: 'text',
        placeholder: 'Angiv øvrige krav til værktøjer',
      },
      {
        name: 'expectedDeliverables',
        label: 'Forventede leverancer',
        type: 'checkbox-group',
        options: [
          { value: 'campaign', label: 'Kampagne live' },
          { value: 'report', label: 'Rapport' },
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'prototype', label: 'Prototype' },
          { value: 'code', label: 'Kodefeature' },
          { value: 'testPlan', label: 'Testplan' },
          { value: 'processDoc', label: 'Procesdokument' },
        ],
        required: true,
      },
      {
        name: 'accessLevel',
        label: 'Adgang & fortrolighed',
        type: 'checkbox-group',
        options: [
          { value: 'public', label: 'Offentlige dokumenter' },
          { value: 'internalRead', label: 'Intern læseadgang' },
          { value: 'internalWrite', label: 'Intern skriveadgang' },
          { value: 'clientData', label: 'Kundedata' },
        ],
        required: true,
      },
      {
        name: 'ndaRequired',
        label: 'Kræves NDA?',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Ja' },
          { value: 'no', label: 'Nej' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'C. Praktikrammer & timing',
    description: 'Angiv rammerne for samarbejdet.',
    fields: [
      {
        name: 'workMode',
        label: 'Arbejdsform',
        type: 'radio',
        options: [
          { value: 'onsite', label: 'On-site (Storkøbenhavn)' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'remote', label: 'Remote' },
        ],
        required: true,
      },
      {
        name: 'onsiteLocation',
        label: 'On-site adresse (hvis relevant)',
        type: 'text',
        placeholder: 'By / postnr. / adresse',
      },
      {
        name: 'onsiteExpectation',
        label: 'On-site forventning',
        type: 'radio',
        options: [
          { value: '0', label: '0 dage pr. uge' },
          { value: '1-2', label: '1–2 dage pr. uge' },
          { value: '3+', label: '3+ dage pr. uge' },
        ],
        required: true,
      },
      {
        name: 'weeklyHours',
        label: 'Ugentlige timer',
        type: 'radio',
        options: [
          { value: '8-15', label: '8–15' },
          { value: '16-20', label: '16–20' },
          { value: '21-30', label: '21–30' },
          { value: '31-37', label: '31–37' },
        ],
        required: true,
      },
      {
        name: 'duration',
        label: 'Varighed',
        type: 'radio',
        options: [
          { value: '8-12', label: '8–12 uger' },
          { value: '13-16', label: '13–16 uger' },
          { value: '17-24', label: '17–24 uger' },
          { value: '25+', label: '25+ uger' },
        ],
        required: true,
      },
      {
        name: 'startWindow',
        label: 'Foretrukket start',
        type: 'radio',
        options: [
          { value: 'asap', label: 'Hurtigst muligt' },
          { value: '2-4weeks', label: '2–4 uger' },
          { value: '1-2months', label: '1–2 måneder' },
          { value: 'specific', label: 'Specifik dato' },
        ],
        required: true,
      },
      {
        name: 'supervisionCapacity',
        label: 'Tid til oplæring/mentoring',
        type: 'radio',
        options: [
          { value: '1-2h', label: '1–2 t/uge' },
          { value: '3-5h', label: '3–5 t/uge' },
          { value: '6h+', label: '6+ t/uge' },
        ],
        required: true,
      },
      {
        name: 'remoteTools',
        label: 'Samarbejdsværktøjer (remote)',
        type: 'checkbox-group',
        options: [
          { value: 'teams', label: 'Microsoft Teams' },
          { value: 'meet', label: 'Google Meet' },
          { value: 'slack', label: 'Slack' },
          { value: 'jira', label: 'Jira' },
          { value: 'github', label: 'GitHub' },
          { value: 'notion', label: 'Notion' },
          { value: 'asana', label: 'Asana' },
          { value: 'other', label: 'Andet' },
        ],
        required: true,
      },
      {
        name: 'equipment',
        label: 'Udstyr stillet til rådighed',
        type: 'checkbox-group',
        options: [
          { value: 'laptop', label: 'Laptop' },
          { value: 'software', label: 'Softwarelicenser' },
          { value: 'workspace', label: 'Arbejdsplads' },
          { value: 'none', label: 'Intet / eget udstyr' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'D. Kandidatprofil',
    description: 'Beskriv hvad der skal til for at lykkes.',
    fields: [
      {
        name: 'academicLevel',
        label: 'Uddannelsesniveau',
        type: 'radio',
        options: [
          { value: 'bachelor', label: 'Bachelor' },
          { value: 'master', label: 'Kandidat' },
          { value: 'higherVocational', label: 'Erhvervsakademi' },
          { value: 'recentGrad', label: 'Nyuddannet (≤12 mdr.)' },
        ],
        required: true,
      },
      {
        name: 'fieldsOfStudy',
        label: 'Studieretning(er)',
        type: 'checkbox-group',
        options: [
          { value: 'business', label: 'Business' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'economics', label: 'Økonomi' },
          { value: 'computerScience', label: 'Datalogi / IT' },
          { value: 'data', label: 'Data / Analytics' },
          { value: 'design', label: 'Design' },
          { value: 'engineering', label: 'Ingeniør' },
          { value: 'logistics', label: 'Logistik / Supply' },
          { value: 'hr', label: 'HR' },
          { value: 'other', label: 'Andet' },
        ],
        required: true,
      },
      {
        name: 'languages',
        label: 'Sprog i dagligdagen',
        type: 'checkbox-group',
        options: [
          { value: 'english', label: 'Engelsk (B2+)' },
          { value: 'swedish', label: 'Svensk' },
          { value: 'danish', label: 'Dansk' },
          { value: 'other', label: 'Andet' },
        ],
        required: true,
      },
      {
        name: 'mustHaveSkills',
        label: 'Must-have kompetencer',
        type: 'chips',
        placeholder: 'Tilføj kompetence og tryk Enter',
        helpText: 'Max 5 vigtigste prioriteringer.',
        required: true,
        max: 5,
      },
      {
        name: 'niceToHaveSkills',
        label: 'Nice-to-have kompetencer',
        type: 'chips',
        placeholder: 'Tilføj kompetence og tryk Enter',
        helpText: 'Valgfrit – hjælper os med at kalibrere shortlist.',
        max: 5,
      },
      {
        name: 'softSkills',
        label: 'Personlige styrker',
        type: 'checkbox-group',
        options: [
          { value: 'proactive', label: 'Proaktiv' },
          { value: 'detail', label: 'Detaljeorienteret' },
          { value: 'analytical', label: 'Analytisk' },
          { value: 'creative', label: 'Kreativ' },
          { value: 'communicator', label: 'Tydelig kommunikation' },
          { value: 'team', label: 'Teamplayer' },
          { value: 'independent', label: 'Selvstændig' },
          { value: 'fastLearner', label: 'Hurtig læring' },
        ],
        required: true,
      },
      {
        name: 'workAuthorization',
        label: 'Beskæftigelseskrav / arbejdstilladelse',
        type: 'radio',
        options: [
          { value: 'eea', label: 'Kun EU/EØS' },
          { value: 'any', label: 'Alle' },
          { value: 'na', label: 'Ikke relevant (remote)' },
        ],
        required: true,
      },
      {
        name: 'drivingLicense',
        label: 'Kørekort påkrævet?',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Ja' },
          { value: 'no', label: 'Nej' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'E. Præferencer & screening',
    description: 'Afstem hvordan vi samarbejder om interviews og shortlist.',
    fields: [
      {
        name: 'internsPlanned',
        label: 'Hvor mange praktikanter planlægger I?',
        type: 'radio',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3+', label: '3+' },
        ],
        required: true,
      },
      {
        name: 'interviewFormat',
        label: 'Interviewform',
        type: 'checkbox-group',
        options: [
          { value: 'video', label: 'Video' },
          { value: 'onsite', label: 'On-site' },
          { value: 'task', label: 'Opgave (kort case)' },
          { value: 'pair', label: 'Samarbejdssession' },
        ],
        required: true,
      },
      {
        name: 'interviewAvailability',
        label: 'Tilgængelighed til interviews (dato + tidsrum)',
        type: 'text',
        placeholder: 'fx Tirsdag & torsdag kl. 13–16',
        required: true,
      },
      {
        name: 'decisionSpeed',
        label: 'Beslutningshastighed',
        type: 'radio',
        options: [
          { value: '48h', label: '24–48 t' },
          { value: '3-5d', label: '3–5 dage' },
          { value: '1-2w', label: '1–2 uger' },
        ],
        required: true,
      },
      {
        name: 'budget',
        label: 'Godtgørelse / budget',
        type: 'radio',
        options: [
          { value: 'none', label: 'Ingen godtgørelse' },
          { value: '<2000', label: '< 2.000 DKK' },
          { value: '2000-4999', label: '2.000–4.999 DKK' },
          { value: '5000-7999', label: '5.000–7.999 DKK' },
          { value: '8000+', label: '≥ 8.000 DKK' },
          { value: 'tbd', label: 'Ikke afklaret / Andet' },
        ],
        required: true,
      },
      {
        name: 'priorityCriteria',
        label: 'Prioriteringskriterier',
        type: 'checkbox-group',
        options: [
          { value: 'earliestStart', label: 'Tidlig start' },
          { value: 'specificTools', label: 'Specifikt værktøj/stack' },
          { value: 'onsitePresence', label: 'On-site tilstedeværelse' },
          { value: 'longDuration', label: 'Lang varighed' },
          { value: 'independence', label: 'Høj selvstændighed' },
          { value: 'languageFit', label: 'Sprogmatch' },
        ],
        required: true,
      },
      {
        name: 'diversityNotes',
        label: 'D&I-hensyn (valgfrit)',
        type: 'textarea',
        placeholder: 'Del evt. mål eller hensyn vi skal respektere.',
      },
      {
        name: 'accessibility',
        label: 'Tilgængelighed / hjælpemidler',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Ja' },
          { value: 'no', label: 'Nej' },
          { value: 'tbd', label: 'Afklares' },
        ],
        required: true,
      },
    ],
  },
  {
    title: 'F. Compliance, samtykke & ekstra',
    description: 'Afslut med nødvendige samtykker og evt. bilag.',
    fields: [
      {
        name: 'authorized',
        label: 'Jeg har mandat til at køre processen / tage imod praktikanter',
        type: 'checkbox',
        required: true,
      },
      {
        name: 'consent',
        label: `Jeg giver samtykke til, at ${brandName} må kontakte mig`,
        type: 'checkbox',
        required: true,
      },
      {
        name: 'acceptPolicies',
        label: 'Jeg accepterer Privatlivspolitik & Vilkår',
        type: 'checkbox',
        required: true,
      },
      {
        name: 'preferredDocs',
        label: 'Foretrukne dokumenter',
        type: 'checkbox-group',
        options: [
          { value: 'ours', label: 'Vores skabelon' },
          { value: 'company', label: 'Jeres skabelon' },
          { value: 'tbd', label: 'Afklares' },
        ],
        required: true,
      },
      {
        name: 'attachments',
        label: 'Bilag (valgfrit)',
        type: 'file',
        helpText: 'Upload projektbeskrivelse, rollebeskrivelse, brandguide, NDA (PDF/DOCX/PPTX, ≤10 MB).',
      },
      {
        name: 'additionalNotes',
        label: 'Ekstra noter',
        type: 'textarea',
        placeholder: 'Evt. ekstra information eller links.',
      },
    ],
    note: 'Svar gerne med TBD hvis noget afventer afklaring – så kan vi alligevel komme i gang.',
  },
];

const content = {
  en: {
    brand: brandName,
    nav: [
      { href: '#how-we-help', label: 'How we help' },
      { href: '#story', label: 'Story' },
      { href: '#roles', label: 'Roles' },
      { href: '#process', label: 'How it works' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#faq', label: 'FAQ' },
      { href: '#contact', label: 'Contact' },
    ],
    hero: {
      headline: 'Hire Swedish interns, simply — for Danish companies.',
      subheadline: 'Fast, low-friction matching across the Øresund. Minimal fee. Real impact.',
      primaryCta: 'Get candidates',
      secondaryCta: 'Talk to us',
      microStory: `Mikkel, a hiring manager in Copenhagen, has a roadmap full of ideas but not enough hands. Across the Øresund, Lina in Malmö is looking for a meaningful internship to launch her career. ${brandName} bridges this gap—matching Danish teams with motivated Swedish interns in days, not months.`,
    },
    valueProps: [
      {
        title: 'Cost-effective',
        description: 'Only a minimal matching fee—no subscriptions, no surprises.',
      },
      {
        title: 'Quality over quantity',
        description: 'Handpicked candidates who fit your project and culture.',
      },
      {
        title: 'Lightweight process',
        description: 'We guide you from role scoping to onboarding.',
      },
      {
        title: 'Cross-border made easy',
        description: 'Practical guidance on contracts, expectations, and logistics.',
      },
      {
        title: 'Flexible modes',
        description: 'On-site (Greater Copenhagen), hybrid, or remote.',
      },
      {
        title: 'Promise',
        description: 'Save time, reduce hiring risk, and give future talent a chance to shine.',
      },
    ],
    story: {
      challenge: {
        title: 'The challenge',
        copy: 'Small and mid-sized Danish companies often struggle to find affordable, motivated talent for well-scoped projects.',
      },
      bridge: {
        title: 'The bridge',
        copy: 'Just across the Øresund, Sweden has a strong pipeline of students and recent grads eager to contribute—often as part of their study programmes.',
      },
      outcome: {
        title: 'The outcome',
        copy: `With ${brandName}, you get a short, focused process and a shortlist of motivated Swedish interns who can deliver value—without heavy admin or high fees.`,
      },
    },
    roles: [
      {
        title: 'Business & Marketing',
        copy: 'Marketing, Growth, Content, Sales Ops, CSR',
      },
      {
        title: 'Tech & Data',
        copy: 'Software Development, QA, Data Analysis, BI, ML (junior)',
      },
      {
        title: 'Design & Product',
        copy: 'UX/UI, Graphic Design, Product Research',
      },
      {
        title: 'Operations & Supply',
        copy: 'Operations, Procurement support, Logistics',
      },
      {
        title: 'People & Admin',
        copy: 'HR support, Talent sourcing (junior), Office Ops',
      },
    ],
    process: {
      steps: [
        {
          title: 'Tell us your needs',
          copy: 'Share a short brief (goals, tasks, tools, duration). We’ll help you sharpen it in one short call if needed.',
        },
        {
          title: 'We handpick candidates',
          copy: 'We screen for motivation, skills, availability, and language (English/Swedish; some speak Danish too).',
        },
        {
          title: 'You interview & decide',
          copy: 'Meet 2–4 strong candidates. Choose the best fit.',
        },
        {
          title: 'Onboard with confidence',
          copy: 'We provide a simple starter pack (scope, outcomes, check-ins) to set everyone up for success.',
        },
        {
          title: 'We stay close',
          copy: 'Light support during the first month to ensure a smooth experience.',
        },
      ],
      cta: 'Get candidates',
    },
    pricing: {
      title: 'Transparent, minimal fee',
      copy: [
        'A single matching fee payable only when you confirm an intern. No subscriptions. No hidden costs.',
        'Set your budget: You define the internship allowance or stipend (if applicable) and the expected duration.',
        'Flat fee example: Flat fee: DKK 7,500, charged only on successful match.',
      ],
    },
    compliance: {
      title: 'Compliance & Practicalities',
      items: [
        'Agreement type: We share template agreements and checklists you can adapt with your legal/HR.',
        'Allowance / stipend: Many companies offer a stipend or benefits; requirements vary—we’ll point you to official guidance.',
        'Schedule & duration: Typical internships range from 8–24 weeks; decide what fits your scope.',
        'Location: On-site (Greater Copenhagen), hybrid, or remote.',
        'Languages: English is usually fine. Swedish is common; some candidates speak Danish.',
        'Not legal advice: We provide templates and direction to resources; please confirm details with your HR/legal team.',
      ],
    },
    socialProof: [
      {
        quote: '“We went from idea to intern in three weeks. Clear process and great fit.”',
        author: 'Head of Marketing, Copenhagen scale-up',
      },
      {
        quote: '“The checklist made onboarding simple. Our intern shipped real features.”',
        author: 'CTO, SaaS SME',
      },
    ],
    faq: [
      {
        question: 'Do interns need to be paid?',
        answer: 'Company practices vary. Many offer a stipend or benefits to ensure fairness and commitment. We’ll point you to official resources to help you decide.',
      },
      {
        question: 'How long does the process take?',
        answer: 'You get a curated shortlist quickly once your brief is ready. Interviews can start within days.',
      },
      {
        question: 'Can internships be remote?',
        answer: 'Yes—on-site, hybrid, or remote, depending on your needs and the candidate’s location.',
      },
      {
        question: 'What if it isn’t a fit?',
        answer: 'Tell us promptly; we’ll rematch where possible.',
      },
      {
        question: 'What languages do candidates speak?',
        answer: 'English is standard; Swedish is common, and some speak Danish.',
      },
      {
        question: 'Do you help with contracts and documents?',
        answer: 'Yes—templates and checklists. You remain the employer/host organisation.',
      },
    ],
    contact: {
      hero: 'Contact us',
      quick: {
        title: 'Option A — Leave your email (fastest)',
        description: 'We’ll send you the starter kit and next steps.',
        emailLabel: 'Email (required)',
        emailPlaceholder: 'name@company.dk',
        consentLabel: `I consent to be contacted by ${brandName} about my inquiry.`,
        privacy: 'We’ll never share your email. Unsubscribe anytime.',
        submitLabel: 'Send me the starter kit',
        successTitle: 'Thanks! Starter kit on the way.',
        successMessage: 'Check your inbox for our starter kit and next steps.',
        errors: {
          email: 'Please enter a valid email.',
          consent: 'Please provide consent so we can follow up.',
        },
        notice: 'Prefer a call? Mention it in the full form — we’ll book a slot.',
      },
      full: {
        title: 'Option B — Tell us about your company',
        description: 'We’ll prepare tailored candidate suggestions based on the details you share.',
        initialValues: sharedInitialValues,
        steps: formStepsEn,
        successTitle: 'Great—thank you!',
        successMessage: 'We’ll review your details and reach out with a shortlist.',
        errors: {
          required: 'This field is required.',
          email: 'Please enter a valid email.',
          cvr: 'CVR must be numbers only (8 digits).',
        },
        placeholders: {
          select: 'Select an option',
        },
        actions: {
          back: 'Back',
          next: 'Next',
          submit: 'Get tailored candidates',
        },
      },
      downloadLabel: 'Download brief template',
    },
    cheatSheet: {
      title: 'Matching cheat-sheet (how your fields guide our routing)',
      bullets: [
        'Area + tasks + tools → map to candidate skill tags.',
        'Hours + duration + start → align availability filters.',
        'Work mode + location + on-site days → Copenhagen commute vs remote pool.',
        'Languages → English-first vs Danish-preferred teams.',
        'Supervision capacity → balance independent vs guided interns.',
        'NDA / access level → match candidates experienced with confidentiality.',
        'Budget → align expectations and candidate motivation.',
      ],
    },
    footer: {
      legal: `${brandName} ApS`,
      address: '[Address line 1], [Postcode] [City], Denmark',
      email: 'hello@oresundtalent.com',
      links: ['Privacy Policy', 'Terms', 'Cookie Settings', 'LinkedIn'],
      copy: `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
    },
  },
  da: {
    brand: brandName,
    nav: [
      { href: '#how-we-help', label: 'Værdien' },
      { href: '#story', label: 'Historien' },
      { href: '#roles', label: 'Roller' },
      { href: '#process', label: 'Sådan fungerer det' },
      { href: '#pricing', label: 'Priser' },
      { href: '#faq', label: 'FAQ' },
      { href: '#contact', label: 'Kontakt' },
    ],
    hero: {
      headline: 'Ansæt svenske praktikanter – enkelt for danske virksomheder.',
      subheadline: 'Hurtig, friktionsfri matching på tværs af Øresund. Minimalt gebyr. Stor effekt.',
      primaryCta: 'Få kandidater',
      secondaryCta: 'Tal med os',
      microStory: `Mikkel i København har en ambitiøs plan – men for få hænder. På den anden side af Øresund søger Lina i Malmö en meningsfuld praktikplads. ${brandName} bygger broen og matcher danske teams med motiverede svenske praktikanter – på uger, ikke måneder.`,
    },
    valueProps: [
      {
        title: 'Omkostningseffektivt',
        description: 'Kun et minimalt formidlingsgebyr – ingen abonnementer, ingen overraskelser.',
      },
      {
        title: 'Kvalitet frem for kvantitet',
        description: 'Nøje udvalgte kandidater, der passer til opgaven og kulturen.',
      },
      {
        title: 'Let proces',
        description: 'Vi hjælper jer fra rollebeskrivelse til onboarding.',
      },
      {
        title: 'Klarhed på tværs af grænser',
        description: 'Praktiske skabeloner til aftaler og forventninger.',
      },
      {
        title: 'Fleksibelt',
        description: 'On-site (Storkøbenhavn), hybrid eller remote.',
      },
      {
        title: 'Løfte',
        description: 'Spar tid, sænk risikoen, og giv fremtidens talent plads til at levere.',
      },
    ],
    story: {
      challenge: {
        title: 'Udfordringen',
        copy: 'Små og mellemstore danske virksomheder mangler ofte motiveret, betalbar arbejdskraft til klart definerede projekter.',
      },
      bridge: {
        title: 'Broen',
        copy: 'Sverige har et stærkt flow af studerende og nyuddannede, der ønsker reel erfaring – ofte som led i deres uddannelse.',
      },
      outcome: {
        title: 'Resultatet',
        copy: `Med ${brandName} får I en fokuseret proces og en shortlist af motiverede svenske praktikanter – uden tung administration eller høje gebyrer.`,
      },
    },
    roles: [
      {
        title: 'Business & Marketing',
        copy: 'Marketing, Growth, Content, Sales Ops, CSR',
      },
      {
        title: 'Tech & Data',
        copy: 'Softwareudvikling, QA, Dataanalyse, BI, ML (junior)',
      },
      {
        title: 'Design & Produkt',
        copy: 'UX/UI, Grafisk design, Produktresearch',
      },
      {
        title: 'Drift & Supply',
        copy: 'Operations, Indkøbssupport, Logistik',
      },
      {
        title: 'People & Admin',
        copy: 'HR-support, Talent sourcing (junior), Office Ops',
      },
    ],
    process: {
      steps: [
        {
          title: 'Fortæl om jeres behov',
          copy: 'Del en kort brief (mål, opgaver, værktøjer, varighed). Vi kan skærpe den i et kort kald.',
        },
        {
          title: 'Vi håndplukker kandidater',
          copy: 'Screening for motivation, kompetencer, tilgængelighed og sprog (engelsk/svensk – nogle taler også dansk).',
        },
        {
          title: 'I interviewer & vælger',
          copy: 'Mød 2–4 stærke kandidater. Vælg det bedste match.',
        },
        {
          title: 'Onboarding med ro i maven',
          copy: 'Vi deler et enkelt startkit (scope, forventede resultater, check-ins).',
        },
        {
          title: 'Vi følger op',
          copy: 'Let støtte den første måned for en smidig oplevelse.',
        },
      ],
      cta: 'Få kandidater',
    },
    pricing: {
      title: 'Gennemsigtigt, minimalt gebyr',
      copy: [
        'Ét formidlingsgebyr, der kun betales, når I bekræfter praktikanten. Ingen abonnementer. Ingen skjulte omkostninger.',
        'Fastlæg rammerne: I definerer evt. godtgørelse/benefits og varighed.',
        'Eksempel på fast gebyr: Fast gebyr: 7.500 DKK, kun ved succesfuldt match.',
      ],
    },
    compliance: {
      title: 'Compliance & praktik (let forståeligt)',
      items: [
        'Aftaletype: Vi stiller skabeloner og tjeklister til rådighed – tilpas sammen med HR/juridisk.',
        'Godtgørelse: Mange virksomheder giver en godtgørelse eller benefits; krav varierer – vi henviser til officielle kilder.',
        'Tid & længde: Typisk 8–24 uger – vælg det, der passer til opgaven.',
        'Sted: On-site (Storkøbenhavn), hybrid eller remote.',
        'Sprog: Engelsk fungerer ofte fint; svensk er almindeligt, og nogle taler dansk.',
        'Ikke juridisk rådgivning: Vi deler skabeloner og ressourcer; bekræft detaljer med HR/juridisk.',
      ],
    },
    socialProof: [
      {
        quote: '“Fra behov til praktikant på tre uger. Klar proces og stærkt match.”',
        author: 'Marketingchef, københavnsk scale-up',
      },
      {
        quote: '“Onboarding-tjeklisten gjorde det nemt. Vores praktikant leverede reelle features.”',
        author: 'CTO, SaaS-SMV',
      },
    ],
    faq: [
      {
        question: 'Skal praktikanter have godtgørelse?',
        answer: 'Praksis varierer. Mange giver en godtgørelse eller benefits for fairness og commitment. Vi henviser til officielle ressourcer.',
      },
      {
        question: 'Hvor hurtigt går processen?',
        answer: 'Når jeres brief er klar, får I hurtigt en kurateret shortlist. Interviews kan starte inden for få dage.',
      },
      {
        question: 'Kan praktik være remote?',
        answer: 'Ja – on-site, hybrid eller remote alt efter behov og kandidatens placering.',
      },
      {
        question: 'Hvad hvis matchet ikke er rigtigt?',
        answer: 'Giv os besked med det samme; vi rematcher, hvor det er muligt.',
      },
      {
        question: 'Hvilke sprog taler kandidaterne?',
        answer: 'Engelsk som minimum; svensk er almindeligt, og nogle taler dansk.',
      },
      {
        question: 'Hjælper I med aftaler og dokumenter?',
        answer: 'Ja – skabeloner og tjeklister. I er fortsat værtsvirksomheden/arbejdsgiver.',
      },
    ],
    contact: {
      hero: 'Kontakt os',
      quick: {
        title: 'Mulighed A – Efterlad din e-mail (hurtigst)',
        description: 'Vi sender vores startkit og næste skridt.',
        emailLabel: 'E-mail (påkrævet)',
        emailPlaceholder: 'navn@virksomhed.dk',
        consentLabel: `Jeg giver samtykke til, at ${brandName} må kontakte mig vedr. min henvendelse.`,
        privacy: 'Vi deler aldrig din e-mail. Afmeld når som helst.',
        submitLabel: 'Send mig startkittet',
        successTitle: 'Tak! Startkit er på vej.',
        successMessage: 'Tjek din indbakke for startkit og næste skridt.',
        errors: {
          email: 'Angiv en gyldig e-mail.',
          consent: 'Samtykke er nødvendigt for, at vi må kontakte dig.',
        },
        notice: 'Foretrækker du et kald? Nævn det i den fulde formular – så booker vi.',
      },
      full: {
        title: 'Mulighed B – Fortæl om jeres virksomhed',
        description: 'Så forbereder vi målrettede kandidatforslag.',
        initialValues: sharedInitialValues,
        steps: formStepsDa,
        successTitle: 'Tak for jeres oplysninger!',
        successMessage: 'Vi vender tilbage med en shortlist, der matcher opgaver, værktøjer og tid.',
        errors: {
          required: 'Dette felt er påkrævet.',
          email: 'Angiv en gyldig e-mail.',
          cvr: 'CVR må kun indeholde tal (8 cifre).',
        },
        placeholders: {
          select: 'Vælg en mulighed',
        },
        actions: {
          back: 'Tilbage',
          next: 'Næste',
          submit: 'Få målrettede kandidater',
        },
      },
      downloadLabel: 'Download brief-skabelon',
    },
    cheatSheet: {
      title: 'Matching cheat-sheet (sådan bruger vi jeres input)',
      bullets: [
        'Område + opgaver + værktøjer → matcher til kandidaters kompetencer.',
        'Timer + varighed + start → sikrer tilgængelighed.',
        'Arbejdsform + lokation + on-site dage → kobler pendler vs. remote profiler.',
        'Sprog → balancerer engelsksprogede vs. dansksprogede teams.',
        'Mentor-tid → anbefaler mere selvstændige vs. guidede profiler.',
        'NDA / adgang → kandidater med erfaring i fortroligt arbejde.',
        'Budget → sikrer forventningsafstemning og motivation.',
      ],
    },
    footer: {
      legal: `${brandName} ApS`,
      address: '[Adresselinje 1], [Postnr.] [By], Danmark',
      email: 'hej@oresundtalent.com',
      links: ['Privatlivspolitik', 'Vilkår', 'Cookieindstillinger', 'LinkedIn'],
      copy: `© ${new Date().getFullYear()} ${brandName}. Alle rettigheder forbeholdes.`,
    },
  },
};

export default function HomePage() {
  const params = useParams();
  const locale = params?.locale || 'da';

  const text = useMemo(() => {
    if (locale === 'sv') {
      return content.en;
    }
    return content[locale] || content.da;
  }, [locale]);

  return (
    <div className="bg-white text-zinc-900">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-lg">{text.brand}</span>
                <span className="text-xs text-zinc-500">Øresund internship matchmaking</span>
              </div>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
              {text.nav.map((item) => (
                <a key={item.href} href={item.href} className="text-zinc-600 hover:text-blue-600">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${locale}/auth/login`}>Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/${locale}/auth/signup/company`}>{text.hero.primaryCta}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center" id="hero">
          <Badge variant="secondary" className="mx-auto mb-4 w-fit">
            🇩🇰 ↔️ 🇸🇪 Øresund bridge for talent
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            {text.hero.headline}
          </h1>
          <p className="mt-6 text-lg text-zinc-600 sm:text-xl">{text.hero.subheadline}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/${locale}/auth/signup/company`}>
                <Building2 className="h-5 w-5" />
                {text.hero.primaryCta}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="#contact">
                <MessageSquare className="h-5 w-5" />
                {text.hero.secondaryCta}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="gap-2 text-zinc-600">
              <Link href={`/${locale}/auth/signup/student`}>
                <Users className="h-5 w-5" />
                {locale === 'da' ? 'Jeg er studerende' : 'I’m a student'}
              </Link>
            </Button>
          </div>
          <Card className="mx-auto mt-10 max-w-3xl text-left">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-blue-600">
                {locale === 'da' ? 'Kort historie' : 'Hero micro-story'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-zinc-600">{text.hero.microStory}</CardContent>
          </Card>
        </section>

        <section id="how-we-help" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-zinc-900">
            {locale === 'da' ? 'Værdien for jer' : 'How we help'}
          </h2>
          <p className="mt-2 text-zinc-600">
            {locale === 'da'
              ? 'Det handler om effektive match, tydelig forventningsafstemning og et flow, der sparer jer tid.'
              : 'It’s all about focused matches, crisp expectations, and a flow that saves your team time.'}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {text.valueProps.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="story" className="bg-zinc-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold text-zinc-900">
              {locale === 'da' ? 'Historien' : 'The story'}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[text.story.challenge, text.story.bridge, text.story.outcome].map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-zinc-600">{item.copy}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-zinc-900">
                {locale === 'da' ? 'Roller vi ofte besætter' : 'Roles we commonly place'}
              </h2>
              <p className="mt-1 text-zinc-600">
                {locale === 'da'
                  ? 'Ser du ikke jeres rolle? Skriv – sandsynligvis kan vi hjælpe.'
                  : 'Don’t see your role? Ask us—odds are we’ve got candidates.'}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="#contact">
                <ArrowRight className="mr-2 h-4 w-4" />
                {locale === 'da' ? 'Lad os tage en snak' : 'Start a conversation'}
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {text.roles.map((role) => (
              <Card key={role.title}>
                <CardHeader>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.copy}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="process" className="bg-blue-950 py-16 text-blue-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="lg:w-1/3">
                <h2 className="text-3xl font-semibold">
                  {locale === 'da' ? 'Sådan fungerer det' : 'How it works'}
                </h2>
                <p className="mt-4 text-sm text-blue-200">
                  {locale === 'da'
                    ? 'Kort, fokuseret proces fra behov til shortlist. Vi står ved jeres side hele vejen.'
                    : 'A short, focused process from brief to shortlist. We stay close throughout.'}
                </p>
                <Button asChild className="mt-6 bg-white text-blue-900 hover:bg-blue-100">
                  <Link href={`/${locale}/auth/signup/company`}>
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    {text.process.cta}
                  </Link>
                </Button>
              </div>
              <div className="space-y-6 lg:w-2/3">
                {text.process.steps.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-blue-300 bg-blue-900/40 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-sm text-blue-200">{step.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-zinc-900">{text.pricing.title}</h2>
              <Separator className="my-4" />
              <ul className="space-y-3 text-zinc-600">
                {text.pricing.copy.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <FileText className="mt-1 h-4 w-4 text-blue-600" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{text.compliance.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-zinc-600">
                  {text.compliance.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Handshake className="mt-1 h-4 w-4 text-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-zinc-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-semibold text-zinc-900">
              {locale === 'da' ? 'Social proof' : 'Social proof'}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {text.socialProof.map((item) => (
                <Card key={item.quote}>
                  <CardContent className="space-y-4 pt-6 text-zinc-600">
                    <p className="text-lg">{item.quote}</p>
                    <p className="text-sm font-medium text-zinc-500">{item.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-zinc-900">FAQ</h2>
          <div className="mt-8 space-y-4">
            {text.faq.map((item) => (
              <details key={item.question} className="rounded-lg border border-zinc-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-900">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="bg-blue-950 py-16 text-blue-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">{text.contact.hero}</h2>
                <p className="mt-2 text-sm text-blue-200">
                  {locale === 'da'
                    ? 'Vælg den løsning, der passer jer – hurtig e-mail eller den fulde match-formular.'
                    : 'Choose the path that fits: quick email handoff or the full matching brief.'}
                </p>
              </div>
              <Button asChild variant="secondary" className="bg-white text-blue-900 hover:bg-blue-100">
                <Link href={briefTemplateHref} download>
                  <FileText className="mr-2 h-4 w-4" />
                  {text.contact.downloadLabel}
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <Card className="border-blue-200 bg-white text-zinc-900">
                <CardHeader>
                  <CardTitle>{text.contact.quick.title}</CardTitle>
                  <CardDescription>{text.contact.quick.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployerQuickForm copy={text.contact.quick} />
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-white text-zinc-900">
                <CardHeader>
                  <CardTitle>{text.contact.full.title}</CardTitle>
                  <CardDescription>{text.contact.full.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployerFullForm copy={text.contact.full} />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-zinc-900">{text.cheatSheet.title}</h2>
          <ul className="mt-6 space-y-3 text-sm text-zinc-600">
            {text.cheatSheet.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <Sparkles className="mt-1 h-4 w-4 text-blue-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{text.footer.legal}</p>
            <p className="text-xs text-zinc-500">{text.footer.address}</p>
            <a href="mailto:hello@oresundtalent.com" className="text-xs text-blue-600">
              {text.footer.email}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            {text.footer.links.map((link) => (
              <a key={link} href="#" className="hover:text-blue-600">
                {link}
              </a>
            ))}
          </div>
          <p className="text-xs text-zinc-500">{text.footer.copy}</p>
        </div>
      </footer>
    </div>
  );
}
