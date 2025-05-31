import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

function CallCalender({ isVisible1, divRef1, handleClose1 }) {
  const [loading, setLoading] = useState(true);
  const [surgeonsWithStatus, setSurgeonsWithStatus] = useState([]);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [endDay, setEndDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const fetchData = async (startDate, endDate) => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/surgeons-with-status-year`,
        { params: { start_date: startDate, end_date: endDate } }
      );
      setSurgeonsWithStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    fetchData(`${currentYear}-01-01`, `${currentYear}-12-31`);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (year && endYear) {
      setLoading(true);
      const startDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const endDate = `${endYear}-${endMonth.padStart(2, "0")}-${endDay.padStart(2, "0")}`;
      fetchData(startDate, endDate);
    }
  };

  const handleClearForm = () => {
    setDay("");
    setMonth("");
    setYear("");
    setEndDay("");
    setEndMonth("");
    setEndYear("");
    const currentYear = new Date().getFullYear();
    fetchData(`${currentYear}-01-01`, `${currentYear}-12-31`);
  };

  return (
    <>
      {isVisible1 && (
        <div
          ref={divRef1}
          className="call-counter absolute bg-white rounded-xl h-auto w-[950px] shadow-[rgba(0,_0,_0,_0.4)_0px_5px_60px] m-auto left-0 right-0 top-[60px] z-[400]"
        >
          <div className="p-8 relative">
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
                    {surgeonsWithStatus.map((surgeon) => (
                      <td key={surgeon.id}>
                        <button className="bg-[#657E98] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                          {surgeon.surgeon_1st_count || 0}
                        </button>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <button className="bg-[#B4C6D9] w-[260px] h-[40px] rounded-md inter-medium text-[20px]">
                        Second
                      </button>
                    </td>
                    {surgeonsWithStatus.map((surgeon) => (
                      <td key={surgeon.id}>
                        <button className="bg-[#B4C6D9] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                          {surgeon.surgeon_2nd_count || 0}
                        </button>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <button className="bg-[#E6E6E6] w-[260px] h-[40px] rounded-md inter-medium text-[20px]">
                        Weekend
                      </button>
                    </td>
                    {surgeonsWithStatus.map((_, index) => (
                      <td key={index}>
                        <button className="bg-[#E6E6E6] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                          20
                        </button>
                      </td>
                    ))}
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
        </div>
      )}
    </>
  );
}

export default CallCalender;
