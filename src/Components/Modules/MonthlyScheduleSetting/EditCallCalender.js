import React from "react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import CallCalender from "./CallCalender";
import VacationCalender from "./VacationCalender";
import EditWeekCalender from "./EditWeekCalender2";
import EditScheduling from "./EditScheduling";
import BlockCalenderShow from "./BlockCalenderShow";
import dayjs from "dayjs";
const Button = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    type="button"
    className={`border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px] ${className}`}
  >
    {children}
  </button>
);

function EditCallCalender({ toggles, toggles1 }) {
  const [realTimeCount, setRealTimeCount] = useState({}); // Final
  const [currentDate, setCurrentDate] = useState(dayjs());
  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => prevDate.subtract(1, "month"));
  };
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => prevDate.add(1, "month"));
  };
  const currentMonth = currentDate.format("MMMM");
  const currentMonths = currentDate.format("MM");
  const currentYear = currentDate.year();

  const [isVisible1, setIsVisible1] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const toggleVisibility1 = () => {
    setIsVisible1(!isVisible1);
  };
  const toggleVisibility2 = () => {
    setIsVisible2(!isVisible2);
  };
  const divRef1 = useRef(null);
  const divRef2 = useRef(null);
  const handleClickOutside = (event) => {
    // if (divRef1.current && !divRef1.current.contains(event.target)) {
    //   setIsVisible1(false);
    // }
    // if (divRef2.current && !divRef2.current.contains(event.target)) {
    //   setIsVisible2(false);
    // }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleClose1 = () => {
    setIsVisible1(false);
  };
  const handleClose2 = () => {
    setIsVisible2(false);
  };
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="bg-[#748BA2] content-center flex-col">
        <div className="global-centering relative w-[1300px] 2xl:w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
          <CallCalender
            isVisible1={isVisible1}
            divRef1={divRef1}
            handleClose1={handleClose1}
            realTimeCount={realTimeCount}
          />
          <VacationCalender
            isVisible2={isVisible2}
            divRef2={divRef2}
            handleClose2={handleClose2}

          />
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
              <button
                onClick={toggleVisibility1}
                type="button"
                className="border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
              >
                Call Counter
              </button>

              <button
                onClick={toggleVisibility2}
                type="button"
                className="border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
              >
                Vacation
              </button>
            </div>
            <h1 className="flex inter-medium text-[24px] me-44 items-center content-center justify-item-center">
              Monthly Call Calendar
            </h1>
            <div className="right flex items-center content-center justify-item-center">
              <div className="w-[150px]"></div>
            </div>
          </div>
          <div className="w-[94%] mx-auto pt-[4%] pb-[5%]">
            <EditWeekCalender
              handleSetRealCount={setRealTimeCount}
            />
          </div>
        </div>
        <EditScheduling />
        <BlockCalenderShow />
      </div>
      {/* <Preloads /> */}
    </>
  );
}

export default EditCallCalender;
