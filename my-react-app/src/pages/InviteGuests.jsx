import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Register.css";
import "../styles/CreateEvent.css";

function InviteGuests() {
    const navigate = useNavigate();
    const { eventId } = useParams();

    const [eventName, setEventName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = async () => {
        try {
            setError("");

            const userString = localStorage.getItem("user");
            const me = userString ? JSON.parse(userString) : null;
            if (!me?.userId) {
                setError("User not logged in");
                navigate("/");
                return;
            }

            const evRes = await fetch(`http://localhost:8080/events/${eventId}`);
            if (!evRes.ok) throw new Error((await evRes.text()) || "Failed to fetch event");
            const ev = await evRes.json();

            const organizer = ev.organizers?.some((o) => o.userId === me.userId);
            if (!organizer) {
                setError("Only organizers can invite guests.");
                return;
            }

            setEventName(ev.eventName);

            const res = await fetch("http://localhost:8080/auth/users", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error((await res.text()) || "Failed to fetch users");

            const data = await res.json();
            const filtered = (Array.isArray(data) ? data : []).filter((u) => u.userId !== me.userId);
            setUsers(filtered);
        } catch (e) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        load();
    }, [eventId]);

    const toggleEmail = (email) => {
        setSelectedEmails((prev) =>
            prev.includes(email) ? prev.filter((x) => x !== email) : [...prev, email]
        );
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!eventName) {
            setError("Event name missing");
            return;
        }
        if (selectedEmails.length === 0) {
            setError("Select at least one guest");
            return;
        }

        const userString = localStorage.getItem("user");
        const me = userString ? JSON.parse(userString) : null;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/mail/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients: selectedEmails,
                    name: me?.name || "Organizer",
                    eventName: eventName,
                }),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to send invitations");
            }

            setSuccess("Invitations sent! Redirecting...");
            setTimeout(() => navigate(`/event/${eventId}/participants`), 1200);
        } catch (e2) {
            setError(e2.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <form className="register-form" onSubmit={handleInvite} style={{ width: 650, maxWidth: "92%" }}>
                <h1 className="register-title">Invite Guests</h1>

                <p style={{ textAlign: "center", color: "#666", marginTop: -10 }}>
                    Event: <b>{eventName || "-"}</b>
                </p>

                {loadingUsers ? (
                    <p style={{ textAlign: "center", color: "#666" }}>Loading users...</p>
                ) : users.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#666" }}>No users available</p>
                ) : (
                    <>
                        <label className="organizers-label">Select guests:</label>
                        <div className="organizers-list">
                            {users.map((u) => (
                                <label key={u.userId} className="organizer-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmails.includes(u.email)}
                                        onChange={() => toggleEmail(u.email)}
                                        disabled={loading}
                                    />
                                    {u.name} ({u.email})
                                </label>
                            ))}
                        </div>
                    </>
                )}

                {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
                {success && <p style={{ color: "green", marginTop: 10 }}>{success}</p>}

                <button type="submit" disabled={loading || loadingUsers}>
                    {loading ? "Sending..." : "Send Invites"}
                </button>

                <button
                    type="button"
                    className="btn1"
                    onClick={() => navigate(`/event/${eventId}/participants`)}
                    disabled={loading}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default InviteGuests;
