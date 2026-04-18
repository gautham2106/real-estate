import { getSiteVisits, getBuyerLeads, getSellerLeads } from '@/lib/dal'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const [visits, buyers, sellers] = await Promise.all([
    getSiteVisits(),
    getBuyerLeads(),
    getSellerLeads(),
  ])

  const today = new Date().toISOString().split('T')[0]

  // Build calendar events
  const visitEvents = visits.map(v => ({
    id: `visit-${v.id}`,
    date: v.visit_date,
    type: 'visit' as const,
    title: `Site Visit`,
    subtitle: `${v.property_id}`,
    href: `/properties/${v.property_id}`,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  }))

  const buyerFollowUps = buyers
    .filter(b => b.follow_up_date)
    .map(b => ({
      id: `buyer-${b.id}`,
      date: b.follow_up_date!,
      type: 'followup' as const,
      title: b.name,
      subtitle: 'Buyer follow-up',
      href: `/buyer-leads/${b.id}`,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      overdue: b.follow_up_date! < today,
    }))

  const sellerFollowUps = sellers
    .filter(s => s.follow_up_date)
    .map(s => ({
      id: `seller-${s.id}`,
      date: s.follow_up_date!,
      type: 'followup' as const,
      title: s.owner_name,
      subtitle: 'Seller follow-up',
      href: `/seller-leads/${s.id}`,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      overdue: s.follow_up_date! < today,
    }))

  const events = [...visitEvents, ...buyerFollowUps, ...sellerFollowUps]
    .sort((a, b) => a.date.localeCompare(b.date))

  return <CalendarClient events={events} today={today} />
}
