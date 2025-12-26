import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center gap-6 py-20 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Tijarat Admin Portal</h1>
      <p className="text-lg text-slate-600">
        Secure UAE COD e-commerce control center. Please sign in to manage products, inventory, and orders.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-brand-700 px-4 py-2 text-white shadow hover:bg-brand-800"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
