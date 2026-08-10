import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2 } from "lucide-react";
import { notificationService } from "../../services/notificationService";

const TYPE_ICON_TINT = {
  appointment: "var(--color-teal-700)",
  billing: "var(--color-amber)",
  pharmacy: "var(--color-coral)",
  "medical-record": "var(--color-sage)",
  system: "var(--color-slate-600)",
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    notificationService
      .getAll()
      .then((res) => {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    // Poll every 30s so alerts (low stock, new appointments) show up without a refresh
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotification = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(c - 1, 0));
      } catch {
        /* non-critical */
      }
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* non-critical */
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.remove(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      /* non-critical */
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative", padding: "8px" }}
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 360,
            maxHeight: 420,
            overflowY: "auto",
            padding: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "14.5px" }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm" style={{ fontSize: "12px", padding: "4px 8px" }}>
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: "28px 16px", textAlign: "center", fontSize: "13.5px", color: "var(--color-slate-600)" }}>
              You're all caught up.
            </p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleOpenNotification(notif)}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                  background: notif.isRead ? "transparent" : "var(--color-teal-100)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: TYPE_ICON_TINT[notif.type] || "var(--color-slate-600)",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{notif.title}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--color-slate-600)", marginTop: "2px" }}>{notif.message}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-slate-300)", marginTop: "4px" }}>{timeAgo(notif.createdAt)}</div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, notif._id)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "4px", alignSelf: "flex-start" }}
                  aria-label="Delete notification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
