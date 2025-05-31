import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faPlus,
  faCheck,
  faTimes,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
const OperationsToDate = () => {
  const [surgeons, setSurgeons] = useState([]);
  const [data, setData] = useState({ surgeons: [], assistants: [] });
  const [currentYear, setCurrentYear] = useState(dayjs().year());

  useEffect(() => {
    fetchSurgeons();
  }, []);

  useEffect(() => {
    fetchData(currentYear);
  }, [currentYear]);

  const fetchSurgeons = async () => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/get-surgeons`
      );
      setSurgeons(response.data);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
    }
  };

  const fetchData = async (year) => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/get-surgeons-logs`,
        {
          params: { year },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const initializeMonthlyData = (items) => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const data = {};

    items.forEach((item) => {
      const name = item.name;
      if (!data[name]) {
        data[name] = {};
        months.forEach((month) => {
          data[name][month] = { surgeries: 0, assistances: 0 };
        });
      }
      data[name][item.month] = {
        surgeries: item.surgeries || 0,
        assistances: item.assistances || 0,
      };
    });

    return data;
  };

  const monthlyDataSurgeons = initializeMonthlyData(data.surgeons);
  const monthlyDataAssistants = initializeMonthlyData(data.assistants);

  const calculateTotals = (data) => {
    const totals = {};
    for (let month = 1; month <= 12; month++) {
      totals[month] = { surgeries: 0, assistances: 0 };
      Object.keys(data).forEach((name) => {
        totals[month].surgeries += data[name][month]?.surgeries || 0;
        totals[month].assistances += data[name][month]?.assistances || 0;
      });
    }
    return totals;
  };

  const totalDataSurgeons = calculateTotals(monthlyDataSurgeons);
  const totalDataAssistants = calculateTotals(monthlyDataAssistants);

  const handlePreviousYear = () => {
    setCurrentYear((prevYear) => prevYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((prevYear) => prevYear + 1);
  };

  return (
    <>
      <div className="stylish relative bg-white w-100 px-10 rounded-md pt-5 pb-10 shadow-lg">
        <div className="w-[85%] bg-[#657E98] absolute text-center py-4 rounded-xl m-auto left-0 right-0 top-[-30px]">
          <h1 className="text-white inter-bold text-[20px]">
            Operations to Date this Year
          </h1>
          <div className="absolute top-3 right-20">
            <button
              className="text-white px-2 py-1 me-3 border-white rounded-md border-2 hover:bg-[#043F82]"
              onClick={handlePreviousYear}
            >
              <FontAwesomeIcon icon={faAngleLeft} size="xl" />
            </button>
            <button className="border-2 bg-transparent px-5 py-1 rounded-md text-center inter-bold text-white">
              {currentYear}
            </button>
            <button
              className="text-white px-2 py-1 ms-3 border-white rounded-md border-2 hover:bg-[#043F82]"
              onClick={handleNextYear}
            >
              <FontAwesomeIcon icon={faAngleRight} size="xl" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="operatives mt-16">
            <thead className="text-center inter-bold text-[14px]">
              <tr>
                <th className="relative">
                  Surgeon
                  <div className="absolute under"></div>
                </th>
                <th>
                  Jan. <br /> Pri./Assist
                </th>
                <th>
                  Feb. <br /> Pri./Assist
                </th>
                <th>
                  Mar. <br /> Pri./Assist
                </th>
                <th>
                  Apr. <br /> Pri./Assist
                </th>
                <th>
                  May. <br /> Pri./Assist
                </th>
                <th>
                  Jun. <br /> Pri./Assist
                </th>
                <th>
                  Jul. <br /> Pri./Assist
                </th>
                <th>
                  Aug. <br /> Pri./Assist
                </th>
                <th>
                  Sept. <br /> Pri./Assist
                </th>
                <th>
                  Oct. <br /> Pri./Assist
                </th>
                <th>
                  Nov. <br /> Pri./Assist
                </th>
                <th>
                  Dec. <br /> Pri./Assist
                </th>
                <th className="text-[#B87D7D]">
                  Total <br /> Pri./Assist
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(monthlyDataSurgeons).map((name, index) => (
                <tr key={index} className="text-left inter-bold">
                  <td>
                    <span className="text-[14px] inter-bold">{name.replace("Dr. ", "")}</span>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <td key={month}>
                      <span className="text-[#000]">
                        {monthlyDataSurgeons[name]?.[month]?.surgeries || 0}
                      </span>
                      /
                      <span className="text-[#000]">
                        {monthlyDataAssistants[name]?.[month]?.assistances || 0}
                      </span>
                    </td>
                  ))}
                  <td className="inter-bold">
                    <span className="text-[#B87D7D]">
                      {Array.from(
                        { length: 12 },
                        (_, i) =>
                          monthlyDataSurgeons[name]?.[i + 1]?.surgeries || 0
                      ).reduce((a, b) => a + b, 0)}
                    </span>
                    /
                    <span className="text-[#B87D7D]">
                      {Array.from(
                        { length: 12 },
                        (_, i) =>
                          monthlyDataAssistants[name]?.[i + 1]?.assistances || 0
                      ).reduce((a, b) => a + b, 0)}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="text-left inter-bold">
                <td>
                  <span className="text-[14px] inter-bold">Total</span>
                </td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={month}>
                    <span className="text-[#B87D7D]">
                      {totalDataSurgeons[month]?.surgeries || 0}
                    </span>
                    /
                    <span className="text-[#B87D7D]">
                      {totalDataAssistants[month]?.assistances || 0}
                    </span>
                  </td>
                ))}
                <td className="inter-bold">
                  <span className="text-[#B87D7D]">
                    {Array.from(
                      { length: 12 },
                      (_, i) => totalDataSurgeons[i + 1]?.surgeries || 0
                    ).reduce((a, b) => a + b, 0)}
                  </span>
                  /
                  <span className="text-[#B87D7D]">
                    {Array.from(
                      { length: 12 },
                      (_, i) => totalDataAssistants[i + 1]?.assistances || 0
                    ).reduce((a, b) => a + b, 0)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OperationsToDate;
