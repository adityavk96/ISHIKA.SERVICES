import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; // adjust ../ as needed

// Helper function to convert string to Proper Case (capitalize first letter of each word)
function toProperCase(str) {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// ----------------------------------------------------
// Component Styles (unchanged from your original code)
// ----------------------------------------------------
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

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------
function NotesPageTabs() {
  const tabs = ["GST", "ITR", "Others"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

  const [input, setInput] = useState({
    sec: "",
    notificationNo: "",
    description: "",
  });

  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch notes for activeTab from Firestore
  const fetchNotes = async (tab) => {
    setLoading(true); // Set loading to true before fetch
    setError(null); // Reset any previous error
    try {
      const notesCol = collection(db, "notes");
      const q = query(notesCol, where("tab", "==", tab));
      const snapshot = await getDocs(q);
      const notesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
    } catch (e) {
      console.error("Error fetching documents: ", e);
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after fetch, regardless of success or failure
    }
  };

  useEffect(() => {
    // Correct way to use async in useEffect
    fetchNotes(activeTab);
    setInput({ sec: "", notificationNo: "", description: "" });
    setEditId(null);
    setShowAddForm(false);
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setInput({ sec: "", notificationNo: "", description: "" });
    setEditId(null);
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (!input.description.trim()) return;

    const noteToSave = {
      ...input,
      description: toProperCase(input.description.trim()),
      tab: activeTab,
    };

    try {
      const docRef = await addDoc(collection(db, "notes"), noteToSave);
      // Optimistic UI update: add the new note to the local state
      setNotes((prevNotes) => [...prevNotes, { id: docRef.id, ...noteToSave }]);
      resetForm();
    } catch (e) {
      console.error("Error adding document: ", e);
      setError("Failed to add note.");
    }
  };

  const handleEdit = (note) => {
    setInput({
      sec: note.sec,
      notificationNo: note.notificationNo,
      description: note.description,
    });
    setEditId(note.id);
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    if (!input.description.trim() || !editId) return;

    const noteToSave = {
      ...input,
      description: toProperCase(input.description.trim()),
      tab: activeTab,
    };

    try {
      const noteDocRef = doc(db, "notes", editId);
      await updateDoc(noteDocRef, noteToSave);
      // Optimistic UI update: update the note in the local state
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editId ? { id: editId, ...noteToSave } : note
        )
      );
      resetForm();
    } catch (e) {
      console.error("Error updating document: ", e);
      setError("Failed to update note.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      // Optimistic UI update: remove the note from the local state
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Failed to delete note.");
    }
  };

  const toggleAddForm = () => {
    if (editId !== null) {
      resetForm();
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

      {/* Input Form -- shown conditionally */}
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

          {editId === null ? (
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

      {/* Loading and Error Messages */}
      {loading && <p style={{ textAlign: "center", marginTop: 20 }}>Loading notes...</p>}
      {error && <p style={{ textAlign: "center", color: "red", marginTop: 20 }}>{error}</p>}
      
      {/* Notes Table */}
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "5%" }}>S. No.</th>
              <th style={{ ...thStyle, width: "10%", textAlign: "center" }}>Sec</th>
              <th style={{ ...thStyle, width: "10%", textAlign: "center" }}>Notification No</th>
              <th style={{ ...thStyle, width: "60%" }}>Description</th>
              <th style={{ ...thStyle, width: "10%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 15 }}>
                  No notes found.
                </td>
              </tr>
            ) : (
              notes.map((note, index) => (
                <tr key={note.id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ ...tdStyle, width: "5%" }}>{index + 1}</td>
                  <td style={{ ...tdStyle, width: "10%", textAlign: "center", whiteSpace: "normal", wordWrap: "break-word" }}>
                    {note.sec}
                  </td>
                  <td style={{ ...tdStyle, width: "10%", textAlign: "center", whiteSpace: "normal", wordWrap: "break-word" }}>
                    {note.notificationNo}
                  </td>
                  <td style={{ ...tdStyle, width: "60%", whiteSpace: "normal", wordWrap: "break-word" }}>
                    {note.description}
                  </td>
                  <td style={{ ...tdStyle, width: "10%" }}>
                    <button onClick={() => handleEdit(note)} style={editBtnStyle} type="button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(note.id)} style={deleteBtnStyle} type="button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default NotesPageTabs;