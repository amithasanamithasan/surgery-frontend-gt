import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import dayjs from "dayjs";

function BlockCalenderShow() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month(); // 0-11 (Jan-Dec)
  // const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = dayjs.utc().year(currentYear).month(currentMonth).daysInMonth();
  const firstDayOfMonth = dayjs.utc().year(currentYear).month(currentMonth).startOf('month').day();
  const daysArray = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      // Use dayjs's built-in date constructor instead of string parsing
      const date = dayjs()
        .year(currentYear)
        .month(currentMonth)
        .date(i + 1)
        .format("YYYY-MM-DD");
      return date;
    }),
  ];

  // Complete the grid to 7-day weeks
  const remainingDays = daysArray.length % 7;
  if (remainingDays !== 0) {
    daysArray.push(...Array(7 - remainingDays).fill(null));
  }

  console.log(daysArray);

  const weeksArray = [];
  for (let i = 0; i < daysArray.length; i += 7) { weeksArray.push(daysArray.slice(i, i + 7)); }
  const handlePreviousMonth = () => { setCurrentDate((prevDate) => prevDate.subtract(1, "month")); };
  const handleNextMonth = () => { setCurrentDate((prevDate) => prevDate.add(1, "month")); };

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

  const [blockEffective, setBlockEffective] = useState(null);
  const [lastAvailableBlock, setLastAvailableBlock] = useState(null);
  const fetchBlockEffectiveData = async (year, month) => {
    setLoading(true);
    try {
      const response = await AxiosAuthInstance.get(`/block-calender-effective-date`, {
        params: { year, month },
      });

      if (response.data) {
        // Only update the state if the fetched block is different
        if (!blockEffective || blockEffective.id !== response.data.id) {
          setBlockEffective(response.data);
          setLastAvailableBlock(response.data); // Store for future use
        }
      }
    } catch (error) {
      console.error("API Error:", error);

      // If no new block found, keep showing the last known block
      if (lastAvailableBlock) {
        setBlockEffective(lastAvailableBlock);
      } else {
        setErrors({ message: "No block data available." });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData(currentYear, currentMonth);
    fetchBlockEffectiveData(currentDate.year(), currentDate.month() + 1);
  }, [currentDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-fit  mt-24 bg-[#748BA2] content-center">
      <div className="relative w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
        <div className="absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] py-5 text-center rounded-xl flex justify-center items-center content-center px-10">
          <p className="flex font-[500] text-2xl items-center content-center justify-item-center">
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
          <div className="block-calender">
            <table className="blocks" id='block-calender'>
              <thead>
                <tr>
                  <th>Location</th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((weekday, idx) => (
                    <th key={idx}>{weekday}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeksArray.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {weekIndex == 0 ? (<td rowSpan={week.length} className="location"><div className='inter-bold text-[22px]'>MOR</div></td>) : ""}
                    {week.slice(1, 6).map((day, dayIndex) => {
                      const date = new Date(day);
                      const dayOfWeeks = dayjs(date).utc().day();
                      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                      const dayOfWeek = days[dayOfWeeks];
                      const morEntries = entries?.MOR || {};
                      const entryKey = `${dayOfWeek}-Wk${weekIndex + 1}startHour`;
                      const entry = morEntries[day];

                      console.log("Formatted Day (UTC):", day);
                      console.log("Day of the Week (UTC):", dayOfWeek);
                      console.log("Generated Entry Key:", entryKey);
                      console.log("Matching Entry:", entry);

                      return (
                        <td key={dayIndex}>
                          {entry ? (
                            <div className="text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500] text-[#000]'>
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}startHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}startMinute`] || "00"}
                                &nbsp; - &nbsp;
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}endHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}endMinute`] || "00"}
                              </p>
                            </div>
                          ) : (
                            <div className="empty-day-block text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500]'> 00 : 00 &nbsp;-&nbsp; 00 : 00</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tbody>
                {weeksArray.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {weekIndex == 0 ? (<td rowSpan={week.length} className="location"><div className='inter-bold text-[22px]'>HOSC</div></td>) : ""}
                    {week.slice(1, 6).map((day, dayIndex) => {
                      const date = new Date(day);
                      const dayOfWeeks = dayjs(date).utc().day();
                      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                      const dayOfWeek = days[dayOfWeeks];
                      const morEntries = entries?.HOSC || {};
                      const entryKey = `${dayOfWeek}-Wk${weekIndex + 1}startHour`;
                      const entry = morEntries[day];

                      console.log("Formatted Day (UTC):", day);
                      console.log("Day of the Week (UTC):", dayOfWeek);
                      console.log("Generated Entry Key:", entryKey);
                      console.log("Matching Entry:", entry);

                      return (
                        <td key={dayIndex}>
                          {entry ? (
                            <div className="text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500] text-[#000]'>
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}startHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}startMinute`] || "00"}
                                &nbsp; - &nbsp;
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}endHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}endMinute`] || "00"}
                              </p>
                            </div>
                          ) : (
                            <div className="empty-day-block text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500]'> 00 : 00 &nbsp;-&nbsp; 00 : 00</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tbody>
                {weeksArray.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {weekIndex == 0 ? (<td rowSpan={week.length} className="location"><div className='inter-bold text-[22px]'>ROBOT</div></td>) : ""}
                    {week.slice(1, 6).map((day, dayIndex) => {
                      const date = new Date(day);
                      const dayOfWeeks = dayjs(date).utc().day();
                      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                      const dayOfWeek = days[dayOfWeeks];
                      const morEntries = entries?.ROBOT || {};
                      const entryKey = `${dayOfWeek}-Wk${weekIndex + 1}startHour`;
                      const entry = morEntries[day];

                      console.log("Formatted Day (UTC):", day);
                      console.log("Day of the Week (UTC):", dayOfWeek);
                      console.log("Generated Entry Key:", entryKey);
                      console.log("Matching Entry:", entry);

                      return (
                        <td key={dayIndex}>
                          {entry ? (
                            <div className="text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500] text-[#000]'>
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}startHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}startMinute`] || "00"}
                                &nbsp; - &nbsp;
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}endHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}endMinute`] || "00"}
                              </p>
                            </div>
                          ) : (
                            <div className="empty-day-block text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500]'> 00 : 00 &nbsp;-&nbsp; 00 : 00</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
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
