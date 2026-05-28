export default function ResultPage({
  params,
}: {
  params: { resultId: string };
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-8 flex flex-col items-center">
      <main className="max-w-3xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow p-8 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-4">Audit Result</h1>
        <p className="text-lg font-medium mb-8">
          Result ID:{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {params.resultId}
          </span>
        </p>

        <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Savings Summary</h2>
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">
            Fetching your personalized AI spend insights...
          </p>
        </div>

        <button className="w-full bg-blue-600 text-white font-semibold text-lg py-3 rounded-xl hover:bg-blue-700 transition-colors">
          Share This Report
        </button>
      </main>
    </div>
  );
}
