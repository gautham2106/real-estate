import { notFound } from 'next/navigation'
import { getBookById, getProperties } from '@/lib/dal'
import EditBookForm from './EditBookForm'

export default async function EditBookPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [book, allProperties] = await Promise.all([getBookById(id), getProperties()])
  if (!book) notFound()
  return <EditBookForm book={book} allProperties={allProperties} />
}
