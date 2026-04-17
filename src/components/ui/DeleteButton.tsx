'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Props {
  onDelete: () => Promise<{ error?: string } | undefined>
  redirectTo: string
  label?: string
}

export default function DeleteButton({ onDelete, redirectTo, label = 'Delete' }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    const result = await onDelete()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(redirectTo)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
      >
        <Trash2 size={15} />
        {label}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {error && <span className="text-xs text-red-600 w-full">{error}</span>}
      <span className="text-sm text-red-700 font-medium">Confirm delete?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? 'Deleting...' : 'Yes, Delete'}
      </button>
      <button
        onClick={() => { setConfirming(false); setError(null) }}
        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200"
      >
        Cancel
      </button>
    </div>
  )
}
