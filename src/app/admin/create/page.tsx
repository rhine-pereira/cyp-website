'use client';

import React from 'react';
import AuthGuard from '@/app/components/Auth/AuthGuard';
import FormBuilder from '@/app/components/FormBuilder/FormBuilder';

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

export default function AdminCreateFormPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold uppercase tracking-[-0.02em] mb-2" style={{ color: theme.text }}>Create New Form</h1>
          <p className="opacity-70 mb-6" style={{ color: theme.text }}>Use the builder below to configure a new form.</p>
          <FormBuilder theme="espresso" />
        </div>
      </div>
    </AuthGuard>
  );
}
