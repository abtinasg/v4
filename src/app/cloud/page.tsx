import { notFound } from 'next/navigation'

export default function CloudPage() {
  // Route disabled: return 404 to remove /cloud from public site
  notFound()
}
