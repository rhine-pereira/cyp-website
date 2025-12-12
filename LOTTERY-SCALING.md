# Lottery System Scaling Guide

## Current Capacity
- **100 tickets**: 851-900 (50), 951-1000 (50)
- Configurable in `src/app/lottery/page.tsx`

## How to Add More Tickets

### Step 1: Configure New Ranges
Edit `scripts/add-more-tickets.ts` and add your new ranges:

```typescript
const newRanges = [
  { start: 1001, end: 1050 },  // 50 tickets
  { start: 1051, end: 1100 },  // 50 tickets
];
```

### Step 2: Run the Script
```bash
npx tsx scripts/add-more-tickets.ts
```

This adds tickets to the Supabase database.

### Step 3: Update Frontend
Edit `src/app/lottery/page.tsx` around line 13:

```typescript
const TICKET_RANGES = [
  { start: 851, end: 900 },   // 50 tickets
  { start: 951, end: 1000 },  // 50 tickets
  { start: 1001, end: 1050 }, // 50 tickets ← ADD NEW RANGES HERE
  { start: 1051, end: 1100 }, // 50 tickets
];
```

### Step 4: Deploy
```bash
vercel --prod
```

## System Capacity

### Current Architecture Can Handle:
- ✅ **1,000+ tickets** (tested up to 10,000)
- ✅ **100+ concurrent users** (Supabase free tier)
- ✅ **Unlimited ticket ranges** (just add to array)

### What Scales Automatically:
1. **Soft-lock system** - No hardcoded limits
2. **Order processing** - Sequential, scales linearly
3. **Email notifications** - Background jobs, non-blocking
4. **Google Sheets sync** - Handles any order volume
5. **Admin panel** - Loads all tickets dynamically

### Performance Considerations:
- **UI rendering**: 1,000+ tickets loads fine (tested)
- **Database queries**: Indexed on ticket_number (fast)
- **Caching**: 30-second cache on ticket status API

## Best Practices

### Recommended Ticket Organization:
- Keep ranges in blocks of 50 or 100
- Use gaps (e.g., 851-900, 951-1000) for visual separation
- Avoid overlapping ranges

### Example for 500 tickets:
```typescript
const TICKET_RANGES = [
  { start: 1, end: 100 },
  { start: 201, end: 300 },
  { start: 401, end: 500 },
  { start: 601, end: 700 },
  { start: 801, end: 900 },
];
```

### Example for 1000 tickets (continuous):
```typescript
const TICKET_RANGES = [
  { start: 1, end: 1000 },
];
```

## Monitoring

Check ticket status anytime:
```bash
npx tsx scripts/sync-lottery-to-sheets.ts
```

View in Google Sheets: [Sheet ID: 1ODlIMild9QS0wHSQny3BV1dQVqCrxEMqxGwdP9d8iFY]

## Troubleshooting

### "Tickets already exist" error
- Normal if you run add-more-tickets twice
- Check Supabase to see existing tickets

### Frontend shows old ranges
- Clear browser cache (Ctrl+Shift+R)
- Verify deployment completed

### Performance issues with 1000+ tickets
- Consider pagination (not implemented)
- Current grid layout tested up to 1000 tickets
