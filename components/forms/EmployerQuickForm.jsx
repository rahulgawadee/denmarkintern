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
      <div className="space-y-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-md">
        <div className="flex items-center gap-3 text-green-700">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg">{copy.successTitle}</span>
        </div>
        <p className="text-green-700 leading-relaxed">{copy.successMessage}</p>
        <Button 
          onClick={() => {
            setEmail('');
            setConsent(false);
            dispatch(resetQuickForm());
          }}
          variant="outline"
          className="w-full border-green-300 text-green-700 hover:bg-green-50"
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
        <Label htmlFor="quick-email" className="text-[#4a3728] font-semibold">
          {copy.emailLabel}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-[#ffa07a]" />
          <Input
            id="quick-email"
            type="email"
            placeholder={copy.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-11 border-2 border-[#ffe4b5] focus:border-[#ffa07a] focus:ring-[#ffa07a] text-[#4a3728]"
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

      <div className="flex items-start gap-3 p-4 rounded-lg bg-[#ffefd5]/30 border border-[#ffe4b5]">
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
            className="font-normal text-[#4a3728] leading-relaxed cursor-pointer"
          >
            {copy.consentLabel}
          </Label>
          <p className="text-xs text-[#6b5444]">{copy.privacy}</p>
          {errors.consent ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.consent}
            </p>
          ) : null}
        </div>
      </div>

      {copy.notice ? (
        <Alert className="border-[#ffe4b5] bg-[#ffefd5]/20">
          <AlertDescription className="text-[#6b5444]">{copy.notice}</AlertDescription>
        </Alert>
      ) : null}

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
