import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeOldTickets() {
  console.log('🧹 Removing old ticket ranges from database...\n');

  // Define old ticket ranges to remove
  const oldRanges = [
    { start: 851, end: 900 },
    { start: 951, end: 1000 },
  ];

  // STEP 1: First, delete orders for old tickets (must delete orders before tickets due to foreign key)
  console.log('🗑️  Deleting orders for old ticket ranges...');
  
  const oldTicketNumbers: number[] = [];
  for (const range of oldRanges) {
    for (let i = range.start; i <= range.end; i++) {
      oldTicketNumbers.push(i);
    }
  }

  const { data: deletedOrders, error: ordersError } = await supabase
    .from('lottery_orders')
    .delete()
    .in('ticket_number', oldTicketNumbers)
    .select();

  if (ordersError) {
    console.error('❌ Error deleting old orders:', ordersError);
  } else {
    console.log(`✅ Deleted ${deletedOrders?.length || 0} old orders\n`);
  }

  // STEP 2: Now delete the tickets
  let totalDeleted = 0;

  for (const range of oldRanges) {
    console.log(`🗑️  Deleting tickets ${range.start}-${range.end}...`);

    // Delete tickets in this range
    const { data, error } = await supabase
      .from('lottery_tickets')
      .delete()
      .gte('ticket_number', range.start)
      .lte('ticket_number', range.end)
      .select();

    if (error) {
      console.error(`❌ Error deleting tickets ${range.start}-${range.end}:`, error);
    } else {
      const count = data?.length || 0;
      console.log(`✅ Deleted ${count} tickets from range ${range.start}-${range.end}`);
      totalDeleted += count;
    }
  }

  console.log(`\n🎉 Total tickets deleted: ${totalDeleted}`);
  console.log('\n📊 Verifying remaining tickets...');

  // Verify what's left
  const { data: remainingTickets, error: verifyError } = await supabase
    .from('lottery_tickets')
    .select('ticket_number')
    .order('ticket_number');

  if (verifyError) {
    console.error('❌ Error verifying tickets:', verifyError);
  } else {
    console.log(`✅ Remaining tickets: ${remainingTickets?.length || 0}`);
    if (remainingTickets && remainingTickets.length > 0) {
      const numbers = remainingTickets.map(t => t.ticket_number);
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      console.log(`   Range: ${min}-${max}`);
    }
  }

  console.log('\n✅ Old tickets removed successfully!');
  console.log('\n💡 Next steps:');
  console.log('1. Run: npx tsx scripts/verify-production-ready.ts');
  console.log('2. Verify ticket count is now 100');
}

removeOldTickets()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
