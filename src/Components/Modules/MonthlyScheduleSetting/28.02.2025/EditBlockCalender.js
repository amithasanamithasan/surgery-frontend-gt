import React, { useState, useEffect, useRef } from 'react';
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Constant from "../../../Constant";

const TimeInputRow = ({ weekNumber, namePrefix, formData, handleChange, location, weekdayIdx, checkboxStates, handleCheckboxChange, date }) => {
  const checkboxKey = `${location}-${date}-${weekdayIdx}-${weekNumber}`;
  const isChecked = checkboxStates[checkboxKey] || !!formData[location]?.[date];
  const startHourRef = useRef(null);
  const startMinuteRef = useRef(null);
  const endHourRef = useRef(null);
  const endMinuteRef = useRef(null);
  const handleHourChange = (e) => {
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
    <div className="btc list-it py-3 flex items-center">
      <input
        type="checkbox"
        id={`checkbox${checkboxKey}`}
        className="me-2 hidden"
        checked={isChecked}
        //checked={checkboxStates[checkboxKey] || false}
        //checked={!!formData[location]}
        onChange={handleCheckboxChange(location, weekdayIdx, weekNumber, date)}
      />
      <label htmlFor={`checkbox${checkboxKey}`} className="flex items-center cursor-pointer text-[14px]">
        <span className="checkbox-inners flex items-center justify-center text-transparent border-2 border-gray-300 rounded-full me-1"></span>
        <p className={`${isChecked ? "" : "deactive"}`}>WK {weekNumber}</p>
      </label>
      <div className={`inter-bold text-[14px] flex items-center  ${isChecked ? "" : "deactive"}`}>
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
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={startHourRef}
          //disabled={!checkboxStates[checkboxKey]}
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
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={startMinuteRef}
          //disabled={!checkboxStates[checkboxKey]}
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
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={endHourRef}
          //disabled={!checkboxStates[checkboxKey]}
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
              handleChange(e, location, date);
              handleHourChange(e);
            }}
            ref={endMinuteRef}
          //disabled={!checkboxStates[checkboxKey]}
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
  console.log("Form Data:", formData);
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const weekdayCounts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
  const weekdayWeeks = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
  const weekdayDates = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };

  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(new Date(currentYear, currentMonth, day));
    const weekday = dayjs(new Date(currentYear, currentMonth, day)).format('dddd');
    if (weekday in weekdayDates) {
      const dateStr = date.format('YYYY-MM-DD');
      weekdayDates[weekday].push(dateStr);
    }

    if (weekday in weekdayCounts) {
      weekdayCounts[weekday]++;
      const weekNumber = Math.ceil(day / 7);
      weekdayWeeks[weekday].push(weekNumber);
    }
  }

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
    const key = `${location}-${date}-${weekdayIdx}-${weekNumber}`;
    setCheckboxStates((prev) => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };

  const handleChange = (e, location, date) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (!newData[location]) {
        newData[location] = {};
      }
      if (!newData[location][date]) {
        newData[location][date] = {};
      }
      if (type === "checkbox" || type === "radio") {
        newData[location][date][name] = checked ? value : "";
      } else {
        newData[location][date][name] = value;
      }
      return newData;
    });
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [success1, setSuccess1] = useState(false);

  const addBlockMonthData = async () => {
    setLoading(true);
    setErrors({});
    setSuccess(false);
    setSuccess1(false);
    //setFormData({});
    const updatedFormData = {
      MOR: formData.MOR || {},
      HOSC: formData.HOSC || {},
      ROBOT: formData.ROBOT || {},
    };
    console.log("Updated Form Data:", updatedFormData);
    try {
      const response = await AxiosAuthInstance.post("/block-calendar", {
        month: currentDate.format('YYYY-MM'),
        //locations: formData
        locations: updatedFormData,
      });
      console.log("Data saved successfully:", response.data);
      setSuccess(true);
      fetchMonthData(currentYear, currentMonth);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors({ message: error.response.data.message });
      } else {
        setErrors({ message: "Failed to save data." });
      }
      console.error("Error saving data:", error);
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
      <div className="relative w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl">
        <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[1165px] top-[-35px] py-5 text-center rounded-xl flex justify-between items-center px-10">
          <div className="left flex items-center content-center justify-item-center">
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
              <button
                type="button"
                className="border-none w-[190px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
              >
                Call Calendar View
              </button>
            </Link>
          </div>
          <h1 className="flex inter-medium text-[24px] items-center content-center justify-item-center">
            Block Time Calendar
          </h1>
          <div className="right flex items-center content-center justify-item-center">
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
              type="submit"
              onClick={addBlockMonthData}
              className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <div className="w-[1286px] mx-auto pt-[4%] pb-[5%]">
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

          {errors.message && <div className="text-red-500 text-center mt-4"> {errors.message} </div>}
          {success && <div className="text-green-500 text-center mt-4"> Data saved successfully! </div>}

          <div className="week-calendar w-[1295px]">
            <table className="blocksd" id="block-calender">
              <thead>
                <tr>
                  <th>Location</th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((weekday, idx) => (
                    <th key={idx}>{weekday}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["MOR", "HOSC", "ROBOT"].map((location, idx) => (
                  <tr key={idx}>
                    <th className="borders inter-bold text-[15px]">{location}</th>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((weekday, weekdayIdx) => (
                      <td key={weekdayIdx}>
                        {weekdayDates[weekday].map((date, dateIdx) => {
                          // Compute week number based on the date
                          const weekNumber = weekdayWeeks[weekday][dateIdx] || 1;
                          return (
                            <TimeInputRow
                              key={`${location}-${date}-${weekdayIdx}-${weekNumber}`}
                              weekNumber={weekNumber}
                              namePrefix={`${weekday}-Wk`}
                              entries={entries}
                              date={date}
                              location={location}
                              weekdayIdx={weekdayIdx}
                              formData={formData}
                              handleChange={handleChange}
                              handleCheckboxChange={handleCheckboxChange}
                              checkboxStates={checkboxStates}
                            />
                          );
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <form onSubmit={handleBlockSave}>
              <div className="bg-[#F9F9F9] text-center h-[90px] w-[1135px] m-auto rounded-md flex items-center justify-between my-[30px] px-[65px]">
                {/* {errors.effective_date_start && <p className="text-red-800"><small>{errors.effective_date_start[0]}</small></p>} */}
                <div className="dates flex">
                  <h1 className="text-left inter-medium text-[20px] w-[250px]">
                    Effective Start Date
                  </h1>
                  <div className="dmy flex items-center bg-white">
                    <input
                      className=" py-2 text-center focus:outline-none w-[80px]"
                      type="text"
                      placeholder="MM"
                      name="blockStartMonth"
                      value={blockStartMonth}
                      onChange={handleDateChange(setBlockStartMonth)}
                      required
                    />
                    <span>/</span>
                    <input
                      className=" py-2 text-center focus:outline-none w-[80px]"
                      type="text"
                      placeholder="DD"
                      name="blockStartDay"
                      value={blockStartDay}
                      onChange={handleDateChange(setBlockStartDay)}
                      required
                    />
                    <span>/</span>
                    <input
                      className=" py-2 text-center focus:outline-none w-[80px]"
                      type="text"
                      placeholder="YYYY"
                      name="blockStartYear"
                      value={blockStartYear}
                      onChange={handleDateChange(setBlockStartYear)}
                      required
                    />
                  </div>
                </div>
                <div className="action-icon flex">
                  <button
                    type="submit"
                    className="ms-end h-[35px] w-[205px] border-2 rounded-md bg-[#B4C6D9] mx-2 text-white hover:bg-[#657E98] hover:text-white"
                  >
                    Save
                  </button>
                  <button
                    className="close ms-end h-[35px] w-[205px] border-2 rounded-md border-none bg-[#D8ADAD] mx-2 hover:bg-[#B87D7D] hover:text-white"
                    id="close"
                    onClick={handleClearFormBlock}
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
