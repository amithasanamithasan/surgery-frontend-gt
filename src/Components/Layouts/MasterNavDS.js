import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../AxiosInterceptors";
import "../Modules/DailyScheduleSetting/style.css";
import AddEvent from './../Modules/DailyScheduleSetting/addEvent';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import Constant from "../../Constant";

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(advancedFormat);

const MasterNavDS = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [schedule, setSchedule] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [surgeonsRole, setSurgeonsRole] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [block, setBlock] = useState([]);
  const [cme, setCme] = useState([]);
  const [omPm, setOmPm] = useState([]);

  // Fetch data function
  const fetchData = async () => {
    try {
      const blockResponse = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/daily-schedule-block-time`,
        { params: { event_date: selectedDate.format("YYYY-MM-DD") } }
      );
      setBlock(blockResponse.data);

      const cmeResponse = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/daily-schedule-cme`,
        { params: { event_date: selectedDate.format("YYYY-MM-DD") } }
      );
      setCme(cmeResponse.data.cme);

      const OmPmResponse = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/daily-schedule-om-pm`,
        { params: { event_date: selectedDate.format("YYYY-MM-DD") } }
      );
      setOmPm(OmPmResponse.data.ompm);

      const scheduleResponse = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/daily-schedule-data`,
        { params: { event_date: selectedDate.format("YYYY-MM-DD") } }
      );

      const formattedSchedule = scheduleResponse.data.surgeon_events;
      const timeList = scheduleResponse.data.times;
      const surgeons = scheduleResponse.data.surgeons;
      const surgeonsRole = scheduleResponse.data.surgeonsRole;

      setTimeSlots(timeList);
      setSurgeons(surgeons);
      setSchedule(formattedSchedule);

      const rolesArray = Object.values(surgeonsRole);
      setSurgeonsRole(rolesArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

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

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="pt-8 rounded relative">
            <AddEvent onClose={closeModal} fetchData={fetchData} />
          </div>
        </div>
      )}
    </>
  );
};

export default MasterNavDS;
