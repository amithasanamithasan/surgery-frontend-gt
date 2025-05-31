import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Calendar from "./celender";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Constant from "../../../Constant";
import EventCard from "./EventCard";
import Preloader from './../../Partials/preLoader';
import AddEvent from "./addEvent";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(advancedFormat);

const DailySchedule = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().utc());
  const [schedule, setSchedule] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [surgeonsRole, setSurgeonsRole] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [block, setBlock] = useState([]);
  const [officeCloseDate, setOfficeCloseDate] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [omPm, setOmPm] = useState([]);
  const [adjustomPm, setAdjustomPm] = useState([]);
  const daysInMonth = selectedDate.daysInMonth();
  const [loading, setLoading] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, index) =>
    selectedDate.utc().startOf("month").add(index, "day")
  );
  const [visibleStartIndex, setVisibleStartIndex] = useState(() => {
    const initialIndex = selectedDate.date() - 1;
    return Math.min(initialIndex, daysInMonth - 15);
  });
  const [visibleStartIndexs, setVisibleStartIndexs] = useState(
    Math.max(0, selectedDate.date() - 2)
  );
  const [visibleStartIndexmd, setVisibleStartIndexmd] = useState(
    Math.max(0, selectedDate.date() - 6)
  );
  const currentDate = dayjs().format("DD/MM");
  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const scrollLeft = () => {
    setVisibleStartIndex((prev) => Math.max(prev - 15, 0));
  };

  const scrollRight = () => {
    setVisibleStartIndex((prev) => Math.min(prev + 15, daysInMonth - 15));
  };
  const scrollLeftMobile = () => {
    setVisibleStartIndexmd((prev) => Math.max(prev - 6, 0));
  };

  const scrollRightMobile = () => {
    setVisibleStartIndexmd((prev) => Math.min(prev + 6, daysInMonth - 6));
  };
  const scrollLeftMobileS = () => {
    setVisibleStartIndexs((prev) => Math.max(prev - 2, 0));
  };

  const scrollRightMobileS = () => {
    setVisibleStartIndexs((prev) => Math.min(prev + 2, daysInMonth - 2));
  };

  const fetchData = async () => {
    const timestamp = new Date().getTime();
    const eventDate = selectedDate.utc().format("YYYY-MM-DD");

    try {
      const [
        blockResponse,
        cmeResponse,
        omPmResponse,
        scheduleResponse,
        offcieCloseResponse,
        adjustomPmResponse,
      ] = await Promise.all([
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-block-time`, { params: { event_date: eventDate, timestamp } }),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-vacation-data`, { params: { event_date: eventDate, timestamp } }),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-om-pm`, { params: { event_date: eventDate, timestamp } }),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-data`, { params: { event_date: eventDate, timestamp } }),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-office-close`, { params: { event_date: eventDate, timestamp } }),
        AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-office-adjust`, { params: { event_date: eventDate, timestamp } }),
      ]);

      const omPmData = omPmResponse.data.ompm || {};

      // Ensure surgeon_o_am and surgeon_o_pm are arrays, even if they are single numbers
      const surgeon_o_am = Array.isArray(omPmData.surgeon_o_am) ? omPmData.surgeon_o_am : [omPmData.surgeon_o_am];
      const surgeon_o_pm = Array.isArray(omPmData.surgeon_o_pm) ? omPmData.surgeon_o_pm : [omPmData.surgeon_o_pm];

      // Ensure office adjustments are formatted correctly
      setAdjustomPm({
        AM: adjustomPmResponse?.data?.adjustmentAM || [],
        PM: adjustomPmResponse?.data?.adjustmentPM || [],
      });

      // Format the times
      const formatTimes = (data) => {
        return data.map(item => ({
          effective_date_start_start_time: item.effective_date_start_start_time
            ? item.effective_date_start_start_time.slice(0, 5)
            : item.effective_date_start_start_time,
          effective_date_start_end_time: item.effective_date_start_end_time
            ? item.effective_date_start_end_time.slice(0, 5)
            : item.effective_date_start_end_time,

          effective_date_end_start_time: item.effective_date_end_start_time
            ? item.effective_date_end_start_time.slice(0, 5)
            : item.effective_date_end_start_time,
          effective_date_end_end_time: item.effective_date_end_end_time
            ? item.effective_date_end_end_time.slice(0, 5)
            : item.effective_date_end_end_time,
        }));
      };

      // Set state updates
      setBlock(blockResponse.data);
      setOfficeCloseDate(offcieCloseResponse.data.officeCloseDate);
      setVacations(cmeResponse.data.vacations);
      // setAdjustomPm({
      //   AM: formatTimes(adjustomPmResponse?.data?.officeAMAjust || []),
      //   PM: formatTimes(adjustomPmResponse?.data?.officePMAjust || []),
      // });
      setOmPm({ surgeon_o_am, surgeon_o_pm });


      const { surgeon_events, times, surgeons, surgeonsRole } = scheduleResponse.data;
      setTimeSlots(times);
      setSurgeons(surgeons);
      setSchedule(surgeon_events);
      setSurgeonsRole(Object.values(surgeonsRole));
    } catch (error) {
      console.error("Error fetching data:", error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, refreshData]);

  const renderScheduleWithCollapsing = (time, surgeon_id) => {
    let printed = false;
    const events = schedule[surgeon_id] ? Object.values(schedule[surgeon_id]) : [];
    const highlightColor = "#E5DEB0";
    const highlightColorOffice = "#E6E6E6";

    const currentDate = selectedDate.format("YYYY-MM-DD");

    // Check if surgeon_o_am and surgeon_o_pm are arrays and then check if the surgeon_id is included
    const isAMFull = Array.isArray(omPm.surgeon_o_am) && omPm.surgeon_o_am.includes(parseInt(surgeon_id));
    const isPMFull = Array.isArray(omPm.surgeon_o_pm) && omPm.surgeon_o_pm.includes(parseInt(surgeon_id));

    // Fetch the correct AM and PM time slots from API response

    const amTimes = adjustomPm?.AM ?? [];
    const pmTimes = adjustomPm?.PM ?? [];

    console.log("AM Times:", amTimes);
    console.log("PM Times:", pmTimes);

    const AM_START = amTimes.length > 0 ? amTimes[0].start_time : null;
    const AM_END = amTimes.length > 0 ? amTimes[0].end_time : null;
    const PM_START = pmTimes.length > 0 ? pmTimes[0].start_time : null;
    const PM_END = pmTimes.length > 0 ? pmTimes[0].end_time : null;

    console.log(`AM Start: ${AM_START}, AM End: ${AM_END}`);
    console.log(`PM Start: ${PM_START}, PM End: ${PM_END}`);

    const toMinutes = (time)=> {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

    const isOfficeEventDuringAM = events.some((event) => {
      const startTime = toMinutes(normalizeTime(event.start_time));
      const endTime = toMinutes(normalizeTime(event.end_time));
      const AM_START_MIN = toMinutes(AM_START);
      const AM_END_MIN = toMinutes(AM_END);

      console.log("Office AM:", startTime, "Existing AM:", AM_START_MIN);
      console.log("Office PM:", endTime, "Existing PM:", AM_END_MIN);

      return (
        event.purpose === "office" &&
        startTime >= AM_START_MIN && startTime <= AM_END_MIN || // Ensure event starts between AM or PM
        endTime >= AM_START_MIN && startTime <= AM_END_MIN ||  //Ensure event ends between AM or PM
        startTime == AM_START_MIN && startTime == AM_END_MIN ||
        endTime == AM_START_MIN && endTime == AM_END_MIN
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
        event.purpose === "office" &&
        startTime >= PM_START_MIN && startTime <= PM_END_MIN || // Ensure event starts between AM or PM
        endTime >= PM_START_MIN && startTime <= PM_END_MIN ||  //Ensure event ends between AM or PM
        startTime == PM_START_MIN && startTime == PM_END_MIN ||
        endTime == PM_START_MIN && endTime == PM_END_MIN
      );
    });

    if (!isOfficeEventDuringAM && AM_START && AM_END && isAMFull && time >= AM_START && time <= AM_END) {
      const rowSpan = timeSlots.filter(t => t >= AM_START && t <= AM_END).length;
      console.log("Rendering AM EventCard", rowSpan);
      return (
        <td key={`${surgeon_id}-am`} rowSpan={rowSpan} className="px-5 2xl:px-0">
          <EventCard
            color={highlightColorOffice}
            title="Office"
            link="#"
            disable={true}
            height={`${29 * rowSpan}px`}
          />
        </td>
      );
    }

    if (!isOfficeEventDuringPM && PM_START && PM_END && isPMFull && time >= PM_START && time <= PM_END) {
      const rowSpan = timeSlots.filter(t => t >= PM_START && t <= PM_END).length;
      console.log("Rendering PM EventCard");
      return (
        <td key={`${surgeon_id}-pm`} rowSpan={rowSpan} className="px-5 2xl:px-0">
          <EventCard
            color={highlightColorOffice}
            title="Office"
            link="#"
            disable={true}
            height={`${29 * rowSpan}px`}
          />
        </td>
      );
    }

    const isFullDayVacation = () => {
      const vacationArray = Array.isArray(vacations) ? vacations : Object.values(vacations);
      return vacationArray.find((item) => item.surgeon_id === surgeon_id);
    };

    const vacationData = isFullDayVacation();
    const highlightText = vacationData ? vacationData.vacation_type : "Vacation";

    if (vacationData && vacationData.vacation_dates.includes(currentDate)) {
      const startIndex = timeSlots.indexOf(time);
      const rowSpan = timeSlots.length - startIndex + 1;
      if (time === timeSlots[0]) {
        return (
          <td key={`${surgeon_id}-vacation`} rowSpan={rowSpan} className="px-5 2xl:px-0">
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
              height={`${rowSpan * 29}px`}
              data={fetchData}
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
          eventData.patient_name = `${event.patient_first_name || ""} ${event.patient_last_name || ""}`;
          eventData.procedure = event.procedure || "";
          if (event.event_location === "PHH MOR") {
            eventData.color = "#E8D1E4";
          } else if (event.event_location === "PHH HOSC") {
            eventData.color = "#E8CDB4";
          } else if (event.event_location === "others") {
            eventData.color = "#BAD9C3";
          }
        } else if (event.purpose === "Meeting") {
          eventData.title = event.purpose || "";
          eventData.surgeon_name = event.surgeon || "";
          // eventData.color = "#E6E6E6";
          eventData.color = "#cccccc";
          eventData.priority = "Meeting";
        } else if (event.purpose === "Office") { //for office event
          eventData.title = event.purpose || "";
          // eventData.color = "#cccccc";
          eventData.color = "#E6E6E6";
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
                link={`${overlap.id}`}
                border=""
                height={`${overlap.rowSpan * 29}px`}
                data={fetchData}
                purposeformetting={overlap.priority}
              />
            </div>
          ))}
        </td>
      );
    }

    if (printed) {
      return orgina_data;
    }

    return <td className="px-5 2xl:px-0"> <div className="widthdp"> </div> </td>;
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
      return (450 - (640 - width));
    }
    else if (window.innerWidth < 640) {
      return (500 - (640 - width));
    } else if (window.innerWidth < 1536) {
      return 495;
    }
  };

  const scrollLeftTable = () => {
    tableContainerRef.current.scrollBy({
      left: -getScrollAmount(),
      behavior: 'smooth',
    });
  };

  const scrollRightTable = () => {
    tableContainerRef.current.scrollBy({
      left: getScrollAmount(),
      behavior: 'smooth',
    });
  };

  if (loading) {
    return <Preloader />
  }
  // -----------Modal--------------
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
    setRefreshData(prev => !prev);
  };
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] hidden lg:flex items-center sticky top-0 z-10">
        <nav className="lg:w-[900px] xl:w-[1200px] 2xl:w-[1400px] flex flex-wrap items-center justify-between mx-auto">
          <Link
            to="/dashboard"
            className="svgx flex justify-item-start px-2 py-2 rounded bg-white text-[#657E98] hover:bg-[#657E98] hover:transition hover:duration-300"
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
            <span className="self-center text-[20px] inter-light whitespace-nowrap dark:text-black ms-[200px]">
              Surgery South, P.C.
            </span>
          </Link>

          {/* {userRole == 1 && ( */}
          <button
            onClick={openModal}
            className="bg-white py-2 px-10 rounded-md inter-medium h-[40px] 2xl:w-[225px] flex justify-center items-center hover:bg-[#ABABAB] hover:text-white mx-2"
          >
            Add New Event
          </button>
          {/* )} */}

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
        </nav>
      </div>
      {/* ----------Mobile Nav-------- */}
      <div className="block lg:hidden">
        <div className="h-[75px] bg-[#B4C6D9] flex justify-center items-center sticky top-0 z-10 px-5">
          <Link
            href="/"
          >
            <span
              className="text-[20px] inter-light whitespace-nowrap dark:text-black">Surgery South P.C.</span>
          </Link>
          <div>
          </div>
        </div>
      </div>

      <div className="body-content bg-[#ECECEC] pb-16">
        <div className="lg:w-[920px] xl:w-[1000px] 2xl:w-[1165px] mx-auto pt-[20px] pb-[5px] relative hidden lg:block">
          <div className="schedule my-5 bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex items-center justify-center">
            <Link
              to="/montly-schedule"
              className="lg:px-4 2xl:px-7 py-2 rounded-md bg-white lg:text-[15px] 2xl:text-[18px] inter-medium hover:bg-[#ABABAB] hover:text-white"
            >
              Monthly Call Calendar
            </Link>

            <p className="mx-auto lg:text-[18px] 2xl:text-[24px] inter-medium ms-24 flex items-center">
              Daily Surgery Schedule
              <strong style={{ fontSize: "10px", padding: "0" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="lg:px-[10px] 2xl:px-[20px]"
                />
              </strong>
              <span className="inter-bold">
                {selectedDate.format("MM/DD/YYYY")}
              </span>
            </p>
            <Calendar
              isCalendarOpen={isCalendarOpen}
              setIsCalendarOpen={setIsCalendarOpen}
            />
          </div>

          <div className="surgery-schedule relative pt-[15px]">
            <div className="flex bg-white rounded-xl py-4 px-5 justify-between overflow-hidden">
              <FontAwesomeIcon
                icon={faAngleLeft}
                size="xl"
                className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                onClick={scrollLeft}
              />
              {daysArray
                .slice(visibleStartIndex, visibleStartIndex + 15)
                .map((date, index) => (
                  <div
                    key={date.format("YYYY-MM-DD")}
                    className={`item border-2 border-black sm:px-2 lg:px-1 2xl:px-2 py-1 rounded-md inter-medium text-[14px] content-center ${date.isSame(selectedDate.utc(), "day") ? "active" : ""}`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.utc().format("MM/DD")} {/* Display date in UTC */}
                  </div>
                ))}
              <FontAwesomeIcon
                icon={faAngleRight}
                size="xl"
                className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                onClick={scrollRight}
              />
            </div>
          </div>
        </div>
        {/* --------Time Scroll Mobile------- */}
        <div className="px-5 py-10 hidden sm:block lg:hidden w-[320px] sm:w-[600px] 2xl:w-[1400px] m-auto">
          <div className="surgery-schedule relative">
            <div className="flex bg-white rounded-xl py-4 px-5 justify-between overflow-hidden">
              <FontAwesomeIcon
                icon={faAngleLeft}
                size="xl"
                className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                onClick={scrollLeftMobile}
              />
              {daysArray
                .slice(visibleStartIndexmd, visibleStartIndexmd + 6)
                .map((date, index) => (
                  <div
                    key={date.format("YYYY-MM-DD")}
                    className={`item border-2 border-black px-2 py-1 rounded-md inter-medium text-[14px] content-center ${date.isSame(selectedDate, "day") ? "active" : ""
                      }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.format("MM/DD")}
                  </div>
                ))}
              <FontAwesomeIcon
                icon={faAngleRight}
                size="xl"
                className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                onClick={scrollRightMobile}
              />
            </div>
          </div>
        </div>
        <div className="px-5 py-10 block sm:hidden lg:hidden w-[90%] sm:w-[600px] 2xl:w-[1400px] m-auto">
          <div className="surgery-schedule relative">
            <div className="flex bg-white rounded-xl py-4 px-5 justify-between overflow-hidden">
              <FontAwesomeIcon
                icon={faAngleLeft}
                size="xl"
                className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                onClick={scrollLeftMobileS}
              />
              {daysArray
                .slice(visibleStartIndexs, visibleStartIndexs + 2)
                .map((date, index) => (
                  <div
                    key={date.format("YYYY-MM-DD")}
                    className={`item border-2 border-black px-2 py-1 rounded-md inter-medium text-[14px] content-center ${date.isSame(selectedDate, "day") ? "active" : ""
                      }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.format("MM/DD")}
                  </div>
                ))}
              <FontAwesomeIcon
                icon={faAngleRight}
                size="xl"
                className="item px-2 py-1 rounded-md inter-medium content-center bg-[#657E98] text-white"
                onClick={scrollRightMobileS}
              />
            </div>
          </div>
        </div>
        {/*daily schedule Data */}
        <div className="w-90% lg:w-[90%] xl:w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 lg:pt-10 mb-10 2xl:px-0 px-5">
          <div className="bg-white w-100 px-2 2xl:px-10 rounded-md pt-5 pb-10 shadow-lg">
            <div className="three-items ps-2 2xl:ps-16 pe-[2%] mt-3">
              {officeCloseDate.map((item, index) => {
                const formattedDate = new Date(item).toISOString().slice(0, 10);
                return (
                  <div className="bg-[#000] rounded-md py-5 mt-2" key={index}>
                    <p className="text-center text-white text-[10px] sm:text-[18px]">
                      <span className="inter-bold"> Office Closed </span>
                    </p>
                  </div>
                );
              })}
            </div>
            {/* <div className="hidden lg:block"> */}
            <div style={{ overflowX: 'auto' }} ref={tableContainerRef}>
              <table className="surgery-schedule" >
                <thead>
                  <tr>
                    <th className="w-[100px] inter-bold text-[18px] text-right">
                      {selectedDate.format("MM/DD")}
                    </th>
                    {combinedData.map((surgeon) => (
                      <th key={surgeon.id} className="inter-extrabold text-[18px]">
                        {surgeon.roles.length < 1 ? (
                          <span className="underlinecall">{surgeon.name}</span>
                        ) : (
                          <>
                            <span>{surgeon.name}</span>
                            <br />
                            <span className="uppercase text-[18px] inter-extrabold">
                              {surgeon.roles.join(', ')}
                            </span>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>

                  {timeSlots.map((time) => {
                    const formattedTime = dayjs.utc(`2024-08-21T${time}`).utc().format(
                      "hh:mm A"
                    );
                    const isBold = boldTimes.includes(formattedTime);

                    return (
                      <tr key={time}>
                        <td
                          className={`2xl:w-[100px]  sticky left-[-10px] z-[3] whitespace-nowrap h-[30px] text-right ${isBold ? "font-bold" : ""
                            }`}
                        >
                          {formattedTime}
                        </td>
                        {surgeons.map((surgeon) =>
                          renderScheduleWithCollapsing(time, surgeon.id)
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="block sm:hidden absolute top-[45px] right-[50px] z-[12]">
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
            <div className="three-items ps-2 2xl:ps-16 pe-[2%] mt-3">
              {block.map((item, index) => (
                <div className="bg-[#B4C6D9] rounded-md py-5 mt-2" key={index}>
                  <p className="text-center text-[10px] sm:text-[18px]">
                    <span className="inter-bold">{item.location} BLOCK:</span> {item.time}
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
            <AddEvent onClose={closeModal} fetchDatas={fetchData} />
          </div>
        </div>
      )}
    </>
  );
};

export default DailySchedule;
