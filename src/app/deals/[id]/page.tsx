import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, User, Handshake, TrendingUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { getDealById, getPropertyById, getBuyerLeadById, getBrokers } from '@/lib/dal'
import { getUserRole } from '@/lib/auth'
import { deleteDealAction } from '@/app/actions/deals'
import { formatCurrency } from '@/lib/utils'

export default async function DealDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [deal, brokers, role] = await Promise.all([getDealById(id), getBrokers(), getUserRole()])

  if (!deal) notFound()

  const brokerMap = Object.fromEntries(brokers.map(b => [b.id, b.name]))

  const [property, buyer] = await Promise.all([
    getPropertyById(deal.property_id),
    getBuyerLeadById(deal.buyer_lead_id),
  ])

  const totalCommission = deal.total_commission ?? deal.deal_value * 0.04

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} />
          Back to Deals
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-blue-600 font-semibold">{deal.deal_id}</span>
              <Badge status={deal.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">{deal.deal_title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Created {new Date(deal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/deals/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Edit
            </Link>
            {role === 'admin' && (
              <DeleteButton onDelete={deleteDealAction.bind(null, id)} redirectTo="/deals" />
            )}
          </div>
        </div>
      </div>

      {/* Deal Value Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Deal Value</p>
          <p className="text-lg font-bold text-slate-800">{formatCurrency(deal.deal_value)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Commission (4%)</p>
          <p className="text-lg font-bold text-blue-700">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Your Net</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(deal.your_net ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Token Amount</p>
          <p className="text-lg font-bold text-slate-700">{deal.token_amount ? formatCurrency(deal.token_amount) : '—'}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Property */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Building2 size={15} className="text-blue-600" />
            Property
          </div>
          {property ? (
            <div className="space-y-1.5 text-sm">
              <Link href={`/properties/${property.id}`} className="font-semibold text-blue-700 hover:underline">
                {property.land_code} — {property.title}
              </Link>
              <p className="text-slate-500">{property.area} {property.area_unit} · {property.type}</p>
              <p className="text-slate-500">{property.address ?? '—'}</p>
              <Badge status={property.status} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Property not found</p>
          )}
        </div>

        {/* Buyer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <User size={15} className="text-purple-600" />
            Buyer
          </div>
          {buyer ? (
            <div className="space-y-1.5 text-sm">
              <Link href={`/buyer-leads/${buyer.id}`} className="font-semibold text-blue-700 hover:underline">
                {buyer.name}
              </Link>
              <p className="text-slate-500">{buyer.phone}</p>
              {buyer.preferred_location && <p className="text-slate-500">📍 {buyer.preferred_location}</p>}
              <Badge status={buyer.status} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Buyer not found</p>
          )}
        </div>

        {/* Brokers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Handshake size={15} className="text-green-600" />
            Brokers
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Buyer Broker</span>
              <span className="font-medium text-slate-700">{deal.buyer_broker_id ? brokerMap[deal.buyer_broker_id] ?? deal.buyer_broker_id : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seller Broker</span>
              <span className="font-medium text-slate-700">{deal.seller_broker_id ? brokerMap[deal.seller_broker_id] ?? deal.seller_broker_id : '—'}</span>
            </div>
            {deal.referral_broker_id && (
              <div className="flex justify-between">
                <span className="text-slate-500">Referral Broker</span>
                <span className="font-medium text-slate-700">{brokerMap[deal.referral_broker_id] ?? deal.referral_broker_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <TrendingUp size={15} className="text-amber-600" />
            Financials
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Token', deal.token_amount, deal.token_date],
              ['Advance', deal.advance_amount, deal.advance_date],
              ['Final', deal.final_amount, deal.final_date],
            ].map(([label, amount, date]) => amount ? (
              <div key={String(label)} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(Number(amount))}{date ? ` · ${date}` : ''}
                </span>
              </div>
            ) : null)}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500">Buyer Commission %</span>
              <span className="font-medium">{deal.buyer_commission_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seller Commission %</span>
              <span className="font-medium">{deal.seller_commission_pct}%</span>
            </div>
            {deal.buyer_broker_payout && (
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Broker Payout</span>
                <span className="font-medium text-green-700">{formatCurrency(deal.buyer_broker_payout)}</span>
              </div>
            )}
            {deal.seller_broker_payout && (
              <div className="flex justify-between">
                <span className="text-slate-500">Seller Broker Payout</span>
                <span className="font-medium text-green-700">{formatCurrency(deal.seller_broker_payout)}</span>
              </div>
            )}
            {deal.commission_payment_status && (
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Commission Status</span>
                <Badge status={deal.commission_payment_status} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loan Info */}
      {deal.loan_required && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-3">Loan Details</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Status</p>
              <p className="font-medium text-slate-700 mt-0.5">{deal.loan_status ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Loan Amount</p>
              <p className="font-medium text-slate-700 mt-0.5">{deal.loan_amount ? formatCurrency(deal.loan_amount) : '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Bank</p>
              <p className="font-medium text-slate-700 mt-0.5">{deal.bank_name ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {deal.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-2">Notes</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{deal.notes}</p>
        </div>
      )}

      {/* Closed reason */}
      {deal.closed_reason && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-5">
          <h3 className="font-semibold text-sm text-red-700 mb-1">Closed Reason</h3>
          <p className="text-sm text-red-600">{deal.closed_reason}</p>
        </div>
      )}
    </div>
  )
}
