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

```bash
git add README.md
git commit -m "Add punch list and QA notes for 05.15.25"
git push origin main
