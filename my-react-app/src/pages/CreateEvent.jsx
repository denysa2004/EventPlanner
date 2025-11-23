import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { useEffect, useState } from "react";
import "../styles/CreateEvent.css";

function CreateEvent() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrganizers, setLoadingOrganizers] = useState(true);
  const [success, setSuccess] = useState("");

  const fetchOrganizers = async () => {
    try {
      const userString = localStorage.getItem("user");
      const loggedInUser = userString ? JSON.parse(userString) : null;

      if (!loggedInUser) {
        setError("User not logged in");
        navigate("/");
        return;
      }

      const response = await fetch("http://localhost:8080/auth/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const filteredOrganizers = data.filter(
          (user) => user.userId !== loggedInUser.userId
        );
        setOrganizers(filteredOrganizers);
        setError("");
      } else {
        const errMsg = await response.text();
        setError(errMsg || "Failed to fetch organizers");
      }
    } catch (err) {
      console.error("Error fetching organizers:", err);
      setError("Something went wrong while fetching organizers.");
    } finally {
      setLoadingOrganizers(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventName || !date || !location) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userString = localStorage.getItem("user");
      const loggedInUser = userString ? JSON.parse(userString) : null;

      if (!loggedInUser) {
        setError("User not logged in");
        navigate("/");
        return;
      }

      // Include logged-in user as organizer along with selected ones
      const finalOrganizers = [...selectedOrganizers, loggedInUser.userId];

      const response = await fetch("http://localhost:8080/events/createEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventDate: date,
          eventLocation: location,
          organizersId: finalOrganizers,
        }),
      });

      if (response.ok) {
        const data = await response.text();
        console.log("Event created:", data);
        setSuccess("Event created successfully! Redirecting...");
        setError("");

        // Clear form
        setEventName("");
        setDate("");
        setLocation("");
        setSelectedOrganizers([]);

        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } else {
        const errMsg = await response.text();
        setError(errMsg || "Failed to create event");
        setSuccess("");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Something went wrong. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizerToggle = (userId) => {
    if (selectedOrganizers.includes(userId)) {
      setSelectedOrganizers(selectedOrganizers.filter((id) => id !== userId));
    } else {
      setSelectedOrganizers([...selectedOrganizers, userId]);
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1 className="register-title">Create Event</h1>

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

        <label className="organizers-label">
          Additional Organizers (optional):
        </label>

        {loadingOrganizers ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            Loading organizers...
          </p>
        ) : organizers.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            No other users available
          </p>
        ) : (
          <div className="organizers-list">
            {organizers.map((org) => (
              <label key={org.userId} className="organizer-option">
                <input
                  type="checkbox"
                  value={org.userId}
                  checked={selectedOrganizers.includes(org.userId)}
                  onChange={() => handleOrganizerToggle(org.userId)}
                  disabled={loading}
                />
                {org.name}
              </label>
            ))}
          </div>
        )}

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
        )}

        <button type="submit" disabled={loading || loadingOrganizers}>
          {loading ? "Creating..." : "Create Event"}
        </button>

        <button
          type="button"
          className="btn1"
          onClick={() => navigate("/home")}
          disabled={loading}
        >
          Back to Home
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;
