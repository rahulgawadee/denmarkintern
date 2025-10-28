'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ChipInput from '@/components/forms/ChipInput';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { submitContactForm, resetFullForm } from '@/store/slices/contactSlice';

// Lightweight progress indicator using div fallback if Progress component missing
const LinearProgress = ({ value }) => {
  return (
    <div className="h-2 w-full rounded-full bg-[#ffefd5]">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-[#ffa07a] to-[#fa8072] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default function EmployerFullForm({ copy }) {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.contact.full);
  
  const steps = copy.steps;
  const initialData = useMemo(
    () => JSON.parse(JSON.stringify(copy.initialValues)),
    [copy.initialValues]
  );
  const [formData, setFormData] = useState(initialData);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset form when component unmounts
    return () => {
      dispatch(resetFullForm());
    };
  }, [dispatch]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep()) {
      return;
    }

    dispatch(submitContactForm({
      type: 'full',
      formData,
    }));
  };

  if (success) {
    return (
      <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-md">
        <div className="flex items-center gap-3 text-blue-700">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg">{copy.successTitle}</span>
        </div>
        <p className="text-blue-700 leading-relaxed">{copy.successMessage}</p>
        <Button 
          onClick={() => {
            setFormData(initialData);
            setStep(0);
            dispatch(resetFullForm());
          }}
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <LinearProgress value={progressValue} />
        <div className="mt-3 flex items-center justify-between text-sm text-[#6b5444]">
          <span className="font-semibold">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="font-medium">{steps[step].title}</span>
        </div>
      </div>

      {steps[step].description ? (
        <p className="text-sm text-[#6b5444] leading-relaxed bg-[#ffefd5]/30 p-3 rounded-lg border border-[#ffe4b5]">
          {steps[step].description}
        </p>
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
                  disabled={loading}
                />
                {error ? (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label htmlFor={field.name} className="text-[#4a3728] font-semibold">
                  {field.label}
                </Label>
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  aria-invalid={error ? 'true' : 'false'}
                  disabled={loading}
                  className="border-2 border-[#ffe4b5] focus:border-[#ffa07a] focus:ring-[#ffa07a] text-[#4a3728] mt-1.5"
                />
                {field.helpText ? (
                  <p className="text-xs text-[#6b5444] mt-1">{field.helpText}</p>
                ) : null}
                {error ? (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }

          if (field.type === 'radio') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label className="mb-2 block text-[#4a3728] font-semibold">{field.label}</Label>
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-[#ffefd5]/30 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        disabled={loading}
                        className="text-[#fa8072] focus:ring-[#ffa07a]"
                      />
                      <span className="text-[#4a3728]">{option.label}</span>
                    </label>
                  ))}
                </div>
                {error ? (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }

          if (field.type === 'checkbox-group') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label className="mb-2 block text-[#4a3728] font-semibold">{field.label}</Label>
                <div className="grid gap-2">
                  {field.options.map((option) => (
                    <label key={option.value} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-[#ffefd5]/30 cursor-pointer transition-colors">
                      <Checkbox
                        checked={(value || []).includes(option.value)}
                        onChange={() => toggleCheckboxValue(field.name, option.value)}
                        disabled={loading}
                      />
                      <span className="text-[#4a3728]">{option.label}</span>
                    </label>
                  ))}
                </div>
                {field.helpText ? (
                  <p className="text-xs text-[#6b5444] mt-1">{field.helpText}</p>
                ) : null}
                {error ? (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.name} className={`${field.colSpan ?? ''} flex items-start gap-2 text-sm p-3 rounded-lg bg-[#ffefd5]/30 border border-[#ffe4b5] cursor-pointer hover:bg-[#ffefd5]/50 transition-colors`}>
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) => updateField(field.name, e.target.checked)}
                  disabled={loading}
                  className="mt-0.5"
                />
                <span className="text-[#4a3728]">{field.label}</span>
                {error ? (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                ) : null}
              </label>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label htmlFor={field.name} className="text-[#4a3728] font-semibold">
                  {field.label}
                </Label>
                <select
                  id={field.name}
                  value={value}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className="mt-1.5 w-full rounded-lg border-2 border-[#ffe4b5] p-2.5 text-sm text-[#4a3728] focus:border-[#ffa07a] focus:ring-[#ffa07a] disabled:opacity-50"
                  aria-invalid={error ? 'true' : 'false'}
                  disabled={loading}
                >
                  <option value="">{copy.placeholders.select}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {error ? (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }

          if (field.type === 'file') {
            return (
              <div key={field.name} className={field.colSpan ?? ''}>
                <Label htmlFor={field.name} className="text-[#4a3728] font-semibold">
                  {field.label}
                </Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Input
                    id={field.name}
                    type="file"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).map((file) => file.name);
                      updateField(field.name, files);
                    }}
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#ffa07a] focus:ring-[#ffa07a]"
                  />
                  <UploadCloud className="h-5 w-5 text-[#ffa07a]" />
                </div>
                {field.helpText ? (
                  <p className="text-xs text-[#6b5444] mt-1">{field.helpText}</p>
                ) : null}
                {value?.length ? (
                  <p className="text-xs text-[#6b5444] mt-2 bg-[#ffefd5]/30 p-2 rounded">
                    {value.length} file(s): {value.join(', ')}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div key={field.name} className={field.colSpan ?? ''}>
              <Label htmlFor={field.name} className="text-[#4a3728] font-semibold">
                {field.label}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={value}
                onChange={(event) => updateField(field.name, event.target.value)}
                aria-invalid={error ? 'true' : 'false'}
                disabled={loading}
                className="border-2 border-[#ffe4b5] focus:border-[#ffa07a] focus:ring-[#ffa07a] text-[#4a3728] mt-1.5"
              />
              {field.helpText ? (
                <p className="text-xs text-[#6b5444] mt-1">{field.helpText}</p>
              ) : null}
              {error ? (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {steps[step].note ? (
        <Alert className="border-[#ffe4b5] bg-[#ffefd5]/20">
          <AlertDescription className="text-[#6b5444]">{steps[step].note}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={goBack} 
          disabled={step === 0 || loading}
          className="border-2 border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5]/50"
        >
          {copy.actions.back}
        </Button>
        {step < totalSteps - 1 ? (
          <Button 
            type="button" 
            onClick={goNext}
            disabled={loading}
            className="bg-gradient-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {copy.actions.next}
          </Button>
        ) : (
          <Button 
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              copy.actions.submit
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
