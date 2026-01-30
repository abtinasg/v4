/**
 * Abtin Dashboard Layout
 * Simple passthrough layout - auth is handled at page level
 */

export default function AbtinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
