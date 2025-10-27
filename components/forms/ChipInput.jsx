'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function ChipInput({
  id,
  label,
  placeholder,
  helpText,
  values,
  onChange,
  max = 5,
}) {
  const [draft, setDraft] = useState('');

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    if (values.length >= max) {
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  };

  const removeValue = (value) => {
    onChange(values.filter((item) => item !== value));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addValue();
    }
    if (event.key === 'Backspace' && !draft && values.length) {
      event.preventDefault();
      const nextValues = [...values];
      nextValues.pop();
      onChange(nextValues);
    }
  };

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="flex items-center gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="secondary" onClick={addValue}>
          Add
        </Button>
      </div>
      {helpText ? (
        <p className="text-xs text-zinc-500">{helpText}</p>
      ) : null}
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value} className="flex items-center gap-1">
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="text-xs"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      {values.length >= max ? (
        <p className="text-xs text-zinc-500">
          Maximum of {max} entries. Remove one to add another.
        </p>
      ) : null}
    </div>
  );
}
