import { useState, useEffect } from "react";
import "../styles/ScheduleBuilder.css";

function ScheduleBuilder({ initialSchedule = "", onChange, disabled = false }) {
  const [scheduleText, setScheduleText] = useState("");

  // Initialize from prop
  useEffect(() => {
    setScheduleText(initialSchedule || "");
  }, [initialSchedule]);

  const handleChange = (e) => {
    const value = e.target.value;
    setScheduleText(value);
    onChange(value);
  };

  return (
    <div className="schedule-builder">
      <label className="schedule-label">Schedule / Agenda (optional):</label>
      <div className="schedule-example">
        Example: 10:00 AM - Welcome & Registration
      </div>
      <textarea
        value={scheduleText}
        onChange={handleChange}
        disabled={disabled}
        className="schedule-textarea"
        placeholder="10:00 AM - Welcome & Registration&#10;11:00 AM - Opening Speech&#10;12:00 PM - Lunch Break&#10;1:00 PM - Main Session"
        rows={6}
      />
    </div>
  );
}

export default ScheduleBuilder;
