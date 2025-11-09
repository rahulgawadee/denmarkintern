'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react';
import { submitContactForm, resetQuickForm } from '@/store/slices/contactSlice';

export default function EmployerQuickForm({ copy }) {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.contact.quick);
  
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset form when component unmounts
    return () => {
      dispatch(resetQuickForm());
    };
  }, [dispatch]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    dispatch(submitContactForm({
      type: 'quick',
      formData: { email, consent },
    }));
  };

  if (success) {
    return (
      <div className="space-y-4 rounded-xl border-2 border-[#d4d4d4] bg-[#f5f5f5] p-6 shadow-sm">
        <div className="flex items-center gap-3 text-zinc-900">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-lg">{copy.successTitle}</span>
        </div>
        <p className="text-zinc-900 leading-relaxed">{copy.successMessage}</p>
        <Button 
          onClick={() => {
            setEmail('');
            setConsent(false);
            dispatch(resetQuickForm());
          }}
          variant="outline"
          className="w-full border-[#d4d4d4] text-zinc-900 hover:bg-[#f5f5f5]"
        >
          Send Another Message
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

      <div className="space-y-2">
        <Label htmlFor="quick-email" className="text-zinc-900 font-semibold">
          {copy.emailLabel}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
          <Input
            id="quick-email"
            type="email"
            placeholder={copy.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-11 border-2 border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b] text-zinc-900 bg-white"
            aria-invalid={errors.email ? 'true' : 'false'}
            disabled={loading}
          />
        </div>
        {errors.email ? (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-[#f5f5f5]/40 border border-[#d4d4d4]">
        <Checkbox
          id="quick-consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={loading}
          className="mt-0.5"
        />
        <div className="space-y-1 text-sm flex-1">
          <Label 
            htmlFor="quick-consent" 
            className="font-normal text-zinc-900 leading-relaxed cursor-pointer"
          >
            {copy.consentLabel}
          </Label>
          <p className="text-xs text-zinc-500">{copy.privacy}</p>
          {errors.consent ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.consent}
            </p>
          ) : null}
        </div>
      </div>

      {copy.notice ? (
        <Alert className="border-[#d4d4d4] bg-[#f5f5f5]/20">
          <AlertDescription className="text-zinc-500">{copy.notice}</AlertDescription>
        </Alert>
      ) : null}

      <Button 
        type="submit" 
        className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-bold shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          copy.submitLabel
        )}
      </Button>
    </form>
  );
}
