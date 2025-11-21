'use client';

import React, { useEffect, useState } from 'react';
import { FormLayout, FormField } from '@/app/types/form';
import { useForm } from 'react-hook-form';
import { Button } from '@/app/components/ui/button';
import Image from 'next/image';
import * as safeStorage from '@/app/lib/safeStorage';

interface FormSubmissionProps {
  form: FormLayout;
  theme?: 'light' | 'espresso';
}

type FormData = Record<string, unknown>;

// Warm Espresso Theme Colors
const espressoTheme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(251, 146, 60, 0.3)',
  inputFocusRing: 'rgba(251, 146, 60, 0.5)',
};

export default function FormSubmission({ form, theme = 'light' }: FormSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors, isValid }, reset, getValues, setValue } = useForm<FormData>({ mode: 'onChange' });
  const formKey = `form_draft_${form.id}`;

  const isEspresso = theme === 'espresso';
  const currentTheme = isEspresso ? espressoTheme : null;

  const toSafeId = (id: string) => id.replace(/[\.\,\[\]\s]+/g, '_');
  const safeIdMap: Record<string, string> = Object.fromEntries(form.fields.map(f => [f.id, toSafeId(f.id)]));
  const origIdBySafe: Record<string, string> = Object.fromEntries(Object.entries(safeIdMap).map(([orig, safe]) => [safe, orig]));

  const linkify = (text: string) => {
    const splitRegex = /(https?:\/\/[^\s]+)/g; // for splitting only
    const parts = text.split(splitRegex);
    return (
      <div className={`whitespace-pre-line ${isEspresso ? 'text-[#FAFAFA]/80' : 'text-slate-700'}`}>
        {parts.map((part, idx) => {
          const isUrl = /^https?:\/\/\S+$/i.test(part);
          if (isUrl) {
            return (
              <a
                key={idx}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`break-words underline ${isEspresso ? 'text-[#FB923C] hover:text-[#FCD34D]' : 'text-sky-700 hover:text-sky-800'}`}
              >
                {part}
              </a>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Process form data to handle file uploads
      const processedData: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        const originalKey = origIdBySafe[key] ?? key;
        if (value instanceof FileList && value.length > 0) {
          const file = value[0];
          // Upload any file to Appwrite Storage
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('isAdminUpload', 'false');
          const fieldMeta = form.fields.find(f => f.id === originalKey);
          const uploadType = fieldMeta?.type === 'image' ? 'image' : 'file';
          uploadFormData.append('uploadType', uploadType);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResult.success) {
            processedData[originalKey] = uploadResult.url;
          } else {
            throw new Error(`Failed to upload file: ${uploadResult.error}`);
          }
        } else if (Array.isArray(value)) {
          processedData[originalKey] = value.join(', ');
        } else if (value && typeof value === 'object') {
          // Normalize nested objects (e.g., checkbox groups registered as field.id.index)
          const fieldMeta = form.fields.find(f => f.id === originalKey);
          if (fieldMeta?.type === 'checkbox') {
            try {
              const vals = Object.values(value as Record<string, unknown>).filter(v => v != null) as string[];
              processedData[originalKey] = vals.join(', ');
            } catch {
              processedData[originalKey] = '';
            }
          } else {
            // Fallback: stringify unknown objects to avoid sending struct values
            try {
              processedData[originalKey] = JSON.stringify(value);
            } catch {
              processedData[originalKey] = '';
            }
          }
        } else {
          processedData[originalKey] = value;
        }
      }

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form.id,
          data: processedData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        reset();
        // clear draft
        try { safeStorage.removeItem(formKey); } catch { }
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autosave draft to localStorage every few seconds and when values change
  useEffect(() => {
    // load draft if exists
    try {
      const raw = safeStorage.getItem(formKey);
      if (raw) {
        const values = JSON.parse(raw);
        Object.entries(values).forEach(([k, v]) => {
          // Support both original IDs and already-safe IDs in stored drafts
          const targetKey = safeIdMap[k] ?? k;
          setValue(targetKey, v);
        });
      }
    } catch { }

    const saveDraft = () => {
      try {
        const vals = getValues();
        // Store using original IDs for readability/backward-compat
        const normalized: Record<string, unknown> = {};
        Object.entries(vals).forEach(([k, v]) => {
          const originalKey = origIdBySafe[k] ?? k;
          normalized[originalKey] = v;
        });
        safeStorage.setItem(formKey, JSON.stringify(normalized));
      } catch { }
    };

    const interval = setInterval(saveDraft, 5000);
    return () => clearInterval(interval);
  }, [formKey, getValues, setValue]);

  // Warn before unload if form is dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      try {
        const vals = getValues();
        const hasData = Object.keys(vals).some(k => {
          const v = (vals as Record<string, unknown>)[k];
          return v !== undefined && v !== '' && !(v instanceof FileList && v.length === 0);
        });
        if (hasData) {
          e.preventDefault();
          e.returnValue = '';
        }
      } catch { }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [getValues]);

  // Focus first error when errors change
  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.length > 0) {
      const el = document.querySelector(`[name="${keys[0]}"]`) as HTMLElement | null;
      if (el && typeof el.focus === 'function') el.focus();
    }
  }, [errors]);

  const renderField = (field: FormField) => {
    const baseClasses = isEspresso
      ? "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
      : "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 placeholder-slate-500";

    const espressoClasses = isEspresso
      ? "bg-white/5 border border-[#FB923C]/30 text-[#FAFAFA] placeholder-white/30 focus:ring-[#FB923C]/50 focus:border-[#FB923C]"
      : "";

    const errorClasses = isEspresso
      ? "border-red-500 focus:ring-red-500"
      : "border-red-500 focus:ring-red-500";

    const safeId = toSafeId(field.id);
    const hasError = Boolean((errors as Record<string, any>)[safeId]);
    const fieldClasses = `${baseClasses} ${isEspresso ? espressoClasses : ''} ${hasError ? errorClasses : ''}`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(safeId, {
              required: field.required ? `${field.label} is required` : false,
              minLength: field.validation?.minLength ? {
                value: field.validation.minLength,
                message: `Minimum length is ${field.validation.minLength}`
              } : undefined,
              maxLength: field.validation?.maxLength ? {
                value: field.validation.maxLength,
                message: `Maximum length is ${field.validation.maxLength}`
              } : undefined,
            })}
            placeholder={field.placeholder}
            className={`${fieldClasses} resize-vertical`}
            rows={3}
            style={isEspresso ? { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FAFAFA' } : {}}
          />
        );

      case 'select':
        return (
          <select
            {...register(safeId, {
              required: field.required ? `${field.label} is required` : false,
            })}
            className={`${fieldClasses} ${!isEspresso ? 'bg-white' : ''}`}
            style={isEspresso ? { backgroundColor: '#1C1917', color: '#FAFAFA' } : {}}
          >
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  {...register(safeId, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                  type="radio"
                  value={option}
                  className={`h-4 w-4 focus:ring-2 ${isEspresso ? 'text-[#FB923C] focus:ring-[#FB923C] border-[#FB923C]/30 bg-transparent' : 'text-sky-600 focus:ring-sky-500 border-gray-300'}`}
                />
                <span className={`ml-2 text-sm ${isEspresso ? 'text-[#FAFAFA]/90' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  {...register(`${safeId}.${index}`, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                  type="checkbox"
                  value={option}
                  className={`h-4 w-4 rounded focus:ring-2 ${isEspresso ? 'text-[#FB923C] focus:ring-[#FB923C] border-[#FB923C]/30 bg-transparent' : 'text-sky-600 focus:ring-sky-500 border-gray-300'}`}
                />
                <span className={`ml-2 text-sm ${isEspresso ? 'text-[#FAFAFA]/90' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            {...register(safeId, {
              required: field.required ? `${field.label} is required` : false,
            })}
            type="file"
            className={`${fieldClasses} ${isEspresso
              ? 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FB923C] file:text-[#1C1917] hover:file:opacity-90'
              : 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100'}`}
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <input
              {...register(safeId, {
                required: field.required ? `${field.label} is required` : false,
              })}
              type="file"
              accept="image/*"
              className={`${fieldClasses} ${isEspresso
                ? 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FB923C] file:text-[#1C1917] hover:file:opacity-90'
                : 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100'}`}
            />
            <p className={`text-xs ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-500'}`}>Upload an image file (JPG, PNG, GIF)</p>
          </div>
        );

      case 'admin-image':
        return (
          <div className="space-y-2">
            {field.imageUrl ? (
              <div className="text-center">
                <div className="relative mx-auto h-auto w-full max-w-md">
                  <Image
                    src={field.imageUrl}
                    alt={field.label}
                    width={800}
                    height={600}
                    className={`h-auto w-full rounded-lg border ${isEspresso ? 'border-[#FB923C]/30' : ''}`}
                  />
                </div>
                <p className={`text-sm mt-2 ${isEspresso ? 'text-[#FAFAFA]/70' : 'text-gray-600'}`}>{field.label}</p>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isEspresso ? 'border-[#FB923C]/20' : 'border-gray-300'}`}>
                <p className={isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-500'}>No image available</p>
                <p className={`text-xs mt-1 ${isEspresso ? 'text-[#FAFAFA]/30' : 'text-gray-400'}`}>Field ID: {field.id}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            {...register(safeId, {
              required: field.required ? `${field.label} is required` : false,
              min: field.validation?.min,
              max: field.validation?.max,
              minLength: field.validation?.minLength ? {
                value: field.validation.minLength,
                message: `Minimum length is ${field.validation.minLength}`
              } : undefined,
              maxLength: field.validation?.maxLength ? {
                value: field.validation.maxLength,
                message: `Maximum length is ${field.validation.maxLength}`
              } : undefined,
              pattern: field.validation?.pattern ? {
                value: new RegExp(field.validation.pattern),
                message: 'Invalid format'
              } : undefined,
            })}
            type={field.type}
            placeholder={field.placeholder}
            className={fieldClasses}
            style={isEspresso ? { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FAFAFA' } : {}}
          />
        );
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className={`rounded-lg border p-6 text-center ${isEspresso ? 'border-green-500/30 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
          <div className={`text-6xl mb-4 ${isEspresso ? 'text-green-400' : 'text-green-600'}`}>✓</div>
          <h2 className={`text-2xl font-bold mb-2 ${isEspresso ? 'text-green-200' : 'text-green-800'}`}>Form Submitted Successfully!</h2>
          <p className={isEspresso ? 'text-green-300' : 'text-green-700'}>Thank you for your submission.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className={`rounded-xl border shadow-sm p-6 ${isEspresso ? 'bg-[#1C1917] border-[#FB923C]/30' : 'bg-white border-gray-200'}`}>
        {/* Header image on top */}
        {form.imageUrl && (
          <div className="mb-4">
            <div className="relative w-full pb-[25%] rounded-lg overflow-hidden">
              <Image
                src={form.imageUrl}
                alt="Form header"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
        <div className="mb-6">
          <h1 className={`mb-2 text-3xl font-bold ${isEspresso ? 'text-[#FAFAFA]' : 'text-slate-900'}`}>{form.title}</h1>
          {form.description && linkify(form.description)}
        </div>
        {form.acceptingResponses === false ? (
          <div className={`rounded-lg border p-4 ${isEspresso ? 'border-amber-500/30 bg-amber-900/20 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            This form is no longer accepting responses.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                {field.type !== 'admin-image' && (
                  <label className={`block text-sm font-medium ${isEspresso ? 'text-[#FAFAFA]/90' : 'text-gray-700'}`}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderField(field)}
                {Boolean((errors as Record<string, any>)[toSafeId(field.id)]?.message) && (
                  <p className="text-sm text-red-600">{String((errors as Record<string, any>)[toSafeId(field.id)]?.message)}</p>
                )}
              </div>
            ))}

            {submitStatus === 'error' && (
              <div className={`border rounded-lg p-4 ${isEspresso ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <p className={isEspresso ? 'text-red-300' : 'text-red-800'}>There was an error submitting the form. Please try again.</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`h-11 w-full disabled:cursor-not-allowed disabled:opacity-50 font-semibold ${isEspresso
                    ? 'bg-[#FB923C] text-[#1C1917] hover:bg-[#FCD34D]'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
