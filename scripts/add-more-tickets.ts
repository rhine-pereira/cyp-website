import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addTickets() {
  console.log('🎟️  Adding more lottery tickets...\n');

  // ⚠️ CONFIGURE YOUR NEW TICKET RANGES HERE:
  const newRanges: Array<{ start: number; end: number }> = [
    // Example: Add 50 more tickets
    // { start: 1001, end: 1050 },
    // { start: 1051, end: 1100 },
    
    // Uncomment and modify as needed:
    // { start: 901, end: 950 },   // Add tickets 901-950
  ];

  if (newRanges.length === 0) {
    console.log('⚠️  No new ranges configured.');
    console.log('Edit this file and add ranges to newRanges array.');
    return;
  }

  let totalAdded = 0;

  for (const range of newRanges) {
    const tickets = [];
    const count = range.end - range.start + 1;
    
    console.log(`📝 Preparing tickets ${range.start}-${range.end} (${count} tickets)...`);
    
    for (let i = range.start; i <= range.end; i++) {
      tickets.push({
        ticket_number: i,
        status: 'available',
        session_id: null,
        client_ip: null,
        locked_at: null,
        order_id: null,
      });
    }

    const { data, error } = await supabase
      .from('lottery_tickets')
      .insert(tickets)
      .select();

    if (error) {
      if (error.code === '23505') {
        console.error(`❌ Tickets ${range.start}-${range.end} already exist (duplicate)`);
      } else {
        console.error(`❌ Error adding tickets ${range.start}-${range.end}:`, error);
      }
    } else {
      console.log(`✅ Added tickets ${range.start}-${range.end} (${count} tickets)`);
      totalAdded += count;
    }
  }

  console.log(`\n🎉 Total tickets added: ${totalAdded}`);
  console.log('\n📝 Next steps:');
  console.log('1. Update TICKET_RANGES in src/app/lottery/page.tsx');
  console.log('2. Deploy the changes with: vercel --prod');
}

addTickets()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
