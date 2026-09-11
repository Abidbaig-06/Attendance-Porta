const API_BASE = "/api";

import { INITIAL_STUDENTS, DEFAULT_SETTINGS } from "../../data.js";

export const FALLBACK_STUDENTS = INITIAL_STUDENTS;
export { INITIAL_STUDENTS, DEFAULT_SETTINGS };

export async function fetchStudents() {
  try {
    const res = await fetch(`${API_BASE}/students`);
    if (!res.ok) throw new Error("Backend response error");
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return json.data;
    }
    return FALLBACK_STUDENTS;
  } catch (err) {
    console.warn("Using local fallback students list:", err);
    return FALLBACK_STUDENTS;
  }
}

export async function fetchSessions() {
  try {
    const res = await fetch(`${API_BASE}/sessions`);
    if (!res.ok) throw new Error("Backend response error");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("Using local storage for sessions:", err);
    const saved = localStorage.getItem("att_history");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function saveSession(session) {
  // Always update localStorage as backup
  try {
    const localHistory = JSON.parse(localStorage.getItem("att_history") || "[]");
    const updated = [session, ...localHistory.filter(s => s.id !== session.id)];
    localStorage.setItem("att_history", JSON.stringify(updated.slice(0, 50)));
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error("Save error");
    return await res.json();
  } catch (err) {
    console.warn("Saved to localStorage fallback (Backend unreachable)");
    return { success: true, data: session, fallback: true };
  }
}

export async function deleteSession(id) {
  try {
    const localHistory = JSON.parse(localStorage.getItem("att_history") || "[]");
    const updated = localHistory.filter(s => String(s.id) !== String(id));
    localStorage.setItem("att_history", JSON.stringify(updated));
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete error");
    return await res.json();
  } catch (err) {
    return { success: true, fallback: true };
  }
}

export async function fetchFacultyContacts() {
  try {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) throw new Error("Backend response error");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("Using local storage fallback for faculty contacts:", err);
    const saved = localStorage.getItem("faculty_whatsapp_contacts_v3");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function saveFacultyContacts(contacts) {
  try {
    localStorage.setItem("faculty_whatsapp_contacts_v3", JSON.stringify(contacts));
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE}/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contacts)
    });
    if (!res.ok) throw new Error("Save faculty contacts error");
    return await res.json();
  } catch (err) {
    console.warn("Saved faculty contacts to localStorage fallback");
    return { success: true, data: contacts, fallback: true };
  }
}
