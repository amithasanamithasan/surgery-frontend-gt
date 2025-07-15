import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import DeleteModal from "./DeleteModal";
import WarningModalEdit from "./WarningModalEdit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import Celender1 from "./celender1";
import WarningModal from "./WarningModal";
import WarningModalDelete from "./WarningModalDelete";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
const SearchByDate = () => {
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState("");
  const [entries, setEntries] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [filterEntries, setFilterEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentlyDelete, setCurrentlyDelete] = useState(false);

  const navigate = useNavigate();
  const dateParam = searchParams.get("date");

  const today = dayjs();
  const dates = Array.from({ length: 7 }, (_, index) =>
    today.subtract(index, "day")
  );
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [dataEditing, setDataEditing] = useState(false);
  const [warningState, setWarningState] = useState("false");
  const [warning, setWarning] = useState(false);
  const [currentlyEdit, setCurrentlyEdit] = useState(false);

  const handleToggleEdit = () => {
    setDataEditing(!dataEditing);
  };
  // -------------Added-------------
  const [newEntry, setNewEntry] = useState({
    room: "",
    first_name: "",
    last_name: "",
    age: "",
    mrn: "",
    diagnosis: "",
    procedure: "",
    notes: "",
    facility: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    if (selectedDate.isSame(today, "day")) {
      setDataEditing((prevState) => !prevState);
      if (dataEditing) {
        setIsEditing(false);
        setEditingId(null);
        setNewEntry({
          room: "",
          first_name: "",
          last_name: "",
          age: "",
          mrn: "",
          diagnosis: "",
          procedure: "",
          notes: "",
          facility: "",
        });
      }
    } else {
      console.log("The selected date is not today's date.");
    }
  };
  // -------------------------------
  const [selectedDate, setSelectedDate] = useState(
    //dateParam ? dayjs(dateParam) : today
    dateParam ? dayjs.utc(dateParam) : dayjs.utc()
  );
  // useEffect(() => {
  //   if (dateParam) {
  //     const newDate = dayjs.utc(dateParam);
  //     setSelectedDate(newDate);
  //     fetchData(dateParam);
  //   } else {
  //     setSelectedDate(dayjs.utc());
  //   }
  // }, [dateParam]);

  // useEffect(() => {
  //   fetchData(selectedDate.format("YYYY-MM-DD"));
  //   const intervalId = setInterval(() => {
  //     fetchData(selectedDate.format("YYYY-MM-DD"));
  //   }, 1000);
  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    let newDate;
    if (dateParam) {
      newDate = dayjs.utc(dateParam);
      setSelectedDate(newDate);
      fetchData(dateParam);
    } else {
      newDate = dayjs.utc();
      setSelectedDate(newDate);
      fetchData(newDate.format("YYYY-MM-DD"));
    }
  }, [dateParam]);

  const fetchData = (date) => {
    AxiosAuthInstance.get(
      `${Constant.BASE_URL}/hospital-round/search-by-date?date=${date}`
    )
      .then((response) => {
        // const allEntries = response.data;
        const allEntries = response.data.map((entry) => ({
          ...entry,
          room: String(entry.room).padStart(2, "0"),
        }));
        // Filter for active entries based on name
        const activeEntries = allEntries.filter(
          (entry) => entry.is_archived === 0 && entry.so === 0 && entry.dc === 0
        );
        setEntries(activeEntries);
        // Filter for archived entries or those with so or dc set
        const nonActiveEntries = allEntries.filter(
          (entry) => entry.is_archived === 1 || entry.so === 1 || entry.dc === 1
        );
        setFilterEntries(nonActiveEntries);
      })
      .catch(handleError);
  };

  const handleSubmit = async () => {
    if (!editingId) return;

    try {
      // Step 1: Update the entry
      await AxiosAuthInstance.put(
        `${Constant.BASE_URL}/hospital-round/${editingId}`,
        newEntry
      );

      // Step 2: Release the lock after a successful update
      await AxiosAuthInstance.put(
        `${Constant.BASE_URL}/hospital-rounds/release-lock/${editingId}`
      );
      console.log("Edit lock released");

      // Step 3: Reset state
      setIsEditing(false);
      setEditingId(null);
      setNewEntry({
        room: "",
        first_name: "",
        last_name: "",
        age: "",
        mrn: "",
        diagnosis: "",
        procedure: "",
        notes: "",
        facility: "",
      });
      handleClearForm();
      fetchData(selectedDate.format("YYYY-MM-DD"));
      setWarningState("false");
    } catch (error) {
      if (error.response && error.response.status === 423) {
        // Another user updated it, so fetch latest data
        try {
          const res = await AxiosAuthInstance.get(
            `${Constant.BASE_URL}/hospital-round/${editingId}`
          );
          setNewEntry(res.data); // Update form with the latest entry
          alert(
            "This entry has been updated by another user. Your form has been refreshed."
          );
        } catch (fetchError) {
          console.error("Error fetching updated entry:", fetchError);
        }
      } else {
        console.error("Update error:", error);
      }
    }
  };

  const handleEdit = async (id, entry) => {
    if (editingId !== null && editingId !== id) {
      // Release the previous lock before locking a new entry
      try {
        await AxiosAuthInstance.put(
          `${Constant.BASE_URL}/hospital-rounds/release-lock/${editingId}`
        );
      } catch (error) {
        console.error("Error releasing previous lock:", error);
      }
    }

    AxiosAuthInstance.put(`${Constant.BASE_URL}/hospital-rounds/${id}/lock`)
      .then(() => {
        setIsEditing(true);
        setEditingId(id);
        setNewEntry(entry);
      })
      .catch((err) => {
        // alert("This entry is being edited by someone else. Try again later.");
        setCurrentlyEdit(true);
      });
  };

  const handleUpdates = async () => {
    if (!editingId) return;
    // Step 1: Release the lock after a successful update
    await AxiosAuthInstance.put(
      `${Constant.BASE_URL}/hospital-rounds/release-lock/${editingId}`
    );
    console.log("Edit lock released");
    // Step 3: Reset state
    setIsEditing(false);
    setEditingId(null);
    setNewEntry({
      room: "",
      first_name: "",
      last_name: "",
      age: "",
      mrn: "",
      diagnosis: "",
      procedure: "",
      notes: "",
      facility: "",
    });
    handleClearForm();
    fetchData(selectedDate.format("YYYY-MM-DD"));
    setWarningState("false");
  };

  const handleErrors = (error) => {
    if (error.response && error.response.status === 403) {
      setErrorMessage(
        "Unauthorized access. You do not have permission to edit entries."
      );
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      setErrors(error.response.data.errors);
    } else {
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleDeleteEntry = (id) => {
    AxiosAuthInstance.patch(`${Constant.BASE_URL}/hospital-round/${id}`, {
      is_archived: true,
    })
      .then(() => {
        fetchData();
        setShowModal(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage(
            "Unauthorized access. You do not have permission to add or update entries."
          );
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "An unexpected error occurred" });
        }
      });
  };

  const openModal = (id) => {
    setSelectedEntryId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEntryId(null);
  };
  const warnModal = () => {
    setWarning(true);
  };
  const warnClose = () => {
    setWarning(false);
    setWarningState("false");
  };
  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
  };
  const currentClose = () => {
    setCurrentlyEdit(false);
  };
  const handleCheckboxChange = (id, field) => {
    console.log(`Checkbox change: id=${id}, field=${field}`);
    const updatedField =
      field === "so" ? { so: true, dc: false } : { so: false, dc: true };
    AxiosAuthInstance.put(
      `${Constant.BASE_URL}/hospital-sodc/${id}`,
      updatedField
    )
      .then((response) => {
        console.log("Update response:", response.data);
        fetchData(dateParam);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage(
            "Unauthorized access. You do not have permission to add or update entries."
          );
        } else if (error.response && error.response.status === 404) {
          setErrorType(
            "Unauthorized access. You do not have permission to add or update entries."
          );
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "An unexpected error occurred" });
        }
      });
  };

  const UpdateCheckboxChange = (id, field, newValue) => {
    const updatedField = { [field]: newValue };

    AxiosAuthInstance.put(
      `${Constant.BASE_URL}/hospital-sodcback/${id}`,
      updatedField
    )
      .then((response) => {
        console.log("Individual update response:", response.data);
        fetchData(dateParam);
      })
      .catch((error) => {
        handleError(error);
      });
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 403) {
      setErrorMessage(
        "Unauthorized access. You do not have permission to add or update entries."
      );
    } else if (error.response && error.response.status === 404) {
      setErrorType(
        "Unauthorized access. You do not have permission to add or update entries."
      );
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.errors
    ) {
      setErrors(error.response.data.errors);
    } else {
      setErrors({ general: "An unexpected error occurred" });
    }
  };

  const makeHidden = () => {
    setIsEditing(false);
  };
  const Archivedroundprint = () => {
    const options = { year: "numeric", month: "long" };
    const content = document.getElementById("archive").outerHTML;
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.width = "0px";
    printWindow.style.height = "0px";
    printWindow.style.border = "none";
    document.body.appendChild(printWindow);
    const printDocument = printWindow.contentWindow.document;
    printDocument.open();
    printDocument.write(`
        <html>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="print-color-adjust" content="exact">
            <head>
                <title>Hospital Rounds</title>
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
                    .hp-round td {
                      height: 60px !important;
                    }
                    .page-header {
                      margin-bottom: 10px;
                      border-bottom: 1px solid #ddd;
                    }
                    input[class="mark"]:checked+label:after {
                     width: 15px;
                     height:15px;
                     top:0px
                    }
                    .page-footer {
                      margin-top:20px;
                      border-top: 1px solid #ddd;
                    }
       
                    .print-container {
                      margin: 0px;
                    }
                   
                    #increase-size{
                      padding: 0px 100px 50px 20px;
                    }
                    #date-print{
                      position: absolute;
                      right: -90px;
                      top: 45%;
                      transform: translateY(-50%);
                      background: rgb(82, 74, 70);
                      border-radius: 25px;
                      color: white;
                      
                    }
                      .hight-print{
                      display:flex;
                      justify-content:center;
                      align-items:center;
                      height:15px;
                      width:100px;
                      }
                    #hide-print, #remove-add-print{
                      display: none;
                    }
           </style>
            </head>
            <body class="bg-white">
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
    };
  };
  const handlePrint = () => {
    const options = { year: "numeric", month: "long" };
    const content = document.getElementById("search").outerHTML;
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.width = "0px";
    printWindow.style.height = "0px";
    printWindow.style.border = "none";
    document.body.appendChild(printWindow);
    const printDocument = printWindow.contentWindow.document;
    printDocument.open();
    printDocument.write(`
        <html>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="print-color-adjust" content="exact">
            <head>
                <title>Archived Rounds </title>
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
                    .hp-round td {
                      height: 60px !important;
                    }
                    .page-header {
                      margin-bottom: 10px;
                      border-bottom: 1px solid #ddd;
                    }
                    input[class="mark"]:checked+label:after {
                     width: 15px;
                     height:15px;
                     top:0px
                    }
                    .page-footer {
                      margin-top:20px;
                      border-top: 1px solid #ddd;
                    }
       
                    .print-container {
                      margin: 0px;
                    }
                   
                    #increase-sizes{
                      padding: 0px 100px 50px 20px;
                    }
                     #date-prints{
                      position: absolute;
                      right: -90px;
                      top: 45%;
                      transform: translateY(-50%);
                      background: rgb(82, 74, 70);
                      border-radius: 25px;
                      color: white;
                      
                    }
                      .hight-print{
                      display:flex;
                      justify-content:center;
                      align-items:center;
                      height:15px;
                      width:100px;
                      }
                    #hide-print, #remove-add-print{
                      display: none;
                    }
           </style>
            </head>
            <body class="bg-white">
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
    };
  };
  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] flex content-center sticky top-0 z-20">
        <MasterNav warn={warnModal} editPage={warningState} />
      </div>

      {errorMessage && (
        <div className="text-red-500 text-center font-medium mt-5">
          {errorMessage}
        </div>
      )}

      <div className="body-content bg-[#ECECEC] pb-0">
        <div className="w-[1165px] mx-auto py-3">
          <div className="administration mt-[30px] mb-[30px] bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex">
            <p className="mx-auto inter-medium text-[24px] flex items-center">
              Hospital Rounds
              <strong style={{ fontSize: "10px", padding: "0 20px" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="px-[20px]"
                />
              </strong>
              <span className="inter-bold">
                {selectedDate
                  ? ` ${dayjs.utc(dateParam).format("MM/DD/YYYY")}`
                  : "No Date Selected"}
              </span>
            </p>
            <button
              onClick={Archivedroundprint}
              id="hide-print"
              type="button"
              className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
            >
              Print Rounds
            </button>
          </div>
        </div>
        {errorType && (
          <div className="text-red-500 text-center font-medium mb-5">
            {errorType}
          </div>
        )}
        <div
          id="archive"
          className="w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 mb-10"
        >
          <div
            id="increase-size"
            className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg"
          >
            <table className="hp-round">
              <thead>
                <tr className="text-center inter-bold text-[14px]">
                  <th>Room</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>A/G</th>
                  <th>MRN</th>
                  <th>Diagnosis</th>
                  <th>Procedure</th>
                  <th>Notes</th>
                  <th>Facility</th>
                  <th>
                    S/O <br /> D/C
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  <>
                    {entries.map((entry, index) =>
                      editingId === entry.id ? (
                        <>
                          <tr
                            key={index}
                            className="text-left border-2 inter-medium text-[14px]"
                          >
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="room"
                                className="w-[60px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
                                value={newEntry.room}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="first_name"
                                className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
                                value={newEntry.first_name}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="last_name"
                                className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
                                value={newEntry.last_name}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="age"
                                className="w-[50px] h-[80px] mt-[5px] border-[1px]  border-[#000] text-center"
                                value={newEntry.age}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="mrn"
                                className="w-[70px] 2xl:w-[80px] h-[80px] mt-[5px]  border-[1px] border-[#000] text-center"
                                value={newEntry.mrn}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <textarea
                                name="diagnosis"
                                className="w-[150px] 2xl:w-[200px] formx h-[80px] mt-[5px] border-[1px] border-[#000] bg-white"
                                value={newEntry.diagnosis}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </td>
                            <td>
                              <textarea
                                name="procedure"
                                className="w-[150px] 2xl:w-[200px] formx h-[80px] mt-[5px] border-[1px] border-[#000] bg-white"
                                value={newEntry.procedure}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <textarea
                                name="notes"
                                className="w-[150px] 2xl:w-[200px] formx h-[80px] mt-[5px] border-[1px] border-[#000] bg-white"
                                value={newEntry.notes}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="facility"
                                className="w-[50px] h-[80px] mt-[5px]  border-[1px]  border-[#000] text-center"
                                value={newEntry.facility}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <div className="flex flex-col mt-[5px] items-center justify-center gap-y-2">
                                <button
                                  onClick={() => {
                                    handleSubmit();
                                    setWarningState("false");
                                  }}
                                  className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                                >
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-white px-0"
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </button>
                                <button
                                  onClick={() => {
                                    handleUpdates();
                                    handleClearForm();
                                    setWarningState("false");
                                  }}
                                  className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                                >
                                  <FontAwesomeIcon
                                    icon={faTimes}
                                    className="text-white px-[2px]"
                                    size="lg"
                                  ></FontAwesomeIcon>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr
                            key={index}
                            className="text-left border-2 inter-medium text-[14px]"
                          >
                            <td>{entry.room}</td>
                            <td>{entry.first_name}</td>
                            <td>{entry.last_name}</td>
                            <td>{entry.age}</td>
                            <td>{entry.mrn}</td>
                            <td>{entry.diagnosis}</td>
                            <td>{entry.procedure}</td>
                            <td>{entry.notes}</td>
                            <td>{entry.facility}</td>
                            <td>
                              <div className="flex flex-col items-center justify-center gap-y-2">
                                {entry.is_editing ? (
                                  <div
                                    onClick={() => {
                                      setCurrentlyDelete(true);
                                    }}
                                  >
                                    <div className="items pb-1">
                                      <input
                                        className="mark"
                                        id={`cb4-${index}`}
                                        type="checkbox"
                                        name="so"
                                        checked={entry.so}
                                        onChange={() =>
                                          handleCheckboxChange(entry.id, "so")
                                        }
                                        disabled
                                      />
                                      <label htmlFor={`cb4-${index}`}></label>
                                    </div>

                                    <div className="items pt-1">
                                      <input
                                        className="mark"
                                        id={`cb5-${index}`}
                                        type="checkbox"
                                        name="dc"
                                        checked={entry.dc}
                                        onChange={() =>
                                          handleCheckboxChange(entry.id, "dc")
                                        }
                                        disabled
                                      />
                                      <label htmlFor={`cb5-${index}`}></label>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="items">
                                      <input
                                        className="mark"
                                        id={`cb4-${index}`}
                                        type="checkbox"
                                        name="so"
                                        checked={entry.so}
                                        onChange={() =>
                                          handleCheckboxChange(entry.id, "so")
                                        }
                                        disabled={entry.dc}
                                      />
                                      <label htmlFor={`cb4-${index}`}></label>
                                    </div>

                                    <div className="items">
                                      <input
                                        className="mark"
                                        id={`cb5-${index}`}
                                        type="checkbox"
                                        name="dc"
                                        checked={entry.dc}
                                        onChange={() =>
                                          handleCheckboxChange(entry.id, "dc")
                                        }
                                        disabled={entry.so}
                                      />
                                      <label htmlFor={`cb5-${index}`}></label>
                                    </div>
                                  </>
                                )}
                                {dataEditing && (
                                  <>
                                    <div className="absolute top-[10px] left-[80px]">
                                      <button
                                        className="bg-[#B4C6D9] w-[65px] border-2 border-white px-4 py-1 rounded-md my-2 drop-shadow"
                                        onClick={() => {
                                          handleEdit(entry.id, entry);
                                          setWarningState("true");
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                    <div className="absolute bottom-[10px] left-[76px]">
                                      <button className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none">
                                        {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                        {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                        {dayjs
                                          .utc(entry.created_at)
                                          .format("MM/DD/YYYY")}
                                      </button>
                                    </div>
                                  </>
                                )}
                                {!dataEditing && (
                                  <div
                                    className="absolute top-[35%] left-[76px]"
                                    id="date-print"
                                  >
                                    <button className=" hight-print bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none">
                                      {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                      {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                      {dayjs
                                        .utc(entry.created_at)
                                        .format("MM/DD/YYYY")}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </>
                      )
                    )}
                    {entries &&
                      (editingId ? (
                        // <tr className="text-left border-2 inter-medium text-[14px]">
                        //   <td></td>
                        //   <td></td>
                        //   <td></td>
                        //   <td></td>
                        //   <td></td>
                        //   <td>
                        //     {dayjs.utc(selectedDate).isSame(dayjs.utc(), 'day') && (
                        //       <button
                        //         className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[100%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white z-[9]"
                        //         onClick={() => {
                        //           handleClearForm();
                        //           setWarningState("false");
                        //         }}
                        //       >
                        //         {dataEditing ? "Exit" : "Edit Entries"}
                        //       </button>
                        //     )}
                        //   </td>
                        //   <td></td>
                        //   <td></td>
                        //   <td></td>
                        // </tr>
                        <></>
                      ) : (
                        <tr className="text-left border-2 inter-medium text-[14px]">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            {dayjs
                              .utc(selectedDate)
                              .isSame(dayjs.utc(), "day") && (
                              <button
                                className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[100%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white z-[9]"
                                onClick={() => {
                                  handleClearForm();
                                  setWarningState("false");
                                }}
                              >
                                {dataEditing ? "Exit" : "Edit Entries"}
                              </button>
                            )}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No entries for the given search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 mt-[80px]">
        <div className="relative bg-white w-100 px-10 rounded-md pt-5 pb-10 shadow-lg">
          <div className="w-[85%] absolute bg-[#657E98] items-center top-[-40px] text-center py-4 rounded-xl m-auto left-0 right-0  flex  px-[2%] justify-between">
            <button
              onClick={handlePrint}
              id="hide-print"
              type="button"
              className="border-none w-[165px] h-[35px] rounded bg-white inter-medium text-[18px] "
            >
              Print Rounds
            </button>
            <div className="w-full text-center">
              <h1 className="text-white inter-medium text-[24px]">
                Archived Rounds
              </h1>
            </div>

            <p>
              {warningState === "true" ? (
                <>
                  <button
                    className="right-0 border-2 w-[175px] text-[18px] inter-medium h-[35px] rounded-md border-none bg-white hover:bg-[#657E98] hover:text-white drop-shadow-2xl"
                    onClick={() => setWarning(true)}
                  >
                    Select Date
                  </button>
                </>
              ) : (
                <>
                  <Celender1
                    isCalendarOpen={isCalendarOpen}
                    setIsCalendarOpen={setIsCalendarOpen}
                  />
                </>
              )}
            </p>
          </div>

          {/* Table for Filtered Entries */}
          <div id="search">
            <div id="increase-sizes">
              <table className="hp-round mt-[30px]">
                <thead>
                  <tr className="text-center inter-bold text-[14px]">
                    <th>Room</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>A/G</th>
                    <th>MRN</th>
                    <th>Diagnosis</th>
                    <th>Procedure</th>
                    <th>Notes</th>
                    <th>Facility</th>
                    <th>
                      S/O <br /> D/C
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filterEntries.length > 0 ? (
                    filterEntries.map((filterEntry, index) => (
                      <tr
                        key={index}
                        className="text-left border-2 inter-medium text-[14px]"
                      >
                        <td>{filterEntry.room}</td>
                        <td>{filterEntry.first_name}</td>
                        <td>{filterEntry.last_name}</td>
                        <td>{filterEntry.age}</td>
                        <td>{filterEntry.mrn}</td>
                        <td>{filterEntry.diagnosis}</td>
                        <td>{filterEntry.procedure}</td>
                        <td>{filterEntry.notes}</td>
                        <td>{filterEntry.facility}</td>
                        <td>
                          <div className="flex flex-col items-center justify-center gap-y-2">
                            <input
                              className="mark"
                              id={`cb4-back-${index}`}
                              type="checkbox"
                              name="so"
                              checked={filterEntry.so}
                              onChange={() =>
                                UpdateCheckboxChange(
                                  filterEntry.id,
                                  "so",
                                  !filterEntry.so
                                )
                              }
                              disabled={
                                filterEntry.is_archived === 1 ||
                                filterEntry.dc === 1
                              }
                            />
                            <label htmlFor={`cb4-back-${index}`}></label>

                            <input
                              className="mark"
                              id={`cb5-back-${index}`}
                              type="checkbox"
                              name="dc"
                              checked={filterEntry.dc}
                              onChange={() =>
                                UpdateCheckboxChange(
                                  filterEntry.id,
                                  "dc",
                                  !filterEntry.dc
                                )
                              }
                              disabled={
                                filterEntry.is_archived === 1 ||
                                filterEntry.so === 1
                              }
                            />
                            <label htmlFor={`cb5-back-${index}`}></label>
                          </div>
                          <div
                            id="date-prints"
                            className="absolute top-[35%] left-[76px]"
                          >
                            <button className=" hight-print bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none">
                              {/* {format(new Date(filterEntry.created_at), 'MM/dd/yyyy')} */}
                              {dayjs
                                .utc(filterEntry.created_at)
                                .format("MM/DD/YYYY")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No entries for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        show={showModal}
        onClose={closeModal}
        onDelete={() => handleDeleteEntry(selectedEntryId)}
      />
      <WarningModal
        warn={warning}
        closeWarn={warnClose}
        updateData={handleSubmit}
        updateLock={handleUpdates}
        upORadd={warningState}
        clear={handleClearForm}
        hide={makeHidden}
      />
      <WarningModalEdit
        warn={currentlyEdit}
        closeWarn={currentClose}
        clear={handleClearForm}
        hide={() => setWarningState(true)}
      />
      <WarningModalDelete
        warn={currentlyDelete}
        close={() => setCurrentlyDelete(false)}
      />
    </>
  );
};

export default SearchByDate;
