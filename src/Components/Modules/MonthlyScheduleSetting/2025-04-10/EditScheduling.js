import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleInfo, faXmark } from "@fortawesome/free-solid-svg-icons";
import EditSchedulingSidebar from "./EditSchedulingSidebar";

function EditScheduling() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [surgeons, setSurgeons] = useState([]);
  const [activeType, setActiveType] = useState("");

  useEffect(() => {
    fetchSurgeons();
  }, []);

  const fetchSurgeons = async () => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/surgeons`
      );
      setSurgeons(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
      setErrorMessage("Failed to fetch surgeons. Please try again.");
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    surgeon_id: "",
    vacation_type: "",
    vacation_start_date: "",
    vacation_end_date: "",
    vacation_dates: [],
    create_by: false,
  });

  const handleTypeClick = (type) => {
    setActiveType(type);
    setFormData((prevData) => ({
      ...prevData,
      vacation_type: type,
    }));
  };

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const [vacationStartDay, setVacationStartDay] = useState("");
  const [vacationStartMonth, setVacationStartMonth] = useState("");
  const [vacationStartYear, setVacationStartYear] = useState("");
  const [vacationEndDay, setVacationEndDay] = useState("");
  const [vacationEndMonth, setVacationEndMonth] = useState("");
  const [vacationEndYear, setVacationEndYear] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const vacation_start_date = `${vacationStartYear}-${vacationStartMonth}-${vacationStartDay}`;
    const vacation_end_date = `${vacationEndYear}-${vacationEndMonth}-${vacationEndDay}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-vacation-data`,
        { ...formData, vacation_start_date: vacation_start_date, vacation_end_date: vacation_end_date }
      );
      setFormData({
        surgeon_id: "",
        vacation_type: "",
        vacationStartDay: "",
        vacationStartMonth: "",
        vacationStartYear: "",
        vacationEndDay: "",
        vacationEndMonth: "",
        vacationEndYear: "",
        vacation_dates: [],
        create_by: false,
      });
      setActiveType("");
      setErrors({});
      console.log("formData:", response)
      handleCancel();
      setSuccess(true);
    } catch (error) {
      setSuccess(false);
      if (error.response) {
        // Check for the custom error from the backend
        if (error.response.data && error.response.data.error) {
          // If the error is from the server (like overlap error), display it
          setErrors({ general: error.response.data.error });
        } else if (error.response.data && error.response.data.errors) {
          // Otherwise, handle other validation errors
          setErrors(error.response.data.errors);
        }
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }

      console.error("Error adding vacation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVacationStartMonth("");
    setVacationStartDay("");
    setVacationStartYear("");
    setVacationEndDay("");
    setVacationEndMonth("");
    setVacationEndYear("");
    setFormData({
      surgeon_id: "",
      vacation_type: "",
      vacationStartDay: "",
      vacationStartMonth: "",
      vacationStartYear: "",
      vacationEndDay: "",
      vacationEndMonth: "",
      vacationEndYear: "",
      vacation_dates: [],
      create_by: false,
    });
    setErrors({});
    setActiveType("");
    console.log("Form canceled and errors cleared");
  };


  return (
    <div className="scheduling mt-0 relative w-[1300px] 2xl:w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl shadow-lg">
      <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] py-5 text-center rounded-xl flex justify-center items-center content-center px-10">
        <p className="flex inter-regular text-2xl items-center content-center justify-item-center">
          Scheduling
        </p>
      </div>
      <div className="w-[94%] mx-auto pt-[3%] pb-[5%]">
        <div className="flex flex-row">
          <div className="basis-2/3">
            <div className="bg-[#657E98] w-[520px] h-[55px] text-white inter-medium text-[24px] flex m-auto rounded-md items-center text-center mt-[40px] mb-[60px]">
              <p className="flex text-center items-center m-auto">Time Off</p>
            </div>

            <form onSubmit={handleSave}>
              <div className="flex justify-between items-center text-center px-2 mb-[50px]">
                {surgeons.map((surgeon) => (
                  <div
                    key={surgeon.id}
                    onClick={() => setFormData((prevData) => ({ ...prevData, surgeon_id: surgeon.id }))}
                    className={`short-title bg-[#B4C6D9] rounded-md h-[55px] w-[180px] flex justify-center items-center cursor-pointer ${formData.surgeon_id === surgeon.id ? 'active' : ''}`}
                  >
                    <p className={`inter-medium text-[24px] text-black flex text-center items-center content-center justify-center`}>{surgeon.initial}</p>
                  </div>
                ))}
              </div>
              <div>
                {success && <p className="pb-5 px-2 text-green-800"><small> <FontAwesomeIcon icon={faCircleInfo} size="xl" className="me-2"></FontAwesomeIcon> Record Submitted Successfully!</small></p>}
              </div>
              {errors && errors.surgeon_id && (
                <p className="text-red-800">
                  <small>{errors.surgeon_id[0]}</small>
                </p>
              )}

              {["Vac", "CME", "Holiday", "Sick", "Maternity"].map((type) => (
                <>
                  <div
                    key={type}
                    className="bg-[#F9F9F9] text-center cursor-pointer h-[75px] px-[33px] rounded-md flex items-center justify-between mb-[30px] group relative" onClick={() => handleTypeClick(type)}
                  >
                    <h1 className="text-left inter-medium text-[20px] w-[150px] cursor-pointer">
                      {type}
                    </h1>

                    {activeType === type ? (
                      <div className="dates flex items-center w-[400px] justify-between">
                        <div className="dmy flex items-center bg-white rounded">
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="MM"
                            name="vacationStartMonth"
                            value={vacationStartMonth}
                            onChange={handleDateChange(setVacationStartMonth)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="DD"
                            name="vacationStartDay"
                            value={vacationStartDay}
                            onChange={handleDateChange(setVacationStartDay)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[50px] rounded"
                            type="text"
                            placeholder="YYYY"
                            name="vacationStartYear"
                            value={vacationStartYear}
                            onChange={handleDateChange(setVacationStartYear)}
                          />
                        </div>
                        <h1 className="inter-medium text-[15px] text-[blue]">TO</h1>
                        <div className="dmy flex items-center bg-white rounded">
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="MM"
                            name="vacationEndMonth"
                            value={vacationEndMonth}
                            onChange={handleDateChange(setVacationEndMonth)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="DD"
                            name="vacationEndDay"
                            value={vacationEndDay}
                            onChange={handleDateChange(setVacationEndDay)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[50px] rounded"
                            type="text"
                            placeholder="YYYY"
                            name="vacationEndYear"
                            value={vacationEndYear}
                            onChange={handleDateChange(setVacationEndYear)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="dates flex items-center w-[400px] justify-between deactive">
                        <div className="dmy flex items-center bg-white rounded">
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="MM"
                          // name="vacationStartMonth"
                          // value={vacationStartMonth}
                          // onChange={handleDateChange(setVacationStartMonth)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="DD"
                          // name="vacationStartDay"
                          // value={vacationStartDay}
                          // onChange={handleDateChange(setVacationStartDay)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[50px] rounded"
                            type="text"
                            placeholder="YYYY"
                          // name="vacationStartYear"
                          // value={vacationStartYear}
                          // onChange={handleDateChange(setVacationStartYear)}
                          />
                        </div>
                        <h1 className="inter-medium text-[15px] text-[blue]">TO</h1>
                        <div className="dmy flex items-center bg-white rounded">
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="MM"
                          // name="vacationEndMonth"
                          // value={vacationEndMonth}
                          // onChange={handleDateChange(setVacationEndMonth)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[40px] rounded"
                            type="text"
                            placeholder="DD"
                          // name="vacationEndDay"
                          // value={vacationEndDay}
                          // onChange={handleDateChange(setVacationEndDay)}
                          />
                          <span>/</span>
                          <input
                            className="py-2 text-center focus:outline-none w-[50px] rounded"
                            type="text"
                            placeholder="YYYY"
                          // name="vacationEndYear"
                          // value={vacationEndYear}
                          // onChange={handleDateChange(setVacationEndYear)}
                          />
                        </div>
                      </div>
                    )}
                    {activeType === type ? (
                      <div className="action-buttons flex justify-end">
                        <button
                          type="submit"
                          className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faCheck} size="xl"></FontAwesomeIcon>
                        </button>
                        <button
                          className="close ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
                          id="close"
                          type="button"
                          onClick={handleCancel}
                        >
                          <FontAwesomeIcon icon={faXmark} size="xl"></FontAwesomeIcon>
                        </button>
                      </div>
                    ) : (<div className="action-buttons flex justify-end deactive">
                      <button
                        type="submit"
                        className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faCheck} size="xl"></FontAwesomeIcon>
                      </button>
                      <button
                        className="close ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
                        id="close"
                        onClick={handleCancel}
                      >
                        <FontAwesomeIcon icon={faXmark} size="xl"></FontAwesomeIcon>
                      </button>
                    </div>)}
                  </div>
                  {/* Error Messages */}
                  {activeType === type && errors && (
                    <div className="my-5">
                      {errors.vacation_type && <p className="text-red-800"><small>{errors.vacation_type[0]}</small></p>}
                      {errors.vacation_start_date && <p className="text-red-800"><small>{errors.vacation_start_date[0]}</small></p>}
                      {errors.vacation_end_date && <p className="text-red-800"><small>{errors.vacation_end_date[0]}</small></p>}
                      {errors.general && <p className="text-red-800"><small>{errors.general}</small></p>}
                    </div>
                  )}
                  {/* Error Messages */}
                </>
              ))}
            </form>
          </div>

          <div className="basis-1/3">
            <div className="relative">
              <div className="seperator"></div>
              <EditSchedulingSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditScheduling;
