'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ChipInput from '@/components/forms/ChipInput';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, UploadCloud } from 'lucide-react';

// Lightweight progress indicator using div fallback if Progress component missing
const LinearProgress = ({ value }) => {
  return (
    <div className="h-2 w-full rounded-full bg-zinc-200">
      <div
        className="h-2 rounded-full bg-blue-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default function EmployerFullForm({ copy }) {
  const steps = copy.steps;
  const initialData = useMemo(
    () => JSON.parse(JSON.stringify(copy.initialValues)),
    [copy.initialValues]
  );
  const [formData, setFormData] = useState(initialData);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const totalSteps = steps.length;
  const progressValue = Math.round(((step + 1) / totalSteps) * 100);

  const validators = {
    email: (value) => !!value && /^\S+@\S+\.\S+$/.test(value),
    cvr: (value) => !!value && /^\d{8}$/.test(value),
    url: (value) => !value || /^(https?:\/\/)?[\w.-]+(\.[\w\.-]+)+[\w-._~:/?#[\]@!$&'()*+,;=.]+$/.test(value),
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleCheckboxValue = (name, option) => {
    setFormData((prev) => {
      const current = prev[name] || [];
      if (current.includes(option)) {
        return { ...prev, [name]: current.filter((item) => item !== option) };
      }
      return { ...prev, [name]: [...current, option] };
    });
  };

  const validateStep = () => {
    const stepErrors = {};
    const currentStep = steps[step];

    currentStep.fields.forEach((field) => {
      const value = formData[field.name];
      if (field.required) {
        if (Array.isArray(value)) {
          if (!value.length) {
            stepErrors[field.name] = copy.errors.required;
          }
        } else if (typeof value === 'boolean') {
          if (!value) {
            stepErrors[field.name] = copy.errors.required;
          }
        } else if (!value) {
          stepErrors[field.name] = copy.errors.required;
        }
      }

      if (!stepErrors[field.name] && field.validator) {
        const validatorFn = validators[field.validator];
        if (validatorFn && !validatorFn(value)) {
          stepErrors[field.name] = copy.errors[field.validator];
        }
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateStep()) {
      return;
    }
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6 text-sm">
        <div className="flex items-center gap-3 text-blue-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">{copy.successTitle}</span>
        </div>
        <p className="text-blue-700">{copy.successMessage}</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <LinearProgress value={progressValue} />
        <div className="mt-2 flex items-center justify-between text-sm text-zinc-500">
          <span>
            {step + 1} / {totalSteps}
          </span>
          <span>{steps[step].title}</span>
        </div>
      </div>

      {steps[step].description ? (
        <p className="text-sm text-zinc-600">{steps[step].description}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {steps[step].fields.map((field) => {
          const value = formData[field.name];
          const error = errors[field.name];

          if (field.type === 'chips') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <ChipInput
                  id={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  values={value}
                  onChange={(nextValues) => updateField(field.name, nextValues)}
                  max={field.max ?? 5}
                />
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  aria-invalid={error ? 'true' : 'false'}
                />
                {field.helpText ? (
                  <p className="text-xs text-zinc-500">{field.helpText}</p>
                ) : null}
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          if (field.type === 'radio') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label className="mb-2 block">{field.label}</Label>
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(event) => updateField(field.name, event.target.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          if (field.type === 'checkbox-group') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label className="mb-2 block">{field.label}</Label>
                <div className="grid gap-2">
                  {field.options.map((option) => (
                    <label key={option.value} className="flex items-start gap-2 text-sm">
                      <Checkbox
                        checked={(value || []).includes(option.value)}
                        onChange={() => toggleCheckboxValue(field.name, option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {field.helpText ? (
                  <p className="text-xs text-zinc-500">{field.helpText}</p>
                ) : null}
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.name} className={field.colSpan ?? ''}>
                <div className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(value)}
                    onChange={(event) => updateField(field.name, event.target.checked)}
                  />
                  <span>{field.label}</span>
                </div>
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
              </label>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <select
                  id={field.name}
                  value={value}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm"
                  aria-invalid={error ? 'true' : 'false'}
                >
                  <option value="">{copy.placeholders.select}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {error ? <p className="text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          if (field.type === 'file') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id={field.name}
                    type="file"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).map((file) => file.name);
                      updateField(field.name, files);
                    }}
                  />
                  <UploadCloud className="h-5 w-5 text-zinc-400" />
                </div>
                {field.helpText ? (
                  <p className="text-xs text-zinc-500">{field.helpText}</p>
                ) : null}
                {value?.length ? (
                  <p className="text-xs text-zinc-600">
                    {value.length} file(s): {value.join(', ')}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div key={field.name} className={field.colSpan ?? ''}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) => updateField(field.name, event.target.value)}
                aria-invalid={error ? 'true' : 'false'}
              />
              {field.helpText ? (
                <p className="text-xs text-zinc-500">{field.helpText}</p>
              ) : null}
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
            </div>
          );
        })}
      </div>

      {steps[step].note ? (
        <Alert>
          <AlertDescription>{steps[step].note}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
          {copy.actions.back}
        </Button>
        {step < totalSteps - 1 ? (
          <Button type="button" onClick={goNext}>
            {copy.actions.next}
          </Button>
        ) : (
          <Button type="submit">{copy.actions.submit}</Button>
        )}
      </div>
    </form>
  );
}
