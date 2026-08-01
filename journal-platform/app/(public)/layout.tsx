import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white shadow-lg relative z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-lg md:text-2xl font-bold tracking-tight"
          >
            <img src="/CCULOGO.png" alt="CCU Logo" className="h-8 md:h-10 w-auto" />
            <span className="hidden sm:inline">CCU Journal of Science</span>
            <span className="sm:hidden">CCU Journal</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/current" className="hover:text-accent transition-colors">Current</Link>
            <Link href="/archives" className="hover:text-accent transition-colors">Archives</Link>
            <Link href="/submit" className="hover:text-accent transition-colors">Submit</Link>
            <Link href="/about" className="hover:text-accent transition-colors">About</Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
                {session.user.isAdmin === 1 && (
                  <Link href="/admin" className="hover:text-accent transition-colors">Admin</Link>
                )}
                <form action={async () => { "use server"; await signOut(); }}>
                  <button type="submit" className="hover:text-accent transition-colors cursor-pointer">Logout</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="bg-accent text-primary font-semibold px-4 py-1.5 rounded hover:bg-accent-light transition-colors">Login</Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <input type="checkbox" id="nav-toggle" className="hidden peer" />
          <label htmlFor="nav-toggle" className="md:hidden cursor-pointer p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>

          {/* Mobile nav dropdown */}
          <nav className="hidden peer-checked:flex flex-col absolute top-full left-0 right-0 bg-primary border-t border-white/10 shadow-lg md:hidden z-50">
            <Link href="/current" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Current</Link>
            <Link href="/archives" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Archives</Link>
            <Link href="/submit" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Submit</Link>
            <Link href="/about" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">About</Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Dashboard</Link>
                {session.user.isAdmin === 1 && (
                  <Link href="/admin" className="px-4 py-3 hover:bg-primary-light transition-colors border-b border-white/5">Admin</Link>
                )}
                <form action={async () => { "use server"; await signOut(); }}>
                  <button type="submit" className="px-4 py-3 text-left hover:bg-primary-light transition-colors cursor-pointer w-full">Logout</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="px-4 py-3 hover:bg-primary-light transition-colors">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary text-white text-center text-sm py-6">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-serif text-base md:text-lg mb-1">
            Coal City University Journal of Science
          </p>
          <p className="text-white/70">
            &copy; {new Date().getFullYear()} Coal City University, Enugu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
