import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Register.css";
import "../styles/Participants.css";
import "../styles/EventDetail.css"

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

      const organizer = data.organizers?.some((o) => o.userId === user.userId);
      setIsOrganizer(!!organizer);

      if (!organizer) {
        setError("Only organizers can view/manage participants.");
        setLoading(false);
        return;
      }

      // Fetch guests using new endpoint
      const guestsRes = await fetch(
        `http://localhost:8080/events/${eventId}/guests`
      );
      if (!guestsRes.ok) {
        throw new Error("Failed to fetch guests");
      }

      const guests = await guestsRes.json();
      setEvent({ ...data, eventGuests: guests });
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
        `http://localhost:8080/events/${eventId}/guests/${userId}?status=${status}`,
        { method: "PUT" }
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

    try {
      const del = await fetch(
        `http://localhost:8080/events/${eventId}/guests/${userId}`,
        { method: "DELETE" }
      );

      if (!del.ok) {
        const txt = await del.text();
        throw new Error(txt || "Failed to remove guest");
      }

      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          eventGuests: (prev.eventGuests || []).filter(
            (g) => g.user?.userId !== userId
          ),
        };
      });
    } catch (e) {
      alert(e.message || "Error removing guest");
    }
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
          <button
            className="bttn"
            onClick={() => navigate(`/event/${eventId}`)}
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  const guests = event?.eventGuests || [];
  const acceptedCount = guests.filter((g) => g.status === "ACCEPTED").length;
  const pendingCount = guests.filter((g) => g.status === "PENDING").length;
  const declinedCount = guests.filter((g) => g.status === "DECLINED").length;

  return (
    <div className="register-page">
      <div className="register-form participants-form">
        <h1 className="register-title">
          {event?.eventName || "Event"} - Participants
        </h1>

        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-number">{acceptedCount}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{declinedCount}</div>
            <div className="stat-label">Declined</div>
          </div>
        </div>

        <div className="participants-actions">
          {isOrganizer && (
            <button
              className="btn"
              type="button"
              onClick={() => navigate(`/event/${eventId}/participants/invite`)}
              style={{width:200}}
            >
              + Invite Guests
            </button>
          )}

          <button
            className="bttn"
            type="button"
            onClick={() => navigate(`/event/${eventId}`)}
            style={{width:200}}
          >
            Back to Event
          </button>
        </div>

        {guests.length === 0 ? (
          <div className="empty-state">
            <p>No participants yet.</p>
            <p style={{ fontSize: "0.9rem", color: "#999", marginTop: "8px" }}>
              Click "Invite Guests" to start inviting people to your event.
            </p>
          </div>
        ) : (
          <div className="participants-list">
            {guests.map((g) => (
              <div key={g.user?.userId} className="participant-card">
                <div className="participant-header">
                  <div className="participant-info">
                    <div className="participant-name">{g.user?.name}</div>
                    <div className="participant-email">{g.user?.email}</div>
                  </div>
                  <span
                    className={`status-badge status-${g.status?.toLowerCase()}`}
                  >
                    {g.status}
                  </span>
                </div>

                {isOrganizer && (
                  <div className="participant-actions">
                    {/* <button
                      type="button"
                      className="action-btn accept"
                      onClick={() => setStatus(g.user.userId, "ACCEPTED")}
                      disabled={g.status === "ACCEPTED"}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="action-btn pending"
                      onClick={() => setStatus(g.user.userId, "PENDING")}
                      disabled={g.status === "PENDING"}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      className="action-btn decline"
                      onClick={() => setStatus(g.user.userId, "DECLINED")}
                      disabled={g.status === "DECLINED"}
                    >
                      Decline
                    </button> */}
                    <button
                      type="button"
                      className="action-btn remove"
                      onClick={() => removeGuest(g.user.userId)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantsList;
