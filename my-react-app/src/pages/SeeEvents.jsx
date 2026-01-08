import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Register.css";
import "../styles/Home.css";
import "../styles/SeeEvents.css";

function SeeEvents() {
  const navigate = useNavigate();

  const [createdEvents, setCreatedEvents] = useState([]);
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user?.userId) {
        navigate("/");
        return;
      }

      const respCreated = await fetch(
        `http://localhost:8080/events/created/user/${user.userId}`
      );
      if (!respCreated.ok) {
        const txt = await respCreated.text();
        throw new Error(txt || "Failed to load created events");
      }
      const created = await respCreated.json();
      setCreatedEvents(Array.isArray(created) ? created : []);

      const respAll = await fetch("http://localhost:8080/events");
      if (!respAll.ok) {
        const txt = await respAll.text();
        throw new Error(txt || "Failed to load events");
      }
      const allEvents = await respAll.json();

      const invited = (Array.isArray(allEvents) ? allEvents : [])
        .map((event) => {
          const guestEntry = event.eventGuests?.find(
            (guest) => guest?.user?.email === user.email
          );
          if (!guestEntry) return null;

          return {
            ...event,
            invitationStatus: guestEntry.status,
          };
        })
        .filter((e) => e !== null);

      setInvitedEvents(invited);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (eventId, status) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user?.userId) {
        navigate("/");
        return;
      }

      const resp = await fetch(
        `http://localhost:8080/events/${eventId}/respond?status=${status}&userId=${user.userId}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      const txt = await resp.text();
      if (!resp.ok) throw new Error(txt || "Failed to respond to invitation");

      alert(txt);
      loadEvents();
    } catch (e) {
      alert(e.message || "Failed to respond to invitation");
    }
  };

  if (loading) {
    return (
      <div className="register-page">
        <div className="register-form">
          <p style={{ textAlign: "center", color: "#666" }}>
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-form see-events-wrapper">
        <h1 className="register-title">My Events</h1>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            {error}
          </p>
        )}

        <div className="two-columns">
          <div className="column">
            <h2>Events I Created</h2>

            {createdEvents.length === 0 && <p>No created events.</p>}

            {createdEvents.map((event) => (
              <div
                key={event.eventId}
                className="event-item clickable"
                onClick={() => navigate(`/event/${event.eventId}`)}
              >
                <h3>{event.eventName}</h3>
                <p>
                  <strong>Date:</strong> {event.eventDate}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {event.location?.address || event.eventLocation}
                </p>
              </div>
            ))}
          </div>

          <div className="column">
            <h2>Invitations I Received</h2>

            {invitedEvents.length === 0 && <p>No invitations received.</p>}

            {invitedEvents.map((event) => (
              <div key={event.eventId} className="event-item">
                <div
                  className="clickable"
                  onClick={() => navigate(`/event/${event.eventId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{event.eventName}</h3>

                  <p>
                    <strong>Date:</strong> {event.eventDate}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {event.location?.address || event.eventLocation}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status ${(
                        event.invitationStatus || "pending"
                      ).toLowerCase()}`}
                    >
                      {event.invitationStatus}
                    </span>
                  </p>
                </div>

                {event.invitationStatus === "PENDING" && (
                  <div className="invite-actions">
                    <button
                      className="accept-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        respondToInvitation(event.eventId, "ACCEPTED");
                      }}
                      style={{ width: 100 }}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        respondToInvitation(event.eventId, "DECLINED");
                      }}
                      style={{ width: 100 }}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          className="bttn"
          type="button"
          onClick={() => navigate("/home")}
          style={{ marginTop: 20 }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default SeeEvents;
