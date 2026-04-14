'use client'

import { useState } from 'react'
import { Calculator, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { formatCurrency } from '@/lib/utils'

const MIN_FEE = 15000

export default function CommissionPage() {
  const [dealValue, setDealValue] = useState(1750000)
  const [buyerPct, setBuyerPct] = useState(2)
  const [sellerPct, setSellerPct] = useState(2)
  const [hasReferral, setHasReferral] = useState(false)
  const [hasTier1, setHasTier1] = useState(false)
  const [hasTier2, setHasTier2] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const [paymentMode, setPaymentMode] = useState('Bank Transfer')
  const [savedMsg, setSavedMsg] = useState(false)

  const totalCommission = dealValue * (buyerPct + sellerPct) / 100
  const buyerBrokerPayout = dealValue * 1.25 / 100
  const sellerBrokerPayout = dealValue * 1.25 / 100
  const referralPayout = hasReferral ? dealValue * 0.25 / 100 : 0
  const tier1Payout = hasTier1 ? dealValue * 0.10 / 100 : 0
  const tier2Payout = hasTier2 ? dealValue * 0.05 / 100 : 0
  const yourNet = totalCommission - buyerBrokerPayout - sellerBrokerPayout - referralPayout - tier1Payout - tier2Payout

  const belowMin = yourNet < MIN_FEE && dealValue > 0

  const handleSave = () => {
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 3000)
  }

  const rows = [
    { label: 'Total Commission', value: totalCommission, highlight: false },
    { label: `Buyer Broker Payout (1.25%)`, value: buyerBrokerPayout, highlight: false, deduct: true },
    { label: `Seller Broker Payout (1.25%)`, value: sellerBrokerPayout, highlight: false, deduct: true },
    ...(hasReferral ? [{ label: 'Referral Payout (0.25%)', value: referralPayout, highlight: false, deduct: true }] : []),
    ...(hasTier1 ? [{ label: 'Tier 1 Override (0.10%)', value: tier1Payout, highlight: false, deduct: true }] : []),
    ...(hasTier2 ? [{ label: 'Tier 2 Override (0.05%)', value: tier2Payout, highlight: false, deduct: true }] : []),
    { label: 'Your Net', value: yourNet, highlight: true, deduct: false },
  ]

  return (
    <div className="space-y-6 max-w-screen-md">
      <PageHeader
        title="Commission Calculator"
        subtitle="Auto-calculates all broker payouts and your net from any deal value"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">Deal Parameters</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Deal Value (₹)</label>
            <input
              type="number"
              value={dealValue}
              onChange={e => setDealValue(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="e.g. 1750000"
            />
            <p className="text-xs text-slate-400 mt-1">{dealValue > 0 ? formatCurrency(dealValue) : ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Buyer Commission %</label>
              <input
                type="number"
                value={buyerPct}
                onChange={e => setBuyerPct(Number(e.target.value))}
                step={0.1}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Seller Commission %</label>
              <input
                type="number"
                value={sellerPct}
                onChange={e => setSellerPct(Number(e.target.value))}
                step={0.1}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-slate-600 mb-2">Override / Referral Deductions</p>
            {[
              { label: 'Referral Broker (−0.25%)', checked: hasReferral, set: setHasReferral },
              { label: 'Tier 1 Override (−0.10%)', checked: hasTier1, set: setHasTier1 },
              { label: 'Tier 2 Override (−0.05%)', checked: hasTier2, set: setHasTier2 },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={e => opt.set(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Net Amount Hero */}
          <div className={`rounded-xl p-6 text-center ${belowMin ? 'bg-red-50 border-2 border-red-300' : 'bg-blue-600'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${belowMin ? 'text-red-500' : 'text-blue-200'}`}>
              Your Net
            </p>
            <p className={`text-4xl font-bold ${belowMin ? 'text-red-700' : 'text-white'}`}>
              {formatCurrency(yourNet)}
            </p>
            {belowMin && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-xs text-red-600 font-medium">Below minimum fee of ₹15,000</p>
              </div>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <tr key={i} className={row.highlight ? 'bg-blue-50' : ''}>
                    <td className={`px-4 py-2.5 ${row.highlight ? 'font-bold text-blue-800' : 'text-slate-600'}`}>
                      {row.deduct && <span className="text-red-400 mr-1">−</span>}
                      {row.label}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono font-semibold ${row.highlight ? 'text-blue-800' : row.deduct ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatCurrency(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <IndianRupee size={14} />
              Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['Pending', 'Partial', 'Released'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['Cash', 'Cheque', 'Bank Transfer', 'UPI'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            {savedMsg ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={15} /> Saved!
              </span>
            ) : 'Save Calculation'}
          </button>
        </div>
      </div>
    </div>
  )
}
