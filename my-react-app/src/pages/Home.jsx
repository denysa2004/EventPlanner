import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/Register.css"

function Home() {
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <form className="register-form" >
      <h1 className="title">Welcome to Event Planner!</h1>

      <form className="button-form">
        <button type="button" className="btn" onClick={() => navigate("/create-event")}  >
          Create Event
        </button>

        <button type="button" className="btn"onClick={() => navigate("/see-events")}>
          See Events
        </button>
      </form>
      <button
            type="button"
            className="logout-btn"
            onClick={() => navigate("/")}
          >
            Logout
          </button>
      </form>
   
    </div>
  );
}

export default Home;
