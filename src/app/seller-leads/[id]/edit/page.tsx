import Link from 'next/link'
import { getSellerLeadById } from '@/lib/dal'
import EditSellerLeadForm from './EditSellerLeadForm'

export default async function EditSellerLeadPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const lead = await getSellerLeadById(id)

  if (!lead) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Seller Lead Not Found</h2>
        <Link href="/seller-leads" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Seller Leads
        </Link>
      </div>
    )
  }

  return <EditSellerLeadForm lead={lead} leadId={id} />
}
