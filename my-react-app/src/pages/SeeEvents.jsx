import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Register.css";
import "../styles/Home.css";
import "../styles/SeeEvents.css";

function SeeEvents() {
  const navigate = useNavigate();

  const [createdEvents, setCreatedEvents] = useState([]);
  const [invitedEvents, setInvitedEvents] = useState([]);

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [eventForInvite, setEventForInvite] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

   const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

  const loadEvents = async () => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user) {
      navigate("/");
      return;
    }

 
    const respCreated = await fetch(
      `http://localhost:8080/events/user/${user.userId}`
    );
    const created = await respCreated.json();
    setCreatedEvents(created);

    const respAll = await fetch("http://localhost:8080/events");
    const all = await respAll.json();

    const invited = all
      .map((event) => {
        const guestEntry = event.eventGuests?.find(
          (guest) => guest.user.email === user.email
        );
        if (!guestEntry) return null;

        return {
          ...event,
          invitationStatus: guestEntry.status,
        };
      })
      .filter((e) => e !== null);

    setInvitedEvents(invited);
  };


  const openInviteModal = async (event) => {
    setEventForInvite(event);

    const respUsers = await fetch("http://localhost:8080/auth/users");
    const userList = await respUsers.json();

    const filtered = userList.filter(
  (u) =>
    !event.organizers.some((org) => org.userId === u.userId) &&
    isValidEmail(u.email) 
);


    setUsers(filtered);
    setSelectedUsers([]);
    setShowInviteModal(true);
  };


  const toggleUser = (email) => {
    if (selectedUsers.includes(email)) {
      setSelectedUsers(selectedUsers.filter((e) => e !== email));
    } else {
      setSelectedUsers([...selectedUsers, email]);
    }
  };


  const sendInvitations = async () => {
    if (selectedUsers.length === 0) {
      alert("Select at least one user!");
      return;
    }

    const userString = localStorage.getItem("user");
    const loggedUser = JSON.parse(userString);

    const resp = await fetch("http://localhost:8080/api/mail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: selectedUsers,
        name: loggedUser.name,
        eventName: eventForInvite.eventName,
      }),
    });

    alert(await resp.text());
    setShowInviteModal(false);
    loadEvents(); // refresh invitations
  };


  const respondToInvitation = async (eventId, status) => {
    const userString = localStorage.getItem("user");
    const user = JSON.parse(userString);

    const resp = await fetch(
      `http://localhost:8080/events/${eventId}/respond?status=${status}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          email: user.email, 
        },
      }
    );

    alert(await resp.text());
    loadEvents();
  };


  return (
    <div className="register-page">
      <div className="register-form see-events-wrapper">
        <h1 className="register-title">My Events</h1>

        <div className="two-columns">
        
          <div className="column">
            <h2>Events I Created</h2>

            {createdEvents.length === 0 && <p>No created events.</p>}

            {createdEvents.map((event) => (
              <div
                key={event.eventId}
                className="event-item clickable"
                onClick={() => navigate(`/event/${event.eventId}`)}
              >
                <h3>{event.eventName}</h3>
                <p>
                  <strong>Date:</strong> {event.eventDate}
                </p>
                <p>
                  <strong>Location:</strong> {event.eventLocation}
                </p>

                <button
                  className="invite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInviteModal(event);
                  }}
                >
                  Send Invitation
                </button>
              </div>
            ))}
          </div>

    
          <div className="column">
            <h2>Invitations I Received</h2>

            {invitedEvents.length === 0 && <p>No invitations received.</p>}

            {invitedEvents.map((event) => (
              <div key={event.eventId} className="event-item">
                <h3>{event.eventName}</h3>
                <p>
                  <strong>Date:</strong> {event.eventDate}
                </p>
                <p>
                  <strong>Location:</strong> {event.eventLocation}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status ${
                      event.invitationStatus.toLowerCase()
                    }`}
                  >
                    {event.invitationStatus}
                  </span>
                </p>

                {event.invitationStatus === "PENDING" && (
                  <div>
                    <button
                      className="accept-btn"
                      onClick={() =>
                        respondToInvitation(event.eventId, "ACCEPTED")
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="decline-btn"
                      onClick={() =>
                        respondToInvitation(event.eventId, "DECLINED")
                      }
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="btn1" onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </div>

      {showInviteModal && (
        <div className="invite-modal">
          <h3>Select Users to Invite</h3>

          {users.length === 0 && <p>No available users.</p>}

          <div className="user-list">
            {users.map((u) => (
              <label key={u.userId} className="user-option">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.email)}
                  onChange={() => toggleUser(u.email)}
                />
                {u.name} – {u.email}
              </label>
            ))}
          </div>

          <button className="invite-btn" onClick={sendInvitations}>
            Send Invitations
          </button>
          <button
            className="cancel-btn"
            onClick={() => setShowInviteModal(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default SeeEvents;
