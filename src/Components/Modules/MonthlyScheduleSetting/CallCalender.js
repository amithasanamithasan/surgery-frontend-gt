import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Draggable, { DraggableCore } from 'react-draggable';

dayjs.extend(utc);

function CallCalender({ isVisible1, divRef1, handleClose1, realTimeCount }) {
  const [loading, setLoading] = useState(true);
  const [surgeonsWithStatus, setSurgeonsWithStatus] = useState([]);
  const [preference, setPreference] = useState([]);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [endDay, setEndDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");



  console.log('sk', realTimeCount);

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // SK
  useEffect(() => {
    setSurgeonsWithStatus(realTimeCount);
    return () => {
      setSurgeonsWithStatus([]);
    };
  }, [realTimeCount]);
  // END SK

  useEffect(() => {
    const fetchStoredPreferences = async () => {
      try {
        const userId = localStorage.getItem("id");

        if (!userId) {
          console.error("❌ User ID not found in localStorage");
          return;
        }

        console.log(`📤 Fetching preferences for user_id=${userId}`);

        const response = await AxiosAuthInstance.get(
          `${Constant.BASE_URL}/serache-surgeons-with-status-year`,
          { params: { user_id: userId } }
        );

        console.log("✅ API Response Data:", response.data);

        if (response.data.length > 0) {
          const data = response.data[0]; // Use the first returned item
          console.log("📌 User-specific preference data:", data);

          // Update states immediately
          setYear(dayjs.utc(data.start_date).format("YYYY"));
          setMonth(dayjs.utc(data.start_date).format("MM"));
          setDay(dayjs.utc(data.start_date).format("DD"));
          setEndYear(dayjs.utc(data.end_date).format("YYYY"));
          setEndMonth(dayjs.utc(data.end_date).format("MM"));
          setEndDay(dayjs.utc(data.end_date).format("DD"));
          setTimeout(() => {
            fetchData(
              dayjs.utc(data.start_date).format("YYYY-MM-DD"),
              dayjs.utc(data.end_date).format("YYYY-MM-DD")
            );
          }, 0);
        } else {
          console.log("❌ No data found for this user.");
          const currentYear = new Date().getFullYear();
          fetchData(`${currentYear}-01-01`, `${currentYear}-12-31`);
        }
      } catch (error) {
        console.error("🚨 API Fetch Error:", error.response?.data || error.message);
      }
    };
    fetchStoredPreferences();
  }, []);



  const fetchData = async (startDate, endDate) => {
    try {
      const userId = localStorage.getItem("id");
      console.log("📅 Fetching Data for user_id:", userId, "with:", { startDate, endDate });

      if (!userId) {
        console.error("❌ User ID not found in localStorage");
        return;
      }

      const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/surgeons-with-status-year`, {
        params: { user_id: userId, start_date: startDate, end_date: endDate }, // Include user_id
      });

      setSurgeonsWithStatus(response.data);
      console.log("✅ Received Data:", response.data);

    } catch (error) {
      console.error("🚨 Error fetching data:", error.response?.data || error.message);
    }
  };



  const handleSearch = async (e) => {
    e.preventDefault();
    if (year && endYear) {
      setLoading(true);
      const startDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const endDate = `${endYear}-${endMonth.padStart(2, "0")}-${endDay.padStart(2, "0")}`;

      try {
        const response = await AxiosAuthInstance.post(`${Constant.BASE_URL}/user-search-preference`, {
          start_date: startDate,
          end_date: endDate,
        });
        if (response.status === 200) {
          fetchData(startDate, endDate); // Fetch data with the new date range
        } else {
          console.error("Error:", response.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearForm = async () => {
    setDay("");
    setMonth("");
    setYear("");
    setEndDay("");
    setEndMonth("");
    setEndYear("");

    try {
      const userId = localStorage.getItem('id');
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const responsePreference = await AxiosAuthInstance.get(`${Constant.BASE_URL}/serache-surgeons-with-status-year`, {
        params: { user_id: userId },
      });

      if (responsePreference.data.length > 0) {
        const data = responsePreference.data[0];
        const startDate = dayjs.utc(data.start_date).format("YYYY-MM-DD");
        const endDate = dayjs.utc(data.end_date).format("YYYY-MM-DD");

        fetchData(startDate, endDate);
      } else {
        console.log("No stored preferences found.");
        const currentYear = new Date().getFullYear();
        fetchData(`${currentYear}-01-01`, `${currentYear}-12-31`);
      }
    } catch (error) {
      console.error("🚨 Error fetching stored preferences:", error);
    }
  };
  // ------------Bounds Set----------
  const [bounds, setBounds] = useState({
    left: -window.innerWidth / 2 + 500,
    top: -150,
    right: window.innerWidth / 2 - 500,
    bottom: 1100,
  });


  return (
    <>
      {isVisible1 && (
        <>
          <Draggable
            handle=".drag-handle"
            bounds={bounds}
            axis="both"
            position={null}
          >
            <div
              ref={divRef1}
              className="call-counter fixed bg-white rounded-xl h-auto w-[950px] shadow-[rgba(0,_0,_0,_0.4)_0px_5px_60px] m-auto left-0 right-0 top-[160px] z-[400]"
            >
              <div className="drag-handle cursor-pointer p-8 relative">
                <button
                  onClick={handleClose1}
                  className="absolute top-[-10px] right-[-15px] h-[35px] w-[35px] flex items-center justify-center bg-[#D8ADAD] px-3 py-1 rounded-md hover:bg-[#B87D7D] border-2 border-[white]"
                >
                  <FontAwesomeIcon icon={faClose} size="xl" />
                </button>
                <div className="counter-body overflow-x-auto">
                  <table className="vacation">
                    <thead>
                      <tr>
                        <th className="inter-bold text-[24px]">Call Counter</th>
                        {surgeonsWithStatus.map((surgeon) => (
                          <th key={surgeon.id} className="inter-bold text-[18px]">
                            {surgeon.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <button className="bg-[#657E98] w-[260px] h-[40px] rounded-md inter-medium text-[20px] text-white">
                            First
                          </button>
                        </td>
                        {surgeonsWithStatus.map((surgeon) => {
                          return (
                            <td key={surgeon.id}>
                              <button className="bg-[#657E98] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                                {surgeon.surgeon_1st_count || 0}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td>
                          <button className="bg-[#B4C6D9] w-[260px] h-[40px] rounded-md inter-medium text-[20px]">
                            Second
                          </button>
                        </td>
                        {surgeonsWithStatus.map((surgeon) => {
                          return (
                            <td key={surgeon.id}>
                              <button className="bg-[#B4C6D9] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                                {surgeon.surgeon_2nd_count || 0}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td>
                          <button className="bg-[#E6E6E6] w-[260px] h-[40px] rounded-md inter-medium text-[20px]">
                            Weekend
                          </button>
                        </td>
                        {surgeonsWithStatus.map((surgeon) => {

                          return (
                            <td key={surgeon.id}>
                              <button className="bg-[#E6E6E6] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                                {surgeon.weekend_count || 0}
                              </button>
                            </td>
                          )
                        })}
                        {/* {surgeonsWithStatus.map((surgeon) => {
                          const surgeonData = wkCount?.[surgeon.id];

                          if (!surgeonData) {
                            console.warn(`Missing data for surgeon.id: ${surgeon.id}`);
                          }

                          const weekendData = surgeonData?.['weekend'];
                          const length = Array.isArray(weekendData) ? weekendData[0] : 0;

                          return (
                            <td key={surgeon.id}>
                              <button className="bg-[#E6E6E6] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                                {(surgeon.weekend_count || 0) + length}
                              </button>
                            </td>
                          );
                        })} */}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <form onSubmit={handleSearch}>
                  <div className="bg-[#e8eaed] text-center mx-2 my-4 px-16 h-[60px] rounded-md flex items-center justify-between">
                    <h1 className="text-center inter-bold text-[18px] me-[40px]">View Date Range</h1>
                    <div className="dmy flex items-center bg-white rounded">
                      <input
                        className="py-2 text-center focus:outline-none w-[60px] rounded"
                        type="text"
                        placeholder="MM"
                        name="month"
                        value={month}
                        onChange={handleDateChange(setMonth)}
                      />
                      <span>/</span>
                      <input
                        className="py-2 text-center focus:outline-none w-[60px] rounded"
                        type="text"
                        placeholder="DD"
                        name="day"
                        value={day}
                        onChange={handleDateChange(setDay)}
                      />
                      <span>/</span>
                      <input
                        className="py-2 text-center focus:outline-none w-[60px] rounded"
                        type="text"
                        placeholder="YYYY"
                        name="year"
                        value={year}
                        onChange={handleDateChange(setYear)}
                      />
                    </div>
                    <h1 className="inter-medium text-[15px]">TO</h1>
                    <div className="dmy flex items-center bg-white rounded">
                      <input
                        className="py-2 text-center focus:outline-none w-[60px] rounded"
                        type="text"
                        placeholder="MM"
                        name="endMonth"
                        value={endMonth}
                        onChange={handleDateChange(setEndMonth)}
                      />
                      <span>/</span>
                      <input
                        className="py-2 text-center focus:outline-none w-[60px] rounded"
                        type="text"
                        placeholder="DD"
                        name="endDay"
                        value={endDay}
                        onChange={handleDateChange(setEndDay)}
                      />
                      <span>/</span>
                      <input
                        className="py-2 text-center focus:outline-none w-[60px] rounded"
                        type="text"
                        placeholder="YYYY"
                        name="endYear"
                        value={endYear}
                        onChange={handleDateChange(setEndYear)}
                      />
                    </div>
                    <div className="">
                      <button
                        type="submit"
                        className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                      >
                        <FontAwesomeIcon icon={faCheck} size="xl" />
                      </button>
                      <button
                        type="button"
                        className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-black rounded-md bg-[#D8ADAD] mx-2"
                        onClick={handleClearForm}
                      >
                        <FontAwesomeIcon icon={faTimes} size="xl" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div >
          </Draggable>
        </>
      )}
    </>
  );
}

export default CallCalender;
