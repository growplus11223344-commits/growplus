import Link from "next/link";
import { ArrowUpRight, LockKeyhole, MonitorSmartphone, ShieldCheck } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_REWARDS_WEB_URL?.trim();
const safeAppUrl = (() => {
  if (!appUrl) return null;
  try {
    const u = new URL(appUrl);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
})();

export default function AccountAccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#070611] px-4 py-20 text-white">
      <div className="w-full max-w-xl space-y-7 rounded-3xl border border-[#8B35FF]/30 bg-[#120D27] p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B35FF]/20">
          <LockKeyhole className="h-7 w-7 text-[#C4A0FF]" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black">GrowPlus — secure account access</h1>
          <p className="text-sm leading-7 text-[#AAA2C1]">
            Your real GrowPlus account is managed through our Rewards and Shopping applications.
            This marketing website does not process passwords or create accounts.
          </p>
        </div>
        {safeAppUrl ? (
          <a
            href={safeAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] px-7 py-3 font-semibold"
          >
            Open GrowPlus Rewards to sign in or register <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-4 text-sm leading-6 text-[#E9D7AB]">
            Secure public account access is being prepared. Do not enter your password into demo forms or unofficial websites.
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link href="/download-apps" className="inline-flex items-center gap-2 text-[#C4A0FF] underline">
            <MonitorSmartphone className="h-4 w-4" /> Preview both apps
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 text-[#AAA2C1] underline">
            <ShieldCheck className="h-4 w-4" /> Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
