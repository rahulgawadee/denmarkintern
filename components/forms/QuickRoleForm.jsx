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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowRight, Save } from 'lucide-react';

export default function QuickRoleForm({ locale = 'da' }) {
  const router = useRouter();
  const params = useParams();
  const token = useSelector((state) => state.auth.token);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    workMode: '',
    duration: { value: '', unit: 'weeks' },
    startDate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = locale === 'da' ? {
    step1Title: 'Trin 1: Grundlæggende info',
    step2Title: 'Trin 2: Arbejdsdetaljer',
    title: 'Rolletitel',
    titlePlaceholder: 'f.eks. Marketing Praktikant',
    department: 'Afdeling',
    departmentPlaceholder: 'Vælg afdeling',
    workMode: 'Arbejdsform',
    workModePlaceholder: 'Vælg arbejdsform',
    duration: 'Varighed',
    durationValue: 'Værdi',
    weeks: 'Uger',
    months: 'Måneder',
    startDate: 'Startdato',
    description: 'Beskrivelse',
    descriptionPlaceholder: 'Beskriv praktikrollen...',
    next: 'Næste',
    back: 'Tilbage',
    saveDraft: 'Gem som udkast',
    departments: {
      Marketing: 'Marketing',
      IT: 'IT',
      HR: 'HR',
      Finance: 'Finance',
      Sales: 'Sales',
      Design: 'Design',
      Engineering: 'Engineering',
      'Customer Service': 'Customer Service',
      Operations: 'Operations',
      Legal: 'Legal',
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
    errors: {
      required: 'Udfyld venligst alle påkrævede felter',
    },
  } : {
    step1Title: 'Step 1: Basic Info',
    step2Title: 'Step 2: Work Details',
    title: 'Role Title',
    titlePlaceholder: 'e.g. Marketing Intern',
    department: 'Department',
    departmentPlaceholder: 'Select department',
    workMode: 'Work Mode',
    workModePlaceholder: 'Select work mode',
    duration: 'Duration',
    durationValue: 'Value',
    weeks: 'Weeks',
    months: 'Months',
    startDate: 'Start Date',
    description: 'Description',
    descriptionPlaceholder: 'Describe the internship role...',
    next: 'Next',
    back: 'Back',
    saveDraft: 'Save as Draft',
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
    errors: {
      required: 'Please fill in all required fields',
    },
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.title || !formData.department) {
      setError(copy.errors.required);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.workMode || !formData.duration.value || !formData.startDate || !formData.description) {
      setError(copy.errors.required);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (status = 'draft') => {
    setError('');
    
    if (!validateStep2()) {
      return;
    }

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
        'Legal': 'people_admin'
      };

      // Convert duration object to string format
      const durationValue = parseInt(formData.duration.value);
      let durationString = '25+';
      if (formData.duration.unit === 'weeks') {
        if (durationValue >= 8 && durationValue <= 12) durationString = '8-12';
        else if (durationValue >= 13 && durationValue <= 16) durationString = '13-16';
        else if (durationValue >= 17 && durationValue <= 24) durationString = '17-24';
        else if (durationValue >= 25) durationString = '25+';
      } else if (formData.duration.unit === 'months') {
        const weeks = durationValue * 4;
        if (weeks >= 8 && weeks <= 12) durationString = '8-12';
        else if (weeks >= 13 && weeks <= 16) durationString = '13-16';
        else if (weeks >= 17 && weeks <= 24) durationString = '17-24';
        else if (weeks >= 25) durationString = '25+';
      }

      const res = await fetch('/api/internships/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          area: [departmentToAreaMap[formData.department] || 'other'],
          workMode: formData.workMode,
          duration: durationString,
          weeklyHours: '21-30', // Default value for quick form
          startWindow: 'asap',
          specificStartDate: formData.startDate ? new Date(formData.startDate) : null,
          description: formData.description,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create role');
      }

      // Redirect to dashboard
      router.push(`/${locale}/dashboard/company?success=role_created`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900">{copy.step1Title}</h3>

          <div className="space-y-2">
            <Label htmlFor="title">{copy.title} *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={copy.titlePlaceholder}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{copy.department} *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange('department', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={copy.departmentPlaceholder} />
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

          <div className="flex justify-end">
            <ActionButton
              icon={ArrowRight}
              onClick={handleNext}
              disabled={loading}
            >
              {copy.next}
            </ActionButton>
          </div>
        </div>
      )}

      {/* Step 2: Work Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900">{copy.step2Title}</h3>

          <div className="space-y-2">
            <Label htmlFor="workMode">{copy.workMode} *</Label>
            <Select
              value={formData.workMode}
              onValueChange={(value) => handleChange('workMode', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={copy.workModePlaceholder} />
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
            <Label htmlFor="duration">{copy.duration} *</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration.value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  duration: { ...prev.duration, value: e.target.value }
                }))}
                placeholder="12"
                className="flex-1"
                required
                disabled={loading}
              />
              <Select
                value={formData.duration.unit}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  duration: { ...prev.duration, unit: value }
                }))}
                disabled={loading}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weeks">{copy.weeks}</SelectItem>
                  <SelectItem value="months">{copy.months}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{copy.startDate} *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{copy.description} *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={copy.descriptionPlaceholder}
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              {copy.back}
            </Button>

            <div className="flex gap-2">
              <ActionButton
                variant="outline"
                icon={Save}
                onClick={() => handleSubmit('draft')}
                loading={loading}
                loadingText={locale === 'da' ? 'Gemmer...' : 'Saving...'}
              >
                {copy.saveDraft}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
