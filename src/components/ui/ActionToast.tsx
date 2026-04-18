'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface ActionToastProps {
  message: string
  actions?: { label: string; href?: string; onClick?: () => void }[]
  onClose: () => void
}

export default function ActionToast({ message, actions, onClose }: ActionToastProps) {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl max-w-sm w-full mx-4 animate-in slide-in-from-bottom-4">
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>

      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                onClick={onClose}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                onClick={() => { action.onClick?.(); onClose() }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
              >
                {action.label}
              </button>
            )
          )}
        </div>
      )}

      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="text-slate-400 hover:text-white transition-colors shrink-0 ml-1"
      >
        <X size={14} />
      </button>
    </div>
  )
}
