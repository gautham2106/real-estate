import Link from 'next/link'
import { getPropertyById } from '@/lib/dal'
import { getUserRole } from '@/lib/auth'
import NewPropertyForm from '@/app/properties/new/NewPropertyForm'

export default async function EditPropertyPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [property, role] = await Promise.all([getPropertyById(id), getUserRole()])

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Property Not Found</h2>
        <Link href="/properties" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Properties
        </Link>
      </div>
    )
  }

  return <NewPropertyForm isAdmin={role === 'admin'} initialData={property} propertyId={id} />
}
