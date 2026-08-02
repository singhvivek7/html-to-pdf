import Link from "next/link";
import { signOutAction } from "@/app/dashboard/actions";

export function DashboardNav({ userLabel }: { userLabel: string }) {
  return (
    <nav className="border-b border-[#EFE9DD]/[0.12] bg-[#1C1B19]">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-[#C4763B]">
            <span className="h-2 w-2 rounded-full bg-[#C4763B]" />
          </span>
          <span className="font-display text-sm font-semibold text-[#EFE9DD]">RenderPDF</span>
        </Link>

        <div className="flex items-center gap-5 text-xs">
          <Link
            href="/docs"
            className="uppercase tracking-wide text-[#A29A8C] transition-colors hover:text-[#EFE9DD]"
          >
            Docs
          </Link>
          <span className="text-[#A29A8C]">{userLabel}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="uppercase tracking-wide text-[#A29A8C] transition-colors hover:text-[#EFE9DD]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
