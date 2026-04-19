import NewSiteVisitForm from './NewSiteVisitForm'

export default async function NewSiteVisitPage(props: {
  searchParams: Promise<{ buyer_id?: string; property_id?: string }>
}) {
  const params = await props.searchParams
  return (
    <NewSiteVisitForm
      initialBuyerId={params.buyer_id}
      initialPropertyId={params.property_id}
    />
  )
}
