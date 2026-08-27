# 🎓 College Faculty Attendance Portal

A modern, high-speed, interactive **Faculty Attendance Portal** built with pure HTML5, CSS3, and modern ES6 JavaScript. Preloaded with all **70 student roll numbers** (`241FA04035` through `241FA04F95`).

---

## 🌟 Key Features

1. **Clean Start on Load / Refresh**
   - Whenever you open or refresh the portal, attendance starts completely **clean and clear (0 ticks / no checkboxes checked)**.
   - Click <kbd>All Present</kbd> to mark all present, or click individual checkboxes / type roll numbers.

2. **Exact 6-Column Matrix Layout**
   - Faithfully reproduces the university portal layout from the reference image with 6 responsive columns.
   - High-contrast checkbox states with distinct blue roll-number styling when marked present.

3. **Supercharged Rapid Entry (Bottom Dock)**
   - **Quick Key-In**: Type the last 2-4 digits of a roll number (e.g. `35`, `124`, `A15`) and press <kbd>Enter</kbd> to immediately toggle attendance!
   - Supports multi-token key-in (e.g., `35, 54, 124` toggles all 3 simultaneously).
   - Press <kbd>/</kbd> anywhere to immediately focus the rapid entry box.

4. **Real-time Live Analytics**
   - Total Strength (70)
   - Live Present & Absent counters
   - Attendance percentage ring meter (Target &ge; 75%)

5. **Instant Export & Communication Tools**
   - 📲 **Copy Absentee List for WhatsApp/SMS**: Generates a pre-formatted message ready to broadcast to students/parents/department groups.
   - 📥 **CSV/Excel Export**: Downloads structured `.csv` sheet with timestamps.
   - 🖨️ **Printable Official Sheet**: Clean, print-styled roster with date, period, and faculty signature line.

6. **Web Audio Synthesizer**
   - Built-in lightweight sound engine providing subtle mechanical click & chime audio feedback (can be toggled on/off).

7. **Session Storage & History**
   - Save session records with <kbd>Ctrl+S</kbd>.
   - View, restore, and manage past attendance records in the History modal.

8. **Dual Theme**
   - Dark Obsidian theme with glowing accents.
   - Clean Executive Light theme.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari) or run a local static server:

```bash
# Using python
python -m http.server 3000

# Or using npx serve
npx serve .
```

---

## ⌨️ Keyboard Shortcuts
- <kbd>/</kbd> : Focus the rapid roll-call input
- <kbd>Ctrl</kbd> + <kbd>S</kbd> : Save current attendance session
- <kbd>Space</kbd> / <kbd>Enter</kbd> on any roll item : Toggle attendance
>>>>>>> 145eae4 (Initial commit: College Faculty Attendance Portal with 70 student roll numbers)
