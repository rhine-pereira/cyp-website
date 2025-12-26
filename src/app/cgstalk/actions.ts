'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Service Role)
// We use the service role key to bypass RLS and securely check for the phone number.
// Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkCgsUser(phone: string) {
    try {
        if (!phone) return { exists: false, error: 'Phone number is required' };

        // Format phone if necessary, but assuming exact match for now as per "input the number"
        // Using the secure RPC function 'check_cgs_user_exists' is best practice if exposed,
        // but since we are server-side here, we can query the table directly if we want.
        // However, sticking to the RPC or direct query. 
        // Let's query the table directly since we have the service role here.

        const { data, error } = await supabaseAdmin
            .from('cgs_users')
            .select('id, role')
            .eq('phone', phone)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            console.error('Supabase error checking user:', error);
            throw new Error('Database error');
        }

        if (data) {
            return { exists: true, role: data.role };
        }

        return { exists: false };
    } catch (err) {
        console.error('Check user error:', err);
        return { exists: false, error: 'Failed to verify user' };
    }
}
