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
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-serif text-xl md:text-2xl font-bold tracking-tight"
          >
            <img
              src="/CCULOGO.png"
              alt="CCU Logo"
              className="h-10 w-auto"
            />
            CCU Journal of Education
          </Link>
          <nav className="flex items-center gap-4 text-sm md:text-base">
            <Link href="/current" className="hover:text-accent transition-colors">
              Current
            </Link>
            <Link href="/archives" className="hover:text-accent transition-colors">
              Archives
            </Link>
            <Link href="/submit" className="hover:text-accent transition-colors">
              Submit
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              About
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
                {session.user.isAdmin === 1 && (
                  <Link
                    href="/admin"
                    className="hover:text-accent transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="hover:text-accent transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-accent text-primary font-semibold px-4 py-1.5 rounded hover:bg-accent-light transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-white text-center text-sm py-6">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-serif text-lg mb-1">
            Coal City University Journal of Education
          </p>
          <p className="text-white/70">
            &copy; {new Date().getFullYear()} Coal City University, Enugu. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
