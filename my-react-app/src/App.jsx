import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent"
import SeeEvents from "./pages/SeeEvents"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-event" element={<CreateEvent /> }/>
        <Route path="/see-events" element={<SeeEvents />}/>
      </Routes>
    </Router>
  );
}

export default App;
