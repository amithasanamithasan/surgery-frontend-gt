import React, { useState, useEffect, useRef } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

function EditSchedulingSidebar() {
  const [errors, setErrors] = useState({});
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hour = now.getHours();
  const minit = now.getMinutes();
  const ampms = hour >= 12 ? "PM" : "AM";

  const elementRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const toggleVisibility = (index) => {
    if (elementRefs[index].current) {
      elementRefs[index].current.classList.toggle("hidden");
    }
  };

  const handleClickOutside = (event) => {
    elementRefs.forEach((ref) => {
      if (ref.current && !ref.current.contains(event.target)) {
        ref.current.classList.add("hidden");
      }
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [selectedValues, setSelectedValues] = useState({
    eft_am_start_hour: "",
    eft_am_end_hour: "",
    eft_am_start_minit: "",
    eft_am_end_minit: "",
    eft_am_start_ampm: "",
    eft_am_end_ampm: "",
    eft_pm_start_hour: "",
    eft_pm_end_hour: "",
    eft_pm_start_minit: "",
    eft_pm_end_minit: "",
    eft_pm_start_ampm: "",
    eft_pm_end_ampm: "",
  });
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };


  // Code for Office Closed 
  const [formOfficeCloseData, setFormOfficeCloseData] = useState({
    note: "Close",
    effective_date_start: "",
    create_by: false,
  });

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const [officeCloseStartDay, setOfficeCloseStartDay] = useState("");
  const [officeCloseStartMonth, setOfficeCloseStartMonth] = useState("");
  const [officeCloseStartYear, setOfficeCloseStartYear] = useState("");
  const [success, setSuccess] = useState(false);

  const handleOfficeCloseSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const effective_date_start = `${officeCloseStartYear}-${officeCloseStartMonth}-${officeCloseStartDay}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-ofice-close-data`,
        {
          ...formOfficeCloseData,
          effective_date_start: effective_date_start,
          note: "Close",
        }
      );

      setFormOfficeCloseData({
        note: "Close",
        officeCloseStartDay: "",
        officeCloseStartMonth: "",
        officeCloseStartYear: "",
        create_by: false,
      });

      setErrors({});
      console.log("formOfficeCloseData:", response);
      setSuccess(true);
    } catch (error) {
      setSuccess(false);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        console.error("Error response data:", error.response.data.errors);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error adding office close data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFormOfficeClose = () => {
    setOfficeCloseStartDay("");
    setOfficeCloseStartMonth("");
    setOfficeCloseStartYear("");
    setErrors({});
    console.log("Form canceled and errors cleared");
  };

  // Office adjust 
  const [formOfficeAdjustData, setFormOfficeAdjusteData] = useState({
    note: "Close",
    effective_date_start: "",
    create_by: false,
  });

  const handleDateAdjustChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const [officeAdjustStartDay, setOfficeAdjustStartDay] = useState("");
  const [officeAdjustStartMonth, setOfficeAdjustStartMonth] = useState("");
  const [officeAdjustStartYear, setOfficeAdjustStartYear] = useState("");

  const [officeAdjustEndtDay, setOfficeAdjustEndDay] = useState("");
  const [officeAdjustEndMonth, setOfficeAdjustEndMonth] = useState("");
  const [officeAdjustEndYear, setOfficeAdjustEndYear] = useState("");

  const handleOfficeAdjustSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const effective_date_start = `${officeAdjustStartYear}-${officeAdjustStartMonth}-${officeAdjustStartDay}`;
    const effective_date_end = `${officeAdjustEndYear}-${officeAdjustEndMonth}-${officeAdjustEndtDay}`;
    try {
      const response = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-ofice-close-data`,
        {
          ...formOfficeCloseData,
          effective_date_start: effective_date_start,
          effective_date_end: effective_date_end,
          note: "Adjust",
        }
      );

      setFormOfficeAdjusteData({
        note: "Adjust",
        officeAdjustStartDay: "",
        officeAdjustStartMonth: "",
        officeAdjustStartYear: "",
        officeAdjustEndtDay: "",
        officeAdjustEndMonth: "",
        officeAdjustEndYear: "",
        create_by: false,
      });

      setErrors({});
      console.log("formOfficeCloseData:", response);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        console.error("Error response data:", error.response.data.errors);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error adding office close data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustFormOffice = () => {
    setOfficeCloseStartDay("");
    setOfficeCloseStartMonth("");
    setOfficeCloseStartYear("");
    setErrors({});
    console.log("Form canceled and errors cleared");
  };
  const [isHidden1, setIsHidden1] = useState(false);
  const [isHidden2, setIsHidden2] = useState(false);
  const [isHidden3, setIsHidden3] = useState(false);
  const handleClick1 = () => {
    setIsHidden1(true);
  };
  const handleClick2 = () => {
    setIsHidden2(true);
  };
  const handleClick3 = () => {
    setIsHidden3(true);
  };
  // ------------------Reference to add Class-------------
  const startAM = useRef(null);
  const endAM = useRef(null);
  const startPM = useRef(null);
  const endPM = useRef(null);
  const startArrowAM1 = useRef(null);
  const startArrowAM2 = useRef(null);
  const startArrowAM3 = useRef(null);
  const startArrowAM4 = useRef(null);
  const endArrowAM1 = useRef(null);
  const endArrowAM2 = useRef(null);
  const endArrowAM3 = useRef(null);
  const endArrowAM4 = useRef(null);
  const startArrowPM1 = useRef(null);
  const startArrowPM2 = useRef(null);
  const startArrowPM3 = useRef(null);
  const startArrowPM4 = useRef(null);
  const endArrowPM1 = useRef(null);
  const endArrowPM2 = useRef(null);
  const endArrowPM3 = useRef(null);
  const endArrowPM4 = useRef(null);
  const addClasses1 = () => {
    if (startAM.current) {
      startAM.current.classList.add("bg-white", "drop-shadow-lg");
      startArrowAM1.current.classList.remove("hidden");
      startArrowAM2.current.classList.remove("hidden");
      startArrowAM3.current.classList.remove("hidden");
      startArrowAM4.current.classList.remove("hidden");
    }
  };
  const addClasses2 = () => {
    if (endAM.current) {
      endAM.current.classList.add("bg-white", "drop-shadow-lg");
      endArrowAM1.current.classList.remove("hidden");
      endArrowAM2.current.classList.remove("hidden");
      endArrowAM3.current.classList.remove("hidden");
      endArrowAM4.current.classList.remove("hidden");
    }
  };
  const addClasses3 = () => {
    if (startPM.current) {
      startPM.current.classList.add("bg-white", "drop-shadow-lg");
      startArrowPM1.current.classList.remove("hidden");
      startArrowPM2.current.classList.remove("hidden");
      startArrowPM3.current.classList.remove("hidden");
      startArrowPM4.current.classList.remove("hidden");
    }
  };
  const addClasses4 = () => {
    if (endPM.current) {
      endPM.current.classList.add("bg-white", "drop-shadow-lg");
      endArrowPM1.current.classList.remove("hidden");
      endArrowPM2.current.classList.remove("hidden");
      endArrowPM3.current.classList.remove("hidden");
      endArrowPM4.current.classList.remove("hidden");
    }
  };
  const removeClasses1 = () => {
    if (startAM.current) {
      startAM.current.classList.remove("bg-white", "drop-shadow-lg");
      startArrowAM1.current.classList.add("hidden");
      startArrowAM2.current.classList.add("hidden");
      startArrowAM3.current.classList.add("hidden");
      startArrowAM4.current.classList.add("hidden");
    }
  };
  const removeClasses2 = () => {
    if (endAM.current) {
      endAM.current.classList.remove("bg-white", "drop-shadow-lg");
      endArrowAM1.current.classList.add("hidden");
      endArrowAM3.current.classList.add("hidden");
      endArrowAM2.current.classList.add("hidden");
      endArrowAM4.current.classList.add("hidden");
    }
  };
  const removeClasses3 = () => {
    if (startPM.current) {
      startPM.current.classList.remove("bg-white", "drop-shadow-lg");
      startArrowPM1.current.classList.add("hidden");
      startArrowPM2.current.classList.add("hidden");
      startArrowPM3.current.classList.add("hidden");
      startArrowPM4.current.classList.add("hidden");
    }
  };
  const removeClasses4 = () => {
    if (endPM.current) {
      endPM.current.classList.remove("bg-white", "drop-shadow-lg");
      endArrowPM1.current.classList.add("hidden");
      endArrowPM2.current.classList.add("hidden");
      endArrowPM3.current.classList.add("hidden");
      endArrowPM4.current.classList.add("hidden");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (startAM.current && !startAM.current.contains(event.target)) {
          removeClasses1();
        }
        if (endAM.current && !endAM.current.contains(event.target)) {
          removeClasses2();
        }
        if (startPM.current && !startPM.current.contains(event.target)) {
          removeClasses3();
        }
        if (endPM.current && !endPM.current.contains(event.target)) {
          removeClasses4();
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [startMinute, setStartMinute] = useState("00");
  const [startHour, setStartHour] = useState("00");
  const [startHourEnd, setStartHourEnd] = useState("00");
  const [startMinuteEnd, setStartMinuteEnd] = useState("00");
  const [endHour, setEndHour] = useState("00");
  const [endHourEnd, setEndHourEnd] = useState("00");
  const [endMinute, setEndMinute] = useState("00");
  const [endMinuteEnd, setEndMinuteEnd] = useState("00");

  const minutes = ["00", "15", "30", "45"];
  const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  // Reusable function for increasing or decreasing values
  const handleTimeChange = (currentValue, setValue, array) => {
    const currentIndex = array.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % array.length; 
    setValue(array[nextIndex]);
  };

  const handleTimeDecrease = (currentValue, setValue, array) => {
    const currentIndex = array.indexOf(currentValue);
    const prevIndex = (currentIndex - 1 + array.length) % array.length; 
    setValue(array[prevIndex]);
  };

  return (
    <div className="relative bg-[#F9F9F9] w-[325px] ms-20 rounded-md text-center mt-[45px] select-none">
      <div className="absolute left-[-15px] bg-[#657E98] w-[355px] h-[55px] text-white inter-medium text-[24px] flex rounded-t-md">
        <p className="flex text-center items-center m-auto">Office Closed</p>
      </div>
      <form onSubmit={handleOfficeCloseSave}>
        <div className="flex justify-center items-center rounded-md text-center pt-[85px]" onClick={handleClick1}>
          <div className="flex items-center rounded bg-white">

            <input
              className="py-4 text-center focus:outline-none w-[80px] rounded-l-md"
              type="text"
              placeholder="MM"
              name="officeCloseStartMonth"
              value={officeCloseStartMonth}
              onChange={handleDateChange(setOfficeCloseStartMonth)}
              required
            />
            <span>/</span>
            <input
              className="py-4 text-center focus:outline-none w-[80px]"
              type="text"
              placeholder="DD"
              name="officeCloseStartDay"
              value={officeCloseStartDay}
              onChange={handleDateChange(setOfficeCloseStartDay)}
              required
            />
            <span>/</span>
            <input
              className="py-4 text-center focus:outline-none w-[80px] rounded-r-md"
              type="text"
              placeholder="YYYY"
              name="officeCloseStartYear"
              value={officeCloseStartYear}
              onChange={handleDateChange(setOfficeCloseStartYear)}
              required
            />

          </div>
        </div>
        <div>
          {errors.effective_date_start && <p className="pt-3 text-red-800"><small>{errors.effective_date_start[0]}</small></p>}
          {success && <p className="pt-3 text-green-800"><small>Successfully Closed the Office!</small></p>}
          
        </div>
        <div className={isHidden1 ? "flex justify-center pt-5" : "flex justify-center pt-5 deactive"}>
          <button
            type="submit"
            className="border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
          >
            <FontAwesomeIcon icon={faCheck} size="xl" />
          </button>
          <button
            className="border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
            id="close"
            onClick={handleClearFormOfficeClose}
          >
            <FontAwesomeIcon icon={faXmark} size="xl" />
          </button>
        </div>
      </form>

      <div className="absolute bg-[#657E98] w-[355px] left-[-15px] h-[55px] text-white inter-medium text-[24px] flex mt-[20px] rounded-md">
        <p className="flex text-center items-center m-auto">
          Adjust Default Office Hours
        </p>
      </div>

      <div className="m-auto rounded-md text-center pt-[100px]">
        <p className="pb-2">Effective Start Date - AM</p>

        <div className="flex justify-center items-center rounded-md text-center pt-[5px]" onClick={handleClick2}>
          <div className="flex items-center rounded bg-white">
            <input
              className="py-4 text-center focus:outline-none w-[80px] rounded-l-md"
              type="text"
              placeholder="MM"
              name=""

            />
            <span>/</span>
            <input
              className="py-4 text-center focus:outline-none w-[80px]"
              type="text"
              placeholder="DD"
              name=""

            />
            <span>/</span>
            <input
              className="py-4 text-center focus:outline-none w-[80px] rounded-r-md"
              type="text"
              placeholder="YYYY"
              name=""
            />
          </div>
        </div>

        <div className="m-auto pt-5 pb-3 relative">
          <div className="flex justify-between mx-[10%]">
            <div onClick={() => addClasses1()} class="flex justify-center items-center w-[120px] cursor-pointer">
              <div
                class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px]" ref={startAM}>
                <select name="startHour" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <span class="ms-[6px]">:</span>
                <select name="startMinute" value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <span className="ms-4">AM</span>
                {/* -----------Hour Arrow------------ */}
                <div onClick={() => handleTimeChange(startHour, setStartHour, hours)} class="hour absolute top-[5px] left-[15px] z-10 hidden" ref={startArrowAM1}>
                  <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                </div>
                <div onClick={() => handleTimeDecrease(startHour, setStartHour, hours)} class="hour absolute bottom-[5px] left-[15px] z-10 hidden" ref={startArrowAM2}>
                  <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                </div>

                {/* -----------Miniute Arrow----------- */}
                <div onClick={() => handleTimeChange(startMinute, setStartMinute, minutes)} class="miniute absolute top-[5px] right-[50px] z-10 hidden" ref={startArrowAM3}>
                  <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                </div>
                <div onClick={() => handleTimeDecrease(startMinute, setStartMinute, minutes)} class="miniute absolute bottom-[5px] right-[50px] z-10 hidden" ref={startArrowAM4}>
                  <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                </div>
              </div>
            </div>
            <div onClick={() => addClasses2()} class="flex justify-center items-center w-[120px] cursor-pointer">
              <div
                class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px]" ref={endAM}>
                <select name="startHourEnd" value={startHourEnd} onChange={(e) => setStartHourEnd(e.target.value)}>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <span class="ms-[6px]">:</span>
                <select name="startMinuteEnd" value={startMinuteEnd} onChange={(e) => setStartMinuteEnd(e.target.value)}>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <span className="ms-4">AM</span>
                {/* -----------Hour Arrow------------ */}
                <div onClick={() => handleTimeChange(startHourEnd, setStartHourEnd, hours)} class="hour absolute top-[5px] left-[15px] z-10 hidden" ref={endArrowAM1}>
                  <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                </div>
                <div onClick={() => handleTimeDecrease(startHourEnd, setStartHourEnd, hours)} class="hour absolute bottom-[5px] left-[15px] z-10 hidden" ref={endArrowAM2}>
                  <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                </div>

                {/* -----------Miniute Arrow----------- */}
                <div onClick={() => handleTimeChange(startMinuteEnd, setStartMinuteEnd, minutes)} class="miniute absolute top-[5px] right-[50px] z-10 hidden" ref={endArrowAM3}>
                  <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                </div>
                <div onClick={() => handleTimeDecrease(startMinuteEnd, setStartMinuteEnd, minutes)} class="miniute absolute bottom-[5px] right-[50px] z-10 hidden" ref={endArrowAM4}>
                  <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={isHidden2 ? "flex justify-center py-2" : "flex justify-center py-2 deactive"}>
          <button
            type="submit"
            className="border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
          >
            <FontAwesomeIcon icon={faCheck} size="xl" />
          </button>
          <button
            className="border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
            id="close"
          >
            <FontAwesomeIcon icon={faXmark} size="xl" />
          </button>
        </div>

        <hr />

        <div className="m-auto rounded-md text-center pt-[35px]">
          <p className="pb-2">Effective Start Date - PM</p>
          <div className="flex justify-center items-center rounded-md text-center pt-[5px]" onClick={handleClick3}>
            <div className="flex items-center rounded bg-white">
              <input
                className="py-4 text-center focus:outline-none w-[80px] rounded-l-md"
                type="text"
                placeholder="MM"
                name=""
              />
              <span>/</span>
              <input
                className="py-4 text-center focus:outline-none w-[80px]"
                type="text"
                placeholder="DD"
                name=""
              />
              <span>/</span>
              <input
                className="py-4 text-center focus:outline-none w-[80px] rounded-r-md"
                type="text"
                placeholder="YYYY"
                name=""
              />
            </div>
          </div>
          <div className="m-auto pt-5 pb-3 relative">
            <div className="flex justify-between mx-[10%]">
              <div onClick={() => addClasses3()} class="flex justify-center items-center w-[120px] cursor-pointer">
                <div
                  class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px] " ref={startPM}>
                  <select name="endHour"  value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                  <span class="ms-[6px]">:</span>
                  <select name="endMinute" value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                  <span className="ms-4">PM</span>
                  {/* -----------Hour Arrow------------ */}
                  <div onClick={() => handleTimeChange(endHour, setEndHour, hours)} class="hour absolute top-[5px] left-[15px] z-10 hidden" ref={startArrowPM1}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={() => handleTimeDecrease(endHour, setEndHour, hours)} class="hour absolute bottom-[5px] left-[15px] z-10 hidden" ref={startArrowPM2}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>

                  {/* -----------Miniute Arrow----------- */}
                  <div onClick={() => handleTimeChange(endMinute, setEndMinute, minutes)} class="miniute absolute top-[5px] right-[50px] z-10 hidden" ref={startArrowPM3}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div  onClick={() => handleTimeDecrease(endMinute, setEndMinute, minutes)} class="miniute absolute bottom-[5px] right-[50px] z-10 hidden" ref={startArrowPM4}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                </div>
              </div>
              <div onClick={() => addClasses4()} class="flex justify-center items-center w-[120px] cursor-pointer">
                <div
                  class="f-time relative h-[80px] w-[120px] flex justify-center items-center px-[20px]" ref={endPM}>
                  <select name="endHourEnd" value={endHourEnd} onChange={(e) => setEndHourEnd(e.target.value)}>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                  <span class="ms-[6px]">:</span>
                  <select name="endMinuteEnd" value={endMinuteEnd} onChange={(e) => setEndMinuteEnd(e.target.value)}>
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                  <span className="ms-4">PM</span>
                  {/* -----------Hour Arrow------------ */}
                  <div onClick={() => handleTimeChange(endHourEnd, setEndHourEnd, hours)} class="hour absolute top-[5px] left-[15px] z-10 hidden" ref={endArrowPM1}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                  <div onClick={() => handleTimeDecrease(endHourEnd, setEndHourEnd, hours)} class="hour absolute bottom-[5px] left-[15px] z-10 hidden" ref={endArrowPM2}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>

                  {/* -----------Miniute Arrow----------- */}
                  <div onClick={() => handleTimeChange(endMinuteEnd, setEndMinuteEnd, minutes)} class="miniute absolute top-[5px] right-[50px] z-10 hidden" ref={endArrowPM3}>
                    <FontAwesomeIcon icon={faAngleUp} color="gray" size="lg"></FontAwesomeIcon>
                  </div>
                  <div onClick={() => handleTimeDecrease(endMinuteEnd, setEndMinuteEnd, minutes)} class="miniute absolute bottom-[5px] right-[50px] z-10 hidden" ref={endArrowPM4}>
                    <FontAwesomeIcon icon={faAngleDown} color="gray" size="lg" ></FontAwesomeIcon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={isHidden3 ? "flex justify-center py-2" : "flex justify-center py-2 deactive"}>
            <button
              type="submit"
              className="border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
            >
              <FontAwesomeIcon icon={faCheck} size="xl" />
            </button>
            <button
              className="border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-white rounded-md bg-[#D8ADAD] mx-2"
              id="close"
              onClick={handleAdjustFormOffice}
            >
              <FontAwesomeIcon icon={faXmark} size="xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditSchedulingSidebar;
