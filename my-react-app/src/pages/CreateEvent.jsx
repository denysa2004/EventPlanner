import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import {useEffect, useState} from "react";
import "../styles/CreateEvent.css"

function CreateEvent() {

  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const loggedInUserString = localStorage.getItem("user");

// Parse it to an object
    const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : null;
  const fetchOrganizers = async () => {
      try{
          const response = await fetch("http://localhost:8080/auth/users",{
              method: "GET",
              headers: {"Content-Type": "application/json"}
          });
          console.log(response);
          console.log(loggedInUser.userId);
          if(response.ok) {
              const data = await response.json();
              console.log("Registered user:", data);
              setOrganizers(data.filter(user => user.userId !== loggedInUser.userId));
              setError("");

          }
          else {
              const errMsg = await response.text();
              setError(errMsg);
          }
      } catch(err){
          console.log(err);
          setError("Something went wrong by fetching the organizers.");
      }
  }
    useEffect(() => {
        fetchOrganizers();
    }, []);
  
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalOrganizers = loggedInUser
            ? [...selectedOrganizers, loggedInUser.userId]
            : selectedOrganizers;

        try {
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
                setSuccess("Event created successfully!");
                setError("");
            } else {
                const text = await response.text();
                setError(text);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Network error");
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
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

          <label className="organizers-label">Organizers:</label>
          <div className="organizers-list">
              {organizers.map((org) => (
                  <label key={org.userId} className="organizer-option">
                      <input
                          type="checkbox"
                          value={org.userId}
                          checked={selectedOrganizers.includes(org.userId)}
                          onChange={() => {
                              if (selectedOrganizers.includes(org.userId)) {
                                  setSelectedOrganizers(selectedOrganizers.filter(id => id !== org.userId));
                              } else {
                                  setSelectedOrganizers([...selectedOrganizers, org.userId]);
                              }
                          }}
                      />
                      {org.name}
                  </label>
              ))}
          </div>


          <button type="submit">Create</button>
        <button className="btn1"  onClick={() => navigate("/home")}
                        style={{ marginTop: "20px"  }}
                        >Back to Home</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
      </form>
    </div>
  );
}

export default CreateEvent;
