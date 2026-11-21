import Link from "next/link";
import { Apple, ArrowUpRight, Download, Eye, Globe, MonitorSmartphone, ShieldCheck, Smartphone } from "lucide-react";
import { SmartphoneMockup } from "@/components/MobileMockups";

const rewardsWebUrl = process.env.NEXT_PUBLIC_REWARDS_WEB_URL?.trim();
const shoppingWebUrl = process.env.NEXT_PUBLIC_SHOPPING_WEB_URL?.trim();
const rewardsApkUrl = process.env.NEXT_PUBLIC_REWARDS_APK_URL?.trim();
const shoppingApkUrl = process.env.NEXT_PUBLIC_SHOPPING_APK_URL?.trim();

const validHttpsUrl = (value: string | undefined) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

function AvailabilityLink({ href, label, readyLabel }: { href: string | null; label: string; readyLabel: string }) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
    >
      {readyLabel} <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <span
      aria-label={label + " is not yet published"}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-[#AAA2C1]"
    >
      {label} — not yet published
    </span>
  );
}

export default function DownloadAppsPage() {
  const rewardsWeb = validHttpsUrl(rewardsWebUrl);
  const shoppingWeb = validHttpsUrl(shoppingWebUrl);
  const rewardsApk = validHttpsUrl(rewardsApkUrl);
  const shoppingApk = validHttpsUrl(shoppingApkUrl);

  return (
    <div className="min-h-screen bg-[#070611] px-4 py-12 text-white sm:py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="mx-auto max-w-3xl space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#8B35FF]/40 bg-[#8B35FF]/10 px-4 py-2 text-xs font-bold text-[#D2A4FF]">
            <MonitorSmartphone className="h-4 w-4" /> GrowPlus mobile apps
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Explore <span className="text-[#B44CFF]">Rewards</span> &amp;{" "}
            <span className="text-[#35E6A2]">Shopping</span>
          </h1>
          <p className="text-sm leading-7 text-[#AAA2C1] sm:text-base">
            See both application designs here. The interactive phone mockups below demonstrate the interface only;
            they are not connected to your real account, orders or payment gateway.
          </p>
        </header>

        <section aria-label="Install GrowPlus apps" className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">Choose your device and app</h2>
            <p className="mt-2 text-sm text-[#AAA2C1]">
              Two Android APK downloads and two iPhone Home Screen web apps. Links activate only when the release URL is configured.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-[#8B35FF]/35 bg-[#150F2C] p-5">
              <Smartphone className="h-7 w-7 text-[#B44CFF]" />
              <h3 className="text-lg font-bold">1. Rewards — Android APK</h3>
              <p className="text-sm text-[#AAA2C1]">Install the signed Rewards app directly from the website once its APK is published.</p>
              <AvailabilityLink href={rewardsApk} label="Rewards APK download" readyLabel="Download Rewards APK" />
            </div>
            <div className="space-y-3 rounded-2xl border border-[#287CFF]/35 bg-[#150F2C] p-5">
              <Smartphone className="h-7 w-7 text-[#92B6FF]" />
              <h3 className="text-lg font-bold">2. Shopping — Android APK</h3>
              <p className="text-sm text-[#AAA2C1]">Install the signed Shopping app directly from the website once its APK is published.</p>
              <AvailabilityLink href={shoppingApk} label="Shopping APK download" readyLabel="Download Shopping APK" />
            </div>
            <div className="space-y-3 rounded-2xl border border-[#8B35FF]/35 bg-[#150F2C] p-5">
              <Apple className="h-7 w-7 text-[#B44CFF]" />
              <h3 className="text-lg font-bold">3. Rewards — iPhone Web App</h3>
              <p className="text-sm text-[#AAA2C1]">Open in Safari and choose Share → Add to Home Screen. No App Store needed.</p>
              <AvailabilityLink href={rewardsWeb} label="Rewards iPhone Web App" readyLabel="Open Rewards iPhone Web App" />
            </div>
            <div className="space-y-3 rounded-2xl border border-[#287CFF]/35 bg-[#150F2C] p-5">
              <Apple className="h-7 w-7 text-[#92B6FF]" />
              <h3 className="text-lg font-bold">4. Shopping — iPhone Web App</h3>
              <p className="text-sm text-[#AAA2C1]">Open in Safari and choose Share → Add to Home Screen. No App Store needed.</p>
              <AvailabilityLink href={shoppingWeb} label="Shopping iPhone Web App" readyLabel="Open Shopping iPhone Web App" />
            </div>
          </div>
        </section>

        <div className="grid gap-7 lg:grid-cols-2">
          <section id="rewards-preview" className="rounded-[28px] border border-[#8B35FF]/40 bg-[#110D24] p-5 sm:p-8">
            <div className="mb-5 space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#C4A0FF]">
                <Eye className="h-4 w-4" /> UI preview — sample data
              </span>
              <h2 className="text-2xl font-black">GrowPlus Rewards</h2>
              <p className="text-sm text-[#AAA2C1]">
                Preview the dashboard, wallet layout, navigation and referral screen styling. Figures shown inside the preview are illustrative.
              </p>
            </div>
            <SmartphoneMockup type="rewards" />
            <div className="mt-7 flex flex-wrap gap-3">
              <AvailabilityLink href={rewardsWeb} label="Rewards Web / iPhone" readyLabel="Open Rewards Web App" />
              <AvailabilityLink href={rewardsApk} label="Rewards Android APK" readyLabel="Get Rewards APK" />
            </div>
          </section>

          <section id="shopping-preview" className="rounded-[28px] border border-[#287CFF]/40 bg-[#110D24] p-5 sm:p-8">
            <div className="mb-5 space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#92B6FF]">
                <Eye className="h-4 w-4" /> UI preview — sample products
              </span>
              <h2 className="text-2xl font-black">GrowPlus Shopping</h2>
              <p className="text-sm text-[#AAA2C1]">
                Preview the product catalog, categories and cart layout. This mockup does not place orders or charge money.
              </p>
            </div>
            <SmartphoneMockup type="shopping" />
            <div className="mt-7 flex flex-wrap gap-3">
              <AvailabilityLink href={shoppingWeb} label="Shopping Web / iPhone" readyLabel="Open Shopping Web App" />
              <AvailabilityLink href={shoppingApk} label="Shopping Android APK" readyLabel="Get Shopping APK" />
            </div>
          </section>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#140F2A] p-6">
            <div className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Apple className="h-5 w-5 text-[#C4A0FF]" /> iPhone — no App Store required
            </div>
            <p className="text-sm leading-7 text-[#AAA2C1]">
              Once a secure public Web App link is published, open it in Safari, tap Share, then Add to Home Screen.
              Safari controls the installation; this website cannot install an iPhone app automatically.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#140F2A] p-6">
            <div className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Smartphone className="h-5 w-5 text-[#35E6A2]" /> Android — website download
            </div>
            <p className="text-sm leading-7 text-[#AAA2C1]">
              Verified, signed Android APKs can be downloaded here when their secure HTTPS download links are published.
              There is no Play Store requirement.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#35E6A2]/20 bg-[#35E6A2]/5 px-6 py-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#35E6A2]" />
            <div className="space-y-2 text-sm">
              <p className="font-bold text-white">Public availability is shown accurately.</p>
              <p className="leading-6 text-[#AAA2C1]">
                The website preview is not the deployed Flutter application. Real sign-in and purchases are only available
                from separately verified application deployments. Payment features remain subject to merchant approval
                and confirmed gateway readiness.
              </p>
              <p className="flex items-center gap-2 text-[#AAA2C1]">
                <Globe className="h-4 w-4" /> Need help? <Link href="/contact" className="font-semibold text-[#C4A0FF] underline">Contact GrowPlus</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
