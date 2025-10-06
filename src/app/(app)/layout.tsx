export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative flex min-h-screen w-full flex-col">{children}</div>;
}
