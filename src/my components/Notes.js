import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const containerStyle = { padding: 20, fontFamily: "Arial, sans-serif" };
const tabsContainerStyle = {
  display: "flex",
  borderBottom: "2px solid #1976d2",
  marginBottom: 8,
  userSelect: "none",
  alignItems: "center",
  gap: 10,
};
const innerTabsContainerStyle = {
  display: "flex",
  borderBottom: "1px solid #4CAF50",
  marginBottom: 15,
  alignItems: "center",
  gap: 10,
};
const sectionTitleStyle = {
  fontWeight: "bold",
  color: "#1976d2",
  marginBottom: 10,
  fontSize: "14px",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  border: "1px solid #1976d2",
};
const theadStyle = {
  backgroundColor: "#1976d2",
  color: "#ffffff",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  fontSize: "13px",
};
const thStyle = {
  padding: "10px",
  border: "1px solid #1976d2",
  fontWeight: "bold",
  textAlign: "center",
};
const tdStyle = {
  padding: "10px",
  border: "1px solid #1976d2",
  fontSize: "16px",
  textAlign: "left",
  verticalAlign: "top",
};
const addNoteBtnStyle = {
  padding: "7px 15px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: "bold",
  float: "right",
  margin: "10px 0 10px 0",
  userSelect: "none",
};
const actionIconStyle = {
  cursor: "pointer",
  marginRight: 10,
  fontSize: "18px",
  userSelect: "none",
};
const editIconClickableStyle = {
  cursor: "pointer",
  fontSize: 18,
  color: "#4caf50",
  userSelect: "none",
  marginLeft: 6,
  borderRadius: 3,
  backgroundColor: "transparent",
  padding: "2px 5px",
  border: "1px solid transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 22,
  transition: "background-color 0.2s",
};
const selectStyle = {
  fontSize: 14,
  padding: 4,
  borderRadius: 4,
  marginLeft: 6,
};

