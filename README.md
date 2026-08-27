# 🎓 College Faculty Attendance Portal

A modern, high-speed, interactive **Faculty Attendance Portal** built with pure HTML5, CSS3, and modern ES6 JavaScript. Preloaded with all **70 student roll numbers** (`241FA04035` through `241FA04F95`).

---

## 🌟 Key Features

1. **Clean Start on Load / Refresh**
   - Whenever you open or refresh the portal, attendance starts completely **clean and clear (0 ticks / all marked Present)**.
   - **Tick = ABSENT**: Tapping any student puts a red checkmark marking them as **Absent**.
   - Unticked boxes remain **Present**.

2. **Exact 6-Column Matrix Layout**
   - Clean, high-contrast white layout with 6 responsive columns.
   - High-contrast checkbox states with distinct red highlights when marked absent.

3. **Supercharged Rapid Entry (Bottom Dock)**
   - **Quick Key-In**: Type the last 2-4 digits of a roll number (e.g. `35`, `124`, `A15`) and press <kbd>Enter</kbd> to immediately toggle attendance!
   - Supports multi-token key-in (e.g., `35, 54, 124` toggles all 3 simultaneously).
   - Press <kbd>/</kbd> anywhere to immediately focus the rapid entry box.

4. **Submission Summary & Absent Roll Numbers**
   - Reveals comprehensive summary cards only after clicking **🚀 Submit Attendance**.
   - Displays all absent roll numbers in clean visual badge chips format.
   - **One-Click Copy**: Dedicated **"📋 Copy Absent Numbers"** button to instantly copy all absent roll numbers to clipboard.

5. **Instant Export & Communication Tools**
   - 📲 **Copy Absentee List for WhatsApp/SMS**: Generates a pre-formatted message ready to broadcast.
   - 📥 **Clean CSV Export**: Downloads structured `.csv` with only **Roll Number** and **Status**.
   - 🖨️ **Printable Official Sheet**: Clean, print-styled roster with date, period, and faculty signature line.

6. **Web Audio Synthesizer**
   - Built-in lightweight sound engine providing subtle mechanical click & chime audio feedback (can be toggled on/off).

7. **Session Storage & History**
   - Save session records with <kbd>Ctrl+S</kbd>.
   - View, restore, and manage past attendance records in the History modal.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari) or run a local static server:

```bash
# Using python
python -m http.server 8080

# Or using npx serve
npx serve .
```

---

## ⌨️ Keyboard Shortcuts
- <kbd>/</kbd> : Focus the rapid roll-call input
- <kbd>Ctrl</kbd> + <kbd>S</kbd> : Submit and save attendance session
- <kbd>Space</kbd> / <kbd>Enter</kbd> on any roll item : Toggle attendance (tick = absent)
