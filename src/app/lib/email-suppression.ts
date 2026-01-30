import { createServerSupabaseClient } from './supabase';

export interface SuppressionEntry {
    email: string;
    reason: 'bounce' | 'complaint' | 'manual';
    bounce_type?: string;
    bounce_subtype?: string;
    source?: string;
}

/**
 * Check if an email address is suppressed (bounced/complained)
 */
export async function isEmailSuppressed(email: string): Promise<boolean> {
    try {
        const supabase = createServerSupabaseClient();
        const normalizedEmail = email.toLowerCase().trim();

        const { data, error } = await supabase
            .from('email_suppressions')
            .select('id')
            .eq('email', normalizedEmail)
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found (not an error for our use case)
            console.error('[email-suppression] Error checking suppression:', error);
            return false; // Fail open - allow sending if DB check fails
        }

        return !!data;
    } catch (error) {
        console.error('[email-suppression] Unexpected error:', error);
        return false; // Fail open
    }
}

/**
 * Add an email to the suppression list
 */
export async function addToSuppressionList(entry: SuppressionEntry): Promise<boolean> {
    try {
        const supabase = createServerSupabaseClient();
        const normalizedEmail = entry.email.toLowerCase().trim();

        const { error } = await supabase
            .from('email_suppressions')
            .upsert(
                {
                    email: normalizedEmail,
                    reason: entry.reason,
                    bounce_type: entry.bounce_type || null,
                    bounce_subtype: entry.bounce_subtype || null,
                    source: entry.source || null,
                },
                { onConflict: 'email' }
            );

        if (error) {
            console.error('[email-suppression] Error adding to suppression list:', error);
            return false;
        }

        console.log(`[email-suppression] Added ${normalizedEmail} to suppression list (${entry.reason})`);
        return true;
    } catch (error) {
        console.error('[email-suppression] Unexpected error adding suppression:', error);
        return false;
    }
}

/**
 * Remove an email from the suppression list (manual override)
 */
export async function removeFromSuppressionList(email: string): Promise<boolean> {
    try {
        const supabase = createServerSupabaseClient();
        const normalizedEmail = email.toLowerCase().trim();

        const { error } = await supabase
            .from('email_suppressions')
            .delete()
            .eq('email', normalizedEmail);

        if (error) {
            console.error('[email-suppression] Error removing from suppression list:', error);
            return false;
        }

        console.log(`[email-suppression] Removed ${normalizedEmail} from suppression list`);
        return true;
    } catch (error) {
        console.error('[email-suppression] Unexpected error removing suppression:', error);
        return false;
    }
}
