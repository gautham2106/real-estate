'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

export interface BrokerOption {
  id: string
  broker_id: string
  name: string
}

export interface LeadOption {
  id: string
  lead_id: string
  label: string
  ownerId?: string  // added_by_broker_id (UUID)
}

interface Props {
  brokers: BrokerOption[]
  leads: LeadOption[]
  brokerFieldName: string
  leadFieldName: string
  brokerLabel?: string
  leadLabel?: string
  required?: boolean
  defaultBrokerId?: string
  defaultLeadId?: string
}

const selectCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400'

export default function BrokerLeadSelect({
  brokers,
  leads,
  brokerFieldName,
  leadFieldName,
  brokerLabel = 'Broker',
  leadLabel = 'Lead',
  required = false,
  defaultBrokerId = '',
  defaultLeadId = '',
}: Props) {
  const [brokerId, setBrokerId] = useState(defaultBrokerId)
  const [leadId, setLeadId] = useState(defaultLeadId)

  const filteredLeads = brokerId
    ? leads.filter(l => l.ownerId === brokerId)
    : []

  const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrokerId(e.target.value)
    setLeadId('')
  }

  return (
    <div className="flex items-end gap-2">
      {/* Step 1: Broker */}
      <div className="flex-1 space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          {brokerLabel}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          name={brokerFieldName}
          value={brokerId}
          onChange={handleBrokerChange}
          className={selectCls}
          required={required}
        >
          <option value="">— Select Broker —</option>
          {brokers.map(b => (
            <option key={b.id} value={b.id}>
              {b.broker_id} — {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Arrow */}
      <div className="pb-2 text-slate-300 shrink-0">
        <ChevronRight size={16} />
      </div>

      {/* Step 2: Lead (filtered) */}
      <div className="flex-1 space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          {leadLabel}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          name={leadFieldName}
          value={leadId}
          onChange={e => setLeadId(e.target.value)}
          className={selectCls}
          disabled={!brokerId}
          required={required}
        >
          <option value="">
            {brokerId
              ? filteredLeads.length > 0 ? '— Select Lead —' : 'No leads for this broker'
              : '← Select broker first'}
          </option>
          {filteredLeads.map(l => (
            <option key={l.id} value={l.id}>
              {l.lead_id} — {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
