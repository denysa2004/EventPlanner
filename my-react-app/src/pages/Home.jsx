import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Home.css";
import "../styles/Register.css";

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="register-page">
      <form className="register-form">
        <h1 className="title">
          Welcome to Event Planner{userName ? `, ${userName}` : ""}!
        </h1>

        <form className="button-form">
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/create-event")}
          >
            Create Event
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => navigate("/see-events")}
          >
            See Events
          </button>
        </form>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </form>
    </div>
  );
}

export default Home;
