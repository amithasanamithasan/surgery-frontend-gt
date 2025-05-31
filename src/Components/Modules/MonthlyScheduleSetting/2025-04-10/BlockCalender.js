import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import DefaultLocations from "../../../utils/BlockCalendarStc"

function BlockCalender() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [entries, setEntries] = useState(DefaultLocations);

  //const [blockEffective, setBlockEffective] = useState({});
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = 35;
  const weekdayCounts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
  const weekdayWeeks = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
  const weekdayDates = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };

  console.log(DefaultLocations);

  // const handlePreviousMonth = () => { setCurrentDate((prevDate) => prevDate.subtract(1, "month")); };
  // const handleNextMonth = () => { setCurrentDate((prevDate) => prevDate.add(1, "month")); };

  const handlePreviousMonth = () => {
    const newDate = currentDate.subtract(1, "month");
    fetchBlockEffectiveData(newDate.year(), newDate.month() + 1); // Fetch first
    setCurrentDate(newDate); // Then update the date
  };

  const handleNextMonth = () => {
    const newDate = currentDate.add(1, "month");
    fetchBlockEffectiveData(newDate.year(), newDate.month() + 1);
    setCurrentDate(newDate);
  };

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
    const options = { year: 'numeric', month: 'long' };
    const content = document.getElementById("block-calender").outerHTML;
    const blockID = document.getElementById("blockID").outerHTML;
    const date = document.getElementById("print-title").outerHTML;
    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.width = '0px';
    printWindow.style.height = '0px';
    printWindow.style.border = 'none';
    document.body.appendChild(printWindow);
    const printDocument = printWindow.contentWindow.document;
    printDocument.open();
    printDocument.write(`
        <html>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="print-color-adjust" content="exact">
            <head>
                <title>Block Calendar</title>
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
                      margin-top:20px;
                      border-top: 1px solid #ddd;
                    }
                    .print-container {
                      margin: 20px;
                    }
                    .hospital {
                      font-size: 40px;  
                    }
                    .fixture {
                      font-size: 20px;  
                    }
                    .scale {
                      padding-bottom: 20px;
                    }
                    .tables {
                      margin-top: 10px;
                      font-size: 10px !important;
                    }
                    .bolder{
                      font-size: 24px;
                      font-weight: 400;
                    }
                    .blocks td {
                        width: 210px !important;
                        padding: 10px 5px !important;
                        height: auto !important;
                    }
                    th.borders {
                      height: auto !important;
                      width: 100px !important;
                    }
                  }
                </style>
            </head>
            <body class="bg-white">
              <div style="display:flex; justify-content: center; align-item:center; font-size: 14px; text-align: center; font-wigth: 400">${date}</div>
              <h1 style="font-size: 12px; text-align: center; font-wigth: 400">${blockID}</h1>
              ${content}
            </body>
        </html>
    `);
    printDocument.close();

    // Wait for the content to be fully loaded
    printWindow.onload = () => {
      printWindow.contentWindow.focus();
      printWindow.contentWindow.print();

      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    }
  };

  return (
    <div className="bg-[#748BA2] content-center h-full pb-[200px] 2xl:pb-[350px]">
      <div className="global-centering relative w-[1300px] 2xl:w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
        <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[1165px] top-[-35px] py-5 text-center rounded-xl flex justify-between items-center  px-10">
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
            <Link to="/montly-schedule">
              <button
                type="button"
                className="border-none w-[190px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
              >
                Call Calendar View
              </button>
            </Link>
          </div>
          <h1 className="flex inter-medium text-[24px] items-center content-center justify-item-center ps-32">
            Block Time Calendar
          </h1>
          <div className="right flex items-center content-center justify-item-center">
            <button
              onClick={handlePrint}
              type="button"
              className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
            >
              Print Calendar
            </button>
            {/* {localStorage.role != 3 && ( */}
            {!(localStorage.role == 3 || localStorage.role == 4) && (
              <Link
                to="/edit-block-calender"
                className="border-none w-[165px] h-[35px] flex justify-center items-center rounded bg-white mx-2 inter-medium text-[18px]"
              >
                Edit Calendar
              </Link>
            )}
          </div>
        </div>

        <div className="w-[1260px] mx-auto pt-[3%] pb-[5%]">
          <div className="relative text-center pt-10 pb-5">
            <div className="relative text-center">
              <div className="prev absolute start-[35%] top-0 px-3 py-1 text-[#657E98]" id="icon-arrow-print">
                <FontAwesomeIcon
                  icon={faAngleLeft}
                  size="xl"
                  className="px-[20px]"
                  onClick={handlePreviousMonth}
                />
              </div>
              <h1 className="text-[24px] inter-bold" id="print-title">
                {currentDate.format("MMMM")} <span className="mx-2">{currentYear}</span>
              </h1>
              <div className="next absolute end-[35%] top-0 px-3 py-1 text-[#657E98]" id="icon-arrow-print">
                <FontAwesomeIcon
                  icon={faAngleRight}
                  size="xl"
                  className="px-[20px]"
                  onClick={handleNextMonth}
                />
              </div>
            </div>
            <p className="text-[18px]" id="blockID">
              {blockEffective?.formatted_date || "No block data available"}
            </p>
          </div>
          <div className="week-calender">
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

                {
                  Object.entries(entries).map((location, location_name) => {
                    return (
                      <tr>
                        <th className='borders inter-bold text-[15px] uppercase'>{location[0]}</th>
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
                                            <h3 className="text-black inter-bold text-[15px] empty-day-block none">
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

export default BlockCalender;
