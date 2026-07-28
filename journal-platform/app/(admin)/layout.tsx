import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-3 font-serif text-xl font-bold tracking-tight"
          >
            <img
              src="/CCULOGO.png"
              alt="CCU Logo"
              className="h-8 w-auto"
            />
            CCU Journal — Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin"
              className="hover:text-accent transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/journals/new"
              className="hover:text-accent transition-colors"
            >
              Upload Journal
            </Link>
            <Link href="/" className="hover:text-accent transition-colors">
              View Site
            </Link>
            <form
              action="/login"
              method="GET"
            >
              <button
                type="submit"
                className="hover:text-accent transition-colors cursor-pointer"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
