import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import dayjs from "dayjs";

const DataRow = ({ weekNumber, namePrefix, location, date, entries, weekdayIdx }) => {
  const data = entries[location]?.[date] || {};

  const startHourKey = `${namePrefix}${weekNumber}startHour`;
  const startMinuteKey = `${namePrefix}${weekNumber}startMinute`;
  const endHourKey = `${namePrefix}${weekNumber}endHour`;
  const endMinuteKey = `${namePrefix}${weekNumber}endMinute`;
  const startHour = data[startHourKey] || "00";
  const startMinute = data[startMinuteKey] || "00";
  const endHour = data[endHourKey] || "00";
  const endMinute = data[endMinuteKey] || "00";

  return (
    <>
      <h3 className="text-[#ABABAB] inter-bold text-[15px]">
        Week {weekNumber}
      </h3>
      <div className='flex'>
        <p className='flex justify-between w-[55px]'>{startHour}  : {startMinute}</p> <p class="mx-2">-</p> <p className='flex justify-end w-[55px]'>{endHour} : {endMinute} </p>
      </div>
    </>
  );
};

function BlockCalenderShow() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [entries, setEntries] = useState({});
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const weekdayCounts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
  const weekdayWeeks = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
  const weekdayDates = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };

  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs.utc(new Date(currentYear, currentMonth, day));  // Use UTC here
    const weekday = date.format('dddd');

    if (weekday in weekdayDates) {
      const dateStr = date.format('YYYY-MM-DD');
      weekdayDates[weekday].push(dateStr);
    }

    if (weekday in weekdayCounts) {
      weekdayCounts[weekday]++;
      const firstDayOfMonth = dayjs.utc(new Date(currentYear, currentMonth, 1));  // Also UTC here
      const weekNumber = date.diff(firstDayOfMonth, 'week') + 1; // Calculate correct week number in UTC

      weekdayWeeks[weekday].push(weekNumber);
    }
  }

  const fetchMonthData = async (year, month) => {
    setLoading(true);
    try {
      const response = await AxiosAuthInstance.get(`/block-calendar?year=${year}&month=${month + 1}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const locationsData = response.data[0]?.locations || {};
        const formattedEntries = {
          MOR: locationsData.MOR || {},
          HOSC: locationsData.HOSC || {},
          ROBOT: locationsData.ROBOT || {},
        };
        setEntries(formattedEntries);
      } else {
        console.error('Unexpected response format:', response.data);
        setErrors({ message: 'No data found for the selected month.' });
      }
    } catch (error) {
      console.error('API Error:', error);
      setErrors({ message: 'Failed to load data for the selected month.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData(currentYear, currentMonth);
  }, [currentDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-fit  mt-24 bg-[#748BA2] content-center">
      <div className="relative w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
        <div className="absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] py-5 text-center rounded-xl flex justify-center items-center content-center px-10">
          <p className="flex inter-regular text-2xl items-center content-center justify-item-center">
            Block Time
          </p>
          <Link
            to="/block-calender"
            className="absolute right-[-80px] top-[50%] transform-translate-50 h-[35px] w-[220px] rounded bg-white mx-2 inter-medium flex items-center justify-center"
          >
            Block Time Calender
          </Link>
        </div>

        <div className="w-[1260px] mx-auto pt-[3%] pb-[5%]">
          <div className="week-calender">
            <table className="blocksd">
              <thead>
                <tr>
                  <th>Location</th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((weekday, idx) => (
                    <th key={idx}>{weekday}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["MOR", "HOSC", "ROBOT"].map((location, idx) => (
                  <tr key={idx}>
                    <th className="borders bordersx inter-bold text-[15px]">{location}</th>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((weekday, weekdayIdx) => (
                      <td key={weekdayIdx}>
                        {weekdayDates[weekday].map((date, dateIdx) => {
                          const weekNumber = weekdayWeeks[weekday][dateIdx] || 1;
                          return (
                            <DataRow
                              key={`${location}-${date}-${weekdayIdx}-${weekNumber}`}
                              weekNumber={weekNumber}
                              namePrefix={`${weekday}-Wk`}
                              entries={entries}
                              date={date}
                              location={location}
                            />
                          );
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockCalenderShow;
