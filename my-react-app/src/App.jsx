import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import SeeEvents from "./pages/SeeEvents";
import EventDetail from "./pages/EventDetail";
import EditEvent from "./pages/EditEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import ParticipantsList from "./pages/ParticipantsList";
import InviteGuests from "./pages/InviteGuests";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-event"
                    element={
                        <ProtectedRoute>
                            <CreateEvent />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/see-events"
                    element={
                        <ProtectedRoute>
                            <SeeEvents />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/event/:eventId"
                    element={
                        <ProtectedRoute>
                            <EventDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/event/:eventId/edit"
                    element={
                        <ProtectedRoute>
                            <EditEvent />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/event/:eventId/participants"
                    element={
                        <ProtectedRoute>
                            <ParticipantsList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/event/:eventId/participants/invite"
                    element={
                        <ProtectedRoute>
                            <InviteGuests />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

