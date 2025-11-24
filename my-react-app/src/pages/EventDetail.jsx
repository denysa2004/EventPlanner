import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Register.css";
import "../styles/EventDetail.css";

function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.userId) {
        setError("User not logged in");
        setLoading(false);
        navigate("/");
        return;
      }

      const response = await fetch(`http://localhost:8080/events/${eventId}`);

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to fetch event details");
      }

      const data = await response.json();
      console.log("Event details received:", data); // Debug
      setEvent(data);

      // Check if current user is an organizer
      const userIsOrganizer = data.organizers?.some(
        (org) => org.userId === user.userId
      );
      setIsOrganizer(userIsOrganizer);

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event deleted successfully!");
        navigate("/see-events");
      } else {
        const errMsg = await response.text();
        alert(errMsg || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Something went wrong while deleting the event");
    }
  };

  if (loading) {
    return (
      <div className="register-page">
        <div className="register-form">
          <p style={{ textAlign: "center", color: "#666" }}>
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="register-page">
        <div className="register-form">
          <h1 className="register-title">Error</h1>
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          <button className="btn1" onClick={() => navigate("/see-events")}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="register-page">
      <div className="event-detail-container">
        <h1 className="register-title">{event.eventName}</h1>

        <div className="detail-section">
          <div className="detail-item">
            <span className="detail-label">📅 Date:</span>
            <span className="detail-value">{event.eventDate}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📍 Location:</span>
            <span className="detail-value">{event.eventLocation}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Organizers</h3>
          {event.organizers && event.organizers.length > 0 ? (
            <div className="organizers-grid">
              {event.organizers.map((organizer) => (
                <div key={organizer.userId} className="organizer-card">
                  <span className="organizer-name">{organizer.name}</span>
                  <span className="organizer-email">{organizer.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No organizers listed</p>
          )}
        </div>

        <div className="button-group">
          {isOrganizer && (
            <>
              <button
                className="btn-edit"
                onClick={() => navigate(`/event/${eventId}/edit`)}
              >
                Edit Event
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete Event
              </button>
            </>
          )}
          <button className="btn1" onClick={() => navigate("/see-events")}>
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
