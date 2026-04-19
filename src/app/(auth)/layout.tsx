import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="absolute top-0 left-0 w-full p-6">
        <Link href="/" className="font-[var(--font-cal)] font-extrabold text-[20px] text-[#242424]">
          CoachClaw
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-[400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
