export default function AbtinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#04060A]">
      {children}
    </div>
  );
}
