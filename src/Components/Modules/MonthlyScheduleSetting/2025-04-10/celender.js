import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Celender = ({ isCalendarOpen, setIsCalendarOpen }) => {
  const [selectedCalenderDate, setSelectedCalenderDate] = useState(new Date());
  const navigate = useNavigate();

  const handleDateSelect = (date) => {
    setSelectedCalenderDate(date);
  };

  const handleSearchDateSubmit = (e) => {
    e.preventDefault();
    const formattedDate = dayjs(selectedCalenderDate).format("YYYY-MM-DD");
    navigate(`/daily-schedule-search-by-date?date=${encodeURIComponent(formattedDate)}`);
    setIsCalendarOpen(false);
  };

  return (
    <>
      <button
        className="right-0 border-2 w-[175px] text-[18px] inter-medium h-[35px] rounded-md border-none bg-white hover:bg-[#657E98] hover:text-white drop-shadow-2xl"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        Select Date
      </button>
      {isCalendarOpen && (
        <div className="absolute right-[-130px] z-10">
          <Calendar onChange={handleDateSelect} value={selectedCalenderDate} />
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
