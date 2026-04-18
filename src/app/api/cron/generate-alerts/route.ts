import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized triggering
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (isDemoMode) {
    return NextResponse.json({ ok: true, message: 'Demo mode — no alerts generated', count: 0 })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const alerts: {
    type: string; message: string; related_type: string; related_id: string;
    due_date: string; priority: string; is_done: boolean; created_at: string
  }[] = []

  // 1. Expiring exclusivity within 30 days
  const { data: properties } = await supabase
    .from('properties')
    .select('id, land_code, title, exclusivity_end')
    .gte('exclusivity_end', today)
    .lte('exclusivity_end', in30Days)

  for (const p of properties ?? []) {
    const daysLeft = Math.ceil((new Date(p.exclusivity_end).getTime() - Date.now()) / 86400000)
    alerts.push({
      type: 'exclusivity_expiry',
      message: `Exclusivity ending in ${daysLeft} days — ${p.title ?? p.land_code}`,
      related_type: 'property',
      related_id: p.id,
      due_date: p.exclusivity_end,
      priority: daysLeft <= 7 ? 'High' : 'Medium',
      is_done: false,
      created_at: new Date().toISOString(),
    })
  }

  // 2. Buyer follow-ups due today or overdue
  const { data: buyers } = await supabase
    .from('buyer_leads')
    .select('id, name, follow_up_date')
    .lte('follow_up_date', today)
    .not('follow_up_date', 'is', null)

  for (const b of buyers ?? []) {
    alerts.push({
      type: 'follow_up',
      message: `Follow-up due${b.follow_up_date < today ? ' (overdue)' : ''} — Buyer: ${b.name}`,
      related_type: 'buyer_lead',
      related_id: b.id,
      due_date: b.follow_up_date,
      priority: b.follow_up_date < today ? 'High' : 'Medium',
      is_done: false,
      created_at: new Date().toISOString(),
    })
  }

  // 3. Seller follow-ups
  const { data: sellers } = await supabase
    .from('seller_leads')
    .select('id, name, follow_up_date')
    .lte('follow_up_date', today)
    .not('follow_up_date', 'is', null)

  for (const s of sellers ?? []) {
    alerts.push({
      type: 'follow_up',
      message: `Follow-up due${s.follow_up_date < today ? ' (overdue)' : ''} — Seller: ${s.name}`,
      related_type: 'seller_lead',
      related_id: s.id,
      due_date: s.follow_up_date,
      priority: s.follow_up_date < today ? 'High' : 'Medium',
      is_done: false,
      created_at: new Date().toISOString(),
    })
  }

  // 4. Deals stale > 14 days without update
  const staleDate = new Date(Date.now() - 14 * 86400000).toISOString()
  const { data: staleDeals } = await supabase
    .from('deals')
    .select('id, deal_id, status, updated_at')
    .not('status', 'in', '("Closed Won","Closed Lost")')
    .lt('updated_at', staleDate)

  for (const d of staleDeals ?? []) {
    alerts.push({
      type: 'stale_deal',
      message: `Deal ${d.deal_id} has had no update in 14+ days (${d.status})`,
      related_type: 'deal',
      related_id: d.id,
      due_date: in7Days,
      priority: 'Medium',
      is_done: false,
      created_at: new Date().toISOString(),
    })
  }

  if (alerts.length > 0) {
    await supabase.from('alerts').insert(alerts)
  }

  return NextResponse.json({ ok: true, count: alerts.length, generated_at: new Date().toISOString() })
}
