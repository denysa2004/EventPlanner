import { useState, useEffect } from "react";
import "../styles/ScheduleBuilder.css";

function ScheduleBuilder({ initialSchedule = "", onChange, disabled = false }) {
  const [scheduleItems, setScheduleItems] = useState([]);

  // Initialization logic
  useEffect(() => {
    if (initialSchedule && initialSchedule.trim()) {
      const items = initialSchedule.split("\n").filter((line) => line.trim());
      const parsed = items.map((item, index) => {
        const match = item.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(.+)$/i);
        if (match) {
          return {
            id: index,
            time: match[1].trim(),
            activity: match[2].trim(),
          };
        }
        return { id: index, time: "", activity: item.trim() };
      });
      setScheduleItems(
        parsed.length > 0 ? parsed : [{ id: 0, time: "", activity: "" }]
      );
    } else {
      setScheduleItems([{ id: 0, time: "", activity: "" }]);
    }
  }, [initialSchedule]);

  // Sync with parent
  useEffect(() => {
    const scheduleString = scheduleItems
      .filter((item) => item.time || item.activity)
      .map((item) => {
        if (item.time && item.activity)
          return `${item.time} - ${item.activity}`;
        if (item.activity) return item.activity;
        return "";
      })
      .filter((line) => line)
      .join("\n");

    onChange(scheduleString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleItems]);

  const addScheduleItem = () => {
    const newId =
      scheduleItems.length > 0
        ? Math.max(...scheduleItems.map((i) => i.id)) + 1
        : 0;
    setScheduleItems([...scheduleItems, { id: newId, time: "", activity: "" }]);
  };

  const removeScheduleItem = (id) => {
    if (scheduleItems.length === 1) {
      setScheduleItems([{ id: 0, time: "", activity: "" }]);
    } else {
      setScheduleItems(scheduleItems.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setScheduleItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="schedule-builder">
      <label className="section-label">Schedule / Agenda (optional):</label>

      <div className="schedule-grid">
        {/* Header Row - Keeps the layout clean */}
        <div className="grid-header">Time</div>
        <div className="grid-header">Activity Description</div>
        <div className="grid-header"></div>{" "}
        {/* Empty for delete button space */}
        {/* Dynamic Rows */}
        {scheduleItems.map((item) => (
          <>
            <input
              type="text"
              placeholder="10:00 AM"
              value={item.time}
              onChange={(e) => updateItem(item.id, "time", e.target.value)}
              disabled={disabled}
              className="schedule-input"
            />

            <input
              type="text"
              placeholder="Welcome & Intro..."
              value={item.activity}
              onChange={(e) => updateItem(item.id, "activity", e.target.value)}
              disabled={disabled}
              className="schedule-input"
            />

            <button
              type="button"
              onClick={() => removeScheduleItem(item.id)}
              disabled={disabled}
              className="delete-btn"
              title="Remove item"
            >
              ✕
            </button>
          </>
        ))}
      </div>

      <div className="add-btn-wrapper">
        <button
          type="button"
          onClick={addScheduleItem}
          disabled={disabled}
          className="add-btn"
        >
          <span>+</span> Add Row
        </button>
      </div>
    </div>
  );
}

export default ScheduleBuilder;
