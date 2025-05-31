import React, { useState, useEffect, useRef } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

function EditSchedulingSidebar() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // ----------- Code for Office Closed  ---------------------
  const [formOfficeCloseData, setFormOfficeCloseData] = useState({
    note: "Close",
    effective_date_start: "",
    create_by: false,
  });

  // dafault last date office, officeAM, office PM
  const [officeAMData, setOfficeAMData] = useState([]);
  const [officePMData, setOfficePMData] = useState([]);
  const [officeData, setOfficeData] = useState([]);

  useEffect(() => {
    if (officeData?.effective_date_start) {
      const date = new Date(officeData.effective_date_start);
      setOfficeCloseStartMonth(String(date.getUTCMonth() + 1).padStart(2, '0'));
      setOfficeCloseStartDay(String(date.getUTCDate()).padStart(2, '0'));
      setOfficeCloseStartYear(date.getUTCFullYear().toString());
    }
  }, [officeData?.effective_date_start]);

  const handleDateChange = (e, setFunction) => {
    setFunction(e.target.value);
  };

  const [officeCloseStartDay, setOfficeCloseStartDay] = useState("");
  const [officeCloseStartMonth, setOfficeCloseStartMonth] = useState("");
  const [officeCloseStartYear, setOfficeCloseStartYear] = useState("");
  const [success, setSuccess] = useState(false);
  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);
  const [close, setClose] = useState(false);
  const [adjus, setAjus] = useState(false);
  // ------------Save Office Close Function-------------
  const handleOfficeCloseSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const effective_date_start = `${officeCloseStartYear}-${officeCloseStartMonth}-${officeCloseStartDay}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-ofice-close-data`,
        {
          ...formOfficeCloseData,
          effective_date_start: effective_date_start,
          note: "Close",
        }
      );

      setFormOfficeCloseData({
        note: "Close",
        officeCloseStartDay: "",
        officeCloseStartMonth: "",
        officeCloseStartYear: "",
        create_by: false,
      });
      setClose(true);
      setErrors({});
      toast.success("Office close data added successfully!");
      console.log("formOfficeCloseData:", response);
      setSuccess(true);
      setAjus(false);
      handleClearFormOfficeClose();
    } catch (error) {
      setClose(true);
      setAjus(false);
      setSuccess(false);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        // toast.error("Failed to add office close data.");
        console.error("Error response data:", error.response.data.errors);
        toast.error(error.response.data.errors.effective_date_start[0]);
      } else {
        setErrors({ general: "An unexpected error occurred" });
        toast.error({ general: "An unexpected error occurred" });
      }
      console.error("Error adding office close data:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------Form clear Office Close-------------------
  const handleClearFormOfficeClose = (e) => {
    e.preventDefault();
    setOfficeCloseStartDay("");
    setOfficeCloseStartMonth("");
    setOfficeCloseStartYear("");
    setErrors({});
    console.log("Form canceled and errors cleared");
  };


  // ---------------------Date for start and end OM/PM--------------------
  const [formOfficeAdjustAMData, setFormOfficeAdjusteAMData] = useState({
    note: "Adjust-AM",
    effective_date_start: "",
    effective_date_end: "",
    effective_date_start_start_time: "",
    effective_date_start_end_time: "",
    effective_date_end_start_time: "",
    effective_date_end_end_time: "",
    create_by: false,
  });
  const [formOfficeAdjustPMData, setFormOfficeAdjustePMData] = useState({
    note: "Adjust-PM",
    effective_date_start: "",
    effective_date_end: "",
    effective_date_start_start_time: "",
    effective_date_start_end_time: "",
    effective_date_end_start_time: "",
    effective_date_end_end_time: "",
    create_by: false,
  });
  const formatDate = (day, month, year) => {
    return `${year}-${day
      .toString()
      .padStart(2, "0")}-${month.toString().padStart(2, "0")}`;
  };
  // const handleDateAdjustChange = (setter) => (e) => {
  //   setter(e.target.value);
  // };

  const [officeAdjustStartDay, setOfficeAdjustStartDay] = useState("");
  const [officeAdjustStartMonth, setOfficeAdjustStartMonth] = useState("");
  const [officeAdjustStartYear, setOfficeAdjustStartYear] = useState("");
  const [officeAdjustEndtDay, setOfficeAdjustEndDay] = useState("");
  const [officeAdjustEndMonth, setOfficeAdjustEndMonth] = useState("");
  const [officeAdjustEndYear, setOfficeAdjustEndYear] = useState("");

  // Function to extract date parts
  const extractDateParts = (dateString) => {
    if (!dateString) return { month: '', day: '', year: '' };
    const date = new Date(dateString);
    return {
      month: String(date.getUTCMonth() + 1).padStart(2, '0'),
      day: String(date.getUTCDate()).padStart(2, '0'),
      year: date.getUTCFullYear().toString(),
    };
  };

  // Sync states with data from database
  useEffect(() => {
    if (officeAMData?.effective_date_start) {
      const { month, day, year } = extractDateParts(officeAMData.effective_date_start);
      setOfficeAdjustStartMonth(month);
      setOfficeAdjustStartDay(day);
      setOfficeAdjustStartYear(year);
    }
    if (officePMData?.effective_date_end) {
      const { month, day, year } = extractDateParts(officePMData.effective_date_end);
      setOfficeAdjustEndMonth(month);
      setOfficeAdjustEndDay(day);
      setOfficeAdjustEndYear(year);
    }
  }, [officeAMData?.effective_date_start, officePMData?.effective_date_end]);

  // Generic Change Handler
  const handleDateAdjustChange = (e, setFunction) => {
    setFunction(e.target.value);
  };

  // ---------------Time and Date Array + sanitize------------------
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

  // --------------Set Form Data---------------
  const [formData, setFormData] = useState({
    eft_am_start_hour: "07",
    eft_am_start_minit: "00",
    eft_am_start_ampm: "AM",
    eft_am_end_hour: "12",
    eft_am_end_minit: "00",
    eft_am_end_ampm: "AM",
    eft_pm_start_hour: "12",
    eft_pm_start_minit: "00",
    eft_pm_start_ampm: "PM",
    eft_pm_end_hour: "08",
    eft_pm_end_minit: "00",
    eft_pm_end_ampm: "PM",
  })
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData };
      newData[name] = value;
      return newData;
    })
  }

  // ----------------Save Office Adjust AM Function------------
  const handleOfficeAdjustAMSave = async (e) => {
    const eventDate_OM = formatDate(officeAdjustStartMonth, officeAdjustStartDay, officeAdjustStartYear);
    const startTime = convertTo24HourFormat(
      formData.eft_am_start_hour,
      formData.eft_am_start_minit,
      formData.eft_am_start_ampm
    );

    const endTime = convertTo24HourFormat(
      formData.eft_am_end_hour,
      formData.eft_am_end_minit,
      formData.eft_am_end_ampm
    );
    // console.log(startTime);
    e.preventDefault();
    setLoading(true);
    const effective_date_start = `${eventDate_OM}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-office-adjust-data`,
        {
          ...formOfficeAdjustAMData,
          effective_date_start: effective_date_start,
          effective_date_start_start_time: startTime,
          effective_date_start_end_time: endTime,
          note: "Adjust-AM",
        }
      );

      setFormOfficeAdjusteAMData({
        note: "Adjust-AM",
        officeAdjustStartMonth: "",
        officeAdjustStartDay: "",
        officeAdjustStartYear: "",
        officeAdjustEndMonth: "",
        officeAdjustEndtDay: "",
        officeAdjustEndYear: "",
        eft_am_start_hour: "",
        eft_am_start_minit: "",
        eft_am_end_hour: "",
        eft_am_end_minit: "",
        create_by: false,
      });
      setAjus(true);
      setErrors({});
      toast.success("Office AM Adjusted successfully!");
      handleAdjustFormOffice();
      setStart(true);
      setClose(false);
    } catch (error) {
      setAjus(true);
      setStart(false);
      setClose(false);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        // toast.error("Failed to Adjust Office.");
        console.error("Error response data:", error.response.data.errors);
        toast.error(error.response.data.errors.effective_date_start[0]);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error adding office close data:", error);
    } finally {
      setLoading(false);
    }
  };
  // ----------------Save Office Adjust PM Function------------
  const handleOfficeAdjustPMSave = async (e) => {
    const eventDate_PM = formatDate(officeAdjustEndMonth, officeAdjustEndtDay, officeAdjustEndYear);
    const startTime = convertTo24HourFormat(
      formData.eft_pm_start_hour,
      formData.eft_pm_start_minit,
      formData.eft_pm_start_ampm
    );

    const endTime = convertTo24HourFormat(
      formData.eft_pm_end_hour,
      formData.eft_pm_end_minit,
      formData.eft_pm_end_ampm
    );
    e.preventDefault();
    setLoading(true);
    const effective_date_end = `${eventDate_PM}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-office-adjust-data`,
        {
          ...formOfficeAdjustPMData,
          effective_date_end: effective_date_end,
          effective_date_end_start_time: startTime,
          effective_date_end_end_time: endTime,
          note: "Adjust-PM",
        }
      );

      setFormOfficeAdjustePMData({
        note: "Adjust-PM",
        officeAdjustStartMonth: "",
        officeAdjustStartDay: "",
        officeAdjustStartYear: "",
        officeAdjustEndMonth: "",
        officeAdjustEndtDay: "",
        officeAdjustEndYear: "",
        create_by: false,
      });

      setErrors({});
      toast.success("Office PM Adjusted successfully!");
      handleAdjustFormOffice();
      setEnd(true);
    } catch (error) {
      setEnd(false);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        console.error("Error response data:", error.response.data.errors);
        toast.error(error.response.data.errors.effective_date_end[0]);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error adding office close data:", error);
    } finally {
      setLoading(false);
    }
  };
  // --------------Form Clear Adjust office---------
  const handleAdjustFormOffice = (e) => {
    e.preventDefault();
    setOfficeAdjustStartDay("");
    setOfficeAdjustStartMonth("");
    setOfficeAdjustStartYear("");
    setOfficeAdjustEndDay("");
    setOfficeAdjustEndMonth("");
    setOfficeAdjustEndYear("");
    setErrors({});
    console.log("Form canceled and errors cleared");
  };


  // ------------Hide Error and Success Message after 3 Sec-----------
  useEffect(() => {
    let errorTimer, successTimer, startTimer, endTimer;

    if (errors.effective_date_start) {
      errorTimer = setTimeout(() => setErrors({}), 3000);
    }

    if (success) {
      setSuccess(true);
      successTimer = setTimeout(() => setSuccess(false), 3000);
    }
    if (start) {
      setStart(true);
      startTimer = setTimeout(() => setStart(false), 3000);
    }
    if (end) {
      setEnd(true);
      endTimer = setTimeout(() => setEnd(false), 3000);
    }
    return () => {
      clearTimeout(errorTimer);
      clearTimeout(successTimer);
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [errors, success, start, end]);



  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/office-last-note`);

      setOfficeData(response.data.lastClose || {});
      setOfficeAMData(response.data.lastAdjustAM || {});
      setOfficePMData(response.data.lastAdjustPM || {});
    } catch (error) {
      console.error("Error fetching office notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeParts = (timeString) => {
    if (!timeString || typeof timeString !== "string") {
      return { hour: "", minute: "", period: "" };
    }

    const [hour, minute] = timeString.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return { hour: String(hour12).padStart(2, "0"), minute: String(minute).padStart(2, "0"), period };
  };

  // Fetch time parts from database and update formData
  useEffect(() => {
    if (officeAMData?.effective_date_start_start_time) {
      const { hour, minute, period } = getTimeParts(officeAMData.effective_date_start_start_time);
      setFormData((prev) => ({
        ...prev,
        eft_am_start_hour: hour,
        eft_am_start_minit: minute,
        eft_am_start_ampm: period,
      }));
    }
    if (officeAMData?.effective_date_start_end_time) {
      const { hour, minute, period } = getTimeParts(officeAMData.effective_date_start_end_time);
      setFormData((prev) => ({
        ...prev,
        eft_am_end_hour: hour,
        eft_am_end_minit: minute,
        eft_am_end_ampm: period,
      }));
    }
    if (officePMData?.effective_date_end_start_time) {
      const timeParts = getTimeParts(officePMData.effective_date_end_start_time);
      setFormData((prevData) => ({
        ...prevData,
        eft_pm_start_hour: timeParts.hour,
        eft_pm_start_minit: timeParts.minute,
        eft_pm_start_ampm: timeParts.period,
      }));
    }
    if (officePMData?.effective_date_end_end_time) {
      const timeParts = getTimeParts(officePMData.effective_date_end_end_time);
      setFormData((prevData) => ({
        ...prevData,
        eft_pm_end_hour: timeParts.hour,
        eft_pm_end_minit: timeParts.minute,
        eft_pm_end_ampm: timeParts.period,
      }));
    }
  }, [officeAMData, officePMData]); // Runs when officeAMData officePMData is loaded


  // ------------------Reference to add Class For Design-------------
  const elementRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const handleClickOutside = (event) => {
    elementRefs.forEach((ref) => {
      if (ref.current && !ref.current.contains(event.target)) {
        ref.current.classList.add("hidden");
      }
    });
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [isHidden1, setIsHidden1] = useState(false);
  const [isHidden2, setIsHidden2] = useState(false);
  const [isHidden3, setIsHidden3] = useState(false);
  const handleClick1 = () => {
    setIsHidden1(true);
  };
  const handleClick2 = () => {
    setIsHidden2(true);
  };
  const handleClick3 = () => {
    setIsHidden3(true);
  };
  const startAM = useRef(null);
  const endAM = useRef(null);
  const startPM = useRef(null);
  const endPM = useRef(null);
  const startArrowAM1 = useRef(null);
  const startArrowAM2 = useRef(null);
  const startArrowAM3 = useRef(null);
  const startArrowAM4 = useRef(null);
  const startArrowAM5 = useRef(null);
  const startArrowAM6 = useRef(null);
  const endArrowAM1 = useRef(null);
  const endArrowAM2 = useRef(null);
  const endArrowAM3 = useRef(null);
  const endArrowAM4 = useRef(null);
  const endArrowAM5 = useRef(null);
  const endArrowAM6 = useRef(null);
  const startArrowPM1 = useRef(null);
  const startArrowPM2 = useRef(null);
  const startArrowPM3 = useRef(null);
  const startArrowPM4 = useRef(null);
  const startArrowPM5 = useRef(null);
  const startArrowPM6 = useRef(null);
  const endArrowPM1 = useRef(null);
  const endArrowPM2 = useRef(null);
  const endArrowPM3 = useRef(null);
  const endArrowPM4 = useRef(null);
  const endArrowPM5 = useRef(null);
  const endArrowPM6 = useRef(null);
  const addClasses1 = () => {
    if (startAM.current) {
      startAM.current.classList.add("bg-white", "drop-shadow-lg");
      startArrowAM1.current.classList.remove("hidden");
      startArrowAM2.current.classList.remove("hidden");
      startArrowAM3.current.classList.remove("hidden");
      startArrowAM4.current.classList.remove("hidden");
      startArrowAM5.current.classList.remove("hidden");
      startArrowAM6.current.classList.remove("hidden");
    }
  };
  const addClasses2 = () => {
    if (endAM.current) {
      endAM.current.classList.add("bg-white", "drop-shadow-lg");
      endArrowAM1.current.classList.remove("hidden");
      endArrowAM2.current.classList.remove("hidden");
      endArrowAM3.current.classList.remove("hidden");
      endArrowAM4.current.classList.remove("hidden");
      endArrowAM5.current.classList.remove("hidden");
      endArrowAM6.current.classList.remove("hidden");
    }
  };
  const addClasses3 = () => {
    if (startPM.current) {
      startPM.current.classList.add("bg-white", "drop-shadow-lg");
      startArrowPM1.current.classList.remove("hidden");
      startArrowPM2.current.classList.remove("hidden");
      startArrowPM3.current.classList.remove("hidden");
      startArrowPM4.current.classList.remove("hidden");
      startArrowPM5.current.classList.remove("hidden");
      startArrowPM6.current.classList.remove("hidden");
    }
  };
  const addClasses4 = () => {
    if (endPM.current) {
      endPM.current.classList.add("bg-white", "drop-shadow-lg");
      endArrowPM1.current.classList.remove("hidden");
      endArrowPM2.current.classList.remove("hidden");
      endArrowPM3.current.classList.remove("hidden");
      endArrowPM4.current.classList.remove("hidden");
      endArrowPM5.current.classList.remove("hidden");
      endArrowPM6.current.classList.remove("hidden");
    }
  };
  const removeClasses1 = () => {
    if (startAM.current) {
      startAM.current.classList.remove("bg-white", "drop-shadow-lg");
      startArrowAM1.current.classList.add("hidden");
      startArrowAM2.current.classList.add("hidden");
      startArrowAM3.current.classList.add("hidden");
      startArrowAM4.current.classList.add("hidden");
      startArrowAM5.current.classList.add("hidden");
      startArrowAM6.current.classList.add("hidden");
    }
  };
  const removeClasses2 = () => {
    if (endAM.current) {
      endAM.current.classList.remove("bg-white", "drop-shadow-lg");
      endArrowAM1.current.classList.add("hidden");
      endArrowAM3.current.classList.add("hidden");
      endArrowAM2.current.classList.add("hidden");
      endArrowAM4.current.classList.add("hidden");
      endArrowAM5.current.classList.add("hidden");
      endArrowAM6.current.classList.add("hidden");
    }
  };
  const removeClasses3 = () => {
    if (startPM.current) {
      startPM.current.classList.remove("bg-white", "drop-shadow-lg");
      startArrowPM1.current.classList.add("hidden");
      startArrowPM2.current.classList.add("hidden");
      startArrowPM3.current.classList.add("hidden");
      startArrowPM4.current.classList.add("hidden");
      startArrowPM5.current.classList.add("hidden");
      startArrowPM6.current.classList.add("hidden");
    }
  };
  const removeClasses4 = () => {
    if (endPM.current) {
      endPM.current.classList.remove("bg-white", "drop-shadow-lg");
      endArrowPM1.current.classList.add("hidden");
      endArrowPM2.current.classList.add("hidden");
      endArrowPM3.current.classList.add("hidden");
      endArrowPM4.current.classList.add("hidden");
      endArrowPM5.current.classList.add("hidden");
      endArrowPM6.current.classList.add("hidden");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startAM.current && !startAM.current.contains(event.target)) {
        removeClasses1();
      }
      if (endAM.current && !endAM.current.contains(event.target)) {
        removeClasses2();
      }
      if (startPM.current && !startPM.current.contains(event.target)) {
        removeClasses3();
      }
      if (endPM.current && !endPM.current.contains(event.target)) {
        removeClasses4();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------Arrow to change time-------------------
  const changePeriod = (type, direction) => {
    const currentPeriod = formData[type];
    const currentIndex = periods.indexOf(currentPeriod);
    const newIndex =
      (currentIndex + direction + periods.length) % periods.length;
    setFormData({ ...formData, [type]: periods[newIndex] });
  };
  const changeTime = (name, valueChange, options) => {
    const currentIndex = options.indexOf(formData[name]);
    const nextIndex =
      (currentIndex + valueChange + options.length) % options.length;
    setFormData((prevData) => ({
      ...prevData,
      [name]: options[nextIndex],
    }));
  };
  // --------------Arrow click function--------------------------
  const ineft_am_start_hour = () => changeTime("eft_am_start_hour", 1, hours);
  const deeft_am_start_hour = () => changeTime("eft_am_start_hour", -1, hours);
  const ineft_am_start_minit = () => changeTime("eft_am_start_minit", 1, minutes);
  const deeft_am_start_minit = () => changeTime("eft_am_start_minit", -1, minutes);
  const ineft_am_start_ampm = () => changePeriod("eft_am_start_ampm", 1);
  const deeft_am_start_ampm = () => changePeriod("eft_am_start_ampm", -1);

  const ineft_am_end_hour = () => changeTime("eft_am_end_hour", 1, hours);
  const deeft_am_end_hour = () => changeTime("eft_am_end_hour", -1, hours);
  const ineft_am_end_minit = () => changeTime("eft_am_end_minit", 1, minutes);
  const deeft_am_end_minit = () => changeTime("eft_am_end_minit", -1, minutes);
  const ineft_am_end_ampm = () => changePeriod("eft_am_end_ampm", 1);
  const deeft_am_end_ampm = () => changePeriod("eft_am_end_ampm", -1);

  const ineft_pm_start_hour = () => changeTime("eft_pm_start_hour", 1, hours);
  const deeft_pm_start_hour = () => changeTime("eft_pm_start_hour", -1, hours);
  const ineft_pm_start_minit = () => changeTime("eft_pm_start_minit", 1, minutes);
  const deeft_pm_start_minit = () => changeTime("eft_pm_start_minit", -1, minutes);
  const ineft_pm_start_ampm = () => changePeriod("eft_pm_start_ampm", 1);
  const deeft_pm_start_ampm = () => changePeriod("eft_pm_start_ampm", -1);

  const ineft_pm_end_hour = () => changeTime("eft_pm_end_hour", 1, hours);
  const deeft_pm_end_hour = () => changeTime("eft_pm_end_hour", -1, hours);
  const ineft_pm_end_minit = () => changeTime("eft_pm_end_minit", 1, minutes);
  const deeft_pm_end_minit = () => changeTime("eft_pm_end_minit", -1, minutes);
  const ineft_pm_end_ampm = () => changePeriod("eft_pm_end_ampm", 1);
  const deeft_pm_end_ampm = () => changePeriod("eft_pm_end_ampm", -1);


  return (
    <div className="relative bg-[#F9F9F9] w-[325px] ms-20 rounded-md text-center mt-[45px] select-none">
      <div className="absolute left-[-15px] bg-[#657E98] w-[355px] h-[55px] text-white inter-medium text-[24px] flex rounded-t-md">
        <p className="flex text-center items-center m-auto">Office Closed</p>
      </div>
      <form onSubmit={handleOfficeCloseSave}>
        <div className="flex justify-center items-center rounded-md text-center pt-[85px]" onClick={handleClick1}>
          <div className="flex items-center rounded bg-white">
            <input
              className="py-4 text-center focus:outline-none w-[80px] rounded-l-md"
              type="text"
              placeholder="MM"
              name="officeCloseStartMonth"
              value={officeCloseStartMonth}
              onChange={(e) => handleDateChange(e, setOfficeCloseStartMonth)}
              required
            />
            <span>/</span>
            <input
              className="py-4 text-center focus:outline-none w-[80px]"
              type="text"
              placeholder="DD"
              name="officeCloseStartDay"
              value={officeCloseStartDay}
              onChange={(e) => handleDateChange(e, setOfficeCloseStartDay)}
              required
            />
            <span>/</span>
            <input
              className="py-4 text-center focus:outline-none w-[80px] rounded-r-md"
              type="text"
              placeholder="YYYY"
              name="officeCloseStartYear"
              value={officeCloseStartYear}
              onChange={(e) => handleDateChange(e, setOfficeCloseStartYear)}
              required
            />
          </div>
        </div>
        <div>
          {/* {close && errors && !adjus && (
            <>
              {errors.effective_date_start && <p className="pt-3 text-red-800"><small>{errors.effective_date_start}</small></p>}
              {success && <p className="pt-3 text-green-800"><small>Successfully Closed the Office!</small></p>}
            </>
          )} */}
        </div>
        <div className={isHidden1 ? "flex justify-center pt-5" : "flex justify-center pt-5 deactive"}>
          <button
            type="submit"
            className="border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
          >
            <FontAwesomeIcon icon={faCheck} size="xl" />
          </button>
          <button
            className="border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
            id="close"
            onClick={handleClearFormOfficeClose}
          >
            <FontAwesomeIcon icon={faXmark} size="xl" />
          </button>
        </div>
      </form>

      <div className="absolute bg-[#657E98] w-[355px] left-[-15px] h-[55px] text-white inter-medium text-[24px] flex mt-[20px] rounded-md">
        <p className="flex text-center items-center m-auto">
          Adjust Default Office Hours
        </p>
      </div>

      <div className="m-auto rounded-md text-center pt-[100px]">
        <p className="pb-2">Effective Start Date - AM</p>
        <form onSubmit={handleOfficeAdjustAMSave}>
          <div className="flex justify-center items-center rounded-md text-center pt-[5px]" onClick={handleClick2}>
            <div className="flex items-center rounded bg-white">
              <input
                className="py-4 text-center focus:outline-none w-[80px] rounded-l-md"
                type="text"
                placeholder="MM"
                name="officeAdjustStartMonth"
                value={officeAdjustStartMonth}
                onChange={(e) => handleDateAdjustChange(e, setOfficeAdjustStartMonth)}
              />
              <span>/</span>
              <input
                className="py-4 text-center focus:outline-none w-[80px]"
                type="text"
                placeholder="DD"
                name="officeAdjustStartDay"
                value={officeAdjustStartDay}
                onChange={(e) => handleDateAdjustChange(e, setOfficeAdjustStartDay)}
              />
              <span>/</span>
              <input
                className="py-4 text-center focus:outline-none w-[80px] rounded-r-md"
                type="text"
                placeholder="YYYY"
                name="officeAdjustStartYear"
                value={officeAdjustStartYear}
                onChange={(e) => handleDateAdjustChange(e, setOfficeAdjustStartYear)}
              />
            </div>
          </div>

          <div className="m-auto pt-5 pb-3 relative">
            <div className="flex justify-between mx-[10%]">
              <div onClick={() => addClasses1()} class="flex justify-center items-center w-[120px] cursor-pointer">
                <div
                  class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px]" ref={startAM}>
                  {/* Hour Select */}
                  <select name="eft_am_start_hour" value={formData.eft_am_start_hour} onChange={handleChange}>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span className="ms-[6px]">:</span>
                  {/* Minute Select */}
                  <select name="eft_am_start_minit" value={formData.eft_am_start_minit} onChange={handleChange}>
                    {minutes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* AM/PM Select */}
                  <select name="eft_am_start_ampm" value={formData.eft_am_start_ampm} onChange={handleChange}>
                    {["AM", "PM"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  {/* -----------Hour Arrow------------ */}
                  <div onClick={ineft_am_start_hour} className="hour absolute top-[5px] left-[17px] z-10 hidden" ref={startArrowAM1}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={deeft_am_start_hour} className="hour absolute bottom-[5px] left-[17px] z-10 hidden" ref={startArrowAM2}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>

                  {/* -----------Miniute Arrow----------- */}
                  <div onClick={ineft_am_start_minit} className="miniute absolute top-[5px] right-[45px] z-10 hidden" ref={startArrowAM3}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={deeft_am_start_minit} className="miniute absolute bottom-[5px] right-[45px] z-10 hidden" ref={startArrowAM4}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  {/* -----------APPM Arrow----------- */}
                  <div onClick={ineft_am_start_ampm} className="ampm absolute top-[5px] right-[13px] z-10 hidden" ref={startArrowAM5}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={deeft_am_start_ampm} className="ampm absolute bottom-[5px] right-[13px] z-10 hidden" ref={startArrowAM6}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                </div>
              </div>
              <div onClick={() => addClasses2()} class="flex justify-center items-center w-[120px] cursor-pointer">
                <div
                  class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px]" ref={endAM}>
                  {/* End Hour Select */}
                  <select name="eft_am_end_hour" value={formData.eft_am_end_hour} onChange={handleChange}>
                    {endhours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <span className="ms-[6px]">:</span>

                  {/* End Minute Select */}
                  <select name="eft_am_end_minit" value={formData.eft_am_end_minit} onChange={handleChange}>
                    {endminutes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* End AM/PM Select */}
                  <select name="eft_am_end_ampm" value={formData.eft_am_end_ampm} onChange={handleChange}>
                    {endperiods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {/* -----------Hour Arrow------------ */}
                  <div onClick={ineft_am_end_hour} className="hour absolute top-[5px] left-[17px] z-10 hidden" ref={endArrowAM1}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={deeft_am_end_hour} className="hour absolute bottom-[5px] left-[17px] z-10 hidden" ref={endArrowAM2}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>

                  {/* -----------Miniute Arrow----------- */}
                  <div onClick={ineft_am_end_minit} className="miniute absolute top-[5px] right-[45px] z-10 hidden" ref={endArrowAM3}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={deeft_am_end_minit} className="miniute absolute bottom-[5px] right-[45px] z-10 hidden" ref={endArrowAM4}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  {/* -----------APPM Arrow----------- */}
                  <div onClick={ineft_am_end_ampm} className="ampm absolute top-[5px] right-[13px] z-10 hidden" ref={endArrowAM5}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={deeft_am_end_ampm} className="ampm absolute bottom-[5px] right-[13px] z-10 hidden" ref={endArrowAM6}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            {/* {adjus && errors && !close && (
              <>
                {errors.effective_date_start && <p className="text-red-800"><small>{errors.effective_date_start}</small></p>}
                {start && <p className="pb-3 text-green-800"><small>Successfully Adjust New Office Hour!</small></p>}
              </>
            )} */}
          </div>
          <div className={isHidden2 ? "flex justify-center py-2" : "flex justify-center py-2 deactive"}>
            <button
              type="submit"
              className="border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
            >
              <FontAwesomeIcon icon={faCheck} size="xl" />
            </button>
            <button
              className="border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
              onClick={handleAdjustFormOffice}
              id="close"
            >
              <FontAwesomeIcon icon={faXmark} size="xl" />
            </button>
          </div>
        </form>
        <hr />

        <div className="m-auto rounded-md text-center pt-[35px]">
          <p className="pb-2">Effective Start Date - PM</p>
          <form onSubmit={handleOfficeAdjustPMSave}>
            <div className="flex justify-center items-center rounded-md text-center pt-[5px]" onClick={handleClick3}>
              <div className="flex items-center rounded bg-white mt-4">
                <input
                  className="py-4 text-center focus:outline-none w-[80px] rounded-l-md"
                  type="text"
                  placeholder="MM"
                  name="officeAdjustEndMonth"
                  value={officeAdjustEndMonth}
                  onChange={(e) => handleDateAdjustChange(e, setOfficeAdjustEndMonth)}
                />
                <span>/</span>
                <input
                  className="py-4 text-center focus:outline-none w-[80px]"
                  type="text"
                  placeholder="DD"
                  name="officeAdjustEndDay"
                  value={officeAdjustEndtDay}
                  onChange={(e) => handleDateAdjustChange(e, setOfficeAdjustEndDay)}
                />
                <span>/</span>
                <input
                  className="py-4 text-center focus:outline-none w-[80px] rounded-r-md"
                  type="text"
                  placeholder="YYYY"
                  name="officeAdjustEndYear"
                  value={officeAdjustEndYear}
                  onChange={(e) => handleDateAdjustChange(e, setOfficeAdjustEndYear)}
                />
              </div>
            </div>
            <div className="m-auto pt-5 pb-3 relative">
              <div className="flex justify-between mx-[10%]">
                <div onClick={() => addClasses3()} class="flex justify-center items-center w-[120px] cursor-pointer">
                  <div
                    class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px] " ref={startPM}>
                    <select name="eft_pm_start_hour" value={formData.eft_pm_start_hour} onChange={handleChange}>
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span class="ms-[6px]">:</span>
                    <select name=" eft_pm_start_minit" value={formData.eft_pm_start_minit} onChange={handleChange}>
                      {minutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select name="eft_pm_start_ampm" value={formData.eft_pm_start_ampm} onChange={handleChange}>
                      {periods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {/* -----------Hour Arrow------------ */}
                    <div onClick={ineft_pm_start_hour} className="hour absolute top-[5px] left-[17px] z-10 hidden" ref={startArrowPM1}>
                      <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    <div onClick={deeft_pm_start_hour} className="hour absolute bottom-[5px] left-[17px] z-10 hidden" ref={startArrowPM2}>
                      <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>

                    {/* -----------Miniute Arrow----------- */}
                    <div onClick={ineft_pm_start_minit} className="miniute absolute top-[5px] right-[45px] z-10 hidden" ref={startArrowPM3}>
                      <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    <div onClick={deeft_pm_start_minit} className="miniute absolute bottom-[5px] right-[45px] z-10 hidden" ref={startArrowPM4}>
                      <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    {/* -----------APPM Arrow----------- */}
                    <div onClick={ineft_pm_start_ampm} className="ampm absolute top-[5px] right-[13px] z-10 hidden" ref={startArrowPM5}>
                      <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    <div onClick={deeft_pm_start_ampm} className="ampm absolute bottom-[5px] right-[13px] z-10 hidden" ref={startArrowPM6}>
                      <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                  </div>
                </div>
                <div onClick={() => addClasses4()} class="flex justify-center items-center w-[120px] cursor-pointer">
                  <div
                    class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px]" ref={endPM}>
                    {/* <select name="eft_pm_end_hour" value={formData.eft_pm_end_hour} onChange={handleChange}> */}
                    <select name="eft_pm_end_hour" value={formData.eft_pm_end_hour} onChange={handleChange}>
                      {endhours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span class="ms-[6px]">:</span>
                    <select name=" eft_pm_end_minit" value={formData.eft_pm_end_minit} onChange={handleChange}>
                      {endminutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select name="eft_pm_end_ampm" value={formData.eft_pm_end_ampm} onChange={handleChange}>
                      {endperiods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {/* -----------Hour Arrow------------ */}
                    <div onClick={ineft_pm_end_hour} className="hour absolute top-[5px] left-[17px] z-10 hidden" ref={endArrowPM1}>
                      <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    <div onClick={deeft_pm_end_hour} className="hour absolute bottom-[5px] left-[17px] z-10 hidden" ref={endArrowPM2}>
                      <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>

                    {/* -----------Miniute Arrow----------- */}
                    <div onClick={ineft_pm_end_minit} className="miniute absolute top-[5px] right-[45px] z-10 hidden" ref={endArrowPM3}>
                      <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg"></FontAwesomeIcon>
                    </div>
                    <div onClick={deeft_pm_end_minit} className="miniute absolute bottom-[5px] right-[45px] z-10 hidden" ref={endArrowPM4}>
                      <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    {/* -----------APPM Arrow----------- */}
                    <div onClick={ineft_pm_end_ampm} className="ampm absolute top-[5px] right-[13px] z-10 hidden" ref={endArrowPM5}>
                      <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                    <div onClick={deeft_pm_end_ampm} className="ampm absolute bottom-[5px] right-[13px] z-10 hidden" ref={endArrowPM6}>
                      <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div>
              <div>
                {errors.effective_date_end && <p className="pt-3 text-red-800"><small>{errors.effective_date_end}</small></p>}
                {end && <p className="pb-3 text-green-800"><small>Successfully Adjust New Office Hour!</small></p>}
              </div>
            </div> */}
            <div className={isHidden3 ? "flex justify-center py-2" : "flex justify-center py-2 deactive"}>
              <button
                type="submit"
                className="border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
              >
                <FontAwesomeIcon icon={faCheck} size="xl" />
              </button>
              <button
                className="border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
                id="close"
                onClick={handleAdjustFormOffice}
              >
                <FontAwesomeIcon icon={faXmark} size="xl" />
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />
    </div>
  );
}

export default EditSchedulingSidebar;
