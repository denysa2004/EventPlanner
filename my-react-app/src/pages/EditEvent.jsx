import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Register.css";
import "../styles/CreateEvent.css";
import ScheduleBuilder from "../components/ScheduleBuilder";

function EditEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [success, setSuccess] = useState("");

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
        navigate("/");
        return;
      }

      const response = await fetch(`http://localhost:8080/events/${eventId}`);

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to fetch event details");
      }

      const data = await response.json();

      // Check if user is an organizer
      const isOrganizer = data.organizers?.some(
        (org) => org.userId === user.userId
      );

      if (!isOrganizer) {
        setError("You are not authorized to edit this event");
        setLoadingEvent(false);
        return;
      }

      // Populate form with existing data
      setEventName(data.eventName || "");
      setDate(data.eventDate || "");
      setLocation(data.eventLocation || "");
      setDescription(data.description || "");
      setSchedule(data.schedule || "");
      setLoadingEvent(false);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err.message || "Something went wrong");
      setLoadingEvent(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventName || !date || !location) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventDate: date,
          eventLocation: location,
          description: description,
          schedule: schedule,
        }),
      });

      if (response.ok) {
        setSuccess("Event updated successfully! Redirecting...");
        setError("");

        setTimeout(() => {
          navigate(`/event/${eventId}`);
        }, 1500);
      } else {
        const errMsg = await response.text();
        setError(errMsg || "Failed to update event");
        setSuccess("");
      }
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Something went wrong. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvent) {
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

  if (error && !eventName) {
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

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1 className="register-title">Edit Event</h1>

        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          disabled={loading}
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          min={new Date().toISOString().split("T")[0]}
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
          required
        />

        <textarea
          placeholder="Event Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows="4"
          className="event-textarea"
        />

        <ScheduleBuilder
          initialSchedule={schedule}
          onChange={setSchedule}
          disabled={loading}
        />

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Event"}
        </button>

        <button
          type="button"
          className="btn1"
          onClick={() => navigate(`/event/${eventId}`)}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditEvent;
