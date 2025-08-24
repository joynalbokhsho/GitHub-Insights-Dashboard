import AuthenticatedLayout from '../authenticated-layout'

export default function ContributionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
