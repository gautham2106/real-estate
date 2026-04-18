'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

interface FloatingActionsProps {
  role?: 'admin' | 'broker' | null
}

interface ActionItem {
  label: string
  href?: string
  onClick?: () => void
}

function getActions(role: 'admin' | 'broker' | null | undefined): ActionItem[] {
  const logEnquiryAction: ActionItem = {
    label: 'Log Enquiry',
    onClick: () => {
      // Show toast message — go to a property and use Log Enquiry
      showToast('Go to a property and use Log Enquiry')
    },
  }

  if (role === 'broker') {
    return [
      { label: 'Add Buyer Lead', href: '/buyer-leads/new' },
      { label: 'Add Seller Lead', href: '/seller-leads/new' },
      logEnquiryAction,
    ]
  }

  // Admin (default)
  return [
    { label: 'Add Property', href: '/properties/new' },
    { label: 'New Deal', href: '/deals/new' },
    logEnquiryAction,
  ]
}

// Simple global toast trigger (DOM-based, no external deps)
function showToast(message: string) {
  const existing = document.getElementById('fab-toast')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'fab-toast'
  el.textContent = message
  el.style.cssText = [
    'position:fixed',
    'bottom:80px',
    'left:50%',
    'transform:translateX(-50%)',
    'background:#1e293b',
    'color:#fff',
    'padding:10px 18px',
    'border-radius:8px',
    'font-size:13px',
    'font-weight:500',
    'z-index:9999',
    'pointer-events:none',
    'white-space:nowrap',
    'box-shadow:0 4px 12px rgba(0,0,0,0.25)',
  ].join(';')
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3500)
}

export default function FloatingActions({ role }: FloatingActionsProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const actions = getActions(role)

  function handleAction(action: ActionItem) {
    setOpen(false)
    if (action.href) {
      router.push(action.href)
    } else if (action.onClick) {
      action.onClick()
    }
  }

  return (
    // md:hidden — only visible on mobile
    <div className="md:hidden fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2" ref={containerRef}>
      {/* Action menu — appears above FAB */}
      {open && (
        <div className="flex flex-col gap-2 mb-1">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleAction(action)}
              className="bg-white rounded-xl shadow-lg px-4 py-3 text-sm font-medium text-slate-800 text-left whitespace-nowrap hover:bg-slate-50 transition-colors border border-slate-200"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open quick actions'}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
      >
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  )
}
