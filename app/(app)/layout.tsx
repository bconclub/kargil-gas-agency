import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell user={{ name: user.name, role: user.role }}>{children}</AppShell>;
}
