import React, { useState, useEffect } from "react";
import { faAngleRight, faAngleLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { useNavigate } from 'react-router-dom';
import Preloader from "../../Partials/preLoader";
function EditWeekCalendar() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs().utc());
  const [surgeons, setSurgeons] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [calendarEntries, setCalendarEntries] = useState({});
  const [office, setOffice] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSurgeons();
    fetchVacations();
    fetchCalendarEntries();
    setErrors({});
  }, [currentDate]);

  const fetchSurgeons = async () => {
    try {
      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/vacation/filter-surgeons`);
      setSurgeons(response.data);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
      setErrors({ fetchSurgeons: "Failed to fetch surgeons. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fetchVacations = async () => {
    try {
      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/vacation-data`);
      if (Array.isArray(response.data.vacations)) {
        setVacations(response.data.vacations);
      } else {
        console.error("Expected array but received:", response.data);
        setErrors({ fetchVacations: "Unexpected response format. Please try again." });
      }
    } catch (error) {
      console.error("Error fetching vacations:", error);
      setErrors({ fetchVacations: "Failed to fetch vacations. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEntries = async () => {
    const year = currentDate.year();
    const month = currentDate.month() + 1;

    try {
      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/calendar-entries`, {
        params: { year, month }
      });
      const entries = response.data.entries;
      const formattedEntries = entries.reduce((acc, entry) => {
        acc[entry.date] = entry;
        return acc;
      }, {});
      setCalendarEntries(formattedEntries);
      setOffice(response.data.office);
    } catch (error) {
      console.error("Error fetching calendar entries:", error);
      setErrors({ fetchEntries: "Failed to fetch calendar entries. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVacation = async (id, dateToDelete) => {
    try {
      const response = await AxiosAuthInstance.post(`${Constant.BASE_URL}/vacation/${id}/delete-date`, { date: dateToDelete });
      setVacations((prevVacations) =>
        prevVacations.map((vacation) => {
          if (vacation.id === id) {
            return { ...vacation, vacation_dates: vacation.vacation_dates.filter(date => date !== dateToDelete) };
          }
          return vacation;
        }).filter(vacation => vacation.vacation_dates.length > 0)
      );
    } catch (error) {
      console.error("Error deleting vacation date:", error.response?.data || error.message);
      setErrors({ deleteVacation: "Failed to delete vacation date. Please try again." });
    }
  };

  const handleDeleteOffice = async (id) => {
    if (!id) {
      console.error("Error: Attempting to delete with an undefined ID.");
      alert("Error: No valid office entry selected for deletion.");
      return;
    }

    console.log("Attempting to delete office entry with ID:", id);

    try {
      const response = await AxiosAuthInstance.post(`${Constant.BASE_URL}/office/${id}/delete-date`);

      if (response.status === 200) {
        setOffice((prevOffice) => prevOffice.filter((office) => office.id !== id));
        alert("Office close entry deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting office close date:", error.response?.data || error.message);
      alert("Failed to delete office close date. Please try again.");
    }
  };


  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  // const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = dayjs().year(currentYear).month(currentMonth).startOf('month').utc().day();
  const daysInMonth = dayjs().utc().year(currentYear).month(currentMonth).daysInMonth();

  const daysArray = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1),];
  const weeksArray = [];
  for (let i = 0; i < daysArray.length; i += 7) { weeksArray.push(daysArray.slice(i, i + 7)); }

  const handleMonthClick = (monthIndex) => {
    const newDate = dayjs().set("month", monthIndex).set("year", currentYear);
    setCurrentDate(newDate);
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => prevDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => prevDate.add(1, "month"));
  };


  const handleSelectChange = (day, event) => {
    const { name, value } = event.target;
    const updatedValue = value === "" ? null : value;

    setFormData((prevData) => ({
      ...prevData,
      [day]: {
        ...prevData[day],
        [name]: updatedValue,
      },
    }));
  };


  const Navigate = useNavigate();
  const addMonthData = async () => {
    const entries = [];
    weeksArray.forEach(week => {
      week.forEach(day => {
        if (day) {
          const dateStr = dayjs.utc(`${currentYear}-${currentMonth + 1}-${day}`).format("YYYY-MM-DD");
          const dayData = formData[dateStr] || {};

          entries.push({
            date: dateStr,
            surgeon_1st: dayData['surgeon_1st'] || null,
            surgeon_2nd: dayData['surgeon_2nd'] || null,
            surgeon_o_am: dayData['surgeon_o_am'] || null,
            surgeon_o_pm: dayData['surgeon_o_pm'] || null,
          });
        }
      });
    });

    try {
      await AxiosAuthInstance.post(`${Constant.BASE_URL}/calendar-add-data`, { entries });
      setErrors({});
      fetchSurgeons();
      fetchVacations();
      fetchCalendarEntries();
      Navigate("/montly-schedule");
    } catch (error) {
      console.error("Error updating month data:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrors({ updateMonth: error.response.data.error });
      } else {
        setErrors({ updateMonth: "Failed to update month data. Please try again." });
      }
    }
  };



  if (loading) return <Preloader />;

  return (
    <>
      {errors.updateMonth && (
        <div className="error-message text-red-600 py-2 px-4 border border-red-300 rounded">
          {errors.updateMonth}
        </div>
      )}
      <button
        onClick={addMonthData}
        type="button"
        className="absolute top-[-14px] right-[140px] border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
      >
        Save Changes
      </button>
      <div className="monthly-call flex justify-between py-5 px-3">
        {["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."].map(
          (month, idx) => (
            <div
              key={idx}
              className={`item bg-[#B4C6D9] px-5 py-2 rounded-md text-xl ${idx === currentMonth ? "active" : ""}`}
              onClick={() => handleMonthClick(idx)}
            >
              {month}
            </div>
          )
        )}
      </div>

      <div className="relative text-center py-5">
        <div className="prev absolute start-[35%] top-5 px-3 py-1 text-[#657E98]">
          <FontAwesomeIcon icon={faAngleLeft} size="xl" className="px-[20px]" onClick={handlePreviousMonth} />
        </div>
        <h1 className="text-2xl inter-bold">
          {currentDate.format("MMMM")} <span className="mx-2">{currentYear}</span>
        </h1>
        <div className="next absolute end-[35%] top-5 px-3 py-1 text-[#657E98]">
          <FontAwesomeIcon icon={faAngleRight} size="xl" className="px-[20px]" onClick={handleNextMonth} />
        </div>
      </div>

      <div className="week-calendar">
        <table className="edit-weeks">
          <thead>
            <tr>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <th key={idx} className="text-[20px] inter-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeksArray.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <td key={dayIndex}>
                    {day ? (
                      <div className="edit-select">
                        <div className="border-[2px] border-black h-9 text-center w-8 rounded-md flex justify-center items-center">
                          {day}
                        </div>
                        <SurgeonSelect
                          // day={dayjs(`${currentYear}-${currentMonth + 1}-${day}`).format("YYYY-MM-DD")}
                          day={dayjs.utc().year(currentYear).month(currentMonth).date(day).format("YYYY-MM-DD")}
                          surgeons={surgeons}
                          vacations={vacations}
                          office={office}
                          calendarEntries={calendarEntries}
                          formData={formData}
                          onChange={handleSelectChange}
                          onDeleteVacation={handleDeleteVacation}
                          onDeleteOffice={handleDeleteOffice}
                          entries={Object.values(calendarEntries)}
                        />
                      </div>
                    ) : (
                      <div className="empty-day"></div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const SurgeonSelect = ({ formData, day, surgeons, vacations, office, onChange, onDeleteOffice, onDeleteVacation, entries = [] }) => {

  const getOfficeInfo = (date) => {
    const officeGroups = office
      .filter(office => office.effective_date_start.includes(date))
      .reduce((acc, office) => {
        if (!acc[office.effective_date_start]) {
          acc[office.effective_date_start] = [];
        }
        acc[office.effective_date_start].push({ id: office.id, note: office.note });
        return acc;
      }, {});

    return officeGroups;
  };

  const officeGroups = getOfficeInfo(day);
  const officeNotes = new Set(
    Object.values(officeGroups).flat().map(o => o.note)
  );


  const getVacationInfo = (date) => {
    const vacationGroups = vacations
      .filter(vacation => vacation.vacation_dates.includes(date))
      .reduce((acc, vacation) => {
        if (!acc[vacation.vacation_type]) {
          acc[vacation.vacation_type] = [];
        }
        acc[vacation.vacation_type].push({ id: vacation.id, initial: vacation.user.initial });
        return acc;
      }, {});

    return vacationGroups;
  };

  const vacationGroups = getVacationInfo(day);
  const vacationedSurgeonsInitials = new Set(
    Object.values(vacationGroups).flat().map(v => v.initial)
  );

  const levels = ["1ST", "2ND", "O AM", "O PM"];
  const callTypes = ["surgeon_1st", "surgeon_2nd", "surgeon_o_am", "surgeon_o_pm"];

  const getSurgeonEntry = (callType, date) => {
    if (!entries) return null;
    const entry = entries.find(entry => dayjs(entry.date).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD"));
    if (entry && entry[callType]) {
      const surgeon = surgeons.find(surgeon => surgeon.id === entry[callType]);
      return surgeon;
    }
    return null;
  };

  return (
    <>
      {levels.map((level, idx) => {
        const callType = callTypes[idx];
        const surgeon = getSurgeonEntry(callType, day);
        const selectedSurgeonId = formData[day]?.[callType] || surgeon?.id || '';

        return (
          <div className="flex justify-between pt-2" key={idx}>
            <label htmlFor={`surgeon-${callType}`} className="text-red-500 w-[50px]">
              {level}
            </label>
            <div className="select-line mx-2"></div>
            <div className="sltc">
              <select
                name={callType}
                id={`surgeon-${callType}`}
                onChange={(e) => onChange(day, e)}
                value={selectedSurgeonId}
                aria-label={`Surgeon ${callType}`}
              >

                <option value="NULL"></option>

                {surgeon && (
                  <option value={surgeon.id}>
                    {surgeon.initial}
                  </option>
                )}

                {surgeons
                  .filter(
                    (s) =>
                      s.id !== selectedSurgeonId && // Exclude the selected surgeon
                      !vacationedSurgeonsInitials.has(s.initial) // Optionally exclude vacationed surgeons
                  )
                  .map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.initial}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        );
      })}


      <div className="edit-item pt-3">
        {Object.keys(vacationGroups).map(vacationType => (
          <div className="text-[14px] flex pt-[1px]" key={vacationType}>
            <div className="pe-5 text-[red] w-[70px]">{vacationType}</div>  {vacationGroups[vacationType].map(v => (
              <span className="px-1 relative" key={v.id}>{v.initial}
                <button
                  className="absolute dlt-x left-[-10px] top-[-5px] close ms-end border-2 border-white h-[30px] w-[30px] rounded-md bg-[#BE4A4E] mx-2 text-white"
                  onClick={() => onDeleteVacation(v.id, day)}
                  key={v.id}
                  id="close">
                  <FontAwesomeIcon icon={faXmark} size="lg"></FontAwesomeIcon>
                </button>
              </span>
            ))}
          </div>
        ))}

        {Object.keys(officeGroups).map((officeType) => (
          <div className="relative my-2 text-[14px] flex items-center" key={officeType}>
            <span>Closed</span>
            <button
              className="absolute  dlt-x left-0 w-[50px] bg-[#BE4A4E] text-white text-[12px] px-2 py-1 rounded"
              onClick={() => onDeleteOffice(officeGroups[officeType][0]?.id)} // Ensure ID is passed
            >
              <FontAwesomeIcon icon={faXmark} size="lg"></FontAwesomeIcon>
            </button>
          </div>
        ))}

      </div>
    </>
  );
};

export default EditWeekCalendar;
