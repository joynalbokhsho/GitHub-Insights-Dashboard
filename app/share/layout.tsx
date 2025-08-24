import AuthenticatedLayout from '../authenticated-layout'

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
