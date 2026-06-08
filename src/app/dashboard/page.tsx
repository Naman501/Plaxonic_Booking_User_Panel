"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
  _id: string;
  roomId?: { name: string; type: string };
  room?:   { name: string; type: string };
  checkinDate:  string;
  checkoutDate: string;
  status: "confirmed" | "pending" | "cancelled" | "approved" | "rejected";
  adminRemarks?: string;
  occupantCount?: number;
  bookingType?: string;
}

interface Room {
  _id: string;
  name: string;
  type: string;
  maxOccupants: number;
}

const fmt = (d: string) => {
  if (!d) return "N/A";
  const dateString = d.includes("T") ? d : `${d}T00:00:00`;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const nights = (from: string, to: string) =>
  Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000));

const STATUS_COLOR: Record<string, string> = {
  approved: "#16A34A", confirmed: "#16A34A", pending: "#D97706", rejected: "#DC2626",
};
const STATUS_BG: Record<string, string> = {
  approved: "#F0FDF4", confirmed: "#F0FDF4", pending: "#FFFBEB", rejected: "#FEF2F2",
};

const Icon = {
  bed:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 4v16"/><rect x="6" y="4" width="12" height="4" rx="1"/></svg>,
  calendar: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  users:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  list:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  home:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  check:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  logout:   (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  star:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preRoomId   = searchParams.get("roomId")   || "";
  const preFrom     = searchParams.get("from")     || "";
  const preTo       = searchParams.get("to")       || "";
  const preRoomName = searchParams.get("roomName") || "";


  const [tab, setTab] = useState<"overview" | "create" | "bookings">(
    preRoomId ? "create" : "overview"
  );

  const [bookings, setBookings]  = useState<Booking[]>([]);
  const [rooms, setRooms]        = useState<Room[]>([]);
  const [loadingBookings, setLB] = useState(false);
  const [submitting, setSub]     = useState(false);

  const [form, setForm] = useState({
    roomId:        preRoomId,
    bookingType:   "individual" as "individual" | "team" | "family",
    checkinDate:   preFrom,  
    checkoutDate:  preTo,    
    occupantCount: "1",
    members: [] as {
    employeeId: string;
    name: string;
    email: string;
  }[],
    memberInput: {
    employeeId: "",
    name: "",
    email: "",
  },
    purpose:       "",
  });

  const fetchBookings = async () => {
    try {
      setLB(true);
      const res = await api.get("/bookings/me");
      setBookings(res.data.bookings);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLB(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data.rooms || []);
    } catch {  }
  };

  const handleLogOut = async () => {
    await api.post("/auth/logout");
    router.push("/login");
  };

const addMember = () => {
  const { employeeId, name, email } =
    form.memberInput;

  if (!employeeId || !name || !email) {
    toast.error("Fill all member fields");
    return;
  }

  const alreadyExists = form.members.some(
    (m) => m.employeeId === employeeId
  );

  if (alreadyExists) {
    toast.error("Member already added");
    return;
  }

  setForm((f) => ({
    ...f,

    members: [
      ...f.members,
      {
        employeeId,
        name,
        email,
      },
    ],

    memberInput: {
      employeeId: "",
      name: "",
      email: "",
    },
  }));
};
  
const removeMember = (
  employeeId: string
) =>
  setForm((f) => ({
    ...f,
    members: f.members.filter(
      (m) => m.employeeId !== employeeId
    ),
  }));

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

const handleSubmit = async (e: any) => {
  e.preventDefault();

  if (
    !form.roomId ||
    !form.checkinDate ||
    !form.checkoutDate ||
    !form.occupantCount
  ) {
    toast.error("Please fill all required fields");
    return;
  }

  if (
    new Date(form.checkoutDate) <=
    new Date(form.checkinDate)
  ) {
    toast.error("Check-out must be after check-in");
    return;
  }

  if (
    form.bookingType === "team" &&
    form.members.length === 0
  ) {
    toast.error("Add at least one team member");
    return;
  }

  try {
    setSub(true);

    const checkRes = await api.get(
      `/bookings/check-pending/${form.roomId}`
    );

    if (checkRes.data.hasPendingRequests) {
      toast.error(
        `${checkRes.data.pendingCount} pending request(s) already exist for this room.`
      );

      return; 
    }

    await api.post("/bookings/create", {
      roomId: form.roomId,
      bookingType: form.bookingType,
      checkinDate: form.checkinDate,
      checkoutDate: form.checkoutDate,
      occupantCount: Number(form.occupantCount),
      members: form.members,
      purpose: form.purpose,
    });

    toast.success("Booking request created!");

  setForm({
  roomId: "",
  bookingType: "individual",
  checkinDate: "",
  checkoutDate: "",
  occupantCount: "1",
  members: [],
  memberInput: {
    employeeId: "",
    name: "",
    email: "",
  },
  purpose: "",
});

fetchBookings();
setTab("bookings");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || "Booking failed"
    );
  } finally {
    setSub(false);
  }
};

  const stayNights = form.checkinDate && form.checkoutDate
    ? nights(form.checkinDate, form.checkoutDate)
    : 0;

  const selectedRoom = rooms.find(r => r._id === form.roomId);

  const stats = {
    total:    bookings.length,
    approved: bookings.filter(b => b.status === "approved" || b.status === "confirmed").length,
    upcoming: bookings.filter(b => new Date(b.checkinDate) > new Date()).length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dash-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #F0F2F5; display: flex; }
        .sidebar { width: 240px; min-height: 100vh; background: linear-gradient(180deg, #042C53 0%, #0C447C 100%); display: flex; flex-direction: column; position: sticky; top: 0; flex-shrink: 0; }
        .sidebar-brand { padding: 1.75rem 1.5rem 1.25rem; border-bottom: 0.5px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
        .brand-icon { width: 34px; height: 34px; background: rgba(255,255,255,0.12); border: 0.5px solid rgba(255,255,255,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
        .brand-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; color: #fff; letter-spacing: 0.02em; }
        .sidebar-nav { flex: 1; padding: 1.25rem 0.75rem; display: flex; flex-direction: column; gap: 4px; }
        .nav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); padding: 0.75rem 0.75rem 0.4rem; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; cursor: pointer; color: rgba(255,255,255,0.55); font-size: 13.5px; font-weight: 400; border: none; background: none; width: 100%; text-align: left; transition: background 0.15s, color 0.15s; }
        .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
        .nav-item.active { background: rgba(255,255,255,0.13); color: #fff; font-weight: 500; }
        .sidebar-footer { padding: 1rem 0.75rem; border-top: 0.5px solid rgba(255,255,255,0.08); }
        .user-chip { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; background: rgba(255,255,255,0.07); }
        .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #378ADD, #185FA5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 500; flex-shrink: 0; }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 13px; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: rgba(255,255,255,0.4); }
        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .topbar { background: #fff; border-bottom: 0.5px solid #E5E7EB; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 20; }
        .page-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #0D1117; }
        .content { padding: 2rem; flex: 1; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 2rem; }
        .stat-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 14px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 14px; }
        .stat-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-val { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #0D1117; line-height: 1; }
        .stat-label { font-size: 12px; color: #6B7280; margin-top: 3px; }
        .room-banner { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border: 0.5px solid #BFDBFE; border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
        .room-banner-icon { width: 36px; height: 36px; background: #185FA5; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
        .form-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 16px; overflow: hidden; }
        .form-header { padding: 1.25rem 1.5rem; border-bottom: 0.5px solid #F3F4F6; display: flex; align-items: center; gap: 10px; }
        .form-body { padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-full { grid-column: 1 / -1; }
        .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin-bottom: 6px; }
        .field-wrap { border: 0.5px solid #D1D5DB; border-radius: 9px; background: #fff; display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 46px; transition: border-color 0.2s, box-shadow 0.2s; }
        .field-wrap:focus-within { border-color: #378ADD; box-shadow: 0 0 0 3px rgba(55,138,221,0.12); }
        .field-wrap input, .field-wrap select { border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111; width: 100%; outline: none; }
        .field-wrap select { cursor: pointer; }
        .nights-pill { display: inline-flex; align-items: center; gap: 6px; background: #EFF6FF; border: 0.5px solid #BFDBFE; color: #185FA5; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
        .submit-btn { height: 46px; background: #185FA5; color: #fff; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; padding: 0 24px; white-space: nowrap; }
        .submit-btn:hover:not(:disabled) { background: #0C447C; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .bookings-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 16px; overflow: hidden; }
        .bookings-header { padding: 1.25rem 1.5rem; border-bottom: 0.5px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; }
        thead th { text-align: left; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #9CA3AF; padding: 10px 16px; background: #FAFAFA; border-bottom: 0.5px solid #F3F4F6; }
        tbody tr { border-bottom: 0.5px solid #F9FAFB; transition: background 0.15s; }
        tbody tr:hover { background: #FAFAFA; }
        tbody tr:last-child { border-bottom: none; }
        tbody td { padding: 13px 16px; font-size: 13.5px; color: #374151; vertical-align: middle; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
        .empty-state { text-align: center; padding: 3rem; color: #9CA3AF; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 2rem; }
        .quick-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 14px; padding: 1.5rem; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; display: flex; align-items: flex-start; gap: 14px; }
        .quick-card:hover { border-color: #378ADD; box-shadow: 0 4px 20px rgba(24,95,165,0.1); transform: translateY(-2px); }
        .quick-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .quick-title { font-size: 15px; font-weight: 500; color: #0D1117; margin-bottom: 4px; }
        .quick-desc { font-size: 12px; color: #6B7280; line-height: 1.5; }
        @media (max-width: 900px) { .sidebar { display: none; } .stats-row { grid-template-columns: 1fr 1fr; } .form-body { grid-template-columns: 1fr; } .quick-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash-root">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">{Icon.home(16)}</div>
            <span className="brand-name">Plaxonic</span>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            {[
              { id: "overview", label: "Overview",    icon: Icon.home(15) },
              { id: "create",   label: "New Booking", icon: Icon.plus(15) },
              { id: "bookings", label: "My Bookings", icon: Icon.list(15) },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${tab === item.id ? "active" : ""}`}
                onClick={() => setTab(item.id as any)}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar">EE</div>
              <div className="user-info">
                <div className="user-name">Employee</div>
                <div className="user-role">Staff</div>
              </div>
              <button onClick={handleLogOut}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}
                title="Logout">
                {Icon.logout(14)}
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          <div className="topbar">
            <div className="page-title">
              {tab === "overview" && "Dashboard"}
              {tab === "create"   && "New Booking"}
              {tab === "bookings" && "My Bookings"}
            </div>
          </div>

          <div className="content">
            <AnimatePresence mode="wait">

              
              {tab === "overview" && (
                <motion.div key="overview"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <div className="stats-row">
                    {[
                      { label: "Total Bookings", val: stats.total,    bg: "#EFF6FF", color: "#185FA5", icon: Icon.bed(18) },
                      { label: "Confirmed",      val: stats.approved, bg: "#F0FDF4", color: "#16A34A", icon: Icon.check(18) },
                      { label: "Upcoming Stays", val: stats.upcoming, bg: "#FFFBEB", color: "#D97706", icon: Icon.calendar(18) },
                    ].map(s => (
                      <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div>
                          <div className="stat-val">{s.val}</div>
                          <div className="stat-label">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="quick-grid">
                    <div className="quick-card" onClick={() => setTab("create")}>
                      <div className="quick-icon" style={{ background: "#EFF6FF", color: "#185FA5" }}>{Icon.plus(20)}</div>
                      <div>
                        <div className="quick-title">New Booking</div>
                        <div className="quick-desc">Reserve a room for your upcoming stay — pick dates, room type, and guests.</div>
                      </div>
                    </div>
                    <div className="quick-card" onClick={() => setTab("bookings")}>
                      <div className="quick-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>{Icon.list(20)}</div>
                      <div>
                        <div className="quick-title">My Bookings</div>
                        <div className="quick-desc">View and manage all your current and past reservations in one place.</div>
                      </div>
                    </div>
                  </div>
                  {bookings.length > 0 && (
                    <div className="bookings-card">
                      <div className="bookings-header">
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#0D1117" }}>Recent Bookings</span>
                        <button onClick={() => setTab("bookings")}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#378ADD", display: "flex", alignItems: "center", gap: 4 }}>
                          View all {Icon.arrow(12)}
                        </button>
                      </div>
                      <table>
                        <thead><tr><th>Room</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
                        <tbody>
                          {bookings.slice(0, 3).map(b => (
                            <tr key={b._id}>
                              <td style={{ fontWeight: 500, color: "#0D1117" }}>{b.roomId?.name || b.room?.name || "—"}</td>
                              <td>{fmt(b.checkinDate)}</td>
                              <td>{fmt(b.checkoutDate)}</td>
                              <td>
                                <span className="status-badge"
                                  style={{ background: STATUS_BG[b.status] || "#F3F4F6", color: STATUS_COLOR[b.status] || "#6B7280" }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLOR[b.status] || "#6B7280", display: "inline-block" }} />
                                  {b.status}
                                </span>
                                {b.status === "rejected" && b.adminRemarks && (
                                  <div style={{ marginTop: 6, fontSize: 12, color: "#DC2626" }}>{b.adminRemarks}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

          
              {tab === "create" && (
                <motion.div key="create"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                  {preRoomId && (
                    <div className="room-banner">
                      <div className="room-banner-icon">{Icon.star(16)}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1E40AF" }}>
                          Room pre-selected from your search
                        </div>
                        <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 2 }}>
                          {preRoomName || `Room ID: ${preRoomId}`}
                          {preFrom && preTo && ` · ${fmt(preFrom)} → ${fmt(preTo)} · ${nights(preFrom, preTo)} nights`}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-card">
                    <div className="form-header">
                      <div style={{ width: 32, height: 32, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#185FA5" }}>
                        {Icon.bed(15)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#0D1117" }}>Booking Details</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>Fill in the details to reserve your room</div>
                      </div>
                    </div>

                    <div className="form-body">

                     
                      <div className="form-full">
                        <label className="field-label">Room *</label>
                        <div className="field-wrap">
                          {Icon.bed(15)}
                          <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}>
                            <option value="">Select a room…</option>
                            {rooms.map(r => (
                              <option key={r._id} value={r._id}>{r.name} — {r.type}</option>
                            ))}
                          </select>
                        </div>
                        {selectedRoom && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                              {Icon.users(12)} Up to {selectedRoom.maxOccupants} guests
                            </span>
                          </div>
                        )}
                      </div>

                    
                      <div className="form-full">
                        <label className="field-label">Booking Type *</label>
                        <div style={{ display: "flex", gap: 10 }}>
                          {(["individual", "team", "family"] as const).map(t => (
                            <button key={t} type="button"
                              onClick={() => setForm(f => ({ ...f, bookingType: t }))}
                              style={{
                                flex: 1, height: 44, borderRadius: 9, cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                                textTransform: "capitalize", transition: "all 0.15s",
                                border: form.bookingType === t ? "none" : "0.5px solid #D1D5DB",
                                background: form.bookingType === t ? "#185FA5" : "#fff",
                                color: form.bookingType === t ? "#fff" : "#6B7280",
                                boxShadow: form.bookingType === t ? "0 2px 8px rgba(24,95,165,0.25)" : "none",
                              }}>
                              {t === "individual" ? "👤" : t === "team" ? "👥" : "👨‍👩‍👧"} {t}
                            </button>
                          ))}
                        </div>
                      </div>

                
                      <div>
                        <label className="field-label">Check In *</label>
                        <div className="field-wrap">
                          {Icon.calendar(14)}
                          <input type="date" value={form.checkinDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={e => setForm(f => ({ ...f, checkinDate: e.target.value }))} />
                        </div>
                      </div>

                      <div>
                        <label className="field-label">Check Out *</label>
                        <div className="field-wrap">
                          {Icon.calendar(14)}
                          <input type="date" value={form.checkoutDate}
                            min={form.checkinDate || new Date().toISOString().split("T")[0]}
                            onChange={e => setForm(f => ({ ...f, checkoutDate: e.target.value }))} />
                        </div>
                        {stayNights > 0 && (
                          <div className="nights-pill">
                            {Icon.calendar(11)} {stayNights} night{stayNights !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="field-label">Occupant Count *</label>
                        <div className="field-wrap">
                          {Icon.users(14)}
                          <input type="number" min="1" max="20" value={form.occupantCount}
                            onChange={e => setForm(f => ({ ...f, occupantCount: e.target.value }))} />
                        </div>
                      </div>

                 
                      <div>
                        <label className="field-label">Purpose</label>
                        <div className="field-wrap">
                          <input type="text" placeholder="e.g. Annual offsite, client visit…"
                            value={form.purpose}
                            onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                        </div>
                      </div>

                   
{form.bookingType === "team" && (
  <div className="form-full">
    <label className="field-label">
      Team Members *
    </label>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1fr 1fr 1fr auto",
        gap: 8,
      }}
    >
    
      <div className="field-wrap">
        <input
          type="text"
          placeholder="Employee ID"
          value={
            form.memberInput.employeeId
          }
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              memberInput: {
                ...f.memberInput,
                employeeId:
                  e.target.value,
              },
            }))
          }
        />
      </div>

      <div className="field-wrap">
        <input
          type="text"
          placeholder="Name"
          value={form.memberInput.name}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              memberInput: {
                ...f.memberInput,
                name: e.target.value,
              },
            }))
          }
        />
      </div>

      <div className="field-wrap">
        <input
          type="email"
          placeholder="Email"
          value={
            form.memberInput.email
          }
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              memberInput: {
                ...f.memberInput,
                email: e.target.value,
              },
            }))
          }
        />
      </div>

      <button
        type="button"
        onClick={addMember}
        style={{
          height: 46,
          padding: "0 16px",
          background: "#EFF6FF",
          color: "#185FA5",
          border:
            "0.5px solid #BFDBFE",
          borderRadius: 9,
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Add
      </button>
    </div>

    {form.members.length > 0 && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 14,
        }}
      >
        {form.members.map((m) => (
          <div
            key={m.employeeId}
            style={{
              border:
                "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              background: "#FAFAFA",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {m.name}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                {m.employeeId} •{" "}
                {m.email}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                removeMember(
                  m.employeeId
                )
              }
              style={{
                border: "none",
                background: "none",
                color: "#DC2626",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}
                      <div className="form-full" style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
                          {submitting ? (
                            <><svg className="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Confirming…</>
                          ) : (
                            <>{Icon.check(15)} Confirm Booking {Icon.arrow(14)}</>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {tab === "bookings" && (
                <motion.div key="bookings"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <div className="bookings-card">
                    <div className="bookings-header">
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#0D1117" }}>All Bookings</div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                          {bookings.length} reservation{bookings.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {loadingBookings ? (
                      <div className="empty-state">
                        <svg className="spin" width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                          style={{ margin: "0 auto 1rem", display: "block" }}>
                          <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                        </svg>
                        Loading bookings…
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="empty-state">
                        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.25 }}>🛏</div>
                        <div style={{ fontSize: 14, color: "#374151", marginBottom: 6, fontWeight: 500 }}>No bookings yet</div>
                        <div style={{ fontSize: 13, marginBottom: 16 }}>Your reservations will appear here once you make a booking.</div>
                      </div>
                    ) : (
                      <table>
                        <thead>
                          <tr><th>Room</th><th>Type</th><th>Check In</th><th>Check Out</th><th>Nights</th><th>Guests</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {bookings.map((b, i) => (
                            <motion.tr key={b._id}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}>
                              <td style={{ fontWeight: 500, color: "#0D1117" }}>{b.roomId?.name || b.room?.name || "—"}</td>
                              <td><span style={{ fontSize: 11, background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: 20 }}>{b.bookingType}</span></td>
                              <td>{fmt(b.checkinDate)}</td>
                              <td>{fmt(b.checkoutDate)}</td>
                              <td style={{ fontWeight: 500 }}>{nights(b.checkinDate, b.checkoutDate)}</td>
                              <td>{b.occupantCount ?? "—"}</td>
                              <td>
                                <span className="status-badge"
                                  style={{ background: STATUS_BG[b.status] || "#F3F4F6", color: STATUS_COLOR[b.status] || "#6B7280" }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLOR[b.status] || "#6B7280", display: "inline-block" }} />
                                  {b.status}
                                </span>
                                {b.status === "rejected" && b.adminRemarks && (
                                  <div style={{ marginTop: 6, fontSize: 12, color: "#DC2626" }}>{b.adminRemarks}</div>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}