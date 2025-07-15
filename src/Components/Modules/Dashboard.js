import React, { useEffect, useState } from "react";
import { AxiosAuthInstance } from "../../AxiosInterceptors";
import Constant from "../../Constant";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Celender from "./celender";
import Celender2 from "./celender2";
import Celender1 from "./celender1";
import { ReactTyped } from "react-typed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const Dashboard = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCalendarOpen2, setIsCalendarOpen2] = useState(false);
  const [isCalendarOpen1, setIsCalendarOpen1] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDates, setSelectedDates] = useState(dayjs.utc());
  const daysInMonth = selectedDates.daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, index) =>
    selectedDate.startOf("month").add(index, "day")
  );
  // const [visibleStartIndex, setVisibleStartIndex] = useState(
  //   selectedDates.date() - 1
  // );

  //Infinite Scroll
  const [startDate, setStartDate] = useState(dayjs());
  const [selectedDateScroll, setSelectedDateScroll] = useState(dayjs());
  const visibleDays = Array.from({ length: 15 }, (_, i) =>
    // startDate.add(i, "day")
    startDate.clone().add(i, "day")
  );
  const scrollLeftSchedule = () => {
    if (selectedDateScroll.isSame(startDate, "day")) {
      setStartDate((prev) => prev.clone().subtract(1, "day"));
      setSelectedDateScroll((prev) => prev.clone().subtract(1, "day"));
    } else {
      setSelectedDateScroll((prev) => prev.clone().subtract(1, "day"));
    }
  };

  const scrollRightSchedule = () => {
    const rightmostDate = startDate.clone().add(14, "day");

    if (selectedDateScroll.isSame(rightmostDate, "day")) {
      setStartDate((prev) => prev.clone().add(1, "day"));
      setSelectedDateScroll((prev) => prev.clone().add(1, "day"));
    } else {
      setSelectedDateScroll((prev) => prev.clone().add(1, "day"));
    }
  };

  console.log("Selected: " + dayjs.utc());
  const [visibleStartIndex, setVisibleStartIndex] = useState(() => {
    const initialIndex = dayjs().date() - 1;
    return Math.min(initialIndex, daysInMonth - 15);
  });
  const scrollLeft = () => {
    setVisibleStartIndex((prev) => Math.max(prev - 15, 0));
     
  };
  const scrollRight = () => {
    setVisibleStartIndex((prev) => Math.min(prev + 15, daysInMonth - 15));
  };
  const dates = Array.from({ length: 7 }, (_, index) =>
    dayjs().subtract(index, "day")
  );

  const fifteenDates = Array.from({ length: 15 }, (_, index) =>
    dayjs().subtract(index, "day")
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, messagesResponse] = await Promise.all([
          AxiosAuthInstance.get("/current-user"),
          AxiosAuthInstance.get(`${Constant.BASE_URL}/messages`),
        ]);

        setUserRole(userResponse.data.user.role);
        calculateUnreadCount(messagesResponse.data.received);
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error(
          "Response data:",
          error.response ? error.response.data : "No response data"
        );
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/messages`
      );
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      console.error(
        "Response data:",
        error.response ? error.response.data : "No response data"
      );
    }
  };

  const calculateUnreadCount = (receivedMessages) => {
    const count = receivedMessages.filter((message) => !message.is_read).length;
    setUnreadCount(count);
  };

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!sessionStorage.getItem("homepageLoaded")) {
      sessionStorage.setItem("homepageLoaded", "true");
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, []);

  const handleLogout = () => {
    AxiosAuthInstance.post("logout").then(() => {
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

  const handleDateSelectHospitalRound = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    navigate(`/hospital-round-search-date?date=${formattedDate}`);
  };

  const handleDateSelectOparativeLog = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    navigate(`/oparative-log-search-date?date=${formattedDate}`);
  };

  const handleDateSelectDailySchedule = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    navigate(`/daily-schedule-search-by-date?date=${formattedDate}`);
  };

  const [activeMonth, setActiveMonth] = useState(dayjs().month());
  const [activeYear, setActiveYear] = useState(dayjs().year());
  const handleMontlySchedule = (monthIndex) => {
    const formattedDate = dayjs
      .utc()
      .set("month", monthIndex)
      .set("year", activeYear)
      .startOf("month")
      .format("YYYY-MM-DD");
    navigate(`/search-montly-schedule?date=${formattedDate}`);
  };
  //Months infinity scroll
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const handlePrev = () => {
    setActiveMonth((prev) => {
      if (prev === 0) {
        setActiveYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setActiveMonth((prev) => {
      if (prev === 11) {
        setActiveYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const [activeIdx, setActiveIdx] = useState(dayjs().month());
  // const handlePrev = () => {
  //   setActiveIdx((prevIdx) => (prevIdx - 1 + months.length) % months.length);
  // };
  // const handleNext = () => {
  //   setActiveIdx((prevIdx) => (prevIdx + 1) % months.length);
  // };
  // if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="h-[100px] bg-[#B4C6D9] content-center sticky top-0 z-10">
        <nav className="w-[1200px] 2xl:w-[1400px] flex flex-wrap items-center justify-between mx-auto">
          <Link
            to="/dashboard"
            className="svgx flex justify-item-start h-[35] w-[35] p-2 rounded bg-white hover:bg-[#657E98] hover:transition hover:duration-300"
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
            className="flex justify-item-center items-center ms-60 overflow-hidden"
          >
            <span className="self-center text-[32px] inter-light whitespace-nowrap dark:text-black ps-20">
              Surgery South, P.C.
            </span>
          </Link>
          <div className="flex justify-item-end items-center overflow-hidden">
            <Link to="/messages">
              <button
                type="button"
                className="border-2 px-2 py-0 rounded bg-[#D8ADAD] mx-2 inter-medium"
              >
                {unreadCount}
              </button>
            </Link>
            <Link to="/messages">
              <button
                type="button"
                className="border-none px-4 py-2 rounded bg-white mx-2 inter-medium hover:bg-[#657E98] hover:text-white hover:transition hover:duration-300"
              >
                Messages
              </button>
            </Link>

            {userRole == 1 || userRole == 2 ? (
              <Link to="/administration">
                <button
                  type="button"
                  className="border-none px-4 py-2 rounded bg-white mx-2 inter-medium hover:bg-[#657E98] hover:text-white hover:transition hover:duration-300"
                >
                  Administration
                </button>
              </Link>
            ) : (
              <></>
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
      <div className="body-content bg-[#ECECEC] mt-[35px] mb-[35px] select-none">
        <div className="w-[1165px] mx-auto py-0">
          {/* <div className="hospital-round relative mb-[18px] bg-[#B4C6D9] px-5 h-[55px] flex items-center justify-center rounded-xl text-center hover:bg-[#657E98] hover:text-white hover:transition hover:duration-300"> */}
          <div className="hospital-round  relative mb-[18px] bg-[#B4C6D9] px-5 h-[55px] flex items-center justify-center rounded-xl text-center">
            <Link to="/hospital-round">
              <p className="flex items-center justify-center w-[600px] h-[55px] inter-medium text-[20px]">
                Hospital Rounds
              </p>
            </Link>
            <Celender
              isCalendarOpen={isCalendarOpen}
              setIsCalendarOpen={setIsCalendarOpen}
            />
          </div>

          <div className="hp-round-items flex bg-white rounded-xl h-[72px] px-3 justify-between items-center overflow-hidden">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`item xl:w-[150px] lg:w-[80px] bg-[#B4C6D9] h-[50px] flex justify-center items-center mx-2 rounded-[5px] inter-medium text-[18px] text-center ${
                  date.isSame(selectedDate, "day") ? "active" : ""
                }`}
                onClick={() => handleDateSelectHospitalRound(date)}
              >
                {date.format("MM/DD")}
              </div>
            ))}
          </div>
          {/* <div className="operative-log mt-10 mb-5 bg-[#B4C6D9] px-5 mt-[40px] mb-[18px] h-[55px] flex justify-center items-center rounded-xl text-center hover:bg-[#657E98] hover:text-white hover:transition hover:duration-300"> */}
          <div className="operative-log relative mt-10 mb-5 bg-[#B4C6D9] px-5 mt-[40px] mb-[18px] h-[55px] flex justify-center items-center rounded-xl text-center">
            <Link to="/oparative-log">
              <p className="flex items-center justify-center w-[600px] h-[55px] inter-medium text-[20px]">
                Operative Log
              </p>
            </Link>
            <Celender2
              isCalendarOpen={isCalendarOpen2}
              setIsCalendarOpen={setIsCalendarOpen2}
            />
          </div>
          <div className="op-log-items flex bg-white rounded-xl h-[72px] px-3 items-center justify-between overflow-hidden">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`item xl:w-[150px] lg:w-[80px] bg-[#B4C6D9] h-[50px] flex justify-center items-center mx-2 rounded-[5px] inter-medium text-[18px] text-center ${
                  date.isSame(selectedDate, "day") ? "active" : ""
                }`}
                onClick={() => handleDateSelectOparativeLog(date)}
              >
                {date.format("MM/DD")}
              </div>
            ))}
          </div>
          {/* <div className="surgery-schedule relative mt-[40px] mb-[18px] bg-[#B4C6D9] px-5 h-[55px] flex justify-center items-center rounded-xl text-center hover:bg-[#657E98] hover:text-white hover:transition hover:duration-300"> */}
          <div className="surgery-schedule relative mt-[40px] mb-[18px] bg-[#B4C6D9] px-5 h-[55px] flex justify-center items-center rounded-xl text-center">
            <Link to="/daily-schedule">
              <p className="flex items-center justify-center w-[600px] h-[55px] inter-medium text-[20px]">
                Daily Surgery Schedule
              </p>
            </Link>
            <Celender1
              isCalendarOpen={isCalendarOpen1}
              setIsCalendarOpen={setIsCalendarOpen1}
            />
          </div>
          <div className="surgery-item relative">
            <div className="flex bg-white rounded-xl h-[55px] items-center px-20 justify-between overflow-hidden">
              {/* {Array(15)
                .fill(null)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="item w-[57px] text-[14px] border-2 border-black h-[30px] justify-center items-center mx-1 flex rounded-md inter-medium content-center"
                  >
                    12/19
                  </div>
                ))} */}

              {/* {daysArray
                .slice(visibleStartIndex, visibleStartIndex + 15)
                .map((date, index) => (
                  <div
                    key={index}
                    className={`item w-[57px] text-[14px] border-2 border-black h-[30px] justify-center items-center mx-1 flex rounded-md inter-medium content-center ${
                      date.isSame(selectedDate, "day") ? "active" : ""
                    }`}
                    onClick={() => handleDateSelectDailySchedule(date)}
                  >
                    {date.format("MM/DD")}
                  </div>
                ))} */}
              {visibleDays.map((date, index) => (
                <div
                  key={index}
                  className={`item w-[57px] text-[14px] border-2 border-black h-[30px] justify-center items-center mx-1 flex rounded-md inter-medium content-center ${
                    date.isSame(selectedDateScroll, "day") ? "active" : ""
                  }`}
                  onClick={() => handleDateSelectDailySchedule(date)}
                >
                  {date.format("MM/DD")}
                </div>
              ))}
            </div>
            <div
              className="prev absolute start-5 top-3 border-none bg-[#657E98] border-2 h-[30px] w-[30px] flex justify-center items-center rounded text-white"
              onClick={scrollLeftSchedule}
            >
              <FontAwesomeIcon icon={faAngleLeft} size="xl"></FontAwesomeIcon>
            </div>
            <div
              className="next absolute end-5 top-3 border-none bg-[#657E98] border-2 h-[30px] w-[30px] flex justify-center items-center rounded text-white"
              onClick={scrollRightSchedule}
            >
              <FontAwesomeIcon icon={faAngleRight} size="xl"></FontAwesomeIcon>
            </div>
          </div>

          <Link to="/montly-schedule">
            {/* <div className="Call-Calender mt-[40px] mb-[18px] bg-[#B4C6D9] px-5 h-[55px] flex items-center justify-center rounded-xl text-center hover:bg-[#657E98] hover:text-white hover:transition hover:duration-300"> */}
            <div className="Call-Calender mt-[40px] mb-[18px] bg-[#B4C6D9] px-5 h-[55px] flex items-center justify-center rounded-xl text-center ">
              <p className="inter-medium text-[20px]">
                Monthly Call Calendar {activeYear}
              </p>
            </div>
          </Link>
          <div className="calender-month relative">
            <div className="flex bg-white rounded-xl h-[55px] items-center px-20 justify-between overflow-hidden">
              {months.map((month, idx) => (
                <div
                  key={idx}
                  className={`item w-[75px] text-[14px] border-2 border-black h-[30px] mx-1 flex justify-center items-center rounded-md inter-medium content-center ${
                    idx === activeMonth ? "active" : ""
                  }`}
                  onClick={() => handleMontlySchedule(idx)}
                >
                  {month}
                </div>
              ))}
            </div>

            <div
              className="prev absolute start-5 top-3 border-none bg-[#657E98] border-2 h-[30px] w-[30px] flex justify-center items-center rounded text-white"
              onClick={handlePrev}
            >
              <FontAwesomeIcon icon={faAngleLeft} size="xl" />
            </div>
            <div
              className="next absolute end-5 top-3 border-none bg-[#657E98] border-2 h-[30px] w-[30px] flex justify-center items-center rounded text-white"
              onClick={handleNext}
            >
              <FontAwesomeIcon icon={faAngleRight} size="xl" />
            </div>
          </div>
        </div>
      </div>
      <div className={`${!visible ? "hidden" : ""}`}>
        <div className="bg-white fixed top-0 h-screen w-screen z-[20]">
          <div className="absolute left-[50%] top-[50%] transform-translate-50">
            <div className="w-[900px] flex items-center">
              <div className="bg-white h-[120px] w-[120px] rounded-[10px] drop-shadow-2xl flex justify-center items-center me-5">
                <img
                  src="assets/images/Surgery-South-Logo---FROM-WEB.png"
                  alt="Loader"
                  className="w-[50px] h-[50px]"
                />
              </div>
              <ReactTyped
                strings={["Surgery South, P.C."]}
                typeSpeed={30}
                backSpeed={50}
                className="inter-bold text-[75px] text-[#657E98]"
                loop
              ></ReactTyped>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
