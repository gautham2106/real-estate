import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

export function generateLandCode(year: number, seq: number): string {
  return `BLU-${year}-${String(seq).padStart(3, '0')}`
}

export function generateLeadId(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(3, '0')}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const today = new Date()
  const diff = date.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800',
    'Negotiating': 'bg-yellow-100 text-yellow-800',
    'Token Received': 'bg-blue-100 text-blue-800',
    'MOU Signed': 'bg-purple-100 text-purple-800',
    'Sold': 'bg-gray-100 text-gray-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Exclusivity Expired': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-cyan-100 text-cyan-800',
    'Converted': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800',
    'Token Paid': 'bg-blue-100 text-blue-800',
    'Closed Won': 'bg-green-100 text-green-800',
    'Closed Lost': 'bg-red-100 text-red-800',
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Blacklisted': 'bg-red-100 text-red-800',
    'Elite': 'bg-purple-100 text-purple-800',
    'Star': 'bg-yellow-100 text-yellow-800',
    'Starter': 'bg-gray-100 text-gray-800',
    'Coordinator': 'bg-indigo-100 text-indigo-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

export function tierIcon(tier: string): string {
  const map: Record<string, string> = {
    Starter: '🌱',
    Active: '⚡',
    Star: '⭐',
    Elite: '💎',
    Coordinator: '👑',
  }
  return map[tier] ?? '•'
}

export function activityIcon(type: string): string {
  const map: Record<string, string> = {
    lead: '👤',
    deal: '🤝',
    property: '🏠',
    visit: '📍',
    alert: '🔔',
    document: '📄',
  }
  return map[type] ?? '•'
}
