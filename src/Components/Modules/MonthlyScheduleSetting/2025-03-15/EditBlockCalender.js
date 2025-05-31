import React, { useState, useEffect, useRef } from 'react';
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Constant from "../../../Constant";
import Preloader from "../../Partials/preLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const TimeInputRow = ({ weekNumber, namePrefix, formData, handleChange, location, weekdayIdx, checkboxStates, handleCheckboxChange, date, isDisabled }) => {
  const checkboxKey = `${location}-${date}-${weekdayIdx}-${weekNumber}`;
  const isChecked = checkboxStates[checkboxKey] || !!formData[location]?.[date];
  const startHourRef = useRef(null);
  const startMinuteRef = useRef(null);
  const endHourRef = useRef(null);
  const endMinuteRef = useRef(null);

  const handleHourChange = (e) => {
    if (isDisabled) return;
    if (e.target.value.length > 2) {
      e.target.value = e.target.value.slice(0, 2);
    }
    handleChange(e, location, date);
    if (e.target.name.includes("startHour") && e.target.value.length === 2) {
      startMinuteRef.current.focus();
    } else if (e.target.name.includes("startMinute") && e.target.value.length === 2) {
      endHourRef.current.focus();
    } else if (e.target.name.includes("endHour") && e.target.value.length === 2) {
      endMinuteRef.current.focus();
    }
  };

  return (
    <div className={`btc list-it py-3 flex items-center selece-none ${isDisabled ? "pointer-events-none" : ""}`}>
      <input
        type="checkbox"
        id={`checkbox${checkboxKey}`}
        className={`me-2 hidden ${isChecked ? "" : "deactive"}`}
        checked={isChecked}
        onChange={handleCheckboxChange(location, weekdayIdx, weekNumber, date)}
        disabled={isDisabled}
      />
      <label htmlFor={`checkbox${checkboxKey}`} className={`flex items-center cursor-pointer text-[14px] ${isDisabled ? 'opacity-50' : ''}`}>
        <span className="checkbox-inners flex items-center justify-center text-transparent border-2 border-gray-300 rounded-full me-1"></span>
        <p className={`${isChecked ? "" : "deactive"}`}>WK {weekNumber}</p>
      </label>
      <div className={`inter-bold text-[14px] flex items-center ${isDisabled ? 'opacity-50' : ''} ${isChecked ? "" : "deactive"}`}>
        <div className="w-[68px] mx-1 border-2 border-black rounded-md text-center text-[16px] inter-medium flex items-center justify-between">
          <input
            type="number"
            min="1"
            max="12"
            placeholder="00"
            className="w-[29px] rounded-md px-1 text-center text-[16px] inter-medium outline-none border-none no-number-spin"
            name={`${namePrefix}${weekNumber}startHour`}
            value={formData[location]?.[date]?.[`${namePrefix}${weekNumber}startHour`] || ""}
            onChange={(e) => {
              if (isDisabled) return;
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={startHourRef}
            disabled={isDisabled}
          />
          <span>:</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="00"
            className="w-[29px] rounded-md px-1 text-center text-[16px] inter-medium outline-none border-none no-number-spin"
            name={`${namePrefix}${weekNumber}startMinute`}
            value={formData[location]?.[date]?.[`${namePrefix}${weekNumber}startMinute`] || ""}
            onChange={(e) => {
              if (isDisabled) return;
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={startMinuteRef}
            disabled={isDisabled}
          />
        </div>
        -
        <div className="w-[68px] mx-1 border-2 border-black rounded-md text-center text-[16px] inter-medium flex items-center justify-between">
          <input
            type="number"
            min="1"
            max="12"
            placeholder="00"
            className="w-[29px] rounded-md px-1 text-center text-[16px] inter-medium outline-none border-none no-number-spin"
            name={`${namePrefix}${weekNumber}endHour`}
            value={formData[location]?.[date]?.[`${namePrefix}${weekNumber}endHour`] || ""}
            onChange={(e) => {
              if (isDisabled) return;
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={endHourRef}
            disabled={isDisabled}
          />
          <span>:</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="00"
            className="w-[29px] rounded-md px-1 text-center text-[16px] inter-medium outline-none border-none no-number-spin"
            name={`${namePrefix}${weekNumber}endMinute`}
            value={formData[location]?.[date]?.[`${namePrefix}${weekNumber}endMinute`] || ""}
            onChange={(e) => {
              if (isDisabled) return;
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={endMinuteRef}
            disabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
};

const EditBlockCalendar = () => {
  const [errors, setErrors] = useState({});
  const [checkboxStates, setCheckboxStates] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [entries, setEntries] = useState({});
  const [formData, setFormData] = useState({
    MOR: {},
    HOSC: {},
    ROBOT: {}
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [success1, setSuccess1] = useState(false);

  // Date calculations
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  // const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = dayjs.utc().year(currentYear).month(currentMonth).daysInMonth();
  const firstDayOfMonth = dayjs.utc().year(currentYear).month(currentMonth).startOf('month').day();

  // Generate days array
  const daysArray = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      dayjs()
        .year(currentYear)
        .month(currentMonth)
        .date(i + 1)
        .format("YYYY-MM-DD")
    ),
  ];
  const remainingDays = daysArray.length % 7;
  if (remainingDays !== 0) daysArray.push(...Array(7 - remainingDays).fill(null));

  console.log(daysArray);
  // Complete weeks


  const weeksArray = [];
  for (let i = 0; i < daysArray.length; i += 7) weeksArray.push(daysArray.slice(i, i + 7));
  console.log(weeksArray);

  // Navigation handlers
  const handlePreviousMonth = () => setCurrentDate(prev => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(prev => prev.add(1, "month"));

  const fetchMonthData = async (year, month) => {
    setLoading(true);
    try {
      const response = await AxiosAuthInstance.get(`/block-calendar?year=${year}&month=${month + 1}`);
      const { locations, checkboxStates } = response.data[0] || {};
      setFormData({
        MOR: locations?.MOR || {},
        HOSC: locations?.HOSC || {},
        ROBOT: locations?.ROBOT || {},
      });
      setCheckboxStates(checkboxStates || {});
      setEntries(response.data);
    } catch (error) {
      setErrors({ message: 'Failed to load data for the selected month.' });
    } finally {
      setLoading(false);
    }
  };
  const handleMonthClick = (monthIndex) => {
    setSuccess(false);
    setSuccess1(false);
    const newDate = dayjs().set("month", monthIndex).set("year", currentYear);
    setCurrentDate(newDate);
    fetchMonthData(newDate.year(), newDate.month());
  };
  const handleCheckboxChange = (location, weekdayIdx, weekNumber, date) => (e) => {
    if (!date) return; // Prevent changes for disabled fields
    const key = `${location}-${date}-${weekdayIdx}-${weekNumber}`;
    setCheckboxStates((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const handleChange = (e, location, date) => {
    if (!date) return; // Prevent changes for disabled fields
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [location]: {
        ...prevData[location],
        [date]: {
          ...prevData[location]?.[date],
          [name]: value
        }
      }
    }));
  };

  const addBlockMonthData = async () => {
    setLoading(true);
    setErrors({});
    try {
      await AxiosAuthInstance.post("/block-calendar", {
        month: currentDate.format('YYYY-MM'),
        locations: formData
      });
      setSuccess(true);
      fetchMonthData(currentYear, currentMonth);
    } catch (error) {
      setErrors({ message: error.response?.data?.message || "Failed to save data." });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMonthData(currentYear, currentMonth);
  }, [currentDate]);

  // Code for Effective Start Date 
  const [formBlockData, setFormBlockData] = useState({
    note: "BlockTime",
    effective_date_start: "",
    create_by: false,
  });

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const [blockStartDay, setBlockStartDay] = useState("");
  const [blockStartMonth, setBlockStartMonth] = useState("");
  const [blockStartYear, setBlockStartYear] = useState("");

  const handleBlockSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const effective_date_start = `${blockStartYear}-${blockStartMonth}-${blockStartDay}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-ofice-close-data`,
        {
          ...formBlockData,
          effective_date_start: effective_date_start,
          note: "BlockTime",
        }
      );

      setSuccess1(true);
      setFormBlockData({
        note: "BlockTime",
        blockStartDay: "",
        blockStartMonth: "",
        blockStartYear: "",
        create_by: false,
      });
      setBlockStartDay("");
      setBlockStartMonth("");
      setBlockStartYear("");

      setErrors({});
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        console.error("Error response data:", error.response.data.errors);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error adding office close data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFormBlock = (e) => {
    e.preventDefault();
    setBlockStartDay("");
    setBlockStartMonth("");
    setBlockStartYear("");
    setErrors({});
    setSuccess(false);
    setSuccess1(false);
  };

  return (
    <div className="h-fit py-40 bg-[#748BA2] content-center">
      <div className="relative w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
        <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[1165px] top-[-35px] py-5 text-center rounded-xl flex justify-between items-center px-10">
          <div className="left flex items-center">
            <Link
              to="/dashboard"
              className="svgx flex justify-item-start h-[35px] w-[35px] justify-center items-center rounded bg-white text-[#657E98] hover:bg-[#657E98] hover:transition hover:duration-300"
            >
              <svg
                id="Group_63"
                data-name="Group 63"
                xmlns="http://www.w3.org/2000/svg"
                width="26.19"
                height="23.833"
                viewBox="0 0 26.19 23.833"
              >
                <defs>
                  <clipPath id="clip-path">
                    <rect
                      id="Rectangle_59"
                      data-name="Rectangle 59"
                      width="26.19"
                      height="23.833"
                      transform="translate(0 0)"
                      fill="#657e98"
                    />
                  </clipPath>
                </defs>
                <g
                  id="Group_61"
                  data-name="Group 61"
                  transform="translate(0 0)"
                  clip-path="url(#clip-path)"
                >
                  <path
                    id="Path_10"
                    data-name="Path 10"
                    d="M25.926,12.63,21,7.657V1.577a.327.327,0,0,0-.327-.327H18.309a.327.327,0,0,0-.327.327V4.608L13.59.177a.613.613,0,0,0-.869,0L.267,12.63A.912.912,0,0,0,1.2,14.141h0l2.6-.885v9.822a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V15.621h5.927v7.457a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V13.292l2.43.829a.912.912,0,0,0,.981-1.491"
                    transform="translate(0 0.005)"
                    fill="#657e98"
                  />
                </g>
              </svg>
            </Link>
            <Link to="/montly-schedule">
              <button className="border-none w-[190px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]">
                Call Calendar View
              </button>
            </Link>
          </div>
          <h1 className="inter-medium text-[24px]">Block Time Calendar</h1>
          <div className="right flex items-center">
            <Link to="/block-calender">
              <button
                className="bg-white h-[35px] w-[35px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative me-2"
              >
                <img
                  src="assets/images/back.png"
                  alt="Original Image"
                  className="block"
                />
                <img
                  src="assets/images/back-hover.png"
                  alt="Hover Image"
                  className="absolute hover-img"
                />
              </button>
            </Link>
            <button
              onClick={addBlockMonthData}
              className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <div className="w-[1286px] mx-auto pt-[4%]">
          <div className="monthly-call flex justify-between py-5">
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
        </div>
        <div className="w-[1286px] mx-auto pb-[5%]">
          <div className="relative text-center pt-10 pb-5">
            <div className="relative text-center">
              <FontAwesomeIcon
                icon={faAngleLeft}
                size="xl"
                className="absolute left-[35%] top-0 px-3 py-1 text-[#657E98] cursor-pointer"
                onClick={handlePreviousMonth}
              />
              <h1 className="text-[24px] inter-bold">
                {currentDate.format("MMMM")} <span className="mx-2">{currentYear}</span>
              </h1>
              <FontAwesomeIcon
                icon={faAngleRight}
                size="xl"
                className="absolute right-[35%] top-0 px-3 py-1 text-[#657E98] cursor-pointer"
                onClick={handleNextMonth}
              />
            </div>
          </div>

          {errors.message && <div className="text-red-500 text-center mt-4">{errors.message}</div>}
          {success && <div className="text-green-500 text-center mt-4">Data saved successfully!</div>}

          <div className="block-calender w-[1295px]">
            <table className="blocksd" id="block-calender">
              <thead>
                <tr>
                  <th>Location</th>
                  {["Monday", "Tuesday", "Wednessday", "Thrusday", "Friday"].map((day, idx) => (
                    <th key={idx}>{day}</th>
                  ))}
                </tr>
              </thead>

              {/* MOR Section */}
              <tbody>
                {weeksArray.map((week, weekIndex) => (
                  <tr key={`mor-${weekIndex}`}>
                    {weekIndex === 0 && <td rowSpan={weeksArray.length} className="locations">MOR</td>}
                    {week.slice(1, 6).map((date, dayIndex) => (
                      <td key={`mor-${weekIndex}-${dayIndex}`}>
                        <TimeInputRow
                          weekNumber={Math.ceil((weekIndex * 7 + dayIndex + 1) / 7)}
                          namePrefix={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex + 1]}-Wk`}
                          date={date || 'invalid-date'}
                          location="MOR"
                          entries={entries}
                          weekdayIdx={dayIndex}
                          formData={formData}
                          handleChange={handleChange}
                          handleCheckboxChange={handleCheckboxChange}
                          checkboxStates={checkboxStates}
                          isDisabled={!date}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              {/* HOSC Section */}
              <tbody>
                {weeksArray.map((week, weekIndex) => (
                  <tr key={`hosc-${weekIndex}`}>
                    {weekIndex === 0 && <td rowSpan={weeksArray.length} className="locations">HOSC</td>}
                    {week.slice(1, 6).map((date, dayIndex) => (
                      <td key={`hosc-${weekIndex}-${dayIndex}`}>
                        <TimeInputRow
                          weekNumber={Math.ceil((weekIndex * 7 + dayIndex + 1) / 7)}
                          namePrefix={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex + 1]}-Wk`}
                          date={date || 'invalid-date'}
                          entries={entries}
                          location="HOSC"
                          weekdayIdx={dayIndex}
                          formData={formData}
                          handleChange={handleChange}
                          handleCheckboxChange={handleCheckboxChange}
                          checkboxStates={checkboxStates}
                          isDisabled={!date}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              {/* ROBOT Section */}
              <tbody>
                {weeksArray.map((week, weekIndex) => (
                  <tr key={`robot-${weekIndex}`}>
                    {weekIndex === 0 && <td rowSpan={weeksArray.length} className="locations">ROBOT</td>}
                    {week.slice(1, 6).map((date, dayIndex) => (
                      <td key={`robot-${weekIndex}-${dayIndex}`}>
                        <TimeInputRow
                          weekNumber={Math.ceil((weekIndex * 7 + dayIndex + 1) / 7)}
                          namePrefix={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex + 1]}-Wk`}
                          date={date || 'invalid-date'}
                          entries={entries}
                          location="ROBOT"
                          weekdayIdx={dayIndex}
                          formData={formData}
                          handleChange={handleChange}
                          handleCheckboxChange={handleCheckboxChange}
                          checkboxStates={checkboxStates}
                          isDisabled={!date}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Effective Date Form */}
            <form onSubmit={handleBlockSave}>
              <div className="bg-[#F9F9F9] text-center h-[90px] w-[1135px] m-auto rounded-md flex items-center justify-between my-[30px] px-[65px]">
                <div className="dates flex">
                  <h1 className="text-left inter-medium text-[20px] w-[250px]">
                    Effective Start Date
                  </h1>
                  <div className="dmy flex items-center bg-white">
                    <input
                      className="py-2 text-center focus:outline-none w-[80px]"
                      type="text"
                      placeholder="MM"
                      value={blockStartMonth}
                      onChange={(e) => setBlockStartMonth(e.target.value)}
                      required
                    />
                    <span>/</span>
                    <input
                      className="py-2 text-center focus:outline-none w-[80px]"
                      type="text"
                      placeholder="DD"
                      value={blockStartDay}
                      onChange={(e) => setBlockStartDay(e.target.value)}
                      required
                    />
                    <span>/</span>
                    <input
                      className="py-2 text-center focus:outline-none w-[80px]"
                      type="text"
                      placeholder="YYYY"
                      value={blockStartYear}
                      onChange={(e) => setBlockStartYear(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="action-icon flex">
                  <button
                    type="submit"
                    className="h-[35px] w-[205px] border-2 rounded-md bg-[#B4C6D9] mx-2 text-white hover:bg-[#657E98]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="h-[35px] w-[205px] border-2 rounded-md border-none bg-[#D8ADAD] mx-2 hover:bg-[#B87D7D]"
                    onClick={() => {
                      setBlockStartDay("");
                      setBlockStartMonth("");
                      setBlockStartYear("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
            {errors.effective_date_start ? (
              <div className='bg-[#F9F9F9] mt-[-20px] h-[40px] w-[1135px] m-auto rounded-md flex items-center justify-between px-[65px]'>
                <p className="text-red-800">
                  <small>{errors.effective_date_start[0]}</small>
                </p>
              </div>
            ) : success1 ? (
              <div className='bg-[#F9F9F9] mt-[-20px] h-[40px] w-[1135px] m-auto rounded-md flex items-center justify-between px-[65px]'>
                <p className="text-green-800">
                  <small>Effective Start Date saved successfully!</small>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlockCalendar;