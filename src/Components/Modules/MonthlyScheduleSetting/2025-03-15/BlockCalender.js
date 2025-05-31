import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Preloader from "../../Partials/preLoader";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
function BlockCalender() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month(); // 0-11 (Jan-Dec)
  // const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() || 7) - 1;
  // const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = dayjs.utc().year(currentYear).month(currentMonth).daysInMonth();
  const firstDayOfMonth = dayjs.utc().year(currentYear).month(currentMonth).startOf('month').day();
  const daysArray = [
    ...Array(firstDayOfMonth).fill(null), // Fill initial empty days
    ...Array.from({ length: daysInMonth }, (_, i) =>
      dayjs().year(currentYear).month(currentMonth).date(i + 1).format("YYYY-MM-DD")
    ),
  ];

  // Ensure the last row aligns with a 7-day structure
  const totalDays = daysArray.length;
  const remainingDays = totalDays % 7;

  if (remainingDays > 0) {
    daysArray.push(...Array(7 - remainingDays).fill(null));
  }


  console.log(firstDayOfMonth);


  const weeksArray = [];
  for (let i = 0; i < daysArray.length; i += 7) { weeksArray.push(daysArray.slice(i, i + 7)); }

  console.log(weeksArray);


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
  console.log(entries.MOR)
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
  // if (loading) {
  //   return <Preloader />
  // }

  const handlePrint = () => {
    const options = { year: 'numeric', month: 'long' };
    const content = document.getElementById("block-calender").outerHTML;
    const dates = document.getElementById("print-title").outerHTML;
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
                <title>Daily Schedule Calendar</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
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
                      margin: 10px;
                    }
                    .tables{
                      border: 1px solid #000 !important;
                    }
                    .tables tr th, .tables tr td{
                      border: 0px solid #000;
                      border-right: 1px solid #000 !important;
                      height: auto;
                      padding: 3px 10px;
                      width: 300px !important;
                    }
                    .empty-day-block{
                      opacity: 0.4;
                    }
                    .block-calender .blocks td{
                      padding: 5px 20px !important;
                      width: 300px !important;
                    }
                    td.location {
                      text-align: center;
                      vertical-align: middle !important; 
                    }
                    .blocks th {
                      font-size: 20px !important;
                      font-weight: 600 !important;
                      width: 300px !important;
                    }
                      #print-title {
                      font-weight: 700;
                      font-size: 24px;
                      margin-bottom: 5px;
                      display: flex;
                      justify-content: center;
                      position: relative;
                      width: 100%
                    }
                    #print-title:before {
                      position: absolute;
                      width: 100px;
                      height: 2px;
                      content: "";
                      background-color: #748BA2;
                      bottom: 0px; 
                      left: 50%;
                      transform: translateX(-50%); 
                    }
                      print{
                      font-size: 13px;
                      font-weight: 600;
                    }
                  }
                </style>
            </head>
            <body class="bg-white">
              ${dates}
              ${content}
            </body>
        </html>
    `);
    printDocument.close();

    // Wait for styles and content to load before printing
    printWindow.onload = () => {
      printWindow.contentWindow.focus();
      printWindow.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    };
  };

  return (
    <div className="bg-[#748BA2] content-center">
      <div className="global-centering relative w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
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
              type="button"
              className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
              onClick={handlePrint}
            >
              Print Calender
            </button>
            <Link
              to="/edit-block-calender"
              className="border-none w-[165px] h-[35px] flex justify-center items-center rounded bg-white mx-2 inter-medium text-[18px]"
            >
              Edit Calender
            </Link>
          </div>
        </div>

        <div className="w-[1260px] mx-auto pt-[3%] pb-[5%]">
          <div className="relative text-center pt-10 pb-5">
            {/* <h1 className="text-[24px] inter-bold">
                        {dayjs().format('MMMM')} <span className="mx-2">{currentYear}</span>
                      </h1> */}
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
            <p className="text-[18px]">
              {blockEffective?.formatted_date || "No block data available"}
            </p>
          </div>
          <div className="block-calender">
            <table className="blocks" id='block-calender'>
              <thead>
                <tr>
                  <th>Location</th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, idx) => (
                    <th key={idx} className="text-[20px] inter-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='tables'>
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

                      return (
                        <td key={dayIndex}>
                          {entry ? (
                            <div className="print text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500] text-[#000]'>
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}startHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}startMinute`] || "00"}
                                &nbsp; - &nbsp;
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}endHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}endMinute`] || "00"}
                              </p>
                            </div>
                          ) : (
                            <div className="print empty-day-block text-[#ABABAB] inter-bold text-[15px]">
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
              <tbody className='tables'>
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

                      return (
                        <td key={dayIndex}>
                          {entry ? (
                            <div className="print text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500] text-[#000]'>
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}startHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}startMinute`] || "00"}
                                &nbsp; - &nbsp;
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}endHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}endMinute`] || "00"}
                              </p>
                            </div>
                          ) : (
                            <div className="print empty-day-block text-[#ABABAB] inter-bold text-[15px]">
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
              <tbody className='tables'>
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

                      return (
                        <td key={dayIndex}>
                          {entry ? (
                            <div className="print text-[#ABABAB] inter-bold text-[15px]">
                              Week {weekIndex + 1}<br />
                              <p className='font-[500] text-[#000]'>
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}startHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}startMinute`] || "00"}
                                &nbsp; - &nbsp;
                                {entry[`${dayOfWeek}-Wk${weekIndex + 1}endHour`] || "00"} : {entry[`${dayOfWeek}-Wk${weekIndex + 1}endMinute`] || "00"}
                              </p>
                            </div>
                          ) : (
                            <div className="print empty-day-block text-[#ABABAB] inter-bold text-[15px]">
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

export default BlockCalender;
