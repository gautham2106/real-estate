'use client'

import { useState } from 'react'
import { Download, BarChart3, FileText } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockDeals, mockBrokers, mockBuyerLeads, mockSellerLeads, mockProperties } from '@/lib/mock-data'

type ReportTab = 'Overview' | 'Deals' | 'Brokers' | 'Leads' | 'Properties' | 'Commission'
const TABS: ReportTab[] = ['Overview', 'Deals', 'Brokers', 'Leads', 'Properties', 'Commission']

const monthlyOverview = [
  { month: 'Nov 2025', deals: 1, revenue: 220000, new_leads: 8, new_props: 2 },
  { month: 'Dec 2025', deals: 2, revenue: 410000, new_leads: 14, new_props: 4 },
  { month: 'Jan 2026', deals: 3, revenue: 580000, new_leads: 18, new_props: 5 },
  { month: 'Feb 2026', deals: 2, revenue: 390000, new_leads: 12, new_props: 3 },
  { month: 'Mar 2026', deals: 4, revenue: 720000, new_leads: 21, new_props: 6 },
  { month: 'Apr 2026', deals: 1, revenue: 175000, new_leads: 9, new_props: 2 },
]

const leadSources = [
  { source: 'Instagram', count: 24, converted: 5, conversion: '20.8%' },
  { source: 'Referral', count: 31, converted: 9, conversion: '29.0%' },
  { source: 'WhatsApp', count: 18, converted: 3, conversion: '16.7%' },
  { source: 'Facebook', count: 9, converted: 1, conversion: '11.1%' },
  { source: 'Walk-in', count: 5, converted: 2, conversion: '40.0%' },
]

