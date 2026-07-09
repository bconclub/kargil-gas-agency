import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator: full data entry + user oversight",
  USER: "Counter staff: daily data entry only",
  CEO: "CEO: read-only reports & dashboard",
};

export default async function UsersPage() {
  await requireRole("ADMIN");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted">Role-based accounts for this agency (1 admin, 2 data-entry staff, 1 CEO).</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role &amp; access</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-2.5">{u.name}</td>
                <td className="px-4 py-2.5 text-muted">{ROLE_LABEL[u.role]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        This is a fixed mock roster (no create/delete). Passwords: admin123 / user123 / user123 / ceo123.
      </p>
    </div>
  );
}
