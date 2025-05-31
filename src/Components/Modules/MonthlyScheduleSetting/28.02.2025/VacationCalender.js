import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function VacationCalender({ isVisible2, divRef2, handleClose2 }) {
  const [loading, setLoading] = useState(true);
  const [surgeonsWithStatus, setSurgeonsWithStatus] = useState([]);
  const [year, setYear] = useState("");

  const fetchData = async (year) => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/surgeons-with-vacation-status-year`,
        { params: { year } }
      );
      setSurgeonsWithStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data for the current year by default
    const currentYear = new Date().getFullYear();
    fetchData(currentYear);
  }, []);

  const handleYearSearch = async (e) => {
    e.preventDefault();
    if (year) {
      setLoading(true);
      await fetchData(year);
    }
  };

  return (
    <>
      {isVisible2 && (
        <div
          ref={divRef2}
          className="vacation-counter absolute bg-white rounded-xl h-auto w-[950px] shadow-[rgba(0,_0,_0,_0.4)_0px_5px_60px] m-auto left-0 right-0 top-[60px] z-[300]"
        >
          <div className="p-8 relative">
            <button
              onClick={handleClose2}
              className="absolute top-[-10px] right-[-15px] h-[35px] w-[35px] flex items-center justify-center bg-[#D8ADAD] px-3 py-1 rounded-md hover:bg-[#B87D7D] border-2 border-white"
            >
              <FontAwesomeIcon icon={faXmark} size="xl"></FontAwesomeIcon>
            </button>
            <div className="counter-body  overflow-x-auto">
              <table className="vacation">
                <tr>
                  <th className="inter-bold text-[24px]">Vacation Counter</th>
                  {surgeonsWithStatus.map((surgeon) => (
                    <th key={surgeon.id} className="inter-bold text-[18px]">
                      {surgeon.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  <td>
                    <button className="bg-[#657E98] w-[260px] h-[40px] rounded-md inter-medium text-[20px] text-white">
                      Allowed
                    </button>
                  </td>
                  {surgeonsWithStatus.map((surgeon) => (
                    <td key={surgeon.id}>
                      <button className="bg-[#657E98] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                        {surgeon.allowed_vacation}
                      </button>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>
                    <button className="bg-[#B4C6D9] w-[260px] h-[40px] rounded-md inter-medium text-[20px]">
                      Taken
                    </button>
                  </td>
                  {surgeonsWithStatus.map((surgeon) => (
                    <td key={surgeon.id}>
                      <button className="bg-[#B4C6D9] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                        {surgeon.taken_vacation || 0}
                      </button>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>
                    <button className="bg-[#E6E6E6] w-[260px] h-[40px] rounded-md inter-medium text-[20px]">
                      Remaining
                    </button>
                  </td>
                  {surgeonsWithStatus.map((surgeon) => (
                    <td key={surgeon.id}>
                      <button className="bg-[#E6E6E6] bg-opacity-20 w-[135px] h-[40px] rounded-md inter-medium text-[18px]">
                        {surgeon.remaining_vacation || 0}
                      </button>
                    </td>
                  ))}
                </tr>
              </table>
            </div>
            <div className="bg-[#e8eaed] text-center mx-2 my-4 h-[60px] rounded-md flex items-center justify-between px-[25%]">
              <h1 className="text-center inter-bold text-[18px]">
                Year Selector
              </h1>
              <form onSubmit={handleYearSearch}>
                <input
                  className="mx-5 rounded h-[40px] text-center focus:outline-none"
                  type="text"
                  name="year"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VacationCalender;
