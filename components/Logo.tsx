// Brand assets for Kargil Gas Agencies — the real logo (background removed) from /public.
/* eslint-disable @next/next/no-img-element */

// Flame-only mark (collapsed sidebar rail, mobile header, login).
export function FlameDroplet({ className = "h-9 w-9" }: { className?: string }) {
  return <img src="/logo-flame.png" alt="Kargil Gas" className={`${className} object-contain`} />;
}

// Kept for existing call sites.
export function LogoMark({ className = "h-9 w-9", iconClass }: { className?: string; iconClass?: string }) {
  return <FlameDroplet className={iconClass ?? className} />;
}

// Full horizontal lockup (expanded sidebar, login).
export function LogoLockup({ className = "" }: { className?: string }) {
  return <img src="/logo-full.png" alt="Kargil Gas Agencies" className={`h-9 w-auto object-contain ${className}`} />;
}
