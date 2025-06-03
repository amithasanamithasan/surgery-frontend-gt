import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Constant from "../../../Constant";
import { useNavigate, useLocation } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import dayjs from "dayjs";
import {
  faCheck,
  faTimes,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
const AddEvent = ({ onClose, fetchDatas, dates }) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const date = query.get("date");
  const [errorType, setErrorType] = useState({});
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

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

  // const [day, setDay] = useState(currentDay);
  // const [month, setMonth] = useState(currentMonth);
  // const [year, setYear] = useState(currentYear);
  const selectedDates = dates ? dates.format("YYYY-MM-DD") : null;
  const eventDate = (date ? dayjs.utc(date) : selectedDates ? dayjs.utc(selectedDates) : dayjs.utc());
  const [day, setDay] = useState(eventDate.date());
  const [month, setMonth] = useState(eventDate.month() + 1);
  const [year, setYear] = useState(eventDate.year());
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
  const formatDate = (day, month, year) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };
  const [purpose, setPurpose] = useState("Procedure");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [surgeons, setSurgeons] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectMonthly, setSelectMonthly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    purpose: "Procedure",
    procedure: "",
    event_date: "",
    metting_q: "",
    metting_d: "",
    startHour: "07",
    startMinute: "00",
    endHour: "08",
    endMinute: "00",
    start_period: "AM",
    end_period: "AM",
    event_note: "",
    event_location: "",
    event_location_text: "",
    surgeon_id: [],
    surgeon_deg: [],
    patient_first_name: "",
    patient_last_name: "",
    patient_mrn: "",
    case_number: "",
    is_archived: false,
    create_by: false,
  });
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/surgeons`
      );
      setSurgeons(
        response.data.map((surgeon) => ({ ...surgeon, selected: false }))
      );
    } catch (error) {
      console.error("Error fetching surgeons:", error);
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setFormData((prevData) => {
      if (isChecked) {
        const allSurgeonsIds = surgeons.map((surgeon) => surgeon.id);
        return {
          ...prevData,
          surgeon_id: allSurgeonsIds,
          surgeon_deg: [],
        };
      } else {
        return {
          ...prevData,
          surgeon_id: [],
          surgeon_deg: [],
        };
      }
    });
  };
  const handleClearDoctor = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(!isChecked);
  }
  const handleMonthly = (e) => {
    const isChecked = e.target.checked;
    setSelectMonthly(isChecked);
    setFormData((prevData) => {
      if (isChecked) {
        return {
          ...prevData,
          metting_q: "1st",
          metting_d: "Monday",
        };
      } else {
        return {
          ...prevData,
          metting_q: null,
          metting_d: null,
        };
      }
    });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const surgeonId = parseInt(value.split("_")[0]);
    const surgeonType = value.split("_")[1];


    setFormData((prevData) => {
      const newData = { ...prevData };
      if (type === "checkbox" || type === "radio") {
        newData[name] = checked ? value : "";
      } else {
        newData[name] = value;
      }

      if (name === "event_location") {
        newData.event_location = value;
        newData.event_location_text =
          value === "others" ? prevData.event_location_text : "";
      }

      // if (name.startsWith("start")) {
      //   newData[name] = value;
      // } else if (name.startsWith("end")) {
      //   newData[name] = value;
      // }
      if (name.startsWith("start")) {
        const startHour = newData.startHour;
        const startMinute = newData.startMinute;
        const startPeriod = newData.start_period;

        if (startHour && startMinute && startPeriod) {
          // Convert to 24-hour format
          let hours = parseInt(startHour, 10);
          let minutes = parseInt(startMinute, 10);
          if (startPeriod === "PM" && hours !== 12) hours += 12;
          if (startPeriod === "AM" && hours === 12) hours = 0;

          // Create date and add 60 minutes (1 hour)
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          date.setSeconds(0);
          date.setMilliseconds(0);
          date.setMinutes(date.getMinutes() + 60);

          // Extract 12-hour format end time
          let endHour = date.getHours();
          const endPeriod = endHour >= 12 ? "PM" : "AM";
          if (endHour === 0) endHour = 12;
          else if (endHour > 12) endHour -= 12;

          const endMinute = date.getMinutes().toString().padStart(2, '0');

          // Assign end values
          newData.endHour = endHour.toString().padStart(2, '0');
          newData.endMinute = endMinute;
          newData.end_period = endPeriod;
          console.log(endHour, endMinute);
        }
      } else if (name.startsWith("end")) {
        newData[name] = value;
      }

      if (name.startsWith("surgeon_")) {
        if (surgeonType === "Pr") {
          if (checked) {
            newData.surgeon_id = [...newData.surgeon_id, surgeonId];
          } else {
            newData.surgeon_id = newData.surgeon_id.filter((id) => id !== surgeonId);
          }

          newData.surgeon_deg = newData.surgeon_deg.filter((id) => id !== surgeonId);
        } else if (surgeonType === "As") {
          if (checked) {
            newData.surgeon_deg = [...newData.surgeon_deg, surgeonId];
          } else {
            newData.surgeon_deg = newData.surgeon_deg.filter((id) => id !== surgeonId);
          }
          newData.surgeon_id = newData.surgeon_id.filter((id) => id !== surgeonId);
        }
      } else {
        newData[name] = value;
      }

      return newData;
    });
  };

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const startTime = convertTo24HourFormat(
      formData.startHour,
      formData.startMinute,
      formData.start_period
    );

    const endTime = convertTo24HourFormat(
      formData.endHour,
      formData.endMinute,
      formData.end_period
    );
    const eventDate = formatDate(day, month, year);
    const data = {
      ...formData,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      selectAll: selectAll ? 1 : 0,
    };
    console.log("Posting data:", data);
    if (purpose === "Meeting") {
      delete data.patient_first_name;
      delete data.patient_last_name;
      delete data.patient_mrn;
      delete data.case_number;
    } else if (purpose === "Office") {
      delete data.surgeon_id;
      delete data.surgeon_deg;
      delete data.patient_first_name;
      delete data.patient_last_name;
      delete data.patient_mrn;
      delete data.case_number;
    }
    AxiosAuthInstance.post(`${Constant.BASE_URL}/daily-schedule`, data)
      .then((response) => {
        console.log("Response:", response);
        setFormData({
          purpose: "",
          procedure: "",
          event_date: "",
          metting_q: "",
          metting_d: "",
          startHour: "07",
          startMinute: "00",
          endHour: "08",
          endMinute: "00",
          start_period: "AM",
          end_period: "PM",
          event_note: "",
          event_location: "",
          event_location_text: "",
          surgeon_id: formData.surgeon_id || [],
          surgeon_deg: formData.surgeon_deg || [],
          patient_first_name: "",
          patient_last_name: "",
          patient_mrn: "",
          case_number: "",
          is_archived: false,
          create_by: false,
        });
        setIsLoading(false);
        //fetchDatas();
        fetchDatas(date ? date : null);
        onClose();
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data
        ) {
          const { message, errors } = error.response.data;
          setMessage(message || "An unexpected error occurred");
          setErrorType(error.response.data.errorType);
          setErrors(errors || {});
        } else {
          setErrors({ general: "An unexpected error occurred" });
          setMessage("");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // ---------------My Custom---------
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

  // const changePeriod = (type, direction) => {
  //   const currentPeriod = formData[type];
  //   const currentIndex = periods.indexOf(currentPeriod);
  //   const newIndex =
  //     (currentIndex + direction + periods.length) % periods.length;
  //   setFormData({ ...formData, [type]: periods[newIndex] });
  // };
  const changePeriod = (type, direction) => {
    const currentPeriod = formData[type];
    const currentIndex = periods.indexOf(currentPeriod);
    const newIndex = (currentIndex + direction + periods.length) % periods.length;
    const newValue = periods[newIndex];

    const updatedForm = {
      ...formData,
      [type]: newValue,
    };

    // Recalculate end time if changing start_period
    if (type === "start_period") {
      const { startHour, startMinute } = updatedForm;

      if (startHour && startMinute) {
        let hours = parseInt(startHour, 10);
        let minutes = parseInt(startMinute, 10);

        if (newValue === "PM" && hours !== 12) hours += 12;
        if (newValue === "AM" && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);
        date.setMinutes(date.getMinutes() + 60); // Add 60 minutes

        let endHour = date.getHours();
        const endPeriod = endHour >= 12 ? "PM" : "AM";
        if (endHour === 0) endHour = 12;
        else if (endHour > 12) endHour -= 12;

        const endMinute = date.getMinutes().toString().padStart(2, "0");

        updatedForm.endHour = endHour.toString().padStart(2, "0");
        updatedForm.endMinute = endMinute;
        updatedForm.end_period = endPeriod;
      }
    }

    setFormData(updatedForm);
  };

  // const increasePeriod = () => changePeriod("start_period", 1);
  // const decreasePeriod = () => changePeriod("start_period", -1);
  const increaseendPeriod = () => changePeriod("end_period", 1);
  const decreaseendPeriod = () => changePeriod("end_period", -1);
  // const changeTime = (name, valueChange, options) => {
  //   const currentIndex = options.indexOf(formData[name]);
  //   const nextIndex =
  //     (currentIndex + valueChange + options.length) % options.length;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: options[nextIndex],
  //   }));
  // };
  const changeTime = (name, valueChange, options) => {
    const currentIndex = options.indexOf(formData[name]);
    const nextIndex =
      (currentIndex + valueChange + options.length) % options.length;
    const newValue = options[nextIndex];

    const updatedForm = {
      ...formData,
      [name]: newValue,
    };

    // If it's a start time change, recalculate end time
    if (
      name === "startHour" ||
      name === "startMinute" ||
      name === "start_period"
    ) {
      const { startHour, startMinute, start_period } = updatedForm;

      if (startHour && startMinute && start_period) {
        let hours = parseInt(startHour, 10);
        let minutes = parseInt(startMinute, 10);

        if (start_period === "PM" && hours !== 12) hours += 12;
        if (start_period === "AM" && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);
        date.setMinutes(date.getMinutes() + 60); // Add 60 minutes

        // Calculate end time
        let endHour = date.getHours();
        const endPeriod = endHour >= 12 ? "PM" : "AM";
        if (endHour === 0) endHour = 12;
        else if (endHour > 12) endHour -= 12;

        const endMinute = date.getMinutes().toString().padStart(2, "0");

        updatedForm.endHour = endHour.toString().padStart(2, "0");
        updatedForm.endMinute = endMinute;
        updatedForm.end_period = endPeriod;
      }
    }

    setFormData(updatedForm);
  };

  // const increaseStartHour = () => changeTime("startHour", 1, hours);
  // const decreaseStartHour = () => changeTime("startHour", -1, hours);
  // const increaseStartMinute = () => changeTime("startMinute", 1, minutes);
  // const decreaseStartMinute = () => changeTime("startMinute", -1, minutes);
  const increaseendHour = () => changeTime("endHour", 1, hours);
  const decreaseendHour = () => changeTime("endHour", -1, hours);
  const increaseendMinute = () => changeTime("endMinute", 1, minutes);
  const decreaseendMinute = () => changeTime("endMinute", -1, minutes);

  const increaseStartHour = () => changeTime("startHour", 1, hours);
  const decreaseStartHour = () => changeTime("startHour", -1, hours);
  const increaseStartMinute = () => changeTime("startMinute", 1, minutes);
  const decreaseStartMinute = () => changeTime("startMinute", -1, minutes);
  const increasePeriod = () => changePeriod("start_period", 1);
  const decreasePeriod = () => changePeriod("start_period", -1);


  return (
    <>
      <div className="h-screen content-center">
        <form onSubmit={handleAddEntry}>
          <div className="relative lg:w-[920px] xl:w-[1220px] 2xl:w-[1400px] h-fit bg-white flex flex-wrap mx-auto rounded-xl">
            <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] lg:py-4 xl:py-5 text-center rounded-xl flex justify-between px-10">
              <div className="bg-white rounded-md h-[40px] w-[225px] flex justify-center items-center inter-medium hover:bg-[#748BA2] hover:text-white"
                onClick={onClose}>
                View Daily Schedule
              </div>
              <h1 className="inter-bold text-[20px]">Add New Event</h1>
              <div className="flex justify-between me-10">
                <button
                  type="submit"
                  className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                >
                  <FontAwesomeIcon icon={faCheck} size="xl" />
                </button>

                <button
                  type="button"
                  className="close ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faTimes} size="xl" />
                </button>
              </div>
            </div>
            <div className="xl:w-[90%] 2xl:w-[80%] mx-auto lg:py-0 xl:py-[2%] mt-10">
              <div className="grid-item special">
                <div className="flex flex-col lg:flex-row lg:mx-[2%]">
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
                            name="purpose"
                            value="Procedure"
                            id="purpose_procedure"
                            checked={formData.purpose === "Procedure"}
                            onChange={handleChange}
                          />
                          <label htmlFor="purpose_procedure">Procedure</label>
                        </span>
                        <span className="md:pe-40 lg:pe-[15px] xl:pe-12 2xl:pe-20">
                          <input
                            type="radio"
                            name="purpose"
                            value="Meeting"
                            id="purpose_meeting"
                            checked={formData.purpose === "Meeting"}
                            onChange={handleChange}
                          />
                          <label htmlFor="purpose_meeting">Meeting</label>
                        </span>
                        <span className="md:pe-40 lg:pe-[15px] xl:pe-12 2xl:pe-20">
                          <input
                            type="radio"
                            name="purpose"
                            value="Office"
                            id="purpose_office"
                            checked={formData.purpose === "Office"}
                            onChange={handleChange}
                          />
                          <label htmlFor="purpose_office">Office</label>
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${formData.purpose === "Office"
                        ? "item full-widths m-0"
                        : "item full-widths m-0"
                        }`}
                    >
                      {formData.purpose === "Procedure" && (
                        <label htmlFor="Procedure">
                          <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                            Procedure
                          </span>
                        </label>
                      )}
                      {formData.purpose === "Meeting" && (
                        <label htmlFor="Meeting">
                          <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
                            Meeting / Notes
                          </span>
                        </label>
                      )}
                      {formData.purpose === "Office" && (
                        <label htmlFor="Office">
                          <span className="md:pe-40 xl:pe-12 2xl:pe-20  lg:text-[18px] xl:text-[22px]">
                            Office / Notes
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
                        value={formData.procedure}
                        onChange={handleChange}
                        className="lg:h-[80px] 2xl:h-[100px] formx"
                        placeholder={`${formData.purpose === "Office"
                          ? ""
                          : "Enter Procedure Here"
                          }`}
                      ></textarea>
                    </div>

                    <div
                      className={`${selectMonthly
                        ? "full-widths lg:pt-0 2xl:pt-2 deactive"
                        : "full-widths lg:pt-0 2xl:pt-2"
                        }`}
                    >
                      <label htmlFor="">
                        <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
                          Event Date
                        </span>
                      </label>
                      <div className="flex justify-between py-3">
                        <select
                          className="2xl:w-[30%] xl:w-[29%] lg:w-[30%] py-3 focus:outline-none bg-[#F9F9F9] text-center me-3 "
                          name="event_day"
                          value={day}
                          onChange={handleDateChange(setDay)}
                          placeholder="Day"
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
                          value={month}
                          onChange={handleDateChange(setMonth)}
                          placeholder="Month"
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
                          value={year}
                          onChange={handleDateChange(setYear)}
                          placeholder="Year"
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

                    {/* Only for meeting */}
                    {formData.purpose === "Meeting" && (
                      <div className="flex justify-between items-center full-widths">
                        <div className="loc1 w-[250px]">
                          <input
                            type="radio"
                            name="Monthly"
                            id="Monthly"
                            onChange={handleMonthly}
                            checked={selectMonthly}
                          />
                          <label htmlFor="Monthly">Monthly</label>
                        </div>
                        <div className="loc2">
                          <select
                            className="focus:outline-none bg-[#F9F9F9] py-1.5 rounded-md w-[90%]"
                            name="metting_q"
                            value={formData.metting_q}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                metting_q: e.target.value,
                              })
                            }
                            disabled={!selectMonthly}
                          >
                            <option disabled>Select</option>
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                            <option value="4th">4th</option>
                            <option value="5th">5th</option>
                          </select>
                        </div>
                        <div className="loc3">
                          <select
                            className="focus:outline-none bg-[#F9F9F9] py-1.5 rounded-md w-[90%]"
                            name="metting_d"
                            value={formData.metting_d}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                metting_d: e.target.value,
                              })
                            }
                            disabled={!selectMonthly}
                          >
                            <option disabled>Select</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                        </div>
                        <input
                          type="hidden"
                          id="Monthly"
                          name="Monthly"
                          value={selectMonthly ? 1 : 0}
                        />
                      </div>
                    )}
                    {/*End Only for meeting */}

                    <div className="full-widths lg:pt-0 2xl:pt-2">
                      {formData.purpose === "Office" ? (
                        <label htmlFor="">
                          <span className="inter-bold lg:text-[18px] xl:text-[22px]">
                            Event Time
                          </span>

                        </label>
                      ) : (
                        <label htmlFor="">
                          <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
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
                              className="f-time relative h-[80px] w-[70px] flex justify-center items-center px-[20px]"
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
                                <div
                                  className="absolute top-[-35px] left-[12px] text-[gray] hover:text-[black]"
                                  onClick={increaseStartHour}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                                <div
                                  className="absolute bottom-[-35px] left-[12px] text-[gray] hover:text-[black]"
                                  onClick={decreaseStartHour}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleDown}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                              </div>
                              <div
                                className="minite absolute right-[0px] z-10 hidden"
                                ref={to2}
                              >
                                <div
                                  className="absolute top-[-35px] right-[12px] text-[gray] hover:text-[black]"
                                  onClick={increaseStartMinute}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                                <div
                                  className="absolute bottom-[-35px] right-[12px] text-[gray] hover:text-[black]"
                                  onClick={decreaseStartMinute}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleDown}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
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
                                <div
                                  className="absolute top-[-35px] left-[15px] text-[gray] hover:text-[black] cursor-pointer"
                                  onClick={increasePeriod}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                                <div
                                  className="absolute bottom-[-35px] left-[15px] text-[gray] hover:text-[black] cursor-pointer"
                                  onClick={decreasePeriod}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleDown}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
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
                              className="f-time h-[80px] flex justify-center items-center w-[70px] px-[40px]"
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
                                <div
                                  className="absolute top-[-35px] left-[13px] text-[gray] hover:text-[black]"
                                  onClick={increaseendHour}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                                <div
                                  className="absolute bottom-[-35px] left-[13px] text-[gray] hover:text-[black]"
                                  onClick={decreaseendHour}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleDown}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                              </div>
                              <div
                                className="minite absolute right-[0px] z-10 hidden"
                                ref={from2}
                              >
                                <div
                                  className="absolute top-[-35px] right-[13px] text-[gray] hover:text-[black]"
                                  onClick={increaseendMinute}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                                <div
                                  className="absolute bottom-[-35px] right-[13px] text-[gray] hover:text-[black]"
                                  onClick={decreaseendMinute}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleDown}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
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
                                <div
                                  className="absolute top-[-35px] left-[14px] text-[gray] hover:text-[black]"
                                  onClick={increaseendPeriod}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                                <div
                                  className="absolute bottom-[-35px] left-[14px] text-[gray] hover:text-[black]"
                                  onClick={decreaseendPeriod}
                                >
                                  <FontAwesomeIcon
                                    icon={faAngleDown}
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {errors && errors.event_date && (
                        <span className="text-red-800">
                          <small> {errors.event_date[0]} </small>
                        </span>
                      )}
                      {errors && errors.start_time && (
                        <p className="text-red-800">
                          <small> {errors.start_time[0]} </small>
                        </p>
                      )}
                      {errors.time && (
                        <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                      )}
                    </div>
                    <div className="item full-widths m-0">
                      {formData.purpose === "Meeting" ? (
                        <label htmlFor="">
                          <span className="inter-bold  lg:text-[18px] xl:text-[22px] deactive">Event Note</span>
                        </label>
                      ) : formData.purpose === "Office" ? (
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
                      {formData.purpose === "Office" ? (
                        <textarea
                          name="event_note"
                          className="lg:h-[80px] 2xl:h-[100px] formx deactive"
                          placeholder="Enter Note Here"
                          value={formData.event_note}
                          onChange={handleChange}
                          disabled
                        ></textarea>
                      ) : formData.purpose === "Meeting" ? (
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

                  {/* <div
                    className={`${formData.purpose === "Office"
                      ? "flex-1 xl:ms-4 w-[60%] deactive"
                      : "flex-1 xl:ms-4 w-[60%]"
                      }`}
                  > */}
                  <div className="flex-1 xl:ms-4 w-[60%]">
                    {formData.purpose === "Procedure" && (
                      <div className="item full-widths m-0 procedure">
                        <label htmlFor="">
                          <span className="inter-bold  lg:text-[18px] xl:text-[22px] ms-[-2px]">
                            Surgeon
                          </span>
                        </label>
                        <div className="grid relative grid-cols-2 py-2 lg:gap-2 xl:gap-4">
                          {/* <div className="sept1"></div> */}
                          {surgeons &&
                            surgeons.length > 0 &&
                            surgeons.map((surgeon, index) => (
                              <div
                                key={index}
                                className={`p-item flex ${index === 1 ? "justify-end sep1" : index === 3 ? "justify-end sep2" : ""}`}
                              >
                                {!selectAll ? (
                                  <div className="name lg:w-[120px] xl:w-[160px]">
                                    <span className="lg:text-[14px] xl:text-[16px] inter-bold pe-5">
                                      {surgeon.name}
                                    </span>
                                  </div>
                                ) : null}

                                <div className="select-item inline">
                                  {selectAll ? (
                                    <span className="">
                                      <input
                                        type="radio"
                                        name={`surgeon_${surgeon.id}`}
                                        value={`${surgeon.id}_Pr`}
                                        checked={formData.surgeon_id.includes(
                                          surgeon.id
                                        )}
                                        onChange={handleChange}
                                      />{" "}
                                      {surgeon.name}
                                    </span>
                                  ) : (
                                    <>
                                      <span className="me-2">
                                        <input
                                          type="checkbox"
                                          className="custom-checkbox"
                                          id={`pr${index + 1}`}
                                          name={`surgeon_${surgeon.id}`}
                                          value={`${surgeon.id}_Pr`}
                                          checked={formData.surgeon_id.includes(
                                            surgeon.id
                                          )}
                                          onChange={handleChange}
                                        />{" "}
                                        <label htmlFor={`pr${index + 1}`}>
                                          Pr.
                                        </label>
                                      </span>
                                      <span className="">
                                        <input
                                          type="checkbox"
                                          className="custom-checkbox"
                                          id={`as${index + 1}`}
                                          name={`surgeon_${surgeon.id}`}
                                          value={`${surgeon.id}_As`}
                                          checked={formData.surgeon_deg.includes(
                                            surgeon.id
                                          )}
                                          onChange={handleChange}
                                        />{" "}
                                        <label htmlFor={`as${index + 1}`}>
                                          As.
                                        </label>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                        {errors && errors.surgeon_id && (
                          <p className="text-red-800">
                            <small> {errors.surgeon_id[0]} </small>
                          </p>
                        )}
                        {errors && errors.surgeon_deg && (
                          <p className="text-red-800">
                            <small> {errors.surgeon_deg[0]} </small>
                          </p>
                        )}
                        {message && errorType === "schedule_conflict" && (
                          <p className="text-red-800">
                            <small>{message}</small>
                          </p>
                        )}
                        <div className="nothejus ms-[3px]">
                          <input
                            type="hidden"
                            name="selectAll"
                            value={selectAll ? 1 : 0}
                          />
                          <input
                            className="hidden"
                            type="checkbox"
                            name="selectAll"
                            id="selectAll"
                            onChange={handleSelectAll}
                            checked={selectAll}
                            value={selectAll ? 1 : 0}
                          />
                          <label
                            htmlFor="selectAll"
                            className="flex items-center h-10 cursor-pointer"
                          >
                            <span className="checkbox-inner flex items-center justify-center text-transparent border-2 border-gray-300 rounded-full me-2 ms-[-5px]"></span>
                            Select All Doctors
                          </label>
                        </div>
                      </div>
                    )}

                    {/* For Meeting */}
                    {(formData.purpose === "Meeting" ||
                      formData.purpose === "Office") && (
                        <div className="item full-widths m-0 procedure">
                          <label htmlFor="">
                            <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
                              Attendees
                            </span>
                          </label>
                          <div className="grid relative grid-cols-2 py-2 lg:gap-0 xl:gap-4 ps-[2px]">
                            {surgeons &&
                              surgeons.length > 0 &&
                              surgeons.map((surgeon, index) => (
                                <div
                                  key={index}
                                  className={`p-item flex ${index === 1 ? "justify-end sep1" : index === 3 ? "justify-end sep2" : ""}`}
                                >
                                  <div className="name w-[220px]">
                                    {!selectAll ? (
                                      <span className="text-[16px] inter-bold pe-5">
                                        <input
                                          type="checkbox"
                                          className="custom-checkbox"
                                          id={surgeon.id}
                                          name={`surgeon_${surgeon.id}`}
                                          value={`${surgeon.id}_Pr`}
                                          checked={formData.surgeon_id.includes(
                                            surgeon.id
                                          )}
                                          onChange={handleChange}
                                        />{" "}
                                        <label htmlFor={surgeon.id}><span className="inter-bold">{surgeon.name}</span></label>
                                      </span>
                                    ) : (
                                      <span className="text-[16px] inter-bold pe-5">
                                        <input
                                          type="radio"
                                          id={surgeon.id}
                                          name={`surgeon_${surgeon.id}`}
                                          value={`${surgeon.id}_Pr`}
                                          checked={formData.surgeon_id.includes(
                                            surgeon.id
                                          )}
                                          onChange={handleChange}
                                        />{" "}
                                        <label htmlFor={surgeon.id}><span className="inter-bold">{surgeon.name}</span></label>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                          {errors && errors.surgeon_id && (
                            <p className="text-red-800">
                              <small> {errors.surgeon_id[0]} </small>
                            </p>
                          )}
                          {errors && errors.surgeon_deg && (
                            <p className="text-red-800">
                              <small> {errors.surgeon_deg[0]} </small>
                            </p>
                          )}
                          {message && errorType === "schedule_conflict" && (
                            <p className="text-red-800">
                              <small>{message}</small>
                            </p>
                          )}
                          <div className="nothejus  ms-[5px]">
                            <span className="pe-5 inter-bold">
                              <input
                                type="hidden"
                                name="selectAll"
                                value={selectAll ? 1 : 0}
                              />
                              <input
                                type="checkbox"
                                className="hidden"
                                name="selectAll"
                                id="selectAll"
                                onChange={handleSelectAll}
                                checked={selectAll}
                              />
                              <label
                                htmlFor="selectAll"
                                className="flex items-center h-10 cursor-pointer"
                              >
                                <span className="checkbox-inner flex items-center justify-center text-transparent border-2 border-gray-300 rounded-full me-2 ms-[-5px]"></span>
                                Select All Doctors
                              </label>
                            </span>
                          </div>
                        </div>
                      )}
                    {/* End Meeting Attandence */}

                    <div
                      className={`${(formData.purpose === "Meeting" ||
                        formData.purpose === "Office")
                        ? "item full-widths mt-5 deactive"
                        : "item full-widths mt-5"
                        }`}
                    >
                      <label htmlFor="">
                        <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
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
                        </div>
                      </div>
                      {errors && errors.event_location_text && (
                        <p className="text-red-800">
                          <small> {errors.event_location_text[0]} </small>
                        </p>
                      )}
                    </div>
                    <div
                      className={`${(formData.purpose === "Meeting" ||
                        formData.purpose === "Office")
                        ? "full-widths pt-5 muted-items deactive"
                        : "full-widths pt-5 muted-items"
                        }`}
                    >
                      <label htmlFor="">
                        <span className="inter-bold  lg:text-[18px] xl:text-[22px]">
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
                      className={`${(formData.purpose === "Meeting" ||
                        formData.purpose === "Office")
                        ? "full-widthspx lg:pt-2 2xl:pt-10 muted-items deactive"
                        : "full-widthspx lg:pt-2 2xl:pt-10 muted-items"
                        }`}
                    >
                      <div className="flex justify-center items-center">
                        <p className=" lg:text-[18px] xl:text-[22px] inter-bold w-[300px]">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddEvent;
