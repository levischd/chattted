export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {children}
    </div>
  );
}
