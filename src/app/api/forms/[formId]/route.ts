import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/app/lib/firebase-admin';
import { getForm, setForm } from '@/app/lib/form-cache';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await context.params;

    // Check cache first
    const cached = getForm(formId);
    if (cached) {
      return NextResponse.json({ success: true, form: cached });
    }

    // Cache miss — fetch from Firestore
    const db = getDb();
    const formDoc = await db.collection('forms').doc(formId).get();

    if (!formDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    const formData = formDoc.data();
    const form = {
      id: formDoc.id,
      ...formData,
      createdAt: formData?.createdAt?.toDate?.() ?? null,
      updatedAt: formData?.updatedAt?.toDate?.() ?? null,
    };

    // Populate cache
    setForm(formId, form);

    return NextResponse.json({ success: true, form });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}
