import { signInWithGithubAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const action = signInWithGithubAction.bind(null, callbackUrl);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1C1B19] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#C4763B]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C4763B]" />
          </span>
          <span className="font-display text-lg font-semibold text-[#EFE9DD]">RenderPDF</span>
        </div>

        <div className="overflow-hidden border border-[#EFE9DD]/[0.12] bg-[#242220] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#EFE9DD]/[0.12] bg-[#1C1B19] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#8C5228]" />
              <div className="h-3 w-3 rounded-full bg-[#C4763B]" />
              <div className="h-3 w-3 rounded-full bg-[#EFE9DD] opacity-40" />
            </div>
            <span className="ml-2 font-mono-accent text-xs text-[#A29A8C]">zsh</span>
          </div>
          <div className="space-y-3 p-6 font-mono-accent text-sm">
            <div>
              <span className="text-[#A29A8C]">$ </span>
              <span className="text-[#EFE9DD]">renderpdf auth</span>
            </div>
            <div className="text-[#A29A8C]">
              {"→"} Sign in required to manage API clients
            </div>
            <form action={action} className="pt-2">
              <button
                type="submit"
                className="font-display w-full border border-[#C4763B] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#C4763B] transition-colors hover:bg-[#C4763B] hover:text-[#1C1B19]"
              >
                gh auth --continue
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#A29A8C]">
          GitHub OAuth &middot; renderpdf.vercel.app
        </p>
      </div>
    </div>
  );
}
