import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import dayjs from "dayjs";
import DefaultLocations from "../../../utils/BlockCalendarStc"
function BlockCalenderShow() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // const [entries, setEntries] = useState({});
  const [entries, setEntries] = useState(DefaultLocations);
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = 35;
  const weekdayCounts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
  const weekdayWeeks = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
  const weekdayDates = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };

  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(new Date(currentYear, currentMonth, day));
    const weekday = date.format('dddd');
    if (weekday in weekdayDates) {
      const dateStr = date.format('YYYY-MM-DD');
      weekdayDates[weekday].push(dateStr);
    }

    if (weekday in weekdayCounts) {
      weekdayCounts[weekday]++;
      const weekNumber = Math.ceil(day / 7);
      weekdayWeeks[weekday].push(weekNumber);
    }
  }

  const fetchMonthData = async (year, month) => {
    setLoading(true);
    try {
      const response = await AxiosAuthInstance.get(`/block-calendar?year=${year}&month=${month + 1}`);
      if (response.data) {
        setEntries(response.data?.locations ?? DefaultLocations);
      }
      // if (Array.isArray(response.data) && response.data.length > 0) {
      //   const locationsData = response.data[0]?.locations || {};
      //   const formattedEntries = {
      //     MOR: locationsData.MOR || {},
      //     HOSC: locationsData.HOSC || {},
      //     ROBOT: locationsData.ROBOT || {},
      //   };
      //   setEntries(formattedEntries);
      // } else {
      //   console.error('Unexpected response format:', response.data);
      //   setErrors({ message: 'No data found for the selected month.' });
      // }
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
      <div className="relative w-[1300px] 2xl:w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
        <div className="absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] py-5 text-center rounded-xl flex justify-center items-center content-center px-10">
          <p className="flex inter-regular text-2xl items-center content-center justify-item-center">
            Block Time
          </p>
          <Link
            to="/block-calender"
            className="absolute right-[-80px] top-[50%] transform-translate-50 h-[35px] w-[220px] rounded bg-white mx-2 inter-medium flex items-center justify-center"
          >
            Block Time Calendar
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
                {
                  Object.entries(entries).map((location, location_name) => {
                    return (
                      <tr>
                        <th className='borders bordersx inter-bold text-[15px] uppercase'>{location[0]}</th>
                        {
                          location[1].map((weekday, index_key) => {
                            return (
                              <td>
                                {
                                  weekday.times.map((times, time_key) => {
                                    return (
                                      <>
                                        {times.startHour && times.endHour && (
                                          <>
                                            <h3 className="text-black inter-bold text-[15px] opacity-[80%]">
                                              Week {time_key + 1}
                                            </h3>
                                          </>
                                        )}
                                        <div className='flex'>
                                          {times.startHour && times.endHour && (
                                            <>
                                              <p className='flex justify-between w-[80px]'>{times.startHour ? times.startHour : '00'}  : {times.startMinute ? times.startMinute : '00'} {times.startPeriod ? times.startPeriod : 'AM'}</p> <p class="mx-2">-</p> <p className='flex justify-end w-[80px]'>{times.endHour ? times.endHour : '00'} : {times.endMinute ? times.endMinute : '00'} {times.endPeriod ? times.endPeriod : 'AM'}</p>

                                            </>
                                          )}
                                        </div>

                                        {/* {times.startHour && times.endHour ? (
                                          <>
                                            <h3 className="text-black inter-bold text-[15px] opacity-[80%]">
                                              Week {time_key + 1}
                                            </h3>
                                          </>
                                        ) : (
                                          <>
                                            <h3 className="text-black inter-bold text-[15px] empty-day-block">
                                              Week {time_key + 1}
                                            </h3>
                                          </>
                                        )}
                                        <div className='flex pb-[5px]'>
                                          {times.startHour && times.endHour ? (
                                            <>
                                              <p className='flex justify-between w-[55px]'>{times.startHour ? times.startHour : '00'}  : {times.startMinute ? times.startMinute : '00'}</p> <p class="mx-2">-</p> <p className='flex justify-end w-[55px]'>{times.endHour ? times.endHour : '00'} : {times.endMinute ? times.endMinute : '00'} </p>

                                            </>
                                          ) : (
                                            <>
                                              <p className='flex justify-between w-[55px] empty-day-block'>{times.startHour ? times.startHour : '00'}  : {times.startMinute ? times.startMinute : '00'}</p> <p class="mx-2 empty-day-block">-</p> <p className='flex justify-end w-[55px] empty-day-block'>{times.endHour ? times.endHour : '00'} : {times.endMinute ? times.endMinute : '00'} </p>
                                            </>
                                          )}
                                        </div> */}
                                      </>
                                    )
                                  })
                                }
                              </td>
                            )
                          })
                        }
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockCalenderShow;
