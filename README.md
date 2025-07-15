# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

# 🛠️ Surgery South – Punch List (05.15.25)

> Live Dashboard: [https://sergiom175.sg-host.com/dashboard](https://sergiom175.sg-host.com/dashboard)

This punch list outlines known issues, UI/UX changes, and feature improvements for the Surgery South application across its modules.

---

## 📅 Hospital Rounds

- [ ] **Print Rounds Button**
  - Add to **both active and archived** hospital rounds.
  - Should compress vertically (reduce padding/margin).
  - S/O and D/C buttons are causing excessive vertical space – resolve this.

- [ ] **Date Ribbon Visibility**
  - On "Day View" (after selecting a date), the date ribbon disappears. This should **stay visible**.

- [ ] **BUG: Add Entry Issue**
  - Hard to replicate. If it happens again, please capture a screenshot.
  
- [ ] **Archived Rounds**
  - Add **scroll arrows** to the date ribbon.
  - Should **not allow navigation past today's date**.

---

## 📝 Operative Log

- [ ] **Print Button**
  - Should only print the operative log section.
  - Do **not include ops-to-date section**.

- [ ] **Scrolling Arrows**
  - Add scroll arrows to the date ribbon for **infinite scroll** behavior.

- [ ] **Alignment**
  - Fields (e.g., on 5/5) should be **top-aligned** in cells.
  - *Diagnosis* and *Procedure* are correct.
  - OK to keep fields horizontally centered.

---

## 🗓️ Daily Surgery Schedule

- [ ] **Surgeon Display Order**
  - Current order is incorrect.
  - Target Order:
    1. Myers
    2. Nurddin
    3. Ferrandez
    4. Mallick
  - ⚠️ Manual reordering in the backend is required.
  - Please avoid requiring the client to delete/re-enter surgeons. If possible, implement a manual reordering backend tool.

---

## 🚨 Header Bar (OR View)

- [ ] Stack the **Title + Date** cleanly.
- [ ] Add infinite scroll in the date ribbon.
  - Currently can’t scroll past 5/01 — must be able to go **both backward and forward indefinitely**.

---

## 📊 Timeline (OR View)

- [ ] Reduce row height.
  - Remove `:15` and `:45` time markers.
  - Keep 4 grey lines/hour for reference.

- [ ] Surgeon names should shift up to remove white space.

- [ ] **Print Button**
  - Should appear in the top bar next to date selection.
  - Print only the main white-space column schedule view.

---

## 🎨 Calendar Colors and Event Layout

- [ ] **Change Colors**
  - MOR = Light Blue
  - OFFICE = Light Green

- [ ] **Remove DR Name** in “Meetings” cells.

- [ ] **Scrolling Arrows**
  - On date select view, arrows must **still appear**.
  - This is **mandatory**, not optional based on the template.

---

## 🐞 OR View Bugs

- [ ] **Data Load Bug (4/30)**
  - Going directly to a selected date sometimes fails to load.
  - Reloading the dashboard fixes it — investigate root cause.

- [ ] **Event Display Format**
  - Event records on calendar should show (in order):
    - Patient Name
    - MRN
    - Procedure

- [ ] **Office Event Records**
  - Should show **Office / Notes content**

---

## ➕ Add New Event

- [ ] Make **all fields optional**, no required fields.
- [ ] Set default end time = start time + 1 hour.
  - Still allow manual override of end time.

---

## 🗓️ Monthly Call Calendar

- [ ] **Edit Calendar**
  - Remove "Office Hours" from Sat/Sun.

- [ ] **Time Off Behavior**
  - Default end date = same as start.
  - Can still be manually adjusted.

- [ ] **Calendar Ribbon UI**
  - Remove **dots** and **month text** from ribbon.
  - PTO (vacation, holiday, CE) = **pink** highlight.

- [ ] **Print Calendar**
  - Ensure all cells are **uniform size**
  - Ensure print-friendliness (flat layout, clean colors)

---

## 🔐 Domain + Data Consistency

- [ ] **Domain**: surgerysouth.com – ensure it resolves to production dashboard.

- [x] ✅ **Q1 Resolved** – Misloaded page on 5/15 was temporarily resolved. Must **prevent** this from happening again.
- [ ] **Q2 Actionable** – If Add Entry bug reappears, capture screenshot.
- [x] ✅ **Q3 Resolved** – Ribbon display formatting clarified and fixed.

---

## ✅ Completed Tasks

- [x] Meeting DR name removed.
- [x] Dot removed from calendar ribbon.
- [x] Surgeon DR order discussion addressed.

---

## 📌 Notes for Devs

> If using Git, commit this `README.md` to the repo root.
> # 🛠️ Surgery South – Punch List (07.07.25)

> 📍 [Dashboard Link](https://sergiom175.sg-host.com/dashboard)

This punch list addresses feature adjustments, UI behavior expectations, and bug fixes across the main modules of the application based on feedback from the Surgery South client as of **July 7, 2025**.

---

## 🏠 Home Page

### ✅ Daily Surgery Schedule
- [ ] **Scroll Limit**
  - Scroll using the arrow is currently restricted.
  - Must support **infinite scrolling**, both into the **past** and **future**.

### ✅ Monthly Call Calendar
- [ ] **Row Scroll Behavior**
  - Must support **infinite horizontal scrolling** across dates (past/future).

---

## 🏥 Hospital Rounds

### ✅ Editing on Single-Date View
- [ ] On date-specific pages (e.g., `Hospital Rounds 07/10/2025`), the page should:
  - Support **editing** (Add Entries, field updates)
  - Mirror the functionality of the **Hospital Rounds Home Page**

- [ ] Add a **button** for “Add New Entry” on the single-date view.

### ✅ Archived Rounds – Date Ribbon Behavior
- [ ] When in **single-date mode**, users should still be able to **change dates using the ribbon** in the archive section.
  - Currently locked on selected day — must enable smooth date switching.

---

## 📋 Operative Log

### ✅ Date Ribbon Direction
- [ ] Reverse the current scroll logic:
  - **Current Date should appear on the LEFT**
  - Dates get **older as you scroll right** (left-to-right descending)

### ✅ Print Format
- [ ] Printed output must include:
  - A proper **Title**: `Operative Log`
  - The **Date** clearly labeled
- [ ] Use **Hospital Rounds print layout** as reference — this is working as expected.

---

## 📅 Daily Surgery Schedule

### 🛠 Event Layout (Based on 6/16/25 Reference)

- [ ] **Time Range Spacing**
  - Add vertical space between time blocks for better clarity

- [ ] **Procedure Display – Must Show 4 Lines:**

| Line | Content                             | Alignment                  |
|------|--------------------------------------|----------------------------|
| 1    | MRN # (left) + Event Location (right) | MRN = flush left; Location = flush right |
| 2    | Patient Name                         | Centered |
| 3    | Procedure                            | Centered |
| 4    | *(optional extra spacing if needed)* |

- [ ] **Remove font compression or auto-resizing.**

---

### 🖊️ Event Editing (Add / Edit)

- [ ] **Primary Surgeon is no longer required.**
  - Must accept either: **Primary**, **Assistant**, or **both**.

---

### 🧾 Meeting Events

- [ ] Replace “Meeting” label with the **Description field** in **bold**.
- [ ] Only **1 line** is needed — no need to display "Meeting".

---

### 🖨️ Print View

- [ ] **Print Layout Issues:**
  - Printed grid is **missing column outlines** and **event highlights**
  - Solution: Ensure **"Background Graphics" is enabled** in browser print dialog.
  - Columns must be visibly boxed; events must retain highlight colors.

---

## 📆 Monthly Call Calendar

### ✅ Weekend Columns

- [ ] Re-add **Saturday and Sunday** columns for:
  - First Call
  - Second Call
- [ ] Do **not** include Office Hours on weekends

### ✅ UI Adjustments

- [ ] **Remove Monthly Ribbon** from top of calendar.
- [ ] **Vacation Entries**
  - Move all vacation notes to **bottom-left of cell**
  - Change color from **pink to black**
  - Text size should match `1st`, `2nd`, and `O` fields

---

## ✅ Notes for Developers

> Suggested commit flow:
```bash
git add README.md
git commit -m "Add 07.07.25 client punch list and layout improvements"
git push origin main


```bash
git add README.md
git commit -m "Add punch list and QA notes for 05.15.25"
git push origin main
