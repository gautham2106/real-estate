import NewDealForm from './NewDealForm'

export default async function NewDealPage(props: {
  searchParams: Promise<{ buyer_id?: string }>
}) {
  const { buyer_id } = await props.searchParams
  return <NewDealForm defaultBuyerId={buyer_id} />
}
