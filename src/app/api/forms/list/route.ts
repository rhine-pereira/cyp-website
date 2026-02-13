import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/firebase-admin';
import { getFormsList, setFormsList } from '@/app/lib/form-cache';

export async function GET() {
    try {
        // Check cache first
        const cached = getFormsList();
        if (cached) {
            return NextResponse.json({ success: true, forms: cached });
        }

        // Cache miss — fetch from Firestore
        const db = getDb();
        const snapshot = await db
            .collection('forms')
            .orderBy('createdAt', 'desc')
            .get();

        const forms = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() ?? null,
                updatedAt: data.updatedAt?.toDate?.() ?? null,
            };
        });

        // Populate cache
        setFormsList(forms);

        return NextResponse.json({ success: true, forms });
    } catch (error) {
        console.error('Error listing forms:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list forms' },
            { status: 500 }
        );
    }
}
