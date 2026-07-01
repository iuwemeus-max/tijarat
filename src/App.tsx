import { ExternalLink, LockKeyhole, ShoppingBag } from 'lucide-react';

const landingUrl = 'https://da576bb73e987a3493.v2.appdeploy.ai/';
const adminUrl = 'https://da576bb73e987a3493.v2.appdeploy.ai/#admin';

export default function App() {
  return (
    <main className="min-h-screen bg-[#fdf7e8] p-6 text-slate-900">
      <section className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-700">Healthy Life ERP</p>
        <h1 className="mt-3 font-serif text-4xl font-black text-emerald-950 md:text-6xl">AppDeploy ERP GitHub Mirror</h1>
        <p className="mt-4 text-lg text-slate-600">The live ERP frontend and backend are running on AppDeploy. This GitHub repo stores the project reference and safe migration notes.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a className="rounded-3xl bg-emerald-900 p-6 text-white shadow-xl" href={landingUrl} target="_blank" rel="noreferrer">
            <ShoppingBag className="mb-4 h-9 w-9" />
            <h2 className="text-2xl font-black">Landing Page</h2>
            <p className="mt-2 text-emerald-100">Open customer order landing page.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-black">Open <ExternalLink className="h-4 w-4" /></span>
          </a>
          <a className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl" href={adminUrl} target="_blank" rel="noreferrer">
            <LockKeyhole className="mb-4 h-9 w-9" />
            <h2 className="text-2xl font-black">Admin ERP</h2>
            <p className="mt-2 text-slate-300">Open admin dashboard route.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-black">Open <ExternalLink className="h-4 w-4" /></span>
          </a>
        </div>
        <div className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm font-semibold text-amber-900">
          Backend note: AppDeploy uses its own SDK/database/secrets. To run outside AppDeploy, convert backend/index.ts to a normal Node API and database.
        </div>
      </section>
    </main>
  );
}
