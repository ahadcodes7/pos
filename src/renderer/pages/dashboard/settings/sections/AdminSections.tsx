import { CloudOff, DatabaseBackup, HardDrive, ShieldCheck, TriangleAlert, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "@/renderer/components/common/FormSection";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import { Callout } from "@/renderer/components/ui/callout";
import { Card } from "@/renderer/components/ui/card";
import { initialsOf } from "@/renderer/components/dashboard/nav";
import { useAuth } from "@/renderer/context/auth-context";
import { cn } from "@/renderer/lib/utils";
import { backupInfo, demoUsers, type Role } from "../settings-data";
import { SectionHeading } from "./fields";

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = { Owner: "default", Manager: "secondary", Cashier: "outline" };

const ROLE_HELP: { role: Role; text: string }[] = [
  { role: "Owner", text: "Everything, including settings, users and data." },
  { role: "Manager", text: "Sales, inventory, reports and refunds." },
  { role: "Cashier", text: "Sales and customers only." },
];

export function UsersSection() {
  const { user } = useAuth();
  const rows = [
    ...(user ? [{ id: user.id, name: user.username, username: user.username, role: "Owner" as Role, active: true, lastActive: "Now", you: true }] : []),
    ...demoUsers.map((u) => ({ ...u, you: false })),
  ];

  return (
    <>
      <SectionHeading id="users" />
      <FormSection
        icon={Users}
        title="Team"
        description="Sample team: user management isn't connected yet."
        aside={
          <Button type="button" size="sm" disabled title="Coming soon">
            <UserPlus />
            Invite user
          </Button>
        }
      >
        <div className="-mx-6 -my-5">
          <table className="w-full text-sm">
            <caption className="sr-only">Users</caption>
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr className="[&>th]:h-9 [&>th]:px-6 [&>th]:text-left [&>th]:font-semibold">
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Last active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-border/60 [&>td]:h-14 [&>td]:px-6">
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initialsOf(u.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="truncate">{u.name}</span>
                          {u.you && <span className="rounded-md bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">You</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className={cn("size-2 rounded-full", u.active ? "bg-success" : "bg-muted-foreground/40")} />
                      {u.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormSection icon={ShieldCheck} title="Roles" description="What each role can do.">
        <ul className="grid gap-3 sm:grid-cols-3">
          {ROLE_HELP.map((r) => (
            <li key={r.role} className="rounded-xl border border-border/70 p-3">
              <Badge variant={ROLE_VARIANT[r.role]}>{r.role}</Badge>
              <p className="mt-2 text-xs text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
      </FormSection>
    </>
  );
}

export function DataSection() {
  return (
    <>
      <SectionHeading id="data" />
      <FormSection icon={HardDrive} title="Local data" description="NayaHisab keeps everything on this computer and works offline.">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="sm:col-span-3">
            <dt className="text-xs text-muted-foreground">Location</dt>
            <dd className="mt-1 truncate rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs">{backupInfo.location}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Last backup</dt>
            <dd className="mt-1 font-medium">{backupInfo.lastBackup}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Size</dt>
            <dd className="mt-1 font-medium">{backupInfo.size}</dd>
          </div>
        </dl>
        <Button type="button" variant="outline" onClick={() => toast.info("Backups aren't connected yet", { description: "This is a preview of the settings page." })}>
          <DatabaseBackup />
          Back up now
        </Button>
      </FormSection>

      <Callout tone="info" icon={CloudOff} title="Cloud sync is coming later">
        Your data stays on this device for now. Syncing between your devices will arrive in a later version.
      </Callout>

      <Card className="border-destructive/30 p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <TriangleAlert className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-base font-semibold">Danger zone</h3>
            <p className="text-sm text-muted-foreground">Erase all products, sales and customers from this device. This can't be undone.</p>
          </div>
          <Button type="button" variant="destructive" disabled title="Not available in preview">
            Reset all data
          </Button>
        </div>
      </Card>
    </>
  );
}
