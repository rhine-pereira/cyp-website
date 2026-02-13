'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FormLayout } from '@/app/types/form';
import FormSubmission from '@/app/components/FormBuilder/FormSubmission';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Spinner from '@/app/components/Spinner';

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

export default function FormSubmissionPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<FormLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${formId}`, { cache: 'no-store' });
        const json = await res.json();

        if (json.success && json.form) {
          const f = json.form;
          setForm({
            ...f,
            createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
            updatedAt: f.updatedAt ? new Date(f.updatedAt) : new Date(),
          } as FormLayout);
        } else {
          setError('Form not found');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <Spinner
          label="Loading form..."
          trackClassName="border-white/20"
          ringClassName="border-t-[#FB923C]"
          labelClassName="text-[#FAFAFA]"
        />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="max-w-md w-full text-center px-4">
          <div className="rounded-xl shadow-md p-8 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: theme.primary }} />
            <h2 className="text-2xl font-bold uppercase tracking-[-0.02em] mb-2" style={{ color: theme.text }}>Form Not Found</h2>
            <p className="mb-6 opacity-70" style={{ color: theme.text }}>
              {error || 'The form you are looking for does not exist or has been removed.'}
            </p>
            <Link
              href="/forms"
              className="inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors"
              style={{ backgroundColor: theme.primary, color: '#1C1917' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/forms"
              className="inline-flex items-center transition-colors hover:opacity-80"
              style={{ color: theme.text }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
            <div className="text-sm opacity-50" style={{ color: theme.text }}>
              Form ID: {form.id}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="py-8">
        <FormSubmission form={form} theme="espresso" />
      </div>
    </div>
  );
}
