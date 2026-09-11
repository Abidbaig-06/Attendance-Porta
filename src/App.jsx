import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import SessionBar from "./components/SessionBar";
import Toolbar from "./components/Toolbar";
import MatrixView from "./components/views/MatrixView";
import CardGridView from "./components/views/CardGridView";
import TableView from "./components/views/TableView";
import SubmissionSummary from "./components/SubmissionSummary";
import HistoryModal from "./components/HistoryModal";
import QuickKeyModal from "./components/QuickKeyModal";
import FacultyWhatsAppModal from "./components/FacultyWhatsAppModal";
import TimetableModal from "./components/TimetableModal";
import Toast from "./components/Toast";
import { sound } from "./utils/sound";
import {
  fetchStudents,
  fetchSessions,
  saveSession,
  deleteSession,
  fetchFacultyContacts,
  saveFacultyContacts
} from "./services/api";
import { INITIAL_STUDENTS, DEFAULT_SETTINGS } from "../data.js";
import { generateWhatsAppMessage, openWhatsAppChat } from "./utils/whatsapp";
import {
  SECTION_1_FACULTIES,
  SECTION_1_SUBJECTS,
  getScheduledClass,
  getTimetablePeriodsForDate,
  getPeriodForSlot
} from "./data/timetable";

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [attendance, setAttendance] = useState(() => {
    const initialAtt = {};
    INITIAL_STUDENTS.forEach((s) => {
      initialAtt[s.roll] = "present";
    });
    return initialAtt;
  });
  const [date, setDate] = useState(getTodayDateString);
  const [period, setPeriod] = useState(() => {
    const todayPeriods = getTimetablePeriodsForDate(getTodayDateString());
    return todayPeriods[0]?.value || "1";
  });
  const [subject, setSubject] = useState(SECTION_1_SUBJECTS[0].name);
  const [section, setSection] = useState("1 CSE");

  // Faculty WhatsApp Contacts State - Starts empty, permanently saved on server & localStorage
  const [facultyContacts, setFacultyContacts] = useState(() => {
    const saved = localStorage.getItem("faculty_whatsapp_contacts_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [selectedFacultyId, setSelectedFacultyId] = useState(() => {
    return localStorage.getItem("selected_faculty_id") || "custom";
  });

  const [customFacultyPhone, setCustomFacultyPhone] = useState(() => {
    return localStorage.getItem("custom_faculty_phone") || "";
  });

  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(() => {
    const saved = localStorage.getItem("auto_send_whatsapp");
    return saved !== null ? saved === "true" : true;
  });

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // Active Faculty Contact Resolution (No hardcoded fallback phone number)
  const activeFaculty =
    selectedFacultyId === "custom"
      ? { id: "custom", name: "Faculty Contact", phone: customFacultyPhone }
      : facultyContacts.find((c) => c.id === selectedFacultyId) || {
          id: "custom",
          name: "Faculty Contact",
          phone: customFacultyPhone
        };

  const [viewMode, setViewMode] = useState("matrix"); // 'matrix' | 'cards' | 'table'
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'present' | 'absent'
  const [searchQuery, setSearchQuery] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [historySessions, setHistorySessions] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showQuickKeyModal, setShowQuickKeyModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  const summaryRef = useRef(null);

  // Save contacts updates permanently to backend & localStorage
  const handleSaveFacultyContacts = async (contacts) => {
    setFacultyContacts(contacts);
    localStorage.setItem("faculty_whatsapp_contacts_v3", JSON.stringify(contacts));
    await saveFacultyContacts(contacts);
  };

  const handleSelectFacultyId = (id) => {
    setSelectedFacultyId(id);
    localStorage.setItem("selected_faculty_id", id);
  };

  const handleChangeCustomPhone = (phone) => {
    setCustomFacultyPhone(phone);
    localStorage.setItem("custom_faculty_phone", phone);
  };

  const handleToggleAutoSend = (val) => {
    setAutoSendWhatsApp(val);
    localStorage.setItem("auto_send_whatsapp", String(val));
    showToast(val ? "WhatsApp auto-send enabled" : "WhatsApp auto-send disabled", "info");
  };

  // Synchronize subject with Section 1 Timetable
  const applyTimetableSlot = (targetDate, targetPeriod, silent = false) => {
    const scheduled = getScheduledClass(targetDate, targetPeriod);
    if (scheduled) {
      const sub =
        SECTION_1_SUBJECTS.find((s) => s.id === scheduled.subjectMeta?.id) ||
        scheduled.subjectMeta;
      const subName = sub?.name || scheduled.subjectTitle;
      setSubject(subName);

      // Only match against user's saved contacts if any exist
      if (facultyContacts && facultyContacts.length > 0) {
        const matchedFaculty = facultyContacts.find(
          (f) =>
            f.phone === scheduled.facultyPhone ||
            f.name.toLowerCase().includes(scheduled.facultyName.toLowerCase())
        );
        if (matchedFaculty) {
          setSelectedFacultyId(matchedFaculty.id);
          localStorage.setItem("selected_faculty_id", matchedFaculty.id);
        }
      }

      if (!silent) {
        showToast(
          `📅 Timetable (${scheduled.dayName} Period ${targetPeriod}): ${scheduled.subjectTitle}`,
          "info"
        );
      }
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    const dayPeriods = getTimetablePeriodsForDate(newDate);
    const isValid = dayPeriods.some((p) => p.value === period);
    const nextPeriod = isValid ? period : (dayPeriods[0]?.value || "1");
    if (!isValid) {
      setPeriod(nextPeriod);
    }
    applyTimetableSlot(newDate, nextPeriod);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    applyTimetableSlot(date, newPeriod);
  };

  const handleChangeSubject = (newSubjectName) => {
    setSubject(newSubjectName);
    const matchedSubject = SECTION_1_SUBJECTS.find((s) => s.name === newSubjectName);
    if (matchedSubject) {
      const matchedFaculty = facultyContacts.find(
        (f) =>
          f.phone === matchedSubject.phone ||
          f.name.toLowerCase().includes(matchedSubject.facultyName.toLowerCase())
      );
      if (matchedFaculty) {
        setSelectedFacultyId(matchedFaculty.id);
        localStorage.setItem("selected_faculty_id", matchedFaculty.id);
        showToast(`Subject: ${matchedSubject.name} (${matchedFaculty.name})`, "info");
      }
    }
  };

  const handleSelectTimetableSlot = (slot) => {
    const targetPeriod = getPeriodForSlot(slot.day, slot.period) || slot.period;
    if (targetPeriod) setPeriod(targetPeriod);
    if (slot.subject) {
      const fullSub = SECTION_1_SUBJECTS.find(
        (s) =>
          s.name.toLowerCase().includes(slot.subject.toLowerCase()) ||
          s.id === slot.subject
      );
      setSubject(fullSub ? fullSub.name : slot.subject);
    }
    if (slot.phone) {
      const match = facultyContacts.find((f) => f.phone === slot.phone);
      if (match) {
        setSelectedFacultyId(match.id);
      } else {
        setSelectedFacultyId("custom");
        setCustomFacultyPhone(slot.phone);
      }
    }
    showToast(`Applied ${slot.day} Period ${targetPeriod}: ${slot.subject} (${slot.faculty})`, "success");
  };

  // Live reload effect whenever user edits data.js
  useEffect(() => {
    setStudents(INITIAL_STUDENTS);
    setSettings(DEFAULT_SETTINGS);
    setAttendance((prev) => {
      const updated = { ...prev };
      INITIAL_STUDENTS.forEach((s) => {
        if (!updated[s.roll]) updated[s.roll] = "present";
      });
      return updated;
    });
  }, [INITIAL_STUDENTS, DEFAULT_SETTINGS]);

  // Sync timetable on initial load
  useEffect(() => {
    applyTimetableSlot(date, period, true);
  }, []);

  // Helper to push toasts
  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize students and attendance on startup
  useEffect(() => {
    async function loadData() {
      const roster = await fetchStudents();
      if (roster && roster.length > 0) {
        setStudents(roster);
        setAttendance((prev) => {
          const initialAtt = { ...prev };
          roster.forEach((s) => {
            if (!initialAtt[s.roll]) initialAtt[s.roll] = "present";
          });
          return initialAtt;
        });
      }

      // Load sessions history from backend
      const sessions = await fetchSessions();
      setHistorySessions(sessions);

      // Load custom faculty contacts from backend
      try {
        const customFaculty = await fetchFacultyContacts();
        if (Array.isArray(customFaculty)) {
          setFacultyContacts(customFaculty);
          localStorage.setItem("faculty_whatsapp_contacts_v3", JSON.stringify(customFaculty));
        }
      } catch (err) {
        console.warn("Could not fetch faculty contacts from backend:", err);
      }

      showToast(`Ready: ${INITIAL_STUDENTS.length} students loaded from Section 1 roster`, "info");
    }
    loadData();
  }, []);

  // Audio synthesizer toggle
  const handleToggleSound = () => {
    const nextState = sound.toggle();
    setSoundEnabled(nextState);
    showToast(nextState ? "Audio Synthesizer ON" : "Audio Synthesizer OFF", "info");
  };

  // Toggle individual student attendance
  const handleToggleStudent = (roll) => {
    setAttendance((prev) => {
      const current = prev[roll] || "present";
      const next = current === "present" ? "absent" : "present";
      if (next === "absent") {
        sound.playUncheck();
      } else {
        sound.playCheck();
      }
      return { ...prev, [roll]: next };
    });
  };

  // Bulk actions
  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.roll] = status;
    });
    setAttendance(updated);
    if (status === "present") sound.playSuccess();
    else sound.playUncheck();

    showToast(
      status === "present"
        ? "Marked all students as Present (All Unticked)"
        : "Marked all students as Absent (All Ticked)",
      status === "present" ? "success" : "warning"
    );
  };

  const handleInvert = () => {
    setAttendance((prev) => {
      const inverted = {};
      students.forEach((s) => {
        inverted[s.roll] = prev[s.roll] === "absent" ? "present" : "absent";
      });
      return inverted;
    });
    sound.playCheck();
    showToast("Inverted attendance selection", "info");
  };

  const handleClearAll = () => {
    handleMarkAll("present");
  };

  // Rapid roll key-in absent apply (modal)
  const handleApplyAbsentKeys = (absentRolls) => {
    setAttendance((prev) => {
      const updated = { ...prev };
      absentRolls.forEach((r) => {
        updated[r] = "absent";
      });
      return updated;
    });
    sound.playUncheck();
    showToast(`Marked ${absentRolls.length} roll number(s) as Absent`, "warning");
  };

  // Quick roll search/key-in from the sticky bottom bar
  const [stickyInput, setStickyInput] = useState("");
  const stickyInputRef = useRef(null);

  const handleStickyRollSubmit = (e) => {
    e.preventDefault();
    const query = stickyInput.trim().toUpperCase();
    if (!query) return;

    const tokens = query.split(/[\s,;]+/).filter(Boolean);
    const matchedStudents = [];

    tokens.forEach((tok) => {
      const matched = students.find((s, idx) => {
        const roll = s.roll.toUpperCase();
        const seq = String(idx + 1);
        return roll === tok || roll.endsWith(tok) || roll.includes(tok) || seq === tok;
      });
      if (matched && !matchedStudents.some((m) => m.roll === matched.roll)) {
        matchedStudents.push(matched);
      }
    });

    if (matchedStudents.length > 0) {
      const summaryNotes = [];
      setAttendance((prev) => {
        const updated = { ...prev };
        matchedStudents.forEach((student) => {
          const current = updated[student.roll] || "present";
          const next = current === "present" ? "absent" : "present";
          updated[student.roll] = next;

          if (next === "absent") {
            sound.playUncheck();
            summaryNotes.push(`✕ ${student.roll} (${student.name}) marked Absent`);
          } else {
            sound.playCheck();
            summaryNotes.push(`✓ ${student.roll} (${student.name}) marked Present`);
          }
        });
        return updated;
      });

      showToast(summaryNotes.join(" • "), "info");
      setStickyInput("");
      if (stickyInputRef.current) stickyInputRef.current.focus();
    } else {
      showToast(`No student found matching "${query}"`, "warning");
    }
  };

  // Submit attendance, save to backend, and send absent numbers to selected WhatsApp number
  const handleSubmitAttendance = async () => {
    setIsSubmitted(true);
    sound.playSuccess();

    const presentStudents = students.filter((s) => attendance[s.roll] === "present");
    const absentStudents = students.filter((s) => attendance[s.roll] === "absent");
    const presentCount = presentStudents.length;
    const absentCount = absentStudents.length;
    const percentage = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : "0.0";

    const sessionPayload = {
      id: `session_${Date.now()}`,
      date,
      period,
      subject,
      section,
      facultyName: activeFaculty.name,
      facultyPhone: activeFaculty.phone,
      total: students.length,
      presentCount,
      absentCount,
      percentage,
      absentRolls: absentStudents.map((s) => ({ roll: s.roll, name: s.name })),
      presentRolls: presentStudents.map((s) => ({ roll: s.roll, name: s.name })),
      attendance,
      timestamp: new Date().toISOString()
    };

    // Save to Express backend
    const res = await saveSession(sessionPayload);
    if (res.data) {
      setHistorySessions((prev) => [res.data, ...prev.filter((s) => s.id !== res.data.id)]);
    }

    // Check if auto-send to WhatsApp is enabled
    if (autoSendWhatsApp && activeFaculty.phone) {
      const waMessage = generateWhatsAppMessage({
        date,
        period,
        section,
        subject,
        facultyName: activeFaculty.name,
        total: students.length,
        presentCount,
        absentCount,
        absentStudents
      });

      const { cleanNumber, opened } = openWhatsAppChat({
        phone: activeFaculty.phone,
        message: waMessage
      });

      if (opened) {
        showToast(
          `Attendance Submitted! Opening WhatsApp to send absent numbers to ${activeFaculty.name} (+${cleanNumber})...`,
          "success"
        );
      } else {
        showToast(
          `Attendance Submitted! (Popup blocked: Click 'Send to WhatsApp' in summary below)`,
          "info"
        );
      }
    } else {
      showToast(
        `Attendance Submitted! ${presentCount} Present, ${absentCount} Absent (${percentage}%)`,
        "success"
      );
    }

    // Scroll smoothly to summary
    setTimeout(() => {
      if (summaryRef.current) {
        summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Restore a previous session from history
  const handleLoadSession = (session) => {
    if (session.date) setDate(session.date);
    if (session.period) setPeriod(session.period);
    if (session.subject) setSubject(session.subject);
    if (session.section) setSection(session.section);
    if (session.facultyPhone) {
      const match = facultyContacts.find((c) => c.phone === session.facultyPhone);
      if (match) {
        setSelectedFacultyId(match.id);
      } else {
        setSelectedFacultyId("custom");
        setCustomFacultyPhone(session.facultyPhone);
      }
    }

    if (session.attendance) {
      setAttendance(session.attendance);
    } else if (session.absentRolls) {
      const restored = {};
      students.forEach((s) => {
        restored[s.roll] = "present";
      });
      session.absentRolls.forEach((item) => {
        const roll = item.roll || item;
        restored[roll] = "absent";
      });
      setAttendance(restored);
    }

    setIsSubmitted(true);
    setShowHistoryModal(false);
    sound.playSuccess();
    showToast(`Loaded session from ${session.date} (Period ${session.period})`, "info");
  };

  // Delete session from history
  const handleDeleteSession = async (id) => {
    await deleteSession(id);
    setHistorySessions((prev) => prev.filter((s) => String(s.id) !== String(id)));
    showToast("Session removed from records", "info");
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const status = attendance[s.roll] || "present";
    if (filterMode === "present" && status !== "present") return false;
    if (filterMode === "absent" && status !== "absent") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRoll = s.roll.toLowerCase().includes(q);
      const matchName = s.name && s.name.toLowerCase().includes(q);
      if (!matchRoll && !matchName) return false;
    }

    return true;
  });

  const counts = {
    total: students.length,
    present: students.filter((s) => attendance[s.roll] === "present").length,
    absent: students.filter((s) => attendance[s.roll] === "absent").length
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenTimetable={() => setShowTimetableModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        historyCount={historySessions.length}
        onSubmit={handleSubmitAttendance}
        isSubmitted={isSubmitted}
        studentCount={students.length}
        settings={settings}
      />

      {/* Faculty Session Controls Bar */}
      <SessionBar
        date={date}
        onChangeDate={handleDateChange}
        period={period}
        onChangePeriod={handlePeriodChange}
        subject={subject}
        onChangeSubject={handleChangeSubject}
        onOpenTimetable={() => setShowTimetableModal(true)}
        facultyContacts={facultyContacts}
        selectedFacultyId={selectedFacultyId}
        onChangeFacultyId={handleSelectFacultyId}
        customFacultyPhone={customFacultyPhone}
        onChangeCustomFacultyPhone={handleChangeCustomPhone}
        onOpenManageFaculty={() => setShowFacultyModal(true)}
        autoSendWhatsApp={autoSendWhatsApp}
        onToggleAutoSendWhatsApp={handleToggleAutoSend}
        onMarkAll={handleMarkAll}
        onInvert={handleInvert}
        onClearAll={handleClearAll}
      />

      {/* Toolbar: Search, Filters, View Modes, Key-In */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        viewMode={viewMode}
        onViewChange={setViewMode}
        counts={counts}
        onOpenQuickKey={() => setShowQuickKeyModal(true)}
      />

      {/* University Matrix / Cards / Table Roster */}
      <main className="roster-view-container" id="studentViewContainer">
        {viewMode === "matrix" && (
          <MatrixView
            students={filteredStudents}
            attendance={attendance}
            onToggleStudent={handleToggleStudent}
          />
        )}
        {viewMode === "cards" && (
          <CardGridView
            students={filteredStudents}
            attendance={attendance}
            onToggleStudent={handleToggleStudent}
          />
        )}
        {viewMode === "table" && (
          <TableView
            students={filteredStudents}
            attendance={attendance}
            onToggleStudent={handleToggleStudent}
          />
        )}
      </main>

      {/* Post-Submission Analytics & WhatsApp Export Summary */}
      {isSubmitted && (
        <SubmissionSummary
          summaryRef={summaryRef}
          date={date}
          period={period}
          subject={subject}
          section={section}
          facultyName={activeFaculty.name}
          facultyPhone={activeFaculty.phone}
          students={students}
          attendance={attendance}
          onToggleStudent={handleToggleStudent}
          onShowToast={showToast}
        />
      )}

      {/* Sticky Bottom Bar for instant Mobile / Tablet submission */}
      <div className="sticky-action-bar">
        <div className="sticky-action-inner">
          <div className="sticky-info">
            <span>
              Present: <strong className="text-success">{counts.present}</strong>
            </span>
            <span className="divider">|</span>
            <span>
              Absent: <strong className="text-danger">{counts.absent}</strong>
            </span>
            {activeFaculty.phone && (
              <span className="sticky-target-faculty">
                &bull; WhatsApp: <strong>{activeFaculty.phone}</strong>
              </span>
            )}
          </div>

          {/* Quick Roll / Number Search Bar */}
          <form className="sticky-quick-input-form" onSubmit={handleStickyRollSubmit}>
            <div className="sticky-input-wrapper">
              <span className="sticky-input-icon" aria-hidden="true">⚡</span>
              <input
                ref={stickyInputRef}
                type="text"
                className="sticky-roll-input"
                placeholder="Enter roll or number (e.g. 35, 54, 4035) & press Enter to toggle tick..."
                value={stickyInput}
                onChange={(e) => setStickyInput(e.target.value)}
                aria-label="Enter student roll number or suffix to toggle attendance"
              />
              {stickyInput && (
                <button
                  type="button"
                  className="sticky-input-clear"
                  onClick={() => {
                    setStickyInput("");
                    if (stickyInputRef.current) stickyInputRef.current.focus();
                  }}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmitAttendance}
            style={{ minWidth: "160px" }}
          >
            {isSubmitted ? "Update Submission" : "Submit Attendance"}
          </button>
        </div>
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        sessions={historySessions}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Quick Roll Key-In Modal */}
      <QuickKeyModal
        isOpen={showQuickKeyModal}
        onClose={() => setShowQuickKeyModal(false)}
        students={students}
        onApplyAbsentKeys={handleApplyAbsentKeys}
      />

      {/* Faculty WhatsApp Contacts Manager Modal */}
      <FacultyWhatsAppModal
        isOpen={showFacultyModal}
        onClose={() => setShowFacultyModal(false)}
        contacts={facultyContacts}
        onSaveContacts={handleSaveFacultyContacts}
        selectedId={selectedFacultyId}
        onSelectFaculty={handleSelectFacultyId}
      />

      {/* Section 1 Weekly Timetable Modal */}
      <TimetableModal
        isOpen={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        currentDate={date}
        currentPeriod={period}
        onSelectSlot={handleSelectTimetableSlot}
      />
    </div>
  );
}
