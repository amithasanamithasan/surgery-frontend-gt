import React, { useState, useEffect, useRef, Fragment } from 'react';
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Constant from "../../../Constant";
import DefaultLocations from "../../../utils/BlockCalendarStc"
import { useImmer } from "use-immer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft, faClose, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import WarningModalDelete, { warningDelete } from "./WarningModalDelete";

const InputRow = ({ week_key, times, handleChange, day_key, location_name, checkboxStates, handleCheckboxChange, entries }) => {
  const checkboxKey = `${location_name}-${day_key}-${week_key}`;
  const hasValue = times.startHour || times.startMinute || times.endHour || times.endMinute;
  // const isChecked = checkboxStates[checkboxKey] || hasValue;
  const isChecked = checkboxStates[checkboxKey] ?? hasValue;
  const startHourRef = useRef(null);
  const startMinuteRef = useRef(null);
  const endHourRef = useRef(null);
  const endMinuteRef = useRef(null);

  const handleHourChange = (e) => {
    let { name, value } = e.target;
    // Ensure only two characters are allowed
    value = value.slice(0, 2);
    e.target.value = value;
    // Move focus to the next input when two characters are entered
    if (value.length === 2) {
      if (name === "startHour") {
        startMinuteRef.current?.focus();
      } else if (name === "startMinute") {
        endHourRef.current?.focus();
      } else if (name === "endHour") {
        endMinuteRef.current?.focus();
      } else if (name === "endMinute") {
        e.target.blur(); //Remove focus after entering endMinute
      }
    }
  };

  return (
    <>
      <div className={`btc list-it py-3 selece-none`}>
        <input
          type="checkbox"
          id={`checkbox-${checkboxKey}`}
          className={`me-2 hidden ${isChecked ? "" : "deactive"}`}
          checked={isChecked}
          onChange={(e) => {
            handleCheckboxChange(location_name, day_key, week_key)(e);
          }}
        />
        <label htmlFor={`checkbox-${checkboxKey}`} className={`flex items-center cursor-pointer text-[14px] pb-[5px]`}>
          <span className={`${isChecked ? "" : "deactive"} checkbox-inners flex items-center justify-center text-transparent border-2 border-gray-300 rounded-full me-1`}></span>
          <p className={`${isChecked ? "" : "deactive"}`}>WK {week_key + 1}</p>
        </label>
        <div className={`inter-bold text-[14px] flex items-center ${isChecked ? "" : "deactive"}`}>
          <div className="w-[95px] mx-1 border-2 border-black rounded-md text-center inter-medium flex items-center justify-between">
            <input
              type="number"
              name="startHour"
              placeholder="00"
              className="w-[26px] rounded-md px-1 text-center inter-medium outline-none border-none no-number-spin"
              value={times.startHour || ''}
              onChange={(e) => {
                handleChange(e, location_name, day_key, week_key);
                handleHourChange(e);
              }}
              ref={startHourRef}
            />
            <span className={`text-black ${!isChecked ? "text-gray-300" : ""}`}>:</span>
            <input
              type="number"
              name="startMinute"
              placeholder="00"
              className="w-[26px] rounded-md px-1 text-center inter-medium outline-none border-none no-number-spin"
              value={times.startMinute || ''}
              onChange={(e) => {
                handleChange(e, location_name, day_key, week_key);
                handleHourChange(e);
              }}
              ref={startMinuteRef}
            />
            <span className={`text-black ${!isChecked ? "text-gray-300" : ""}`}>:</span>
            <select
              className={`no-arrow ${isChecked ? "" : "text-gray-100"}`}
              value={times.startPeriod || 'AM'}
              name="startPeriod"
              onChange={(e) => {
                handleChange(e, location_name, day_key, week_key);
              }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          -
          <div className="w-[95px] mx-1 border-2 border-black rounded-md text-center inter-medium flex items-center justify-between">
            <input
              type="number"
              name='endHour'
              placeholder="00"
              className="w-[26px] rounded-md px-1 text-center inter-medium outline-none border-none no-number-spin"
              value={times.endHour || ''}
              onChange={(e) => {
                handleChange(e, location_name, day_key, week_key);
                handleHourChange(e);
              }}
              ref={endHourRef}
            />
            <span className={`text-black ${!isChecked ? "text-gray-300" : ""}`}>:</span>
            <input
              type="number"
              name='endMinute'
              placeholder="00"
              className="w-[26px] rounded-md px-1 text-center inter-medium outline-none border-none no-number-spin"
              value={times.endMinute || ''}
              onChange={(e) => {
                handleChange(e, location_name, day_key, week_key);
                handleHourChange(e);
              }}
              ref={endMinuteRef}
            />
            <span className={`text-black ${!isChecked ? "text-gray-300" : ""}`}>:</span>
            <select
              className={`no-arrow ${isChecked ? "" : "text-gray-100"}`}
              value={times.endPeriod || 'AM'}
              name="endPeriod"
              onChange={(e) => {
                handleChange(e, location_name, day_key, week_key);
              }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}
const EditBlockCalendar = () => {
  const [errors, setErrors] = useState({});
  const [errorsBlock, setErrorsBlock] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [checkboxStates, setCheckboxStates] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [entries, setEntries] = useImmer(DefaultLocations);
  const [warningDelete, setWarningDelete] = useState(false);
  const [blockEffective, setBlockEffective] = useState(null);
  const [lastAvailableBlock, setLastAvailableBlock] = useState(null);
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
      setEntries(response.data.locations ?? DefaultLocations);
    } catch (error) {
      setErrors({ message: 'Failed to load data for the selected month.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = (monthIndex) => {
    setCheckboxStates(false);
    setSuccess(false);
    setSuccess1(false);
    const newDate = dayjs().set("month", monthIndex).set("year", currentYear);
    setCurrentDate(newDate);
    fetchMonthData(newDate.year(), newDate.month());
    console.log(currentDate)
  };
  const handlePreviousMonth = () => setCurrentDate(prev => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(prev => prev.add(1, "month"));

  // const handleCheckboxChange = (location_name, day_key, week_key) => (e) => {
  //   const key = `${location_name}-${day_key}-${week_key}`;
  //   setCheckboxStates((prev) => ({ ...prev, [key]: e.target.checked }));
  // };
  const handleCheckboxChange = (location_name, day_key, week_key) => (e) => {
    const key = `${location_name}-${day_key}-${week_key}`;
    const isChecked = e.target.checked;
    setCheckboxStates((prev) => ({ ...prev, [key]: isChecked }));
  
    if (!isChecked) {
      setEntries(draft => {
        const timeEntry = draft[location_name][day_key].times[week_key];
        timeEntry.startHour = null;
        timeEntry.startMinute = null;
        timeEntry.endHour = null;
        timeEntry.endMinute = null;
        // Optional: Clear periods if needed
        // timeEntry.startPeriod = null;
        // timeEntry.endPeriod = null;
      });
    }
  };

  const handleChange = (e, location, day_key, week_key) => {
    const name = e.target.name;
    const value = e.target.value;
    setEntries(draft => {
      draft[location][day_key].times[week_key][name] = value
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
    const updatedFormData = entries;
    console.log("Updated Form Data:", updatedFormData);
    // return
    try {
      const response = await AxiosAuthInstance.post("/block-calendar", {
        month: currentDate.format('YYYY-MM'),
        //locations: formData
        locations: entries,
      });
      console.log("Data saved successfully:", response.data);
      setSuccess(true);
      fetchMonthData(currentYear, currentMonth);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors({ message: error.response.data.message });
      } else if (error.response && error.response.status === 422) {
        setErrors({ message: error.response.data.message });
      }
      else {
        setErrors({ message: "Failed to save data." });
      }
      console.error("Error saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockEffectiveData(currentYear, currentMonth + 1);
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
  const fetchBlockEffectiveData = async (year, month) => {
    setLoading(true);
    try {
      const response = await AxiosAuthInstance.get(`/block-calender-effective-date-show`, {
        params: { year, month },
      });

      if (response.data) {
        // Only update the state if the fetched block is different
        if (!blockEffective || blockEffective.id !== response.data.id) {
          setBlockEffective(response.data);
          setLastAvailableBlock(response.data); // Store for future use
        }
      }
    } catch (error) {
      console.error("API Error:", error);

      // If no new block found, keep showing the last known block
      if (lastAvailableBlock) {
        setBlockEffective(lastAvailableBlock);
      } else {
        setErrorsBlock({ message: "No block data available." });
      }
    } finally {
      setLoading(false);
    }
  };
  const [blockStartDay, setBlockStartDay] = useState("");
  const [blockStartMonth, setBlockStartMonth] = useState();
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
      // setBlockStartDay("");
      // setBlockStartMonth("");
      // setBlockStartYear("");

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

  useEffect(() => {
    if (lastAvailableBlock) {
      setBlockStartDay(lastAvailableBlock.formatted_date || "");
      setBlockStartMonth(lastAvailableBlock.formatted_month || "");
      setBlockStartYear(lastAvailableBlock.formatted_year || "");
    }
  }, [lastAvailableBlock]);


  const handleClearFormBlock = () => {
    setBlockStartDay("");
    setBlockStartMonth("");
    setBlockStartYear("");
    setErrors({});
    setSuccess(false);
    setSuccess1(false);
  };

  return (
    <>
      <div className="h-fit py-40 bg-[#748BA2] content-center">
        <div className="relative w-[1330px] 2xl:w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl">
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
                    clipPath="url(#clip-path)"
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
                className="h-[35px] w-[35px] flex items-center justify-center bg-[#D8ADAD] px-3 py-1 rounded-md hover:bg-[#B87D7D] text-[#FFF] border-2 border-[white]"
                onClick={() => {
                  setWarningDelete(true)
                }}
              >
                <FontAwesomeIcon icon={faRotateLeft} size="xl" />
              </button>
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
                    onClick={() => {
                      handleMonthClick(idx)
                    }}
                  >
                    {month}
                  </div>
                )
              )}
            </div>
            <div className="w-[1286px] mx-auto pb-[5%]">
              <div className="relative text-center pt-10 pb-5">
                <div className="relative text-center">
                  <FontAwesomeIcon
                    icon={faAngleLeft}
                    size="xl"
                    className="absolute left-[35%] top-0 px-3 py-1 text-[#657E98] cursor-pointer"
                    onClick={() => {
                      setCheckboxStates(false);
                      handlePreviousMonth();
                    }}
                  />
                  <h1 className="text-[24px] inter-bold">
                    {currentDate.format("MMMM")} <span className="mx-2">{currentYear}</span>
                  </h1>
                  <FontAwesomeIcon
                    icon={faAngleRight}
                    size="xl"
                    className="absolute right-[35%] top-0 px-3 py-1 text-[#657E98] cursor-pointer"
                    onClick={() => {
                      setCheckboxStates(false);
                      handleNextMonth();
                    }}
                  />
                </div>
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
                    {Object.entries(entries).map(([locationName, days]) => (
                      <tr key={locationName}>
                        <th className='borders inter-bold text-[15px] uppercase'>{locationName} </th>
                        {days.map((weekday, day_key) => (
                          <td key={day_key}>
                            {weekday.times.map((times, week_key) => (
                              <InputRow
                                key={`${locationName}-${day_key}-${week_key}`}
                                week_key={week_key}
                                times={times}
                                handleChange={handleChange}
                                day_key={day_key}
                                location_name={locationName}
                                checkboxStates={checkboxStates}
                                handleCheckboxChange={handleCheckboxChange}
                              />
                            ))}
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
                {
                  errors.effective_date_start &&
                  <div className='bg-[#F9F9F9] mt-[-20px] h-[40px] w-[1135px] m-auto rounded-md flex items-center justify-between px-[65px]'>
                    <p className="text-red-800">
                      <small>
                        {errors.effective_date_start[0]}
                      </small>
                    </p>
                  </div>
                }
                {success1 && <div className="text-green-500 text-center mt-4"> Effective Start Date saved successfully! </div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <WarningModalDelete
        warn={warningDelete}
        close={() => setWarningDelete(false)}
        dataDate={currentDate.format("YYYY-MM")}
        data={() => fetchMonthData(currentYear, currentMonth)}
      />
    </>
  );
};

export default EditBlockCalendar;
