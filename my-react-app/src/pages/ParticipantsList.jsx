import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Register.css";
import "../styles/Participants.css";

function ParticipantsList() {
    const navigate = useNavigate();
    const { eventId } = useParams();

    const [event, setEvent] = useState(null);
    const [isOrganizer, setIsOrganizer] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchEvent = async () => {
        try {
            setLoading(true);
            setError("");

            const userString = localStorage.getItem("user");
            const user = userString ? JSON.parse(userString) : null;

            if (!user?.userId) {
                setError("User not logged in");
                navigate("/");
                return;
            }

            const res = await fetch(`http://localhost:8080/events/${eventId}`);
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to fetch event");
            }

            const data = await res.json();
            setEvent(data);

            const organizer = data.organizers?.some((o) => o.userId === user.userId);
            setIsOrganizer(!!organizer);

            if (!organizer) {
                setError("Only organizers can view/manage participants.");
            }
        } catch (e) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const setStatus = async (userId, status) => {
        try {
            const res = await fetch(
                `http://localhost:8080/events/${eventId}/respond?status=${status}&userId=${userId}`,
                { method: "POST" }
            );

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to update status");
            }

            setEvent((prev) => {
                if (!prev) return prev;
                const updated = (prev.eventGuests || []).map((g) => {
                    if (g.user?.userId === userId) return { ...g, status };
                    return g;
                });
                return { ...prev, eventGuests: updated };
            });
        } catch (e) {
            alert(e.message || "Error updating status");
        }
    };

    const removeGuest = async (userId) => {
        if (!window.confirm("Remove this participant?")) return;

        // 1) încercăm DELETE (dacă există la voi)
        try {
            const del = await fetch(
                `http://localhost:8080/events/${eventId}/guests?userId=${userId}`,
                { method: "DELETE" }
            );

            if (del.ok) {
                setEvent((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        eventGuests: (prev.eventGuests || []).filter(
                            (g) => g.user?.userId !== userId
                        ),
                    };
                });
                return;
            }
        } catch (_) {
        }

        await setStatus(userId, "DECLINED");
    };

    if (loading) {
        return (
            <div className="register-page">
                <div className="register-form participants-form">
                    <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="register-page">
                <div className="register-form participants-form">
                    <h1 className="register-title">Participants</h1>
                    <p style={{ color: "red", textAlign: "center" }}>{error}</p>
                    <button className="btn1" onClick={() => navigate(`/event/${eventId}`)}>
                        Back to Event
                    </button>
                </div>
            </div>
        );
    }

    const guests = event?.eventGuests || [];

    return (
        <div className="register-page">
            <div className="register-form participants-form">
                <h1 className="register-title">Participants</h1>

                <div className="participants-actions">
                    {isOrganizer && (
                        <button
                            className="btn"
                            type="button"
                            onClick={() => navigate(`/event/${eventId}/participants/invite`)}
                        >
                            Invite Guests
                        </button>
                    )}

                    <button className="btn1" type="button" onClick={() => navigate(`/event/${eventId}`)}>
                        Back to Event
                    </button>
                </div>

                {guests.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#666" }}>No participants yet.</p>
                ) : (
                    <div className="participants-list">
                        {guests.map((g) => (
                            <div key={g.user?.userId} className="participant-card">
                                <div className="participant-main">
                                    <div className="participant-name">{g.user?.name}</div>
                                    <div className="participant-email">{g.user?.email}</div>
                                    <div className="participant-status">Status: {g.status}</div>

                                    {/* organizer-only actions */}
                                    <div className="participant-actions-row">
                                        <button
                                            type="button"
                                            className="accept-btn"
                                            onClick={() => setStatus(g.user.userId, "ACCEPTED")}
                                        >
                                            ACCEPTED
                                        </button>
                                        <button
                                            type="button"
                                            className="decline-btn"
                                            onClick={() => setStatus(g.user.userId, "DECLINED")}
                                        >
                                            DECLINED
                                        </button>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setStatus(g.user.userId, "PENDING")}
                                        >
                                            PENDING
                                        </button>

                                        <button
                                            type="button"
                                            className="decline-btn"
                                            onClick={() => removeGuest(g.user.userId)}
                                            style={{ marginLeft: "auto" }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ParticipantsList;
