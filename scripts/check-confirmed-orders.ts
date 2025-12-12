import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface LotteryOrder {
  id: string;
  ticket_number: number;
  name: string;
  phone: string;
  email: string;
  parish: string;
  transaction_id: string;
  amount: number;
  status: string;
  confirmed_at: string;
  created_at: string;
}

async function checkConfirmedOrders() {
  console.log('🔍 Fetching confirmed lottery orders...\n');

  // ==================== FILTERS ====================
  // Customize these filters to view specific orders:
  
  // OPTION 1: Orders confirmed after a specific date
  // const startDate = '2025-12-11T00:00:00'; // Change this date
  // const query = supabase
  //   .from('lottery_orders')
  //   .select('*')
  //   .eq('status', 'confirmed')
  //   .gte('confirmed_at', startDate);

  // OPTION 2: Orders confirmed in a date range
  // const startDate = '2025-12-11T00:00:00';
  // const endDate = '2025-12-11T23:59:59';
  // const query = supabase
  //   .from('lottery_orders')
  //   .select('*')
  //   .eq('status', 'confirmed')
  //   .gte('confirmed_at', startDate)
  //   .lte('confirmed_at', endDate);

  // OPTION 3: Orders confirmed today
  // const today = new Date().toISOString().split('T')[0] + 'T00:00:00';
  // const query = supabase
  //   .from('lottery_orders')
  //   .select('*')
  //   .eq('status', 'confirmed')
  //   .gte('confirmed_at', today);

  // DEFAULT: Fetch ALL confirmed orders
  const query = supabase
    .from('lottery_orders')
    .select('*')
    .eq('status', 'confirmed');
  
  // =================================================

  const { data: orders, error } = await query.order('confirmed_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching orders:', error);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('✅ No confirmed orders found.');
    return;
  }

  console.log(`📊 Total Confirmed Orders: ${orders.length}\n`);
  console.log('═'.repeat(100));
  console.log('LIST OF CONFIRMED ORDERS:');
  console.log('═'.repeat(100));
  
  orders.forEach((order: LotteryOrder, index) => {
    const confirmedDate = new Date(order.confirmed_at).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'short'
    });
    
    console.log(`\n${index + 1}. Ticket #${order.ticket_number}`);
    console.log(`   Name:          ${order.name}`);
    console.log(`   Email:         ${order.email}`);
    console.log(`   Phone:         ${order.phone}`);
    console.log(`   Parish:        ${order.parish}`);
    console.log(`   Order ID:      ${order.id}`);
    console.log(`   Transaction:   ${order.transaction_id}`);
    console.log(`   Amount:        ₹${order.amount}`);
    console.log(`   Confirmed At:  ${confirmedDate}`);
    console.log('   ' + '─'.repeat(80));
  });

  console.log('\n═'.repeat(100));
  console.log('📧 NEXT STEPS:');
  console.log('═'.repeat(100));
  console.log('1. Review the list above');
  console.log('2. To check if emails were delivered, visit Resend Dashboard:');
  console.log('   https://resend.com/emails');
  console.log('   - Filter by date to see sent emails');
  console.log('   - Check status: Delivered, Bounced, or Failed');
  console.log('   - Search by recipient email to verify specific customers');
  console.log('\n3. To resend e-tickets:');
  console.log('   - To ALL confirmed orders: npx tsx scripts\\resend-lottery-etickets.ts');
  console.log('   - To specific date range: Edit resend script and uncomment date filter');
  console.log('   - To specific emails: Edit resend script and use email filter');
  console.log('\n4. FILTER OPTIONS in scripts (uncomment in the script file):');
  console.log('   - By date: Orders confirmed after 2025-12-11');
  console.log('   - By date range: Orders confirmed between two dates');
  console.log('   - By order IDs: Specific order IDs');
  console.log('   - By emails: Specific customer emails');
  console.log('═'.repeat(100));
}

checkConfirmedOrders().catch(console.error);
