"use client";

import { useEffect, useMemo, useState } from "react";

type InviteRole = "medium" | "consulente";
type InviteStatus = "active" | "used" | "disabled" | "expired";

type Invite = {
  id: string;
  token: string;
  role: InviteRole;
  created_at: string;
  expires_at: string | null;
  used_at: string | null;
  status: InviteStatus;
};

export default function MembersInvitesPage() {
  const [list, setList] = useState<Invite[]>([]);
  const [q, setQ] = useState("");

  const [role, setRole] = useState<InviteRole>("medium");
  const [expiryDays, setExpiryDays] = useState<string>("7");

  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  async function loadInvites() {
    const res = await fetch("/api/invites");
    const json = await res.json();
    setList(json.invites ?? []);
  }

  useEffect(() => {
    loadInvites();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLo
