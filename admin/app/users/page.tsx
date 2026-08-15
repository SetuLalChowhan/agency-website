"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Shield, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AdminUser, Pagination } from "@/lib/types";
import { Badge, Button, Dialog, EmptyState, Field, Input, Select, Spinner, useConfirm, useToast } from "@/components/ui";

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"];

export default function UsersPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api<{ data: AdminUser[]; meta: { pagination: Pagination } }>(`/api/v1/admin/users?page=${page}&limit=50`),
        api<{ data: Array<{ role: string; permissions: string[] }> }>("/api/v1/admin/users/roles"),
      ]);
      setUsers(usersRes.data);
      setPagination(usersRes.meta.pagination);
      setRoles(Object.fromEntries(rolesRes.data.map((r) => [r.role, r.permissions])));
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (user: AdminUser) => {
    if (!(await confirm(`Remove ${user.email}? They will lose access immediately.`))) return;
    try {
      await api(`/api/v1/admin/users/${user._id}`, { method: "DELETE" });
      toast("User removed");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Delete failed", "error");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Admin users</h1>
          <p className="mt-1 text-sm text-smoke">Who can sign in to the dashboard and what they can do.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Invite user
        </Button>
      </header>

      {loading ? (
        <Spinner label="Loading users" />
      ) : users.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <div className="border border-line bg-ink-2/40">
          <ul className="divide-y divide-line">
            {users.map((user) => (
              <li key={user._id} className="group flex items-center gap-4 px-4 py-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line bg-ink-3">
                  <Shield className="h-4 w-4 text-acid" />
                </span>
                <button type="button" onClick={() => setEditing(user)} className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-medium text-paper">{user.name}</span>
                  <span className="meta-label block text-[10px] text-stone">{user.email}</span>
                </button>
                <Badge value={user.role} />
                <Badge value={user.active} />
                <div className="flex flex-none items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(user)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(user)} className="hover:!text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Roles reference */}
      <div className="border border-line bg-ink-2/40">
        <p className="meta-label border-b border-line px-4 py-3 text-stone">Role permissions</p>
        <div className="grid gap-4 p-4 md:grid-cols-4">
          {ROLES.map((role) => (
            <div key={role} className="border border-line bg-ink p-3">
              <p className="text-sm font-medium text-paper">{role}</p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {(roles[role] ?? []).map((p) => (
                  <li key={p} className="rounded-sm bg-ink-3 px-1.5 py-0.5 font-mono text-[10px] text-smoke">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <UserDialog
        open={creating || editing !== null}
        user={editing}
        creating={creating}
        saving={saving}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSave={async (payload) => {
          setSaving(true);
          try {
            if (creating) await api("/api/v1/admin/users", { method: "POST", body: payload });
            else await api(`/api/v1/admin/users/${editing?._id}`, { method: "PATCH", body: payload });
            toast("Saved");
            setCreating(false);
            setEditing(null);
            load();
          } catch (err) {
            toast(err instanceof ApiError ? err.message : "Save failed", "error");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}

function UserDialog({
  open,
  user,
  creating,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  user: AdminUser | null;
  creating: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, any>) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      setForm(user ? { name: user.name, email: user.email, role: user.role, active: user.active } : { role: "EDITOR", active: true });
    }
  }, [open, user]);

  return (
    <Dialog open={open} onClose={onClose} title={creating ? "Invite user" : `Edit ${user?.name ?? "user"}`}>
      <div className="flex flex-col gap-4">
        <Field label="Name">
          <Input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Role">
          <Select value={form.role ?? "EDITOR"} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label={creating ? "Initial password" : "New password (leave blank to keep)"} hint="Minimum 8 characters.">
          <Input type="password" value={form.password ?? ""} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </Field>
        {!creating && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-paper/85">
            <input type="checkbox" checked={form.active !== false} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-acid" />
            Account active
          </label>
        )}
        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(form)} loading={saving}>{creating ? "Create user" : "Save"}</Button>
        </div>
      </div>
    </Dialog>
  );
}