const propBreakdown = [
  { type: 'Plot', count: 14, total_value: 18200000, avg_price: 1300000 },
  { type: 'Farm', count: 6, total_value: 22500000, avg_price: 3750000 },
  { type: 'Commercial', count: 3, total_value: 9600000, avg_price: 3200000 },
  { type: 'House', count: 1, total_value: 2200000, avg_price: 2200000 },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('Overview')
  const [exporting, setExporting] = useState<'PDF' | 'Excel' | null>(null)

  const handleExportExcel = async () => {
    setExporting('Excel')
    try {
      const XLSX = (await import('xlsx')).default
      const wb = XLSX.utils.book_new()

      // Deals sheet
      const dealsData = mockDeals.map(d => ({
        'Deal ID': d.deal_id, 'Title': d.deal_title, 'Deal Value': d.deal_value,
        'Total Commission': d.total_commission ?? 0, 'Your Net': d.your_net ?? 0, 'Status': d.status,
        'Created': formatDate(d.created_at),
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dealsData), 'Deals')

      // Brokers sheet
      const brokersData = mockBrokers.map(b => ({
        'Broker ID': b.broker_id, 'Name': b.name, 'Tier': b.tier_level,
        'Deals Closed': b.deals_closed ?? 0, 'Commission': b.total_commission_earned ?? 0,
        'Status': b.status, 'Joined': b.joined_date,
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(brokersData), 'Brokers')

      // Properties sheet
      const propsData = mockProperties.map(p => ({
        'Land Code': p.land_code, 'Title': p.title, 'Type': p.type,
        'Area': `${p.area} ${p.area_unit}`, 'Price': p.price, 'Status': p.status,
        'District': p.district ?? '', 'Classification': p.classification,
      }))
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(propsData), 'Properties')

      // Monthly overview
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyOverview), 'Monthly Summary')

      // Leads
      const leadsData = [
        ...mockBuyerLeads.map(l => ({ 'Lead ID': l.lead_id, 'Type': 'Buyer', 'Name': l.name, 'Phone': l.phone, 'Status': l.status, 'Source': l.source ?? '' })),
        ...mockSellerLeads.map(l => ({ 'Lead ID': l.lead_id, 'Type': 'Seller', 'Name': l.owner_name, 'Phone': l.phone, 'Status': l.status, 'Source': l.source ?? '' })),
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(leadsData), 'Leads')

      XLSX.writeFile(wb, `bluesquare-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    } finally {
      setExporting(null)
    }
  }

  const handleExportPDF = async () => {
    setExporting('PDF')
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const today = formatDate(new Date())
      let y = 20

      // Header
      doc.setFontSize(18)
      doc.setTextColor(30, 64, 175)
      doc.text('Bluesquare Real Estate CRM', 20, y); y += 8
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Report generated: ${today}`, 20, y); y += 12

      // Summary stats
      doc.setFontSize(13)
      doc.setTextColor(15, 23, 42)
      doc.text('Summary', 20, y); y += 7
      doc.setFontSize(10)
      doc.setTextColor(71, 85, 105)
      const totalRevenue = monthlyOverview.reduce((s, r) => s + r.revenue, 0)
      const stats = [
        `Total Deals: ${mockDeals.length}`,
        `Total Brokers: ${mockBrokers.length}`,
        `Total Properties: ${mockProperties.length}`,
        `Total Leads: ${mockBuyerLeads.length + mockSellerLeads.length}`,
        `6-Month Revenue: ₹${(totalRevenue / 100000).toFixed(2)}L`,
      ]
      stats.forEach(s => { doc.text(`• ${s}`, 24, y); y += 6 })
      y += 4

      // Top Brokers
      doc.setFontSize(13)
      doc.setTextColor(15, 23, 42)
      doc.text('Top Brokers', 20, y); y += 7
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text('Name', 24, y); doc.text('Tier', 80, y); doc.text('Deals', 110, y); doc.text('Commission', 140, y); y += 5
      doc.setDrawColor(226, 232, 240); doc.line(20, y, 190, y); y += 4
      mockBrokers.slice(0, 5).forEach((b, i) => {
        doc.text(b.name, 24, y)
        doc.text(b.tier_level, 80, y)
        doc.text(String(b.deals_closed ?? 0), 110, y)
        doc.text(`₹${((b.total_commission_earned ?? 0) / 100000).toFixed(1)}L`, 140, y)
        if (i < 4) { doc.setDrawColor(241, 245, 249); doc.line(20, y + 2, 190, y + 2) }
        y += 7
      })
      y += 4

      // Recent Deals
      doc.setFontSize(13)
      doc.setTextColor(15, 23, 42)
      doc.text('Deals', 20, y); y += 7
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text('Deal ID', 24, y); doc.text('Value', 80, y); doc.text('Commission', 120, y); doc.text('Status', 160, y); y += 5
      doc.setDrawColor(226, 232, 240); doc.line(20, y, 190, y); y += 4
      mockDeals.forEach(d => {
        doc.text(d.deal_id, 24, y)
        doc.text(`₹${(d.deal_value / 100000).toFixed(1)}L`, 80, y)
        doc.text(`₹${((d.total_commission ?? 0) / 1000).toFixed(0)}K`, 120, y)
        doc.text(d.status, 160, y)
        y += 6
        if (y > 270) { doc.addPage(); y = 20 }
      })

      doc.save(`bluesquare-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } finally {
      setExporting(null)
    }
  }

  const handleExport = (type: 'PDF' | 'Excel') => {
    if (type === 'Excel') handleExportExcel()
    else handleExportPDF()
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Reports"
        subtitle="Business intelligence and performance analytics"
        action={
          <div className="flex gap-2">
            <button onClick={() => handleExport('Excel')} disabled={!!exporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors">
              <Download size={14} />
              {exporting === 'Excel' ? 'Exporting…' : 'Excel'}
            </button>
            <button onClick={() => handleExport('PDF')} disabled={!!exporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors">
              <FileText size={14} />
              {exporting === 'PDF' ? 'Exporting…' : 'PDF'}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">Monthly Performance — Last 6 Months</h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Month', 'Deals Closed', 'Revenue', 'New Leads', 'New Properties'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyOverview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{row.month}</td>
                    <td className="px-5 py-3"><span className="font-bold text-blue-600">{row.deals}</span></td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{formatCurrency(row.revenue)}</td>
                    <td className="px-5 py-3">{row.new_leads}</td>
                    <td className="px-5 py-3">{row.new_props}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                <tr>
                  <td className="px-5 py-3 font-bold text-slate-800">Total</td>
                  <td className="px-5 py-3 font-bold text-blue-700">{monthlyOverview.reduce((s, r) => s + r.deals, 0)}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{formatCurrency(monthlyOverview.reduce((s, r) => s + r.revenue, 0))}</td>
                  <td className="px-5 py-3 font-bold text-slate-700">{monthlyOverview.reduce((s, r) => s + r.new_leads, 0)}</td>
                  <td className="px-5 py-3 font-bold text-slate-700">{monthlyOverview.reduce((s, r) => s + r.new_props, 0)}</td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === 'Deals' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Deal ID', 'Property', 'Deal Value', 'Commission (4%)', 'Your Net', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockDeals.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{d.deal_id}</td>
                  <td className="px-4 py-3 text-slate-700">{d.deal_title}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(d.deal_value)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(d.total_commission ?? 0)}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(d.your_net ?? 0)}</td>
                  <td className="px-4 py-3"><Badge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Brokers Tab */}
      {activeTab === 'Brokers' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Broker', 'Tier', 'Deals', 'Commission', 'Active Leads', 'Seller Leads', 'Buyer Leads', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...mockBrokers].sort((a, b) => (b.deals_closed ?? 0) - (a.deals_closed ?? 0)).map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{b.name}</td>
                  <td className="px-4 py-3"><Badge status={b.tier_level} /></td>
                  <td className="px-4 py-3 font-bold text-blue-600">{b.deals_closed ?? 0}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(b.total_commission_earned ?? 0)}</td>
                  <td className="px-4 py-3">{b.active_leads_count ?? 0}</td>
                  <td className="px-4 py-3">{b.total_seller_leads ?? 0}</td>
                  <td className="px-4 py-3">{b.total_buyer_leads ?? 0}</td>
                  <td className="px-4 py-3"><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'Leads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-1">Buyer Leads</p>
              <p className="text-3xl font-bold text-blue-600">{mockBuyerLeads.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total added</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-1">Seller Leads</p>
              <p className="text-3xl font-bold text-purple-600">{mockSellerLeads.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total added</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Lead Source Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Source', 'Total Leads', 'Converted', 'Conversion Rate'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadSources.map(r => (
                  <tr key={r.source} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{r.source}</td>
                    <td className="px-5 py-3">{r.count}</td>
                    <td className="px-5 py-3 font-semibold text-green-700">{r.converted}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: r.conversion }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{r.conversion}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'Properties' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Property Type', 'Total Listed', 'Combined Value', 'Avg Price', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propBreakdown.map(r => (
                <tr key={r.type} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{r.type}</td>
                  <td className="px-5 py-3 font-bold text-blue-600">{r.count}</td>
                  <td className="px-5 py-3 font-semibold">{formatCurrency(r.total_value)}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(r.avg_price)}</td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-blue-600 hover:underline">View All</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {activeTab === 'Commission' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Deal', 'Deal Value', 'Total Commission', 'Broker Payouts', 'Your Net', 'Payment Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockDeals.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{d.deal_id}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(d.deal_value)}</td>
                  <td className="px-4 py-3">{formatCurrency(d.total_commission ?? 0)}</td>
                  <td className="px-4 py-3 text-red-600">−{formatCurrency((d.buyer_broker_payout ?? 0) + (d.seller_broker_payout ?? 0))}</td>
                  <td className="px-4 py-3 font-bold text-green-700">{formatCurrency(d.your_net ?? 0)}</td>
                  <td className="px-4 py-3"><Badge status={d.commission_payment_status ?? 'Pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
