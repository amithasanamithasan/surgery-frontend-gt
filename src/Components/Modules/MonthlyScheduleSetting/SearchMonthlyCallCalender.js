import React, { useState, useRef, useEffect } from "react";
import Header from "./FristHeader.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import CallCalender from "./CallCalender.js";
import VacationCalender from "./VacationCalender.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Constant from "../../../Constant.js";
import { AxiosAuthInstance } from "../../../AxiosInterceptors.js"
import Preloader from './../../Partials/preLoader';
function MonthlyCallCalender() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(dayjs().utc());
  const [surgeons, setSurgeons] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [office, setOffice] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get('date');

    if (dateParam) {
      const parsedDate = dayjs.utc(dateParam);
      setCurrentDate(parsedDate)
    }
  }, [location.search]);

  useEffect(() => {
    fetchEntries();
    fetchSurgeons();
    fetchVacations();
  }, [currentDate]);

  const fetchEntries = async () => {
    try {
      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/calendar-entries`, {
        params: {
          year: currentDate.year(), 
          month: currentDate.month() + 1,
          date: currentDate.format("YYYY-MM-DD"),
        },
      });
  
      console.log("Fetched entries:", response.data);
      setEntries(response.data.entries);
      setOffice(response.data.office);
    } catch (error) {
      console.error("Error fetching calendar entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurgeons = async () => {
    try {
      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/vacation/filter-surgeons`);
      setSurgeons(response.data);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
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
      }
    } catch (error) {
      console.error("Error fetching vacations:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  // const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
const firstDayOfMonth = dayjs.utc(currentDate).startOf("month").day() - 1; 
  const daysInMonth = dayjs.utc(currentDate).daysInMonth();

  const daysArray = [
    ...Array(firstDayOfMonth).fill(null), 
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  const weeksArray = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weeksArray.push(daysArray.slice(i, i + 5));
  }

  const handleMonthClick = (monthIndex) => {
    const newDate = dayjs().utc().set("month", monthIndex).set("year", currentYear);
    setCurrentDate(newDate);
    navigate(`/search-montly-schedule?date=${newDate.format("YYYY-MM-DD")}`);
  };

  const handlePreviousMonth = () => { setCurrentDate((prevDate) => prevDate.subtract(1, "month")); };
  const handleNextMonth = () => { setCurrentDate((prevDate) => prevDate.add(1, "month")); };
  const [isVisible1, setIsVisible1] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const toggleVisibility1 = () => { setIsVisible1(!isVisible1); };
  const toggleVisibility2 = () => { setIsVisible2(!isVisible2); };
  const divRef1 = useRef(null);
  const divRef2 = useRef(null);
  const handleClickOutside = (event) => {
    if (divRef1.current && !divRef1.current.contains(event.target)) { setIsVisible1(false); }
    if (divRef2.current && !divRef2.current.contains(event.target)) { setIsVisible2(false); }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleClose1 = () => { setIsVisible1(false); };
  const handleClose2 = () => { setIsVisible2(false); };
  if (loading) {
    return <Preloader />
  }
  return (
    <>
      <div className="bg-[#748BA2] content-center">
        <div className="global-centering relative w-[1400px] bg-white flex flex-wrap rounded-xl shadow-lg">
          <CallCalender
            isVisible1={isVisible1}
            divRef1={divRef1}
            handleClose1={handleClose1}
          />
          <VacationCalender
            isVisible2={isVisible2}
            divRef2={divRef2}
            handleClose2={handleClose2}
          />
          <Header toggles={toggleVisibility1} toggles1={toggleVisibility2} />
          <div className="w-[94%] mx-auto mt-[55px] mb-[65px]">
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
            <div id="call-calender">
              <div className="relative text-center">
                <div className="prev absolute start-[35%] top-0 px-3 py-1 text-[#657E98]" id="icon-arrow-print">
                  <FontAwesomeIcon
                    icon={faAngleLeft}
                    size="xl"
                    className="px-[20px]"
                    onClick={handlePreviousMonth}
                  />
                </div>
                <h1 className="text-[24px] inter-bold" id="print-title">
                  {currentDate.format("MMMM")} <span className="mx-2">{currentYear}</span>
                </h1>
                <div className="next absolute end-[35%] top-0 px-3 py-1 text-[#657E98]" id="icon-arrow-print">
                  <FontAwesomeIcon
                    icon={faAngleRight}
                    size="xl"
                    className="px-[20px]"
                    onClick={handleNextMonth}
                  />
                </div>
              </div>
              <div className="week-calender ">
                <table className="weeks">
                  <thead>
                    <tr>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => (
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
                              <div className="edit-select pt-5">
                                <div className="absolute top-0 right-5 inter-bold">
                                  {day}
                                </div>
                                <SurgeonSelect
                                  // day={dayjs.utc(`${currentYear}-${currentMonth + 1}-${day}`).format("YYYY-MM-DD")}
                                  day={dayjs.utc().year(currentYear).month(currentMonth).date(day).format("YYYY-MM-DD")}
                                  surgeons={surgeons}
                                  vacations={vacations}
                                  entries={entries}
                                  office={office}
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
            </div>
          </div>
          <Link to="/block-calender" className="msg-submit rounded-md bg-[#B4C6D9] py-3 text-center inter-medium text-[24px]  w-[50%] absolute bottom-[-25px] left-0 right-0 m-auto"> View Block Time Calender </Link>
        </div>
      </div>
      {/* <Preloads /> */}
    </>
  );
}

const SurgeonSelect = ({ day, surgeons, vacations, entries, office }) => {
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

  const getOfficeInfo = (date) => {
    const officeGroups = office
      .filter(office => office.effective_date_start.includes(date))
      .reduce((acc, office) => {
        if (!acc[office.effective_date_start]) {
          acc[office.effective_date_start] = [];
        }
        acc[office.effective_date_start].push({ note: office.note });
        return acc;
      }, {});

    return officeGroups;
  };

  const officeGroups = getOfficeInfo(day);
  const officeNotes = new Set(
    Object.values(officeGroups).flat().map(o => o.note)
  );

  const levels = ["1st", "2nd", "O AM", "O PM"];
  const callTypes = ["surgeon_1st", "surgeon_2nd", "surgeon_o_am", "surgeon_o_pm", "none"];

  const getSurgeonEntry = (callType, date) => {
    console.log("Date for entry lookup:", dayjs(date).format("YYYY-MM-DD"));
    const entry = entries.find(entry => dayjs.utc(entry.date).format("YYYY-MM-DD") == dayjs(date).format("YYYY-MM-DD"));
    console.log("Found entry:", entry);
    if (entry && entry[callType]) {
      const surgeon = surgeons.find(surgeon => surgeon.id === entry[callType]);
      console.log("Found surgeon:", surgeon);
      return surgeon;
    }
    return null;
  };

  return (
    <>
      {levels.map((level, idx) => {
        const callType = callTypes[idx];
        const surgeon = getSurgeonEntry(callType, day);
        if (!surgeon) return null;
        return (
          <div className="flex spx items-center pt-1" key={idx}>
            <label htmlFor={`surgeon-${callType}`} className="me-2 text-[18px] inter-medium">
              {level}
            </label>
            <div className="sltc text-[18px] inter-bold">
              {surgeon ? surgeon.initial : " "}
            </div>
          </div>
        );
      })}

      {Object.keys(vacationGroups).length > 0 && (
        <div className="edit-item pt-1">
          {Object.keys(vacationGroups).map(vacationType => (
            <div className="text-[14px]" key={vacationType}>
              <div className="text-[pink] pink-colors">
                {vacationType} <span className="inter-bold">{vacationGroups[vacationType].map(v => v.initial).join(' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(officeGroups).length > 0 ? (
        <div>
          <p className="text-[14px] text-[pink] pink-colors">
            Closed
          </p>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default MonthlyCallCalender;
