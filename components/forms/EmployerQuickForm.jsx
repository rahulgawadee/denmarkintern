'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Mail } from 'lucide-react';

export default function EmployerQuickForm({ copy }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const validate = () => {
    const nextErrors = {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = copy.errors.email;
    }
    if (!consent) {
      nextErrors.consent = copy.errors.consent;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-sm">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">{copy.successTitle}</span>
        </div>
        <p className="text-green-700">{copy.successMessage}</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="quick-email">{copy.emailLabel}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            id="quick-email"
            type="email"
            placeholder={copy.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-10"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
        </div>
        {errors.email ? (
          <p className="text-xs text-red-600">{errors.email}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="quick-consent"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <div className="space-y-1 text-sm">
          <Label htmlFor="quick-consent" className="font-normal">
            {copy.consentLabel}
          </Label>
          <p className="text-xs text-zinc-500">{copy.privacy}</p>
          {errors.consent ? (
            <p className="text-xs text-red-600">{errors.consent}</p>
          ) : null}
        </div>
      </div>

      {copy.notice ? (
        <Alert>
          <AlertDescription>{copy.notice}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full">
        {copy.submitLabel}
      </Button>
    </form>
  );
}
