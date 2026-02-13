import { NextRequest, NextResponse } from 'next/server';
import { invalidateForm, invalidateAll } from '@/app/lib/form-cache';

/**
 * POST /api/forms/invalidate
 *
 * Body: { formId?: string }
 *   - If formId is provided, invalidates that specific form + the listing cache.
 *   - Otherwise, invalidates the entire forms cache.
 *
 * Called by admin pages after direct Firestore writes (delete, toggle, etc.).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const formId = (body as { formId?: string }).formId;

        if (formId) {
            invalidateForm(formId);
        } else {
            invalidateAll();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error invalidating form cache:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to invalidate cache' },
            { status: 500 }
        );
    }
}
