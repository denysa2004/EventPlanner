import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import "../styles/Register.css";
import "../styles/CreateEvent.css";

function InviteGuests() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [eventName, setEventName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [customEmail, setCustomEmail] = useState("");
  const [customEmails, setCustomEmails] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const onFileChange = (event) => {
        const file = event.target.files[0];
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
        if (!allowedTypes.includes(file.type)) {
            alert("Please select an image file");
            return;
        }
        setSelectedFile(file);
    };

  const load = async () => {
    try {
      setError("");

      const userString = localStorage.getItem("user");
      const me = userString ? JSON.parse(userString) : null;
      if (!me?.userId) {
        setError("User not logged in");
        navigate("/");
        return;
      }

      const evRes = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!evRes.ok)
        throw new Error((await evRes.text()) || "Failed to fetch event");
      const ev = await evRes.json();

      const organizer = ev.organizers?.some((o) => o.userId === me.userId);
      if (!organizer) {
        setError("Only organizers can invite guests.");
        return;
      }

      setEventName(ev.eventName);

      const res = await fetch("http://localhost:8080/auth/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok)
        throw new Error((await res.text()) || "Failed to fetch users");

      const data = await res.json();
      const filtered = (Array.isArray(data) ? data : []).filter(
        (u) => u.userId !== me.userId
      );
      setUsers(filtered);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const toggleEmail = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((x) => x !== email) : [...prev, email]
    );
  };

  const addCustomEmail = () => {
    const email = customEmail.trim();
    if (!email) {
      setError("Please enter an email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (customEmails.includes(email)) {
      setError("This email is already added");
      return;
    }

    setCustomEmails([...customEmails, email]);
    setCustomEmail("");
    setError("");
  };

  const removeCustomEmail = (email) => {
    setCustomEmails(customEmails.filter((e) => e !== email));
  };

  const loadDataFromExcel = (file) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (event) => {
              try {
                  const data = new Uint8Array(event.target.result);
                  const workbook = XLSX.read(data, { type: 'array' });

                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                  const emails = jsonData
                      .map(row => row[0])
                      .filter(email => email && typeof email === 'string')
                      .map(email => email.trim())
                      .filter(email => email.length > 0);

                  console.log('Extracted emails:', emails);

                  const validEmails = emails.filter(email => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      return emailRegex.test(email);
                  });


                  if (validEmails.length === 0) {
                      alert('No valid emails found in the file');
                      resolve([]);
                      return;
                  }

                  setCustomEmails(prev => {
                      const combined = [...prev, ...validEmails];
                      return [...new Set(combined)];
                  });

                  setSuccess(`Successfully imported email(s) from file`);
                  resolve(validEmails);  // Return the valid emails

              } catch (error) {
                  console.error('Error reading file:', error);
                  alert('Error reading file. Please make sure it is a valid Excel file.');
                  reject(error);
              }
          };

          reader.onerror = () => {
              alert('Error reading file');
              reject(new Error('File reading error'));
          };

          reader.readAsArrayBuffer(file);
      });
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!eventName) {
      setError("Event name missing");
      return;
    }
      let excelEmails = [];

      if (selectedFile) {
          try {
              excelEmails = await loadDataFromExcel(selectedFile);
          } catch (err) {
              setError("Failed to process Excel file");
              return;
          }
      }

      const allEmails = [...new Set([...selectedEmails, ...customEmails, ...excelEmails])];

      if (allEmails.length === 0) {
      setError("Select at least one guest or add an email");
      return;
    }

    const userString = localStorage.getItem("user");
    const me = userString ? JSON.parse(userString) : null;

    setLoading(true);
    try {
      // Add guests to event using new endpoint
      for (const email of allEmails) {
        const addRes = await fetch(
          `http://localhost:8080/events/${eventId}/guests?email=${encodeURIComponent(
            email
          )}`,
          { method: "POST" }
        );
        if (!addRes.ok) {
          const txt = await addRes.text();
          throw new Error(txt || `Failed to add guest ${email}`);
        }
      }

      // Send email invitations
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: allEmails,
          name: me?.name || "Organizer",
          eventName: eventName,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to send invitations");
      }

      setSuccess("Guests added and invitations sent! Redirecting...");
      setTimeout(() => navigate(`/event/${eventId}/participants`), 1200);
    } catch (e2) {
        setSuccess("");
      setError(e2.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form
        className="register-form"
        onSubmit={handleInvite}
        style={{ width: 650, maxWidth: "92%" }}
      >
        <h1 className="register-title">Invite Guests</h1>

        <p style={{ textAlign: "center", color: "#666", marginTop: -10 }}>
          Event: <b>{eventName || "-"}</b>
        </p>

        {/* Custom Email Input Section */}
        <div style={{ marginBottom: "20px", marginTop: "20px" }}>
          <label className="organizers-label">Invite by Email:</label>
          <div
            style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
          >
            <input
              type="email"
              placeholder="Enter email address..."
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomEmail();
                }
              }}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px",
                border: "2px solid #e0c3fc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <button
              type="button"
              onClick={addCustomEmail}
              disabled={loading}
              style={{
               
                background: "#b44cff",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "20",
                width:100,
                marginTop:10,
                
              }}
            >
              Add
            </button>
          </div>

          {customEmails.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                Added emails ({customEmails.length}):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {customEmails.map((email, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      background: "#f0e6ff",
                      border: "1px solid #b44cff",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomEmail(email)}
                      disabled={loading}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#b44cff",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        padding: "0",
                        lineHeight: "1",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "#e0c3fc",
            margin: "25px 0",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "0 10px",
              color: "#999",
              fontSize: "0.85rem",
            }}
          >
            OR
          </span>
        </div>

          <div>
              <h3>Upload Invite List From Excel</h3>
              <div>
                  <input type="file" onChange={onFileChange} accept=".xlsx, .xls, .csv"/>
              </div>
          </div>


          <div
              style={{
                  height: "1px",
                  background: "#e0c3fc",
                  margin: "25px 0",
                  position: "relative",
              }}
          >
          <span
              style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "white",
                  padding: "0 10px",
                  color: "#999",
                  fontSize: "0.85rem",
              }}
          >
            OR
          </span>
          </div>

        {loadingUsers ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            No registered users available
          </p>
        ) : (
          <>
            <label className="organizers-label">Select registered users:</label>
            <div className="organizers-list">
              {users.map((u) => (
                <label key={u.userId} className="organizer-option">
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(u.email)}
                    onChange={() => toggleEmail(u.email)}
                    disabled={loading}
                  />
                  {u.name} ({u.email})
                </label>
              ))}
            </div>
          </>
        )}

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: 10 }}>{success}</p>}

        <button type="submit" disabled={loading || loadingUsers} style={{width:300}}>
          {loading ? "Sending..." : "Send Invites"}
        </button>

        {/* <button
          type="button"
          className="btn1"
          onClick={() => navigate(`/event/${eventId}/participants`)}
          disabled={loading}
        >
          Cancel
        </button> */}
      </form>
    </div>
  );
}

export default InviteGuests;
