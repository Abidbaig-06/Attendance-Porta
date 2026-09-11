import React from "react";

export default function TableView({ students, attendance, onToggleStudent }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No students match your filter or search.</p>
        <p className="empty-sub">Try adjusting the filter buttons or search bar.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="roster-table">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th style={{ width: "160px" }}>Roll Number</th>
            <th>Student Name</th>
            <th style={{ width: "120px" }}>Section</th>
            <th style={{ width: "140px" }}>Status</th>
            <th style={{ width: "100px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const isPresent = attendance[student.roll] === "present";
            return (
              <tr
                key={student.roll}
                className={isPresent ? "row-present" : "row-absent"}
                onClick={() => onToggleStudent(student.roll)}
                style={{ cursor: "pointer" }}
              >
                <td className="text-muted">{index + 1}</td>
                <td className="font-mono" style={{ fontWeight: 600 }}>
                  {student.roll}
                </td>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td className="text-muted">{student.section || "CSE - Sec 1"}</td>
                <td>
                  <span
                    className={`status-badge ${isPresent ? "badge-present" : "badge-absent"}`}
                    style={{
                      color: isPresent ? "#000000" : "#dc2626",
                      backgroundColor: isPresent ? "#f1f5f9" : "#fee2e2",
                      border: isPresent ? "1px solid #cbd5e1" : "1px solid #fca5a5",
                      fontWeight: isPresent ? "600" : "700"
                    }}
                  >
                    {isPresent ? "✓ PRESENT" : "✕ ABSENT"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className={`btn btn-sm ${isPresent ? "btn-danger" : "btn-success"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStudent(student.roll);
                    }}
                  >
                    {isPresent ? "Mark Absent" : "Mark Present"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
