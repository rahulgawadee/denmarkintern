'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowRight, ArrowLeft, Check, Save } from 'lucide-react';
import ChipInput from './ChipInput';

export default function FullRoleForm({ locale = 'da' }) {
  const router = useRouter();
  const params = useParams();
  const token = useSelector((state) => state.auth.token);
  
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  
  const [formData, setFormData] = useState({
    // Step A: Company Info (prefilled)
    // Step B: Role Overview
    title: '',
    department: '',
    duration: '',
    startDate: '',
    weeklyHours: '',
    workMode: '',
    location: { city: '', address: '' },
    // Step C: Responsibilities
    responsibilities: [],
    // Step D: Skills & Tools
    mustHaveSkills: [],
    niceToHaveSkills: [],
    tools: [],
    // Step E: Requirements
    languageRequirements: [{ language: 'English', level: 'B2' }],
    academicLevel: [],
    fieldOfStudy: [],
    // Step F: Compensation
    stipend: '',
    benefits: [],
    // Step G: Additional
    description: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = locale === 'da' ? {
    stepA: 'Virksomhedsinfo',
    stepB: 'Rolleoversigt',
    stepC: 'Ansvarsområder',
    stepD: 'Færdigheder & Værktøjer',
    stepE: 'Krav',
    stepF: 'Kompensation',
    stepG: 'Opsummering',
    next: 'Næste',
    back: 'Tilbage',
    saveDraft: 'Gem som udkast',
    submit: 'Indsend til matching',
    submitting: 'Indsender...',
    // Fields
    title: 'Stillingsbetegnelse',
    department: 'Afdeling',
    duration: 'Varighed',
    startDate: 'Startdato',
    weeklyHours: 'Timer per uge',
    workMode: 'Arbejdsform',
    location: 'Placering',
    city: 'By',
    address: 'Adresse',
    responsibilities: 'Ansvarsområder',
    responsibilitiesHelp: 'Tilføj opgaver (maks 5)',
    mustHaveSkills: 'Nødvendige færdigheder',
    niceToHaveSkills: 'Nice-to-have færdigheder',
    tools: 'Værktøjer & teknologier',
    languageReq: 'Sprogkrav',
    academicLevel: 'Uddannelsesniveau',
    fieldOfStudy: 'Studieretning',
    stipend: 'Løn/Stipend',
    benefits: 'Fordele',
    description: 'Fuld beskrivelse',
    // Options
    departments: {
      Marketing: 'Marketing',
      IT: 'IT',
      HR: 'HR',
      Sales: 'Salg',
      Finance: 'Finans',
      Operations: 'Drift',
      Design: 'Design',
      Other: 'Andet',
    },
    workModes: {
      onsite: 'På stedet',
      remote: 'Fjern',
      hybrid: 'Hybrid',
    },
    durations: {
      '8-12': '8-12 uger',
      '13-16': '13-16 uger',
      '17-24': '17-24 uger',
      '25+': '25+ uger',
    },
    weeklyHoursOptions: {
      '8-15': '8-15 timer',
      '16-20': '16-20 timer',
      '21-30': '21-30 timer',
      '31-37': '31-37 timer',
    },
    stipendOptions: {
      none: 'Ingen',
      '<2000': '< 2000 DKK',
      '2000-4999': '2000-4999 DKK',
      '5000-7999': '5000-7999 DKK',
      '8000+': '8000+ DKK',
      not_decided: 'Ikke besluttet',
    },
    academicLevels: {
      bachelor: 'Bachelor',
      master: 'Master',
      vocational: 'Erhvervsuddannelse',
      recent_graduate: 'Nyuddannet',
    },
  } : {
    stepA: 'Company Info',
    stepB: 'Role Overview',
    stepC: 'Responsibilities',
    stepD: 'Skills & Tools',
    stepE: 'Requirements',
    stepF: 'Compensation',
    stepG: 'Summary',
    next: 'Next',
    back: 'Back',
    saveDraft: 'Save as Draft',
    submit: 'Submit for Matching',
    submitting: 'Submitting...',
    // Fields
    title: 'Job Title',
    department: 'Department',
    duration: 'Duration',
    startDate: 'Start Date',
    weeklyHours: 'Weekly Hours',
    workMode: 'Work Mode',
    location: 'Location',
    city: 'City',
    address: 'Address',
    responsibilities: 'Responsibilities',
    responsibilitiesHelp: 'Add tasks (max 5)',
    mustHaveSkills: 'Must-have Skills',
    niceToHaveSkills: 'Nice-to-have Skills',
    tools: 'Tools & Technologies',
    languageReq: 'Language Requirements',
    academicLevel: 'Academic Level',
    fieldOfStudy: 'Field of Study',
    stipend: 'Stipend',
    benefits: 'Benefits',
    description: 'Full Description',
    // Options
    departments: {
      Marketing: 'Marketing',
      IT: 'IT',
      HR: 'HR',
      Sales: 'Sales',
      Finance: 'Finance',
      Operations: 'Operations',
      Design: 'Design',
      Other: 'Other',
    },
    workModes: {
      onsite: 'On-site',
      remote: 'Remote',
      hybrid: 'Hybrid',
    },
    durations: {
      '8-12': '8-12 weeks',
      '13-16': '13-16 weeks',
      '17-24': '17-24 weeks',
      '25+': '25+ weeks',
    },
    weeklyHoursOptions: {
      '8-15': '8-15 hours',
      '16-20': '16-20 hours',
      '21-30': '21-30 hours',
      '31-37': '31-37 hours',
    },
    stipendOptions: {
      none: 'None',
      '<2000': '< 2000 DKK',
      '2000-4999': '2000-4999 DKK',
      '5000-7999': '5000-7999 DKK',
      '8000+': '8000+ DKK',
      not_decided: 'Not decided',
    },
    academicLevels: {
      bachelor: 'Bachelor',
      master: 'Master',
      vocational: 'Vocational',
      recent_graduate: 'Recent Graduate',
    },
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const handleNext = () => {
    setError('');
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (status = 'under_review') => {
    setError('');
    setLoading(true);

    try {
      // Map department to area enum
      const departmentToAreaMap = {
        'Marketing': 'business_marketing',
        'IT': 'tech_data',
        'HR': 'people_admin',
        'Finance': 'business_marketing',
        'Sales': 'business_marketing',
        'Design': 'design_product',
        'Engineering': 'tech_data',
        'Customer Service': 'people_admin',
        'Operations': 'operations_supply',
        'Legal': 'people_admin',
        'Other': 'other'
      };

      const res = await fetch('/api/internships/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status,
          area: [departmentToAreaMap[formData.department] || 'other'],
          specificStartDate: formData.startDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create role');
      }

      router.push(`/${locale}/dashboard/company?success=role_created`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>
            {copy[`step${String.fromCharCode(64 + step)}`]} ({step}/{totalSteps})
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="min-h-[400px]">
        {/* Step B: Role Overview */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.stepB}</h3>

            <div className="space-y-2">
              <Label htmlFor="title">{copy.title} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Marketing Intern"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{copy.department} *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(copy.departments).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{copy.duration} *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleChange('duration', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(copy.durations).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{copy.startDate} *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>{copy.weeklyHours} *</Label>
                <Select
                  value={formData.weeklyHours}
                  onValueChange={(value) => handleChange('weeklyHours', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(copy.weeklyHoursOptions).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{copy.workMode} *</Label>
                <Select
                  value={formData.workMode}
                  onValueChange={(value) => handleChange('workMode', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(copy.workModes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{copy.city}</Label>
                <Input
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  placeholder="Copenhagen"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step C: Responsibilities */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.stepC}</h3>
            <ChipInput
              id="responsibilities"
              label={copy.responsibilities}
              placeholder="Press Enter to add"
              helpText={copy.responsibilitiesHelp}
              values={formData.responsibilities}
              onChange={(values) => handleChange('responsibilities', values)}
              max={5}
            />
          </div>
        )}

        {/* Step D: Skills & Tools */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.stepD}</h3>
            
            <ChipInput
              id="mustHaveSkills"
              label={copy.mustHaveSkills}
              placeholder="e.g. Excel, Communication"
              values={formData.mustHaveSkills}
              onChange={(values) => handleChange('mustHaveSkills', values)}
              max={5}
            />

            <ChipInput
              id="niceToHaveSkills"
              label={copy.niceToHaveSkills}
              placeholder="e.g. Figma, SEO"
              values={formData.niceToHaveSkills}
              onChange={(values) => handleChange('niceToHaveSkills', values)}
              max={5}
            />

            <ChipInput
              id="tools"
              label={copy.tools}
              placeholder="e.g. Salesforce, Slack"
              values={formData.tools}
              onChange={(values) => handleChange('tools', values)}
              max={5}
            />
          </div>
        )}

        {/* Step E: Requirements */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.stepE}</h3>

            <div className="space-y-2">
              <Label>{copy.academicLevel}</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(copy.academicLevels).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant={formData.academicLevel.includes(key) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = formData.academicLevel;
                      const updated = current.includes(key)
                        ? current.filter((l) => l !== key)
                        : [...current, key];
                      handleChange('academicLevel', updated);
                    }}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </div>

            <ChipInput
              id="fieldOfStudy"
              label={copy.fieldOfStudy}
              placeholder="e.g. Business, Computer Science"
              values={formData.fieldOfStudy}
              onChange={(values) => handleChange('fieldOfStudy', values)}
              max={3}
            />
          </div>
        )}

        {/* Step F: Compensation */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.stepF}</h3>

            <div className="space-y-2">
              <Label>{copy.stipend}</Label>
              <Select
                value={formData.stipend}
                onValueChange={(value) => handleChange('stipend', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(copy.stipendOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ChipInput
              id="benefits"
              label={copy.benefits}
              placeholder="e.g. Free lunch, Flexible hours"
              values={formData.benefits}
              onChange={(values) => handleChange('benefits', values)}
              max={5}
            />
          </div>
        )}

        {/* Step G: Summary */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{copy.stepG}</h3>

            <div className="space-y-2">
              <Label>{copy.description}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the full internship opportunity..."
                rows={6}
                disabled={loading}
              />
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-zinc-200 p-4 space-y-3 bg-zinc-50">
              <h4 className="font-semibold text-zinc-900">{formData.title || 'Role Title'}</h4>
              <div className="flex flex-wrap gap-2">
                {formData.department && <Badge>{formData.department}</Badge>}
                {formData.duration && <Badge variant="outline">{formData.duration}</Badge>}
                {formData.workMode && <Badge variant="outline">{copy.workModes[formData.workMode]}</Badge>}
              </div>
              {formData.responsibilities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Responsibilities:</p>
                  <ul className="text-sm text-zinc-600 list-disc list-inside">
                    {formData.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Step: Confirmation */}
        {step === 7 && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Review and Submit</h3>
            <p className="text-zinc-600">
              {locale === 'da'
                ? 'Du er klar til at indsende din praktikrolle til matching!'
                : 'You are ready to submit your internship role for matching!'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {copy.back}
        </Button>

        <div className="flex gap-2">
          {step < totalSteps && (
            <>
              <ActionButton
                variant="outline"
                icon={Save}
                onClick={() => handleSubmit('draft')}
                loading={loading}
              >
                {copy.saveDraft}
              </ActionButton>
              <ActionButton
                icon={ArrowRight}
                onClick={handleNext}
                disabled={loading}
              >
                {copy.next}
              </ActionButton>
            </>
          )}

          {step === totalSteps && (
            <ActionButton
              icon={Check}
              onClick={() => handleSubmit('under_review')}
              loading={loading}
              loadingText={copy.submitting}
            >
              {copy.submit}
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
