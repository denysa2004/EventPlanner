import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import "../styles/Home.css";
import "../styles/SeeEvents.css";
import { useState } from "react";

function SeeEvents(){
    return (
        <div className="register-page">
            <div className="register-form">
                <h1 className="register-title">Available Events</h1>

                <div className="event-item">
                    <h3>John & Maria Wedding</h3>
                    <p><strong>Date:</strong> 2025-06-20</p>
                    <p><strong>Location:</strong> Vienna, Austria</p>
                </div>

                <button className="btn" type="button" onClick={() => navigate("/")}
                        style={{ marginTop: "20px" }}
                        >Back to Home</button>
            </div>
        </div>
    );
}

export default SeeEvents();