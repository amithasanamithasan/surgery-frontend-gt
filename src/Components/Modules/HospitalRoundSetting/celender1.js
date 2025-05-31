import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Celender = ({ isCalendarOpen, setIsCalendarOpen }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSearchDateSubmit = (e) => {
    e.preventDefault();
    const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
    navigate(
      `/hospital-round-search-date?date=${encodeURIComponent(formattedDate)}`
    );
    setIsCalendarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);
  return (
    <>
      <button
        className="right-0 border-2 w-[175px] text-[18px] inter-medium h-[35px] rounded-md border-none bg-white hover:bg-[#657E98] hover:text-white drop-shadow-2xl"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        Select Date
      </button>
      {isCalendarOpen && (
        <div ref={calendarRef} className="absolute right-[-130px] top-[-120px] z-10">
          <Calendar onChange={handleDateSelect} value={selectedDate} />
          <div className="absolute buttons bottom-[20px] w-[60%] m-auto left-0 right-0 pt-5 flex justify-center z-5">
            <button
              className="inter-bold mx-2 text-center bg-[#D8ADAD] w-[135px] h-[35px] rounded-md"
              onClick={() => setIsCalendarOpen(false)}
            >
              Cancel
            </button>
            <form onSubmit={handleSearchDateSubmit}>
              <button className="inter-bold mx-2 text-center bg-[#B4C6D9] w-[135px] h-[35px] rounded-md">
                Select
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Celender;
