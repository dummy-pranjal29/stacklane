import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
          See How Much You are Overspending on AI
        </h1>
        <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mb-10">
          Audit your spending across Cursor, Claude, ChatGPT, and more in 2
          minutes. Get personalized savings recommendations instantly.
        </p>

        <Link
          href="/audit"
          className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 text-lg font-medium text-white transition-colors hover:bg-blue-700 mb-12"
        >
          Start Your Audit
        </Link>

        <div className="text-sm font-medium text-zinc-500 mb-24">
          <p>Trusted by 500+ engineering teams</p>
        </div>

        <section className="max-w-3xl w-full text-left bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 mt-10">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Is this completely free?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes. We build this tool to help founders optimize AI spending
                and identify opportunities for Credex discounted credits.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                How accurate are the recommendations?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Very accurate for plan downgrades. All pricing is sourced from
                official vendor pages, updated weekly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Will you share my data?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                No. Audits are private by default. You control what information
                is visible.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
