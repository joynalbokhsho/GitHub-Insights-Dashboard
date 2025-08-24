import AuthenticatedLayout from '../authenticated-layout'

export default function RepositoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
