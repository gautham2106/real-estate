'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightCircle } from 'lucide-react'

interface Props {
  onConvert: () => Promise<{ error?: string; propertyId?: string } | undefined>
}

export default function ConvertToListingButton({ onConvert }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConvert = async () => {
    setLoading(true)
    const result = await onConvert()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.propertyId) {
      router.push(`/properties/${result.propertyId}`)
    }
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-1">{error}</p>}
      <button
        onClick={handleConvert}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        <ArrowRightCircle size={15} />
        {loading ? 'Converting...' : 'Convert to Listing'}
      </button>
    </div>
  )
}
