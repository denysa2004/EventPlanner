import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { useState } from "react";
import "../styles/CreateEvent.css"

function CreateEvent() {

  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

 
  const organizers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Alex Pop" },
    { id: 3, name: "Maria Ionescu" }
  ];

  
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Event Name:", eventName);
    console.log("Date:", date);
    console.log("Location:", location);
    console.log("Selected Organizers:", selectedOrganizers);
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

        <select
          multiple
          className="multi-select"
          value={selectedOrganizers}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setSelectedOrganizers(selected);
          }}
          required
        >
          {organizers.map(org => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>

        <button type="submit" onSubmit={handleSubmit}>Create</button>
        <button className="btn1"  onClick={() => navigate("/home")}
                        style={{ marginTop: "20px"  }}
                        >Back to Home</button>
      </form>
    </div>
  );
}

export default CreateEvent;
