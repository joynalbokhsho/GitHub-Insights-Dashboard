import AuthenticatedLayout from '../authenticated-layout'

export default function ExportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
