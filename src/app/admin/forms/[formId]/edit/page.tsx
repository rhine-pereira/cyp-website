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
        const data = snap.data() as any;
        const initial: FormLayout = {
          id: snap.id,
          title: data.title,
          description: data.description,
          fields: data.fields || [],
          imageUrl: data.imageUrl,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">{error || 'Form not found'}</div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Form</h1>
          <p className="text-gray-600">Update your form configuration and save changes</p>
        </div>
        <FormBuilder initialForm={form} />
      </div>
    </AuthGuard>
  );
}
