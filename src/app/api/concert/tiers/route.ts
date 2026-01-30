import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase';
import { availabilityRatelimit, getClientIP } from '@/app/lib/concert-ratelimit';
import type { TierAvailability } from '@/app/types/concert';

// Capitalize first letter of tier name for display
function capitalizeTier(tier: string): string {
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
}

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);

        // Rate limit check
        const rateLimitResult = await availabilityRatelimit.limit(clientIP);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please wait before trying again.',
                    retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
                },
                { status: 429 }
            );
        }

        const supabase = createServerSupabaseClient();

        // Get tier metadata from Supabase (price, description, etc.)
        const { data: tiers, error: tiersError } = await supabase
            .from('concert_ticket_inventory')
            .select('tier, price, description, total_tickets, sold_tickets')
            .order('price', { ascending: false });

        if (tiersError) throw tiersError;

        // Build availability from Supabase data only (no Redis for user-facing to reduce load)
        const availability: TierAvailability[] = (tiers || []).map(tier => {
            // Calculate available from Supabase data
            const available = Math.max(0, tier.total_tickets - tier.sold_tickets);

            return {
                tier: capitalizeTier(tier.tier), // Capitalize for display
                price: tier.price,
                description: tier.description || capitalizeTier(tier.tier),
                total: tier.total_tickets,
                available,
                sold: tier.sold_tickets,
            };
        });

        return NextResponse.json({
            success: true,
            tiers: availability,
        });

    } catch (error) {
        console.error('[Tiers] Error fetching tiers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ticket tiers' },
            { status: 500 }
        );
    }
}