export default function NotesPageTabs() {
  // State declarations
  const [tabs, setTabs] = useState([
    { label: "GST", innerTabs: ["GSTR1", "GSTR3B"] },
    { label: "ITR", innerTabs: ["ITR1", "ITR3"] },
    { label: "Balance Sheet", innerTabs: ["Companies", "Schedule"] },
    { label: "Other", innerTabs: [] },
  ]);
  const [activeTab, setActiveTab] = useState(tabs[0].label);
  const [activeInnerTab, setActiveInnerTab] = useState(tabs[0].innerTabs[0] || null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState({ description: "" });
  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMainTab, setEditMainTab] = useState(null);
  const [editInnerTab, setEditInnerTab] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    setError(null);

    const notesCol = collection(db, "notes");
    let q;
    if (activeInnerTab) {
      q = query(notesCol, where("tab", "==", activeTab), where("innerTab", "==", activeInnerTab));
    } else {
      q = query(notesCol, where("tab", "==", activeTab));
    }
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesList);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError("Failed to load notes.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [activeTab, activeInnerTab]);

  // Toggle expanded/collapsed state for a note
  const toggleExpand = (id) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleChange = (e) => {
    setInput({ description: e.target.value });
  };
  const resetForm = () => {
    setInput({ description: "" });
    setEditId(null);
    setShowAddForm(false);
  };
  const handleAdd = async () => {
    if (!input.description.trim()) return;
    const noteToSave = {
      description: input.description.trim(),
      tab: activeTab,
      innerTab: activeInnerTab || null,
    };
    try {
      await addDoc(collection(db, "notes"), noteToSave);
      resetForm();
    } catch (e) {
      console.error("Add note error:", e);
      setError("Failed to add note.");
    }
  };
  const handleEdit = (note) => {
    setInput({ description: note.description });
    setEditId(note.id);
    setShowAddForm(true);
  };
  const handleUpdate = async () => {
    if (!input.description.trim() || !editId) return;
    const noteToSave = {
      description: input.description.trim(),
      tab: activeTab,
      innerTab: activeInnerTab || null,
    };
    try {
      const docRef = doc(db, "notes", editId);
      await updateDoc(docRef, noteToSave);
      resetForm();
    } catch (e) {
      console.error("Update note error:", e);
      setError("Failed to update note.");
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (e) {
      console.error("Delete note error:", e);
      setError("Failed to delete note.");
    }
  };
  const toggleAddForm = () => {
    if (editId !== null) resetForm();
    setShowAddForm((prev) => !prev);
  };
  const addNewTab = () => {
    const name = prompt("Enter new tab name:");
    if (name && name.trim()) {
      const trimmedName = name.trim();
      if (tabs.some((t) => t.label.toLowerCase() === trimmedName.toLowerCase())) {
        alert("Tab already exists");
        return;
      }
      setTabs((prev) => [...prev, { label: trimmedName, innerTabs: [] }]);
      setActiveTab(trimmedName);
      setActiveInnerTab(null);
      setEditMainTab(null);
    }
  };
  const addNewInnerTab = (tabLabel) => {
    const name = prompt("Enter new inner tab name:");
    if (name && name.trim()) {
      const trimmedName = name.trim();
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.label === tabLabel) {
            if (tab.innerTabs.some((i) => i.toLowerCase() === trimmedName.toLowerCase())) {
              alert("Inner tab already exists");
              return tab;
            }
            return { ...tab, innerTabs: [...tab.innerTabs, trimmedName] };
          }
          return tab;
        })
      );
      setActiveInnerTab(trimmedName);
      setEditInnerTab(null);
    }
  };
  const renameTab = (oldLabel, newName) => {
    if (
      newName &&
      newName.trim() &&
      newName.trim() !== oldLabel &&
      !tabs.some((t) => t.label.toLowerCase() === newName.trim().toLowerCase())
    ) {
      const trimmedNewName = newName.trim();
      const updatedTabs = tabs.map((tab) =>
        tab.label === oldLabel ? { ...tab, label: trimmedNewName } : tab
      );
      setTabs(updatedTabs);
      if (activeTab === oldLabel) setActiveTab(trimmedNewName);
      setEditMainTab(null);
    } else if (newName.trim() !== oldLabel) {
      alert("Invalid or duplicate tab name.");
    }
  };
  const renameInnerTab = (mainLabel, oldInner, newName) => {
    if (
      newName &&
      newName.trim() &&
      newName.trim() !== oldInner &&
      !tabs
        .find((t) => t.label === mainLabel)
        .innerTabs.some((i) => i.toLowerCase() === newName.trim().toLowerCase())
    ) {
      const trimmedNewName = newName.trim();
      const updatedTabs = tabs.map((tab) => {
        if (tab.label === mainLabel) {
          return {
            ...tab,
            innerTabs: tab.innerTabs.map((inner) =>
              inner === oldInner ? trimmedNewName : inner
            ),
          };
        }
        return tab;
      });
      setTabs(updatedTabs);
      if (activeInnerTab === oldInner) setActiveInnerTab(trimmedNewName);
      setEditInnerTab(null);
    } else if (newName.trim() !== oldInner) {
      alert("Invalid or duplicate inner tab name.");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Main Tabs */}
      <div style={tabsContainerStyle}>
        {tabs.map((tab) => (
          <div
            key={tab.label}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              borderBottom: activeTab === tab.label ? "2px solid #1976d2" : "none",
              fontWeight: activeTab === tab.label ? "bold" : "normal",
              color: activeTab === tab.label ? "#1976d2" : "#000",
              padding: "8px 12px",
            }}
            onClick={() => setActiveTab(tab.label)}
          >
            {editMainTab === tab.label ? (
              <select
                value={tab.label}
                onChange={(e) => renameTab(tab.label, e.target.value)}
                onBlur={() => setEditMainTab(null)}
                autoFocus
                style={selectStyle}
              >
                {tabs.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <span>{tab.label}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMainTab(tab.label);
                  }}
                  title="Rename Tab"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setEditMainTab(tab.label);
                  }}
                  style={editIconClickableStyle}
                >
                  ✏️
                </span>
              </>
            )}
          </div>
        ))}
        <div
          onClick={addNewTab}
          style={{
            marginLeft: "auto",
            cursor: "pointer",
            padding: "10px 15px",
            color: "green",
            fontSize: "22px",
            fontWeight: "bold",
            userSelect: "none",
          }}
          title="Add New Tab"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") addNewTab();
          }}
        >
          +
        </div>
      </div>

      {/* Inner Tabs */}
      <div style={innerTabsContainerStyle}>
        {tabs.find((t) => t.label === activeTab).innerTabs.map((innerTab) => (
          <div
            key={innerTab}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              borderBottom: activeInnerTab === innerTab ? "2px solid #4caf50" : "none",
              fontWeight: activeInnerTab === innerTab ? "bold" : "normal",
              color: activeInnerTab === innerTab ? "#4caf50" : "#555",
              padding: "6px 10px",
            }}
            onClick={() => setActiveInnerTab(innerTab)}
          >
            {editInnerTab === innerTab ? (
              <select
                value={innerTab}
                onChange={(e) => renameInnerTab(activeTab, innerTab, e.target.value)}
                onBlur={() => setEditInnerTab(null)}
                autoFocus
                style={selectStyle}
              >
                {tabs.find((t) => t.label === activeTab).innerTabs.map((iTab) => (
                  <option key={iTab} value={iTab}>
                    {iTab}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <span>{innerTab}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditInnerTab(innerTab);
                  }}
                  title="Rename Inner Tab"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setEditInnerTab(innerTab);
                  }}
                  style={{ ...editIconClickableStyle, fontSize: 14 }}
                >
                  ✏️
                </span>
              </>
            )}
          </div>
        ))}
        <div
          onClick={() => addNewInnerTab(activeTab)}
          style={{
            marginLeft: "auto",
            cursor: "pointer",
            padding: "8px 16px",
            color: "green",
            fontSize: "18px",
            fontWeight: "bold",
            userSelect: "none",
          }}
          title="Add New Inner Tab"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") addNewInnerTab(activeTab);
          }}
        >
          +
        </div>
      </div>

      {/* Showing content caption */}
      <div style={sectionTitleStyle}>
        Showing content for {activeInnerTab || activeTab}
      </div>

      {/* Notes Add/Edit button */}
      <button onClick={toggleAddForm} style={addNoteBtnStyle}>
        {showAddForm ? "Cancel" : "Add Note"}
      </button>

      {/* Notes table */}
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={{ ...thStyle, width: "5%" }}>S. NO</th>
            <th style={{ ...thStyle, width: "80%" }}>Notes</th>
            <th style={{ ...thStyle, width: "7%" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {notes.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ ...tdStyle, textAlign: "center" }}>
                No notes yet
              </td>
            </tr>
          ) : (
            notes.map((note, index) => (
              <tr key={note.id}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>
                  {expandedNotes.has(note.id) ? (
                    <>
                      {note.description.split('\n').map((line, idx) => (
                        <p key={idx} style={{ marginBottom: 8 }}>{line}</p>
                      ))}
                      <span
                        onClick={() => toggleExpand(note.id)}
                        style={{ color: "blue", cursor: "pointer" }}
                      >
                        View Less
                      </span>
                    </>
                  ) : (
                    <>
                      {(note.description.length > 200
                        ? note.description.slice(0, 200) + "..."
                        : note.description
                      )}
                      {note.description.length > 200 && (
                        <span
                          onClick={() => toggleExpand(note.id)}
                          style={{ color: "blue", cursor: "pointer", marginLeft: 6 }}
                        >
                          View More
                        </span>
                      )}
                    </>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <span
                    onClick={() => handleEdit(note)}
                    style={{ ...actionIconStyle, color: "#2196F3" }}
                    title="Edit Note"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleEdit(note);
                      }
                    }}
                  >
                    ✏️
                  </span>
                  <span
                    onClick={() => handleDelete(note.id)}
                    style={{ ...actionIconStyle, color: "red" }}
                    title="Delete Note"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleDelete(note.id);
                      }
                    }}
                  >
                    🗑️
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Add/Edit note form */}
      {showAddForm && (
        <div style={{ marginTop: 20, maxWidth: "70%" }}>
          <textarea
            name="description"
            placeholder="Enter description *"
            value={input.description}
            onChange={handleChange}
            style={{
              width: "100%",
              minHeight: 80,
              resize: "vertical",
              padding: 8,
              fontSize: 14,
              borderRadius: 4,
              border: "1px solid #ccc",
              boxSizing: "border-box",
              whiteSpace: "pre-wrap",
            }}
          />
          <div style={{ marginTop: 10 }}>
            {editId === null ? (
              <button onClick={handleAdd} style={addNoteBtnStyle}>
                Add Note
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                style={{ ...addNoteBtnStyle, backgroundColor: "#2196F3" }}
              >
                Update Note
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading & error messages */}
      {loading && <p style={{ textAlign: "center", marginTop: 20 }}>Loading notes...</p>}
      {error && <p style={{ textAlign: "center", color: "red", marginTop: 20 }}>{error}</p>}
    </div>
  );
}
