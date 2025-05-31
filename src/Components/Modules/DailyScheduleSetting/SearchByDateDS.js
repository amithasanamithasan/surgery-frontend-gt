import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Calendar from "./celender";
import { format } from "date-fns";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Constant from "../../../Constant";
import EventCard from "./EventCard";
import moment from "moment";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Preloader from "../../Partials/preLoader";
import AddEvent from "./addEvent";
import utc from "dayjs/plugin/utc";
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
const SearchByDateDs = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().utc());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [surgeonsRole, setSurgeonsRole] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [block, setBlock] = useState([]);
  const location = useLocation();
  const [cme, setCme] = useState([]);
  const [officeCloseDate, setOfficeCloseDate] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [omPm, setOmPm] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [adjustomPm, setAdjustomPm] = useState([]);
  const query = new URLSearchParams(location.search);
  const date = query.get("date");
  const [loading, setLoading] = useState(true);
  const daysInMonth = selectedDate.daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, index) =>
    selectedDate.utc().startOf("month").add(index, "day")
  );
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Fetch Data
  const fetchData = async (eventDate) => {
    setLoading(true);
    try {
      const response = await Promise.all([
        AxiosAuthInstance.get(
          `${Constant.BASE_URL}/daily-schedule-block-time`,
          { params: { event_date: eventDate } }
        ),
        AxiosAuthInstance.get(
          `${Constant.BASE_URL}/daily-schedule-vacation-data`,
          { params: { event_date: eventDate } }
        ),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-om-pm`, {
          params: { event_date: eventDate },
        }),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-data`, {
          params: { event_date: eventDate },
        }),
        AxiosAuthInstance.get(
          `${Constant.BASE_URL}/daily-schedule-office-close`,
          { params: { event_date: eventDate } }
        ),
        AxiosAuthInstance.get(
          `${Constant.BASE_URL}/daily-schedule-office-adjust`,
          { params: { event_date: eventDate } }
        ),
      ]);

      const [
        blockRes,
        cmeRes,
        omPmRes,
        scheduleRes,
        officeCloseRes,
        adjustRes,
      ] = response;

      console.log("Block Response:", blockRes.data);
      console.log("Vacation Response:", cmeRes.data.vacations);
      console.log("OM/PM Response:", omPmRes.data.ompm);
      console.log("Schedule Response:", scheduleRes.data);
      console.log("Office Close Response:", officeCloseRes.data);
      console.log("Adjust Response:", adjustRes.data);

      setBlock(blockRes.data);
      setVacations(cmeRes.data.vacations);
      setOfficeCloseDate(officeCloseRes.data.officeCloseDate);

      const omPmData = omPmRes.data.ompm || {};
      setOmPm({
        surgeon_o_am: Array.isArray(omPmData.surgeon_o_am)
          ? omPmData.surgeon_o_am
          : [omPmData.surgeon_o_am],
        surgeon_o_pm: Array.isArray(omPmData.surgeon_o_pm)
          ? omPmData.surgeon_o_pm
          : [omPmData.surgeon_o_pm],
      });

      setAdjustomPm({
        AM: adjustRes?.data?.adjustmentAM || [],
        PM: adjustRes?.data?.adjustmentPM || [],
      });

      const { surgeon_events, times, surgeons, surgeonsRole } =
        scheduleRes.data;
      // Custom surgeon name order
      // const customSurgeonOrder = ['Sharif Khan', 'Musfiquer', 'Oleraj Hossin', 'Rajib Chowdhury'];
      const customSurgeonOrder = [
        "Dr. Myers",
        "Dr. Mallick",
        "Dr. Nuriddin",
        "Dr. Fernandez",
      ];

      // const customSurgeonOrder = ['Brian Myers', 'Ahmad Nuriddin', 'Jose Fernandez', 'Reema Mallick'];
      // Sort the surgeons list based on the custom order
      const sortedSurgeons = customSurgeonOrder
        .map((name) => surgeons.find((s) => s.name === name))
        .filter(Boolean); // skip names not found

      setSchedule(surgeon_events);
      setTimeSlots(times);
      setSurgeons(sortedSurgeons);
      setSurgeonsRole(Object.values(surgeonsRole));
    } catch (error) {
      console.error("Error fetching data:", error);
      setSchedule([]); // Reset schedule only in case of error
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data When Selected Date Changes
  // useEffect(() => {
  //   const eventDate = selectedDate.utc().format("YYYY-MM-DD");
  //   fetchData(eventDate);
  // }, [selectedDate, refreshData]);

  // useEffect(() => {
  //   const eventDate = dayjs.utc(date).format("YYYY-MM-DD");
  //   fetchData(eventDate);
  // }, [selectedDate, refreshData]);

  const eventDate = dayjs.utc(date).format("YYYY-MM-DD");

  useEffect(() => {
    fetchData(eventDate);
  }, [eventDate, refreshData]);
  const handlePrint = () => {
    // Clone the target DOM element
    const originalContent = document
      .getElementById("print-schedule")
      .cloneNode(true);
    // Remove the element with id="ignor"
    const elementToIgnore = originalContent.querySelector("#ignor");
    if (elementToIgnore) {
      elementToIgnore.remove();
    }
    // Get the HTML string of the modified clone
    const content = originalContent.outerHTML;
    // Create the iframe
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.width = "0px";
    printWindow.style.height = "0px";
    printWindow.style.border = "none";
    document.body.appendChild(printWindow);
    const printDocument = printWindow.contentWindow.document;
    printDocument.open();
    printDocument.write(`
    <html>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="print-color-adjust" content="exact">
      <head>
        <title>Daily Surgery Schedule</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link href="/assets/css/style.css" rel="stylesheet">
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: none;
            }
            body {
              font-family: Arial, sans-serif;
            }
            .page-header, .page-footer {
              text-align: center;
              font-size: 12px;
              color: #333;
            }
            .page-header {
              margin-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .page-footer {
              margin-top: 20px;
              border-top: 1px solid #ddd;
            }
            .print-container {
              margin: 0px;
            }
            .visible-table {
              z-index: 1000;
            }
            table td {
              height: 14px;
            }
            #show {
              background: black;
            }
          }
        </style>
      </head>
      <body class="bg-white">
        ${content}
      </body>
    </html>
  `);
    printDocument.close();

    // Wait for content to be ready before printing
    printWindow.onload = () => {
      printWindow.contentWindow.focus();
      printWindow.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    };
  };

  const normalizeTime = (time) => {
    if (!time || typeof time !== "string" || !time.includes(":")) {
      console.error("Invalid time value:", time);
      return "00:00"; // Default to avoid errors
    }
    return time.split(":").slice(0, 2).join(":");
  };

  const toMinutes = (time) => {
    if (!time || typeof time !== "string" || !time.includes(":")) {
      console.error("Invalid time value:", time);
      return 0;
    }
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const getRowHeight = (rowSpan) => {
    if (rowSpan >= 52) return rowSpan * 13.9;
    if (rowSpan >= 50) return rowSpan * 13.9;
    if (rowSpan >= 48) return rowSpan * 13.9;
    if (rowSpan >= 46) return rowSpan * 13.9;
    if (rowSpan >= 44) return rowSpan * 13.9;
    if (rowSpan >= 42) return rowSpan * 13.9;
    if (rowSpan >= 40) return rowSpan * 13.9;
    if (rowSpan >= 38) return rowSpan * 13.9;
    if (rowSpan >= 36) return rowSpan * 13.9;
    if (rowSpan >= 34) return rowSpan * 13.9;
    if (rowSpan >= 32) return rowSpan * 13.9;
    if (rowSpan >= 30) return rowSpan * 13.9;
    if (rowSpan >= 28) return rowSpan * 13.8;
    if (rowSpan >= 26) return rowSpan * 13.8;
    if (rowSpan >= 24) return rowSpan * 13.8;
    if (rowSpan >= 22) return rowSpan * 13.8;
    if (rowSpan >= 20) return rowSpan * 13.8;
    if (rowSpan >= 18) return rowSpan * 13.8;
    if (rowSpan >= 16) return rowSpan * 13.8;
    if (rowSpan >= 14) return rowSpan * 13.8;
    if (rowSpan >= 12) return rowSpan * 13.8;
    if (rowSpan >= 10) return rowSpan * 13.7;
    if (rowSpan >= 8) return rowSpan * 13;
    if (rowSpan >= 6) return rowSpan * 12.8;
    if (rowSpan >= 4) return rowSpan * 12;
    if (rowSpan >= 2) return rowSpan * 11;
    if (rowSpan > 0) return rowSpan * 10;
    return 0;
  };
  const renderScheduleWithCollapsing = (time, surgeon_id) => {
    let printed = false;
    const events = schedule[surgeon_id]
      ? Object.values(schedule[surgeon_id])
      : [];
    const highlightColor = "#E5DEB0";
    const highlightColorOffice = "#88E788";

    const currentDate = dayjs.utc(date).format("YYYY-MM-DD");

    const isFullDayVacation = () => {
      const vacationArray = Array.isArray(vacations)
        ? vacations
        : Object.values(vacations);
      return vacationArray.find((item) => item.surgeon_id === surgeon_id);
      // const currentDate = selectedDate.format("YYYY-MM-DD");
      // return vacationData && vacationData.vacation_dates.includes(currentDate);
    };

    const vacationData = isFullDayVacation();
    const highlightText = vacationData
      ? vacationData.vacation_type
      : "Vacation";

    if (vacationData && vacationData.vacation_dates.includes(currentDate)) {
      const startIndex = timeSlots.indexOf(time);
      const rowSpan = timeSlots.length - startIndex + 1;
      if (time === timeSlots[0]) {
        return (
          <td
            key={`${surgeon_id}-vacation`}
            rowSpan={rowSpan}
            className="px-5 2xl:px-0"
          >
            <EventCard
              color={highlightColor}
              title={highlightText}
              surgeon_d=""
              event_location=""
              patient_name=""
              procedure=""
              surgeon_name=""
              link="#"
              border=""
              diable={true}
              height={`${rowSpan * 13.6}px`}
              data={fetchData}
              rowlist={rowSpan}
              item_vac="fit"
            />
          </td>
        );
      }

      return null;
    }

    let overlappingEvents = [];
    const occupiedSlots = {};

    const orgina_data = events.map((event) => {
      if (time === event.start_time) {
        const startIndex = timeSlots.indexOf(event.start_time);
        const endIndex = timeSlots.indexOf(event.end_time);
        const rowSpan = endIndex - startIndex + 1;
        printed = true;

        const eventData = {
          id: event.id,
          surgeon_d: "",
          surgeon_name: "",
          event_location: "",
          patient_name: "",
          procedure: "",
          color: "#FFF",
          title: "",
          rowSpan,
        };

        if (event.purpose === "Procedure") {
          eventData.surgeon_d = event.surgeon_type;
          eventData.event_location =
            event.event_location === "others"
              ? event.event_location_text
              : event.event_location ?? "";
          eventData.patient_name = `${event.patient_first_name || ""} ${
            event.patient_last_name || ""
          }`;
          eventData.procedure = event.procedure || "";
          eventData.patient_mrn = `${event.patient_mrn || ""}`;
          if (event.event_location === "PHH MOR") {
            eventData.color = "#90D5FF";
          } else if (event.event_location === "PHH HOSC") {
            eventData.color = "#E8CDB4";
          } else if (event.event_location === "others") {
            eventData.color = "#BAD9C3";
          }
        } else if (event.purpose === "Meeting") {
          eventData.title = event.purpose || "";
          eventData.event_note_metting = `${event.event_note || ""}`;
          eventData.surgeon_name = event.surgeon || "";
          eventData.procedures = event.procedure || "";
          eventData.color = "#cccccc";
          eventData.priority = "Meeting";
        } else if (event.purpose === "Office") {
          eventData.title = event.purpose || "";
          eventData.office_note = event.procedure || "";
          eventData.color = "#88E788";
        }

        overlappingEvents.push(eventData);
        return null;
      }
    });

    if (overlappingEvents.length > 0) {
      overlappingEvents.sort((a, b) => (a.title === "Meeting" ? -1 : 1));
      return (
        <td key={`${surgeon_id}-${time}`} className="px-5 2xl:px-0 relative">
          {overlappingEvents.map((overlap, index) => (
            <div
              key={index}
              style={{
                top: `${index * 5}px`,
                left: `${index * 5}px`,
                zIndex: 10 + index,
              }}
            >
              <EventCard
                color={overlap.color}
                title={overlap.title}
                surgeon_d={overlap.surgeon_d}
                event_location={overlap.event_location}
                patient_name={overlap.patient_name}
                procedure={overlap.procedure}
                surgeon_name={overlap.surgeon_name}
                link={
                  localStorage.role == 3
                    ? "#"
                    : overlap?.id
                    ? `${overlap.id}`
                    : "#"
                }
                diable={localStorage.role == 3 ? true : false}
                border=""
                height={`${getRowHeight(overlap.rowSpan)}px`}
                data={fetchData}
                purposeformetting={overlap.priority}
                rowlist={overlap.rowSpan}
                patient_mrn={overlap.patient_mrn}
                event_note_metting={overlap.event_note_metting}
                office_note={overlap.office_note}
                meeting_note={overlap.procedures}
              />
            </div>
          ))}
        </td>
      );
    }

    const isAMFull =
      Array.isArray(omPm.surgeon_o_am) &&
      omPm.surgeon_o_am.includes(parseInt(surgeon_id));
    const isPMFull =
      Array.isArray(omPm.surgeon_o_pm) &&
      omPm.surgeon_o_pm.includes(parseInt(surgeon_id));

    // Fetch the correct AM and PM time slots from API response
    // For AM Pm Card
    const amTimes = adjustomPm?.AM ?? [];
    const pmTimes = adjustomPm?.PM ?? [];

    console.log("AM Times:", amTimes);
    console.log("PM Times:", pmTimes);

    const AM_START = adjustomPm?.AM?.start_time || null;
    const AM_END = adjustomPm?.AM?.end_time || null;
    const PM_START = adjustomPm?.PM?.start_time || null;
    const PM_END = adjustomPm?.PM?.end_time || null;

    let AM_END_INIT = null;
    let PM_END_INIT = null;

    if (AM_START && AM_START.includes(":")) {
      const [amHour, amMinute] = AM_START.split(":").map(Number);
      const amDate = new Date();
      amDate.setHours(amHour, amMinute, 0);
      amDate.setMinutes(amDate.getMinutes() + 15);
      AM_END_INIT = amDate.toTimeString().slice(0, 5);
    } else {
      console.error("AM_START is invalid:", AM_START);
    }

    if (PM_START && PM_START.includes(":")) {
      const [pmHour, pmMinute] = PM_START.split(":").map(Number);
      const pmDate = new Date();
      pmDate.setHours(pmHour, pmMinute, 0);
      pmDate.setMinutes(pmDate.getMinutes() + 15);
      PM_END_INIT = pmDate.toTimeString().slice(0, 5);
    } else {
      console.error("PM_START is invalid:", PM_START);
    }

    // Check if "Office" event overlaps with AM or PM time slots
    // const isOfficeEventDuringAM = overlappingEvents.some(
    //   (event) => event.purpose === "Office" && normalizeTime(event.start_time) >= AM_START && normalizeTime(event.end_time) <= AM_END
    // );
    // const isOfficeEventDuringPM = overlappingEvents.some(
    //   (event) => event.purpose === "Office" && normalizeTime(event.start_time) >= PM_START && normalizeTime(event.end_time) <= PM_END
    // );
    const isOfficeEventDuringAM = events.some((event) => {
      const startTime = toMinutes(normalizeTime(event.start_time));
      const endTime = toMinutes(normalizeTime(event.end_time));
      const AM_START_MIN = toMinutes(AM_START);
      const AM_END_MIN = toMinutes(AM_END);

      console.log("Office AM:", startTime, "Existing AM:", AM_START_MIN);
      console.log("Office PM:", endTime, "Existing PM:", AM_END_MIN);

      return (
        (event.purpose === "office" &&
          startTime >= AM_START_MIN &&
          startTime <= AM_END_MIN) || // Ensure event starts between AM or PM
        (endTime >= AM_START_MIN && startTime <= AM_END_MIN) || //Ensure event ends between AM or PM
        (startTime == AM_START_MIN && startTime == AM_END_MIN) ||
        (endTime == AM_START_MIN && endTime == AM_END_MIN)
      );
    });
    const isOfficeEventDuringPM = events.some((event) => {
      const startTime = toMinutes(normalizeTime(event.start_time));
      const endTime = toMinutes(normalizeTime(event.end_time));
      const PM_START_MIN = toMinutes(PM_START);
      const PM_END_MIN = toMinutes(PM_END);

      console.log("Office AM:", startTime, "Existing AM:", PM_START_MIN);
      console.log("Office PM:", endTime, "Existing PM:", PM_END_MIN);

      return (
        (event.purpose === "office" &&
          startTime >= PM_START_MIN &&
          startTime <= PM_END_MIN) || // Ensure event starts between AM or PM
        (endTime >= PM_START_MIN && startTime <= PM_END_MIN) || //Ensure event ends between AM or PM
        (startTime == PM_START_MIN && startTime == PM_END_MIN) ||
        (endTime == PM_START_MIN && endTime == PM_END_MIN)
      );
    });
    console.log("isOfficeEventDuringAM:", isOfficeEventDuringAM);
    console.log("isOfficeEventDuringAM:", isOfficeEventDuringPM);

    if (
      isAMFull &&
      time >= AM_START &&
      time <= AM_END_INIT &&
      !isOfficeEventDuringAM
    ) {
      const rowSpan = timeSlots.filter(
        (t) => t >= AM_START && t <= AM_END_INIT
      ).length;
      const rowSpanAM =
        timeSlots.filter((t) => t >= AM_START && t <= AM_END).length + 1;

      return (
        <td
          key={`${surgeon_id}-am`}
          rowSpan={rowSpan}
          className="px-5 2xl:px-0"
        >
          <EventCard
            color={highlightColorOffice}
            title="Office"
            link={
              localStorage.role == 3
                ? "#"
                : adjustomPm?.AM?.id
                ? `${adjustomPm.AM.id}`
                : "#"
            }
            diable={localStorage.role == 3 ? true : false}
            adjust={true}
            data={fetchData}
            height={`${getRowHeight(rowSpanAM)}px`}
            rowlist={rowSpanAM}
          />
        </td>
      );
    }

    if (
      isPMFull &&
      time >= PM_START &&
      time <= PM_END_INIT &&
      !isOfficeEventDuringPM
    ) {
      const rowSpan = timeSlots.filter(
        (t) => t >= PM_START && t <= PM_END_INIT
      ).length;
      const rowSpanPM =
        timeSlots.filter((t) => t >= PM_START && t <= PM_END).length + 1;

      return (
        <td
          key={`${surgeon_id}-pm`}
          rowSpan={rowSpan}
          className="px-5 2xl:px-0"
        >
          <EventCard
            color={highlightColorOffice}
            title="Office"
            //link={adjustomPm?.PM?.id ? `${adjustomPm.PM.id}` : "#"}
            link={
              localStorage.role == 3
                ? "#"
                : adjustomPm?.AM?.id
                ? `${adjustomPm.AM.id}`
                : "#"
            }
            diable={localStorage.role == 3 ? true : false}
            adjust={true}
            data={fetchData}
            height={`${getRowHeight(rowSpanPM)}px`}
            rowlist={rowSpanPM}
          />
        </td>
      );
    }

    if (printed) {
      return orgina_data;
    }

    return (
      <td className="px-5 2xl:px-0">
        {" "}
        <div className="widthdp"> </div>{" "}
      </td>
    );
  };

  const boldTimes = [
    "05:00 AM",
    "06:00 AM",
    "07:00 AM",
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
    "11:00 PM",
    "12:00 AM",
  ];
  const HiddenTimes = [
    "07:15 AM",
    "07:45 AM",
    "08:15 AM",
    "08:45 AM",
    "09:15 AM",
    "09:45 AM",
    "10:15 AM",
    "10:45 AM",
    "11:15 AM",
    "11:45 AM",
    "12:15 PM",
    "12:45 PM",
    "01:15 PM",
    "01:45 PM",
    "02:15 PM",
    "02:45 PM",
    "03:15 PM",
    "03:45 PM",
    "04:15 PM",
    "04:45 PM",
    "05:15 PM",
    "05:45 PM",
    "06:15 PM",
    "06:45 PM",
    "07:15 PM",
    "07:45 PM",
  ];
  // Combine surgeons and roles
  const combinedData = surgeons.map((surgeon) => {
    const roleEntries = Object.values(surgeonsRole).filter(
      (role) => role.id === surgeon.id
    );
    return {
      id: surgeon.id,
      name: surgeon.name,
      roles: roleEntries.map((role) => role.role),
    };
  });

  const tableContainerRef = useRef(null);
  const getScrollAmount = () => {
    const width = window.innerWidth;
    if (window.innerWidth < 340) {
      return 220;
    } else if (window.innerWidth < 500) {
      return 450 - (640 - width);
    } else if (window.innerWidth < 640) {
      return 500 - (640 - width);
    } else if (window.innerWidth < 1536) {
      return 478;
    }
  };

  const scrollLeftTable = () => {
    tableContainerRef.current.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    });
  };

  const scrollRightTable = () => {
    tableContainerRef.current.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    });
  };
  const handleLogout = () => {
    AxiosAuthInstance.post("logout").then((r) => {
      localStorage.removeItem("id");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("user_status");
      localStorage.removeItem("token");
      window.location.href = "/";
    });
  };
  const openModal = () => {
    setShowModal(true);
    setRefreshData((prev) => !prev);
  };
  const closeModal = () => {
    setShowModal(false);
  };
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/daily-schedule"); // Go back to the previous page
  };
  if (loading) {
    return <Preloader />;
  }
  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] hidden lg:flex items-center sticky top-0 z-10">
        <nav className="lg:w-[900px] xl:w-[1200px] 2xl:w-[1400px] flex flex-wrap items-center justify-between mx-auto">
          <Link
            to="/dashboard"
            className="svgx me-[100px] 2xl:me-[350px] flex justify-item-start px-2 py-2 rounded bg-white text-[#657E98] hover:bg-[#657E98] hover:transition hover:duration-300"
          >
            <svg
              id="Group_63"
              data-name="Group 63"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
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
          <Link
            to="/"
            className="flex justify-item-center items-center mx-auto overflow-hidden"
          >
            <span className="self-center text-[20px] inter-light whitespace-nowrap dark:text-black">
              Surgery South, P.C.
            </span>
          </Link>
          <div className="flex">
            <Link
              to="/block-calender"
              target="_blank"
              className="bg-white py-2 px-10 rounded-md inter-medium h-[40px] flex justify-center items-center hover:bg-[#ABABAB] hover:text-white mx-2"
            >
              Block Time Calendar
            </Link>
            {localStorage.role != 3 && (
              <button
                onClick={openModal}
                className="bg-white py-2 px-10 rounded-md inter-medium h-[40px] w-[225px] flex justify-center items-center hover:bg-[#ABABAB] hover:text-white mx-2"
              >
                Add New Event
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-white h-[37px] w-[37px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative"
            >
              <img
                src="assets/images/logout icon.svg"
                alt="Original Image"
                className="block"
              />
              <img
                src="assets/images/logout state 2.svg"
                alt="Hover Image"
                className="absolute hover-img"
              />
            </button>
          </div>
        </nav>
      </div>
      {/* ----------Mobile Nav-------- */}
      <div className="block lg:hidden">
        <div className="h-[75px] bg-[#B4C6D9] flex justify-center items-center sticky top-0 z-10 px-5">
          <Link href="/">
            <span className="text-[20px] inter-light whitespace-nowrap dark:text-black">
              Surgery South P.C.
            </span>
          </Link>
          <div></div>
        </div>
      </div>

      <div className="body-content bg-[#ECECEC]">
        <div className="lg:w-[920px] xl:w-[1000px] 2xl:w-[1165px] mx-auto pt-[20px] pb-[5px] relative hidden lg:block">
          <div className="schedule my-5 bg-[#B4C6D9] px-5 py-2 rounded-xl text-center flex items-center justify-center gap-x-[10px]">
            <Link
              to="/montly-schedule"
              className="lg:px-4 2xl:px-7 py-2 rounded-md bg-white lg:text-[15px] 2xl:text-[18px] inter-medium hover:bg-[#ABABAB] hover:text-white"
            >
              Monthly Call Calendar
            </Link>
            <p className="mx-auto lg:text-[18px] 2xl:text-[22px] inter-medium flex items-center flex-col">
              Daily Surgery Schedule
              {/* <strong style={{ fontSize: "10px", padding: "0" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="lg:px-[10px] 2xl:px-[20px]"
                />
              </strong> */}
              <span className="inter-bold">
                {date
                  ? ` ${dayjs.utc(date).format("MM/DD/YYYY")}`
                  : "No Date Selected"}
              </span>
            </p>
            <button
              className="bg-white h-[37px] w-[37px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative me-4"
              onClick={handleBack}
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
            <div
              onClick={handlePrint}
              className="lg:px-4 2xl:px-7 py-1 rounded-md bg-white lg:text-[18px] 2xl:text-[18px] inter-medium hover:bg-[#ABABAB] hover:text-white cursor-pointer"
            >
              Print Schedule
            </div>
            <Calendar
              isCalendarOpen={isCalendarOpen}
              setIsCalendarOpen={setIsCalendarOpen}
            />
          </div>
        </div>
        {/*daily schedule Data */}
        {/* <div className="w-90% sm:w-[600px] lg:w-[960px] xl:w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 lg:pt-10 mb-10 2xl:px-0 px-5"> */}
        <div
          className="w-90% lg:w-[90%] xl:w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 lg:pt-2 mb-10 2xl:px-0 px-5"
          id="print-schedule"
        >
          <div className="bg-white w-100 px-2 2xl:px-10 rounded-md pb-10 shadow-lg">
            {/* {schedule.length === 0 && omPm.surgeon_o_am.length == 0 && omPm.surgeon_o_pm.length === 0 && vacations.length === 0 ? ( */}
            {(schedule?.length ?? 0) &&
            (omPm?.surgeon_o_am?.length ?? 0) &&
            (omPm?.surgeon_o_pm?.length ?? 0) &&
            (vacations?.length ?? 0) ? (
              <p className="text-center text-[18px] inter-bold py-5">
                Data are not available on this date
              </p>
            ) : (
              <>
                <div className="three-items ps-2 2xl:ps-16 pe-[2%] mt-3 pt-3">
                  {officeCloseDate.map((item, index) => {
                    const formattedDate = new Date(item)
                      .toISOString()
                      .slice(0, 10);
                    return (
                      <div
                        className="bg-[#000] rounded-md py-2"
                        id="show"
                        key={index}
                      >
                        <p className="text-center color-off text-white text-[10px] sm:text-[18px]">
                          <span className="inter-bold"> Office Closed </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ overflowX: "auto" }} ref={tableContainerRef}>
                  {/* <div className="hidden lg:block"> */}
                  <table className="surgery-schedule">
                    <thead>
                      <tr>
                        <th className="w-[100px] inter-bold text-[18px] text-right">
                          {/* {selectedDate.format("MM/DD")} */}
                          {/* {dayjs.utc(selectedDate).format("MM/DD")} */}
                          {dayjs.utc(date).format("MM/DD")}
                        </th>
                        {/* {surgeons.map((surgeon) => (
                    <th key={surgeon.name} className="inter-bold text-[18px]">
                      {surgeon.name}
                    </th>
                  ))} */}
                        {combinedData.map((surgeon) => (
                          <th
                            key={surgeon.id}
                            className="inter-extrabold text-[18px]"
                          >
                            {surgeon.roles.length < 1 ? (
                              <span className="underlinecall">
                                {surgeon.name}
                              </span>
                            ) : (
                              <>
                                <span>{surgeon.name}</span>
                                <br />
                                <span className="uppercase text-[18px] inter-extrabold">
                                  {surgeon.roles.join(", ")}
                                </span>
                              </>
                            )}
                            {/* <span className="">{surgeon.name}</span> <br /> <span className="underlinecall uppercase text-[18px] inter-extrabold">{surgeon.roles.join(', ')}</span> */}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time) => {
                        const formattedTime = dayjs
                          .utc(`2024-08-21T${time}`)
                          .utc()
                          .format("hh:mm A");
                        const isBold = boldTimes.includes(formattedTime);
                        const isHidden = HiddenTimes.includes(formattedTime);
                        return (
                          <tr key={time}>
                            <td
                              className={`2xl:w-[100px] sticky left-[-10px] z-[3] h-[30px] text-right whitespace-nowrap ${
                                isBold ? "font-bold" : ""
                              }`}
                            >
                              <p className={`${isHidden ? "hidden" : ""}`}>
                                {formattedTime}
                              </p>
                            </td>
                            {surgeons.map((surgeon) =>
                              renderScheduleWithCollapsing(time, surgeon.id)
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="block sm:hidden absolute top-[45px] right-[30px] z-[12]">
                    <FontAwesomeIcon
                      icon={faAngleRight}
                      size="sm"
                      className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                      onClick={scrollRightTable}
                    />
                  </div>
                  <div className="block sm:hidden absolute top-[45px] left-[170px] z-[12]">
                    <FontAwesomeIcon
                      icon={faAngleLeft}
                      size="sm"
                      className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                      onClick={scrollLeftTable}
                    />
                  </div>
                </div>
              </>
            )}
            <div class="three-items ps-2 2xl:ps-16 pe-[2%] mt-3" id="ignor">
              {block.map((item, index) => (
                <div class="bg-[#B4C6D9] rounded-md py-5 mt-2" key={index}>
                  <p class="text-center text-[10px] sm:text-[18px]">
                    <span class="inter-bold">{item.location} BLOCK :</span>{" "}
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/*end daily schedule Data */}
      </div>
      {/* ----------------Modal--------------- */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="pt-8 rounded relative">
            <AddEvent
              onClose={closeModal}
              fetchDatas={fetchData}
              dates={selectedDate}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SearchByDateDs;
