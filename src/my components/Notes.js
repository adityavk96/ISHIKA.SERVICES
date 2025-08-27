import React, { useState, useEffect } from "react";

function getInitialNotes(tab) {
  const saved = localStorage.getItem(`notes_${tab}`);
  return saved ? JSON.parse(saved) : [];
}

// Helper function to convert string to Proper Case (capitalize first letter of each word)
function toProperCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function NotesPageTabs() {
  const tabs = ["GST", "ITR", "Others"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [notes, setNotes] = useState(getInitialNotes(activeTab));

  const [input, setInput] = useState({
    sec: "",
    notificationNo: "",
    description: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setNotes(getInitialNotes(activeTab));
    setInput({
      sec: "",
      notificationNo: "",
      description: "",
    });
    setEditIndex(null);
    setShowAddForm(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(`notes_${activeTab}`, JSON.stringify(notes));
  }, [notes, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!input.description.trim()) return; // Description required

    const noteToSave = {
      ...input,
      description: toProperCase(input.description.trim()),
    };

    setNotes([...notes, noteToSave]);
    setInput({
      sec: "",
      notificationNo: "",
      description: "",
    });
    setShowAddForm(false);
  };

  const handleEdit = (index) => {
    setInput(notes[index]);
    setEditIndex(index);
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!input.description.trim()) return; // Description required

    const noteToSave = {
      ...input,
      description: toProperCase(input.description.trim()),
    };

    const updated = notes.map((note, idx) =>
      idx === editIndex ? noteToSave : note
    );
    setNotes(updated);
    setInput({
      sec: "",
      notificationNo: "",
      description: "",
    });
    setEditIndex(null);
    setShowAddForm(false);
  };

  const handleDelete = (index) => {
    setNotes(notes.filter((_, idx) => idx !== index));
  };

  const toggleAddForm = () => {
    if (editIndex !== null) {
      setEditIndex(null);
      setInput({ sec: "", notificationNo: "", description: "" });
    }
    setShowAddForm((prev) => !prev);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "3px solid blue" : "none",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Add Note Button (Right aligned) */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
        <button onClick={toggleAddForm} style={addBtnStyle}>
          {showAddForm ? "Cancel" : "Add Note"}
        </button>
      </div>

      {/* Input Form - visible if toggled */}
      {showAddForm && (
        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <input
            name="sec"
            placeholder="Sec"
            value={input.sec}
            onChange={handleChange}
            style={{
              marginRight: 10,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "15%",
              whiteSpace: "normal",
              wordWrap: "break-word",
              textAlign: "center",
            }}
          />
          <input
            name="notificationNo"
            placeholder="Notification No"
            value={input.notificationNo}
            onChange={handleChange}
            style={{
              marginRight: 10,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "15%",
              whiteSpace: "normal",
              wordWrap: "break-word",
              textAlign: "center",
            }}
          />
          <input
            name="description"
            placeholder="Description *"
            value={input.description}
            onChange={handleChange}
            style={{
              marginRight: 10,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "50%",
              whiteSpace: "normal",
              wordWrap: "break-word",
            }}
          />

          {editIndex === null ? (
            <button onClick={handleAdd} style={addBtnStyle}>
              Add Note
            </button>
          ) : (
            <button onClick={handleUpdate} style={updateBtnStyle}>
              Update Note
            </button>
          )}
        </div>
      )}

      {/* Notes Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "5%" }}>S. No.</th>
            <th
              style={{
                ...thStyle,
                width: "10%",
                textAlign: "center",
              }}
            >
              Sec
            </th>
            <th
              style={{
                ...thStyle,
                width: "10%",
                textAlign: "center",
              }}
            >
              Notification No
            </th>
            <th style={{ ...thStyle, width: "60%" }}>Description</th>
            <th style={{ ...thStyle, width: "10%" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {notes.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 15 }}>
                No notes found.
              </td>
            </tr>
          )}
          {notes.map((note, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ ...tdStyle, width: "5%" }}>{index + 1}</td>
              <td
                style={{
                  ...tdStyle,
                  width: "10%",
                  textAlign: "center",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {note.sec}
              </td>
              <td
                style={{
                  ...tdStyle,
                  width: "10%",
                  textAlign: "center",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {note.notificationNo}
              </td>
              <td
                style={{
                  ...tdStyle,
                  width: "60%",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {note.description}
              </td>
              <td style={{ ...tdStyle, width: "10%" }}>
                <button
                  onClick={() => handleEdit(index)}
                  style={editBtnStyle}
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  style={deleteBtnStyle}
                  type="button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  backgroundColor: "#f5f5f5",
  padding: "8px",
  border: "1px solid #ddd",
  whiteSpace: "normal",
  wordWrap: "break-word",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  whiteSpace: "normal",
  wordWrap: "break-word",
};

const addBtnStyle = {
  padding: "7px 15px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: "bold",
};

const updateBtnStyle = {
  padding: "7px 15px",
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: "bold",
};

const editBtnStyle = {
  padding: "5px 10px",
  marginRight: 8,
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: 3,
  cursor: "pointer",
};

const deleteBtnStyle = {
  padding: "5px 10px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: 3,
  cursor: "pointer",
};

export default NotesPageTabs;
