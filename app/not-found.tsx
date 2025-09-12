import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-5xl font-bold">404</div>
        <div className="mt-2 text-lg opacity-80">Page not found</div>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 rounded border border-slate-700 hover:bg-slate-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
