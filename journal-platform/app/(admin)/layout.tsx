import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-primary text-white shadow-lg relative z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-serif text-lg md:text-xl font-bold tracking-tight">
            <img src="/CCULOGO.png" alt="CCU Logo" className="h-8 w-auto" />
            <span>CCU Journal — Admin</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/admin" className="hover:text-accent transition-colors">Dashboard</Link>
            <Link href="/admin/journals/new" className="hover:text-accent transition-colors">Upload Journal</Link>
            <Link href="/" className="hover:text-accent transition-colors">View Site</Link>
            <form action="/login" method="GET">
              <button type="submit" className="hover:text-accent transition-colors cursor-pointer">Logout</button>
            </form>
          </nav>

          {/* Mobile hamburger */}
          <input type="checkbox" id="admin-nav-toggle" className="hidden peer" />
          <label htmlFor="admin-nav-toggle" className="md:hidden cursor-pointer p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>

          {/* Mobile nav dropdown */}
          <nav className="hidden peer-checked:flex flex-col absolute top-full left-0 right-0 bg-primary border-t border-white/10 shadow-lg md:hidden z-50">
            <Link href="/admin" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Dashboard</Link>
            <Link href="/admin/journals/new" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Upload Journal</Link>
            <Link href="/" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">View Site</Link>
            <form action="/login" method="GET">
              <button type="submit" className="px-4 py-3 text-left hover:bg-primary-light transition-colors cursor-pointer w-full">Logout</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
