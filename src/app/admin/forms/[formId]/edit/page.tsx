'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FormLayout } from '@/app/types/form';
import FormBuilder from '@/app/components/FormBuilder/FormBuilder';
import AuthGuard from '@/app/components/Auth/AuthGuard';

export default function EditFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<FormLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, 'forms', formId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Form not found');
          return;
        }
        const data = snap.data() as Partial<FormLayout> & {
          createdAt?: { toDate?: () => Date } | Date | string | number;
          updatedAt?: { toDate?: () => Date } | Date | string | number;
        };
        const initial: FormLayout = {
          id: snap.id,
          title: data.title || 'Untitled',
          description: data.description,
          fields: data.fields || [],
          imageUrl: data.imageUrl,
          createdAt: typeof data.createdAt === 'object' && data.createdAt && 'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate()
            : data.createdAt instanceof Date
              ? data.createdAt
              : new Date(),
          updatedAt: typeof data.updatedAt === 'object' && data.updatedAt && 'toDate' in data.updatedAt && typeof data.updatedAt.toDate === 'function'
            ? data.updatedAt.toDate()
            : data.updatedAt instanceof Date
              ? data.updatedAt
              : new Date(),
          spreadsheetId: data.spreadsheetId,
          acceptingResponses: data.acceptingResponses,
        };
        setForm(initial);
      } catch (e) {
        console.error(e);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    if (formId) load();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C1917]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FB923C]"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C1917] text-[#FAFAFA]">{error || 'Form not found'}</div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#1C1917]">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#FAFAFA]">Edit Form</h1>
            <p className="text-[#FAFAFA]/70">Update your form configuration and save changes</p>
          </div>
          <FormBuilder initialForm={form} theme="espresso" />
        </div>
      </div>
    </AuthGuard>
  );
}
