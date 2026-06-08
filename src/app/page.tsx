"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
  const checkAuth = async () => {
    try {
      await api.get("/auth/me");
    } catch {
      router.push("/login");
    }
  };

  checkAuth();
}, [router]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBooking = (room: any) => {
    if (!from || !to) {
      toast.error("Please select check-in and check-out dates first");
      return;
    }
    const params = new URLSearchParams({
      roomId:   room._id,
      roomName: room.name,
      from,
      to,
    });
    router.push(`/dashboard?${params.toString()}`);
  };

  const getNights = () => {
    if (!from || !to) return 0;
    return Math.max(
      0,
      Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000),
    );
  };

const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});

const getSlide = (id: string) => activeSlides[id] ?? 0;
const setSlide = (id: string, idx: number) =>
  setActiveSlides((prev) => ({ ...prev, [id]: idx }));
  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const checkAvailability = async () => {
    if (!from || !to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (new Date(to) <= new Date(from)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/rooms`);
      console.log(res.data.rooms)
      setRooms(res.data.rooms);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nights = getNights();

  return (
    <>
    <button
  onClick={() => router.push("/dashboard")}
  style={{
    background: "#fff",
    color: "#0C447C",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "12px",
    fontWeight: 600,
  }}
>
  Dashboard
</button>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .hotel-root { font-family: 'DM Sans', sans-serif; }
        .hotel-heading { font-family: 'Cormorant Garamond', serif; font-weight: 300; }
        .date-input-wrap:focus-within { border-color: #378ADD !important; box-shadow: 0 0 0 3px rgba(55,138,221,0.15); }
        .room-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .room-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(4,44,83,0.12); border-color: #378ADD; }
        .book-btn { transition: background 0.2s ease, transform 0.15s ease; }
        .book-btn:hover { background: #0C447C !important; }
        .book-btn:active { transform: scale(0.98); }
        .search-btn { transition: background 0.2s ease, transform 0.15s ease; }
        .search-btn:hover { background: #0C447C !important; transform: translateY(-1px); }
        .search-btn:active { transform: scale(0.98); }
      `}</style>

      <div className="hotel-root min-h-screen" style={{ background: "#F4F6F9" }}>

        {/* ── Hero ── */}
        <div style={{
          background: "linear-gradient(160deg, #0C447C 0%, #042C53 100%)",
          padding: "4rem 2rem 6rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%23ffffff' fill-opacity='0.06'/%3E%3C/svg%3E")`,
          }} />
          <div className="max-w-6xl mx-auto px-4" style={{ position: "relative" }}>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <span
                onClick={() => router.push("/")}
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.1)",
                  border: "0.5px solid rgba(255,255,255,0.2)",
                  color: "#85B7EB", fontSize: "11px", letterSpacing: "0.14em",
                  textTransform: "uppercase", padding: "5px 16px",
                  borderRadius: "20px", marginBottom: "1.25rem", cursor: "pointer",
                }}
              >
                Plaxonic Technologies
              </span>
              <h1 className="hotel-heading" style={{
                fontSize: "clamp(38px,6vw,60px)", color: "#fff", margin: 0, lineHeight: 1.1,
              }}>
                Find Your{" "}
                <em style={{ fontStyle: "italic", fontWeight: 300 }}>Perfect Room</em>
              </h1>
              <p style={{
                color: "#85B7EB", fontSize: "15px", fontWeight: 300,
                marginTop: "1rem", maxWidth: "400px", lineHeight: 1.7,
              }}>
                Seamless booking for exceptional accommodations — select your dates to see what is available.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            style={{
              background: "#fff", borderRadius: "16px",
              border: "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 40px rgba(4,44,83,0.13)",
              padding: "1.75rem", marginTop: "-3rem",
              position: "relative", zIndex: 10,
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "12px", alignItems: "end",
            }}>
              {/* Check In */}
              <div>
                <label style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#6B7280", fontWeight: 500, marginBottom: "8px",
                }}>
                  <FaCalendarAlt size={11} /> Check in
                </label>
                <div className="date-input-wrap" style={{
                  border: "0.5px solid #D1D5DB", borderRadius: "10px",
                  padding: "10px 14px", display: "flex", alignItems: "center",
                  gap: "8px", transition: "border-color 0.2s",
                }}>
                  <FaCalendarAlt color="#9CA3AF" size={14} />
                  <input
                    type="date"
                    value={from}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFrom(e.target.value)}
                    style={{
                      border: "none", background: "transparent",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                      color: "#111", width: "100%", outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Check Out */}
              <div>
                <label style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#6B7280", fontWeight: 500, marginBottom: "8px",
                }}>
                  <FaCalendarAlt size={11} /> Check out
                </label>
                <div className="date-input-wrap" style={{
                  border: "0.5px solid #D1D5DB", borderRadius: "10px",
                  padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <FaCalendarAlt color="#9CA3AF" size={14} />
                  <input
                    type="date"
                    value={to}
                    min={from || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setTo(e.target.value)}
                    style={{
                      border: "none", background: "transparent",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                      color: "#111", width: "100%", outline: "none",
                    }}
                  />
                </div>
              </div>

            
              <div>
                <label style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#6B7280", fontWeight: 500, marginBottom: "8px",
                }}>
                  <FaUsers size={11} /> Duration
                </label>
                <div style={{
                  border: "0.5px solid #D1D5DB", borderRadius: "10px",
                  padding: "10px 14px", height: "46px", display: "flex",
                  alignItems: "center", fontSize: "14px",
                  color: nights > 0 ? "#185FA5" : "#9CA3AF",
                  fontWeight: nights > 0 ? 500 : 400,
                }}>
                  {nights > 0 ? `${nights} night${nights !== 1 ? "s" : ""}` : "Select dates"}
                </div>
              </div>

              <button
                className="search-btn"
                onClick={checkAvailability}
                style={{
                  background: "#185FA5", color: "#fff", border: "none",
                  borderRadius: "10px", height: "46px", padding: "0 24px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                  fontWeight: 500, cursor: "pointer", display: "flex",
                  alignItems: "center", gap: "8px", whiteSpace: "nowrap",
                }}
              >
                {loading ? "Searching..." : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Check availability
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14">
          {rooms.length > 0 && (
            <div style={{
              display: "flex", alignItems: "baseline",
              gap: "1rem", marginBottom: "1.5rem",
            }}>
              <h2 className="hotel-heading" style={{ fontSize: "32px", margin: 0 }}>
                {rooms.length} rooms available
              </h2>
              {nights > 0 && from && to && (
                <span style={{ fontSize: "14px", color: "#6B7280" }}>
                  {nights} night{nights !== 1 ? "s" : ""} · {formatDate(from)} – {formatDate(to)}
                </span>
              )}
            </div>
          )}

         <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    padding: "10px 0",
  }}
>
  {rooms.map((room: any, idx: number) => (
    <motion.div
      key={room._id}
      className="room-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07 }}
      style={{
        background: "#fff",
        borderRadius: "18px",
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* ── Image / Placeholder ── */}
      
    
{/* ── Image Carousel ── */}
<div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
  {room.images && room.images.length > 0 ? (
    <>
      {/* Slides */}
      {room.images.map((img: string, i: number) => (
        <img
          key={i}
          src={img}
          alt={`${room.name} ${i + 1}`}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            opacity: getSlide(room._id) === i ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      ))}

      {/* Left arrow */}
      {room.images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const cur = getSlide(room._id);
            setSlide(room._id, cur === 0 ? room.images.length - 1 : cur - 1);
          }}
          style={{
            position: "absolute", left: "10px", top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)", border: "none",
            color: "#fff", width: "28px", height: "28px",
            borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", zIndex: 2,
            backdropFilter: "blur(4px)",
          }}
        >
          ‹
        </button>
      )}

      {/* Right arrow */}
      {room.images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const cur = getSlide(room._id);
            setSlide(room._id, cur === room.images.length - 1 ? 0 : cur + 1);
          }}
          style={{
            position: "absolute", right: "10px", top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)", border: "none",
            color: "#fff", width: "28px", height: "28px",
            borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", zIndex: 2,
            backdropFilter: "blur(4px)",
          }}
        >
          ›
        </button>
      )}

      {/* Dot indicators */}
      {room.images.length > 1 && (
        <div style={{
          position: "absolute", bottom: "10px", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: "5px", zIndex: 2,
        }}>
          {room.images.map((_: string, i: number) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setSlide(room._id, i); }}
              style={{
                width: getSlide(room._id) === i ? "18px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: getSlide(room._id) === i
                  ? "#fff" : "rgba(255,255,255,0.5)",
                border: "none", padding: 0, cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </>
  ) : (
    <div style={{
      height: "100%",
      background: "linear-gradient(135deg, #E6F1FB 0%, #B5D4F4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="54" height="54" viewBox="0 0 24 24" fill="none"
        stroke="#378ADD" strokeWidth="1.2" strokeLinecap="round"
        strokeLinejoin="round" style={{ opacity: 0.5 }}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  )}

  {/* Type badge */}
  <span style={{
    position: "absolute", top: "14px", right: "14px",
    background: "rgba(255,255,255,0.95)", color: "#185FA5",
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", padding: "6px 12px", borderRadius: "999px",
    zIndex: 2,
  }}>
    {room.type}
  </span>
</div>
      {/* ── Content ── */}
      <div style={{ padding: "18px" }}>
        <h3 style={{
          fontSize: "20px", marginBottom: "6px",
          fontWeight: 700, color: "#111827",
        }}>
          {room.name}
        </h3>

        {room.description && (
          <p style={{
            fontSize: "13px", color: "#6B7280", marginBottom: "12px",
            lineHeight: 1.5,
          }}>
            {room.description}
          </p>
        )}

        <div style={{
          display: "flex", flexDirection: "column", gap: "7px",
          marginBottom: "14px", fontSize: "14px", color: "#4B5563",
        }}>
          <div><strong>Max Occupancy:</strong> {room.maxOccupancy} guests</div>
          <div>
            <strong>Status:</strong>{" "}
            {room.isAvailable
              ? <span style={{ color: "#16A34A", fontWeight: 600 }}>Available</span>
              : <span style={{ color: "#DC2626", fontWeight: 600 }}>Booked</span>}
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px",
          }}>
            {room.amenities.map((amenity: string) => (
              <span key={amenity} style={{
                background: "#EFF6FF", color: "#185FA5",
                fontSize: "11px", fontWeight: 500,
                padding: "4px 10px", borderRadius: "999px",
                border: "1px solid #BFDBFE",
              }}>
                {amenity}
              </span>
            ))}
          </div>
        )}

        <button
          className="book-btn"
          onClick={() => {
            if (!room.isAvailable) {
              toast.error("Room Unavailable");
            } else {
              handleBooking(room);
            }
          }}
          style={{
            background: room.isAvailable ? "#185FA5" : "#94A3B8",
            color: "#fff", border: "none", borderRadius: "10px",
            width: "100%", padding: "12px", fontSize: "14px",
            fontWeight: 600,
            cursor: room.isAvailable ? "pointer" : "not-allowed",
            transition: "0.2s ease",
          }}
        >
          {room.isAvailable ? "Book Now" : "Unavailable"}
        </button>
      </div>
    </motion.div>
  ))}
</div>


        </div>
      </div>
    </>
  );
}