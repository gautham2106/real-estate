import Link from 'next/link'
import { getBuyerLeadById } from '@/lib/dal'
import EditBuyerLeadForm from './EditBuyerLeadForm'

export default async function EditBuyerLeadPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const lead = await getBuyerLeadById(id)

  if (!lead) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Buyer Lead Not Found</h2>
        <Link href="/buyer-leads" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Buyer Leads
        </Link>
      </div>
    )
  }

  return <EditBuyerLeadForm lead={lead} leadId={id} />
}
