import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Register.css";
import "../styles/Home.css";
import "../styles/SeeEvents.css";

function SeeEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.userId) {
        setError("User not logged in");
        setLoading(false);
        navigate("/");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/events/user/${user.userId}`
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to fetch events");
      }

      const data = await response.json();
      console.log("Fetched events:", data);
      setEvents(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-form">
        <h1 className="register-title">My Events</h1>

        {loading && (
          <p style={{ textAlign: "center", color: "#666" }}>
            Loading events...
          </p>
        )}

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>Error: {error}</p>
        )}

        {!loading && !error && events.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>
            No events found. Create your first event!
          </p>
        )}

        {!loading &&
          !error &&
          events.length > 0 &&
          events.map((event) => {
            const eventIdValue = event.eventId || event.id;
            return (
              <div
                key={eventIdValue}
                className="event-item clickable"
                onClick={() => navigate(`/event/${eventIdValue}`)}
              >
                <h3>{event.eventName}</h3>
                <p>
                  <strong>Date:</strong> {event.eventDate}
                </p>
                <p>
                  <strong>Location:</strong> {event.eventLocation}
                </p>
              </div>
            );
          })}

        <button
          className="btn1"
          onClick={() => navigate("/home")}
          style={{ marginTop: "20px" }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default SeeEvents;
