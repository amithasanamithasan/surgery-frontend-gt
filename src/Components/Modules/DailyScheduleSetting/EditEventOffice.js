import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Constant from "../../../Constant";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import "../DailyScheduleSetting/style.css"
import {
  faCheck,
  faTimes,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const EditEventOffice = ({ onClose, idParams, fetchDatas, dates }) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const date = query.get("date");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const selectedDates = dates ? dates.format("YYYY-MM-DD") : null;

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 4 }, (_, i) =>
    (i * 15).toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];
  const endhours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const endminutes = Array.from({ length: 4 }, (_, i) =>
    (i * 15).toString().padStart(2, "0")
  );
  const endperiods = ["AM", "PM"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const convertTo24HourFormat = (hour, minute, period) => {
    let hours = parseInt(hour, 10);
    if (period === "PM" && hours !== 12) {
      hours += 12;
    }
    if (period === "AM" && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${minute}`;
  };

  const formatDate = (day, month, year) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  const [errors, setErrors] = useState({});;

  useEffect(() => {
    fetchScheduleData();
  }, [idParams]);

  const fetchScheduleData = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosAuthInstance.get(`/daily-schedule-office-adjust/${idParams}`);
      const scheduleData = response?.data?.data;
      // const eventDate = new Date(scheduleData.event_date);
      console.log(date);
      const eventDate = selectedDates ? dayjs.utc(selectedDates) : (date ? dayjs.utc(date) : dayjs.utc());
      const event_year = eventDate.year();
      const event_month_index = eventDate.month();
      const event_day = eventDate.date();

      const event_month_number = event_month_index + 1;

      const [startHour24, startMinute] = scheduleData.start_time.split(":");
      const startHour = (parseInt(startHour24) % 12 || 12)
        .toString()
        .padStart(2, "0");
      const startPeriod = parseInt(startHour24) >= 12 ? "PM" : "AM";

      const [endHour24, endMinute] = scheduleData.end_time.split(":");
      const endHour = (parseInt(endHour24) % 12 || 12)
        .toString()
        .padStart(2, "0");
      const endPeriod = parseInt(endHour24) >= 12 ? "PM" : "AM";

      const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const formattedDate = `${date.getMonth() + 1
          }/${date.getDate()}/${date.getFullYear()}`;
        const hours = date.getHours() % 12 || 12;
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const period = date.getHours() >= 12 ? "PM" : "AM";
        return {
          date: formattedDate,
          time: `${hours}:${minutes} ${period}`,
        };
      };

      const created_at = formatTimestamp(scheduleData.created_at);
      const updated_at = formatTimestamp(scheduleData.updated_at);

      setFormData({
        ...formData,
        event_day: event_day.toString(),
        event_month: event_month_number,
        event_year: event_year.toString(),
        startHour: startHour,
        startMinute: startMinute,
        start_period: startPeriod,
        endHour: endHour,
        endMinute: endMinute,
        end_period: endPeriod,
        purpose: String(scheduleData.purpose),
        procedure: scheduleData.procedure,
        note: scheduleData.note,
        flag: "Yes",
        case_number: scheduleData.case_number,
        creatorName: scheduleData.creator?.name || "Unknown Creator",
        updatorName:
          scheduleData.updated_by?.name || scheduleData.creator?.name,
        created_at: created_at.date,
        created_at_time: created_at.time,
        updated_at: updated_at.date,
        updated_at_time: updated_at.time,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setIsLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
  
    const start_time = convertTo24HourFormat(
      formData.startHour,
      formData.startMinute,
      formData.start_period
    );
    const end_time = convertTo24HourFormat(
      formData.endHour,
      formData.endMinute,
      formData.end_period
    );
    const event_date = formatDate(
      formData.event_day,
      formData.event_month,
      formData.event_year
    );
  
    const data = {
      ...formData,
      event_date,
      start_time,
      end_time,
    };
    console.log(data);
    setIsLoading(true);
    try {
      await AxiosAuthInstance.post(`/daily-schedule-office-adjust-new-insert`, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Ensure credentials are sent if needed
      });
  
      onClose();
      fetchDatas(date);
    } catch (error) {
      console.error("Error updating schedule:", error);
      setIsLoading(false);
    }
  };
  

  //   ---------------Time Picker--------------
  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);
  const containerRef3 = useRef(null);
  const containerRef4 = useRef(null);
  const to1 = useRef(null);
  const to2 = useRef(null);
  const to3 = useRef(null);
  const to4 = useRef(null);
  const to5 = useRef(null);
  const from1 = useRef(null);
  const from2 = useRef(null);
  const from3 = useRef(null);
  const from4 = useRef(null);
  const from5 = useRef(null);
  const pe1 = useRef(null);
  const pe2 = useRef(null);
  const pe3 = useRef(null);
  const pe4 = useRef(null);
  const pe5 = useRef(null);
  const pe6 = useRef(null);
  const time1 = () => {
    to1.current.classList.remove("hidden");
    to2.current.classList.remove("hidden");
    to3.current.classList.add("bg-white", "drop-shadow-lg", "w-[80px]");
    to4.current.classList.remove("pointer-events-none");
    to5.current.classList.remove("pointer-events-none");
  };
  const time2 = () => {
    from1.current.classList.remove("hidden");
    from2.current.classList.remove("hidden");
    from3.current.classList.add("bg-white", "drop-shadow-lg", "w-[80px]");
    from4.current.classList.remove("pointer-events-none");
    from5.current.classList.remove("pointer-events-none");
  };
  const period1 = () => {
    pe3.current.classList.remove("hidden");
    pe1.current.classList.add("bg-white", "drop-shadow-lg");
    pe2.current.classList.remove("pointer-events-none");
  };
  const period2 = () => {
    pe6.current.classList.remove("hidden");
    pe4.current.classList.add("bg-white", "drop-shadow-lg");
    pe5.current.classList.remove("pointer-events-none");
  };
  const resetElements1 = () => {
    to1.current.classList.add("hidden");
    to2.current.classList.add("hidden");
    to3.current.classList.remove("bg-white", "drop-shadow-lg", "w-[80px]");
    to4.current.classList.add("pointer-events-none");
    to5.current.classList.add("pointer-events-none");
  };
  const resetElements2 = () => {
    from1.current.classList.add("hidden");
    from2.current.classList.add("hidden");
    from3.current.classList.remove("bg-white", "drop-shadow-lg", "w-[80px]");
    from4.current.classList.add("pointer-events-none");
    from5.current.classList.add("pointer-events-none");
  };
  const resetElements3 = () => {
    pe3.current.classList.add("hidden");
    pe1.current.classList.remove("bg-white", "drop-shadow-lg");
    pe2.current.classList.add("pointer-events-none");
  };
  const resetElements4 = () => {
    pe6.current.classList.add("hidden");
    pe4.current.classList.remove("bg-white", "drop-shadow-lg");
    pe5.current.classList.add("pointer-events-none");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef1.current &&
        !containerRef1.current.contains(event.target)
      ) {
        resetElements1();
      }
      if (
        containerRef2.current &&
        !containerRef2.current.contains(event.target)
      ) {
        resetElements2();
      }
      if (
        containerRef3.current &&
        !containerRef3.current.contains(event.target)
      ) {
        resetElements3();
      }
      if (
        containerRef4.current &&
        !containerRef4.current.contains(event.target)
      ) {
        resetElements4();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changePeriod = (type, direction) => {
    const currentPeriod = formData[type];
    const currentIndex = periods.indexOf(currentPeriod);
    const newIndex =
      (currentIndex + direction + periods.length) % periods.length;
    setFormData({ ...formData, [type]: periods[newIndex] });
  };
  const increasePeriod = () => changePeriod("start_period", 1);
  const decreasePeriod = () => changePeriod("start_period", -1);
  const increaseendPeriod = () => changePeriod("end_period", 1);
  const decreaseendPeriod = () => changePeriod("end_period", -1);
  const changeTime = (name, valueChange, options) => {
    const currentIndex = options.indexOf(formData[name]);
    const nextIndex =
      (currentIndex + valueChange + options.length) % options.length;
    setFormData((prevData) => ({
      ...prevData,
      [name]: options[nextIndex],
    }));
  };
  const increaseStartHour = () => changeTime("startHour", 1, hours);
  const decreaseStartHour = () => changeTime("startHour", -1, hours);
  const increaseStartMinute = () => changeTime("startMinute", 1, minutes);
  const decreaseStartMinute = () => changeTime("startMinute", -1, minutes);
  const increaseendHour = () => changeTime("endHour", 1, hours);
  const decreaseendHour = () => changeTime("endHour", -1, hours);
  const increaseendMinute = () => changeTime("endMinute", 1, minutes);
  const decreaseendMinute = () => changeTime("endMinute", -1, minutes);
  return (
    <>
      <div className="h-screen content-center">
        <div className="global-centering relative lg:w-[920px] xl:w-[1220px] 2xl:w-[1400px] h-fit bg-white flex flex-wrap mx-auto rounded-xl">
          <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] lg:py-3 xl:py-5 text-center rounded-xl flex justify-between items-center px-10">
            <Link to="/daily-schedule">
              <div className="bg-white rounded-md h-[40px] w-[225px] flex justify-center items-center inter-medium hover:bg-[#748BA2] hover:text-white">
                View Daily Schedule
              </div>
            </Link>
            <h1 className="inter-bold text-[20px]">Adjust Office Hours {formData.note == "Adjust-AM" ? "- AM" : "- PM"}</h1>
            <div className="flex justify-between">
              <button
                className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                onClick={handleAddEntry}
              >
                <FontAwesomeIcon icon={faCheck} size="xl" />
              </button>
              <button
                onClick={onClose}
                className="close ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
                id="close"
              >
                <FontAwesomeIcon icon={faTimes} size="xl" />
              </button>
            </div>
          </div>
          <form onSubmit={handleAddEntry} className="mx-auto">
            <div className="lg:w-[95%] xl:w-[100%] mx-auto lg:py-0 xl:py-[2%] mt-10">
              <div className="grid-item special">
                <div className="flex flex-col lg:flex-row lg:mx-0 gap-x-2">
                  <div className="flex-1 w-[40%] xl:me-4">
                    <div className="item full-widths m-0">
                      <label htmlFor="name">
                        <span className="inter-bold lg:text-[18px] xl:text-[22px]">Purpose</span>
                      </label>
                      {errors && errors.purpose && (
                        <p className="text-red-800">
                          <small> {errors.purpose[0]} </small>
                        </p>
                      )}
                      <div className="p-item py-2">
                        <span className="md:pe-40 lg:pe-[15px] xl:pe-12 2xl:pe-20">
                          <input
                            type="radio"
                            className="me-2"
                            name="purpose"
                            value={formData.purpose}
                            id="purpose_procedure"
                            checked={formData.purpose === formData.purpose}
                            onChange={handleChange}
                          />
                          {formData.purpose}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`${formData.purpose === "Office"
                        ? "full-widths m-0"
                        : "item full-widths m-0"
                        }`}
                    >
                      {formData.purpose === "Procedure" && (
                        <label htmlhtmlhtmlFor="Procedure">
                          <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                            Procedure
                          </span>
                        </label>
                      )}

                      {formData.purpose === "Meeting" && (
                        <label htmlFor="Meeting">
                          <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                            Meeting / Notes
                          </span>
                        </label>
                      )}
                      {formData.purpose === "Office" && (
                        <label htmlFor="Office">
                          <span className="md:pe-40 xl:pe-12 2xl:pe-20  lg:text-[18px] xl:text-[22px] deactive">
                            Notes
                          </span>
                        </label>
                      )}
                      {errors && errors.procedure && (
                        <p className="text-red-800">
                          <small> {errors.procedure[0]} </small>
                        </p>
                      )}

                      <textarea
                        name="procedure"
                        value={formData.note}
                        onChange={handleChange}
                        className="lg:h-[80px] 2xl:h-[100px] formx deactive"
                        placeholder={`${formData.purpose === "Office"
                          ? formData.note
                          : "Enter Procedure Here"
                          }`}
                      ></textarea>
                    </div>

                    <div className="deactive">
                      <label htmlFor="">
                        <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                          Event Date
                        </span>
                      </label>
                      <div className="flex justify-between py-3">
                        <select
                          className="2xl:w-[30%] xl:w-[29%] lg:w-[30%] py-3 focus:outline-none bg-[#F9F9F9] text-center me-3 "
                          name="event_day"
                          value={formData.event_day}
                          onChange={handleDateChange}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            )
                          )}
                        </select>
                        <select
                          className="2xl:w-[30%] xl:w-[29%] lg:w-[30%] py-3 focus:outline-none bg-[#F9F9F9] text-center me-3 "
                          name="event_month"
                          value={formData.event_month}
                          onChange={handleDateChange}
                        >
                          {months.map((monthName, index) => (
                            <option key={index + 1} value={index + 1}>
                              {monthName}
                            </option>
                          ))}
                        </select>
                        <select
                          className="2xl:w-[30%] xl:w-[29%] lg:w-[30%] py-3 focus:outline-none bg-[#F9F9F9] text-center me-3 "
                          name="event_year"
                          value={formData.event_year}
                          onChange={handleDateChange}
                        >
                          {Array.from({ length: 51 }, (_, i) => i + 2000).map(
                            (year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="full-widths lg:pt-0 2xl:pt-2">
                      {formData.purpose === "Office" ? (
                        <label htmlFor="">
                          <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                            Event Time
                          </span>
                        </label>
                      ) : (
                        <label htmlFor="">
                          <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                            Event Time
                          </span>
                        </label>
                      )}
                      <div className="flex py-3 justify-between items-center">
                        <div className="w-[245px] focus:outline-none bg-[#F9F9F9] h-[45px] items-center justify-between flex px-5 relative cursor-auto">
                          <p>From</p>
                          <div
                            className="flex justify-center items-center w-[80px] cursor-pointer"
                            ref={containerRef1}
                          >
                            <div
                              className="f-time relative h-[80px] w-[60px] flex justify-center items-center px-[20px]"
                              onClick={time1}
                              ref={to3}
                            >
                              <select
                                name="startHour"
                                value={formData.startHour}
                                onChange={handleChange}
                                className="outline-none pointer-events-none"
                                ref={to4}
                              >
                                {hours.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                              <span className="mx-[6px]">:</span>
                              <select
                                name="startMinute"
                                value={formData.startMinute}
                                onChange={handleChange}
                                className="outline-none pointer-events-none"
                                ref={to5}
                              >
                                {minutes.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                              <div
                                className="hour absolute left-[0px] z-10 hidden"
                                ref={to1}
                              >
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  size="lg"
                                  className="absolute top-[-35px] left-[13px] text-[gray] hover:text-[black]"
                                  onClick={increaseStartHour}
                                ></FontAwesomeIcon>
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  size="lg"
                                  className="absolute bottom-[-35px] left-[13px] text-[gray] hover:text-[black]"
                                  onClick={decreaseStartHour}
                                ></FontAwesomeIcon>
                              </div>
                              <div
                                className="minite absolute right-[0px] z-10 hidden"
                                ref={to2}
                              >
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  size="lg"
                                  className="absolute top-[-35px] right-[13px] text-[gray] hover:text-[black]"
                                  onClick={increaseStartMinute}
                                ></FontAwesomeIcon>
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  size="lg"
                                  className="absolute bottom-[-35px] right-[13px] text-[gray] hover:text-[black]"
                                  onClick={decreaseStartMinute}
                                ></FontAwesomeIcon>
                              </div>
                            </div>
                          </div>
                          <div className="relative" ref={containerRef3}>
                            <div
                              className="f-time h-[80px] w-[50px] flex justify-center items-center absolute top-[-40px] right-[-10px]"
                              onClick={period1}
                              ref={pe1}
                            >
                              <select
                                name="start_period"
                                value={formData.start_period}
                                onChange={handleChange}
                                className="outline-none ms-[10px] pointer-events-none"
                                ref={pe2}
                              >
                                {periods.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                              <div
                                className="period absolute left-[0px] z-10 hidden"
                                ref={pe3}
                              >
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  size="lg"
                                  className="absolute top-[-35px] left-[14px] text-[gray] hover:text-[black]"
                                  onClick={increasePeriod}
                                ></FontAwesomeIcon>
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  size="lg"
                                  className="absolute bottom-[-35px] left-[14px] text-[gray] hover:text-[black]"
                                  onClick={decreasePeriod}
                                ></FontAwesomeIcon>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-[245px] focus:outline-none bg-[#F9F9F9] h-[45px] items-center justify-between flex px-5 relative cursor-auto">
                          <p>To</p>
                          <div
                            className="flex justify-center items-center w-[80px] cursor-pointer me-[20px]"
                            ref={containerRef2}
                          >
                            <div
                              className="f-time h-[80px] flex justify-center items-center w-[60px] px-[20px]"
                              onClick={time2}
                              ref={from3}
                            >
                              <select
                                name="endHour"
                                value={formData.endHour}
                                onChange={handleChange}
                                className="outline-none pointer-events-none"
                                ref={from4}
                              >
                                {endhours.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                              <span className="mx-[6px]">:</span>
                              <select
                                name="endMinute"
                                value={formData.endMinute}
                                onChange={handleChange}
                                className="outline-none pointer-events-none"
                                ref={from5}
                              >
                                {endminutes.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                              <div
                                className="hour absolute left-[0px] z-10 hidden"
                                ref={from1}
                              >
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  size="lg"
                                  className="absolute top-[-35px] left-[13px] text-[gray] hover:text-[black]"
                                  onClick={increaseendHour}
                                ></FontAwesomeIcon>
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  size="lg"
                                  className="absolute bottom-[-35px] left-[13px] text-[gray] hover:text-[black]"
                                  onClick={decreaseendHour}
                                ></FontAwesomeIcon>
                              </div>
                              <div
                                className="minite absolute right-[0px] z-10 hidden"
                                ref={from2}
                              >
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  size="lg"
                                  className="absolute top-[-35px] right-[13px] text-[gray] hover:text-[black]"
                                  onClick={increaseendMinute}
                                ></FontAwesomeIcon>
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  size="lg"
                                  className="absolute bottom-[-35px] right-[13px] text-[gray] hover:text-[black]"
                                  onClick={decreaseendMinute}
                                ></FontAwesomeIcon>
                              </div>
                            </div>
                          </div>
                          <div className="relative" ref={containerRef4}>
                            <div
                              className="f-time h-[80px] w-[50px] flex justify-center items-center absolute top-[-40px] left-[-40px] cursor-pointer"
                              onClick={period2}
                              ref={pe4}
                            >
                              <select
                                name="end_period"
                                value={formData.end_period}
                                onChange={handleChange}
                                className="outline-none ms-[10px] pointer-events-none"
                                ref={pe5}
                              >
                                {endperiods.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                              <div
                                className="period absolute left-[0px] z-10 hidden"
                                ref={pe6}
                              >
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  size="lg"
                                  className="absolute top-[-35px] left-[14px] text-[gray] hover:text-[black]"
                                  onClick={increaseendPeriod}
                                ></FontAwesomeIcon>
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  size="lg"
                                  className="absolute bottom-[-35px] left-[14px] text-[gray] hover:text-[black]"
                                  onClick={decreaseendPeriod}
                                ></FontAwesomeIcon>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {errors && errors.start_time && (
                        <p className="text-red-800">
                          <small> {errors.start_time[0]} </small>
                        </p>
                      )}
                    </div>

                    <div className="item full-widths m-0">
                      {formData.purpose === "Office" || formData.purpose === "Meeting" ? (
                        <label htmlFor="">
                          <span className="inter-bold  lg:text-[18px] xl:text-[22px] deactive">Note</span>
                        </label>
                      ) : (
                        <label htmlFor="">
                          <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
                            Event Note
                          </span>
                        </label>
                      )}

                      {errors && errors.event_note && (
                        <p className="text-red-800">
                          <small> {errors.event_note[0]} </small>
                        </p>
                      )}
                      {formData.purpose === "Office" || formData.purpose === "Meeting" ? (
                        <textarea
                          name="event_note"
                          className="lg:h-[80px] 2xl:h-[100px] formx deactive"
                          placeholder="Enter Note Here"
                          value={formData.event_note}
                          onChange={handleChange}
                          disabled
                        ></textarea>
                      ) : (
                        <textarea
                          name="event_note"
                          className="lg:h-[80px] 2xl:h-[100px] formx"
                          placeholder="Enter Note Here"
                          value={formData.event_note}
                          onChange={handleChange}
                        ></textarea>
                      )}

                    </div>
                  </div>

                  <div className="flex-1 xl:ms-4 w-[60%]">
                    <div
                      className={`${(formData.purpose === "Meeting" ||
                        formData.purpose === "Office")
                        ? "item full-widths mt-5 deactive"
                        : "item full-widths mt-5"
                        }`}
                    >

                      {/* <label htmlFor="">
                        <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                          Surgeon
                        </span>
                      </label>
                      <div className="flex justify-between py-3 items-center">
                        <div className="loc1">
                          <input
                            type="radio"
                            checked
                            id="event_location_phh_mor"
                          />{" "}
                          <label htmlFor="event_location_phh_mor">
                          {surgeons.map((surgeon, index) => (
                              <div className="name lg:w-[120px] xl:w-[160px]">
                              <span className="lg:text-[14px] xl:text-[16px] inter-bold pe-5">
                                {surgeon.name}
                              </span>
                            </div>
                                 ))}
                          </label>
                        </div>
                      </div> */}

                      <label htmlFor="">
                        <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                          Event Location
                        </span>
                      </label>
                      {errors && errors.event_location && (
                        <p className="text-red-800">
                          <small> {errors.event_location[0]} </small>
                        </p>
                      )}
                      <div className="flex justify-between py-3 items-center">
                        <div className="loc1">
                          <input
                            type="radio"
                            name="event_location"
                            value="PHH MOR"
                            id="event_location_phh_mor"
                            checked={formData.event_location === "PHH MOR"}
                            onChange={handleChange}
                          />{" "}
                          <label htmlFor="event_location_phh_mor">
                            PHH MOR
                          </label>
                        </div>
                        <div className="loc2">
                          <input
                            type="radio"
                            name="event_location"
                            value="PHH HOSC"
                            id="event_location_phh_hosc"
                            checked={formData.event_location === "PHH HOSC"}
                            onChange={handleChange}
                          />{" "}
                          <label htmlFor="event_location_phh_hosc">
                            PHH HOSC
                          </label>
                        </div>
                        <div className="loc3">
                          <input
                            type="radio"
                            name="event_location"
                            value="others"
                            id="event_location_others"
                            checked={formData.event_location === "others"}
                            onChange={handleChange}
                          />
                          <input
                            className="focus:outline-none bg-[#F9F9F9] py-1.5 px-2 rounded-md"
                            type="text"
                            name="event_location_text"
                            placeholder="Others"
                            value={
                              formData.event_location === "others"
                                ? formData.event_location_text
                                : ""
                            }
                            onChange={handleChange}
                            disabled={formData.event_location !== "others"}
                          />
                          {errors && errors.event_location_text && (
                            <p className="text-red-800">
                              <small> {errors.event_location_text[0]} </small>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${(formData.purpose === "Meeting" ||
                        formData.purpose === "Office")
                        ? "full-widths lg:pt-0 2xl:pt-5 muted-items deactive"
                        : "full-widths lg:pt-0 2xl:pt-5 muted-items"
                        }`}
                    >
                      <label htmlFor="">
                        <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                          Patient Name
                        </span>
                      </label>
                      {errors && errors.patient_first_name && (
                        <p className="text-red-800">
                          <small> {errors.patient_first_name[0]} </small>
                        </p>
                      )}

                      <div className="flex justify-between py-3 gap-x-4">
                        <div className="names1">
                          <input
                            className="w-[100%] my-1 py-3 focus:outline-none bg-[#F9F9F9] rounded-md px-2"
                            type="text"
                            name="patient_first_name"
                            placeholder="Frist Name"
                            value={formData.patient_first_name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="names2">
                          <input
                            className="w-[100%] my-1 py-3 focus:outline-none bg-[#F9F9F9] rounded-md px-2"
                            type="text"
                            name="patient_last_name"
                            placeholder="Last Name"
                            value={formData.patient_last_name}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${formData.purpose === "Meeting" || formData.purpose === "Office"
                        ? "full-widthspx lg:pt-0 2xl:pt-5 muted-items deactive"
                        : "full-widthspx lg:pt-0 2xl:pt-5 muted-items"
                        }`}
                    >
                      <div className="flex justify-center items-center">
                        <p className="lg:text-[18px] xl:text-[22px] inter-bold w-[300px]">
                          Patient MRN
                        </p>
                        <input
                          className="w-[100%] py-3 focus:outline-none bg-[#F9F9F9] px-2"
                          type="text"
                          name="patient_mrn"
                          placeholder="MRN Number"
                          value={formData.patient_mrn}
                          onChange={handleChange}
                        />
                      </div>
                      {errors && errors.patient_mrn && (
                        <p className="text-red-800">
                          <small> {errors.patient_mrn[0]} </small>
                        </p>
                      )}
                    </div>
                    <div
                      className={`${(formData.purpose === "Meeting" ||
                        formData.purpose === "Office")
                        ? "full-widthspx lg:pt-4 2xl:pt-10 muted-items deactive"
                        : "full-widthspx lg:pt-4 2xl:pt-10 muted-items"
                        }`}
                    >
                      <div className="flex justify-center items-center">
                        <p className="lg:text-[18px] xl:text-[22px] inter-bold w-[300px]">
                          Case Number
                        </p>
                        <input
                          className="w-[100%] py-3 focus:outline-none bg-[#F9F9F9] px-2"
                          type="text"
                          name="case_number"
                          placeholder="Case Number"
                          value={formData.case_number}
                          onChange={handleChange}
                        />
                      </div>
                      {errors && errors.case_number && (
                        <p className="text-red-800">
                          <small> {errors.case_number[0]} </small>
                        </p>
                      )}
                    </div>

                    <div className="grid-item">
                      <div className="full-widths lg:pt-2 xl:pt-5">
                        <span className="pe-4 lg:text-[14px] xl:text-[15px]">
                          <strong>Event Created By:</strong>
                        </span>
                        <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.created_by}</span>
                        <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.created_at}</span>
                        <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.created_at_time}</span>
                      </div>
                    </div>
                    <div className="grid-item">
                      <div className="full-widths">
                        <span className="pe-8 lg:text-[14px] xl:text-[15px]">
                          <strong>Last Update By:</strong>
                        </span>
                        {formData.update_by !== "" ? (
                          <>
                            <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.update_by}</span>
                            <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.updated_at}</span>
                            <span className="px-3 lg:text-[14px] xl:text-[15px]">
                              {formData.updated_at_time}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.update_by}</span>
                            <span className="px-3 lg:text-[14px] xl:text-[15px]">{formData.updated_at}</span>
                            <span className="px-3 lg:text-[14px] xl:text-[15px]">
                              {formData.updated_at_time}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div >
      </div >
    </>
  );
};

export default EditEventOffice;
