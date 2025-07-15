import React, { useState, useEffect, useRef } from "react";
import Constant from "../../../Constant";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import DeleteModal from "./DeleteModal";
import WarningModal from "./WarningModal";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Preloader from "../../Partials/preLoader";
import {
  faAngleRight,
  faCheck,
  faTimes,
  faCircle,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import Celender from "./celender";
import WarningModalEdit from "./WarningModalEdit";
import WarningModalDelete from "./WarningModalDelete";

const HospitalRound = () => {
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [errorType, setErrorType] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filterEntries, setFilterEntries] = useState([]);
  const [tempFilterEntries, setTempFilterEntries] = useState([]);
  const [name, setName] = useState("");
  const [nextLocation, setNextLocation] = useState(null);
  const [currentlyDelete, setCurrentlyDelete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date();

  // const dates = Array.from({ length: 7 }, (_, index) =>
  //   dayjs().subtract(index, "day")
  // );
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const dates = Array.from({ length: 7 }, (_, i) => startDate.add(i, "day"));
  const [newEntry, setNewEntry] = useState({
    room: "",
    first_name: "",
    last_name: "",
    age: "",
    mrn: "",
    diagnosis: "",
    procedure: "",
    notes: "Diet: ",
    facility: "PHH",
    so: false,
    dc: false,
  });

  useEffect(() => {
    if (selectedDate && filterEntries.length > 0) {
      filterEntriesByDate(selectedDate);
    }
  }, [selectedDate, filterEntries]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchEntries(date);
  };
  const [prevEditingState, setPrevEditingState] = useState(0);
  const prevEditingRef = useRef(0);

  // useEffect(() => {
  //   fetchEntries();
  //   fetchUserData();
  // }, []);

  useEffect(() => {
    fetchEntries();
    fetchUserData();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warning, setWarning] = useState(false);
  const [warningState, setWarningState] = useState("false");
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditings, setIsEditings] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdd, setIsAdd] = useState(null);
  const [currentlyEdit, setCurrentlyEdit] = useState(false);
  const [change, setChange] = useState(0);

  // const handleEdit = (id, entry) => {
  //   setIsEditings(true);
  //   setEditingId(id);
  //   setNewEntry(entry);
  // };

  //  const handleRight = () => {
  //   const rightmostDate = startDate.add(6, "day");
  //   if (selectedDate.isSame(rightmostDate, "day")) {
  //     setStartDate(prev => prev.add(1, "day"));
  //     setSelectedDate(prev => prev.add(1, "day"));
  //   } else {
  //     setSelectedDate(prev => prev.add(1, "day"));
  //   }
  // };
  const isRightDisabled = selectedDate.isSame(dayjs().startOf("day"), "day");
  const handleRight = () => {
    const today = dayjs().startOf("day");
    const rightmostDate = startDate.add(6, "day");

    if (selectedDate.isSame(today, "day")) return;

    if (selectedDate.isSame(rightmostDate, "day")) {
      const newStart = startDate.add(1, "day");
      const newSelected = selectedDate.add(1, "day");

      if (!newSelected.isAfter(today)) {
        setStartDate(newStart);
        setSelectedDate(newSelected);
      }
    } else {
      const newSelected = selectedDate.add(1, "day");

      if (!newSelected.isAfter(today)) {
        setSelectedDate(newSelected);
      }
    }
  };
  const handleLeft = () => {
    if (selectedDate.isSame(startDate, "day")) {
      setStartDate((prev) => prev.subtract(1, "day"));
      setSelectedDate((prev) => prev.subtract(1, "day"));
    } else {
      setSelectedDate((prev) => prev.subtract(1, "day"));
    }
  };
  const fetchUserData = async () => {
    try {
      const [userResponse] = await Promise.all([
        AxiosAuthInstance.get("/current-user"),
      ]);
      setUserRole(userResponse.data.user.role);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error(
        "Response data:",
        error.response ? error.response.data : "No response data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = () => {
    AxiosAuthInstance.get(`${Constant.BASE_URL}/hospital-round`)
      .then((response) => {
        const allEntries = response.data.map((entry) => ({
          ...entry,
          room: String(entry.room).padStart(2, "0"),
        }));

        const nonArchivedEntries = allEntries.filter(
          (entry) => entry.is_archived === 0 && entry.so === 0 && entry.dc === 0
        );
        setEntries(nonArchivedEntries);

        const archivedEntries = allEntries.filter(
          (entry) => entry.is_archived === 1 || entry.so === 1 || entry.dc === 1
        );
        setFilterEntries(archivedEntries);
      })
      .catch((error) => {
        console.error("There was an error fetching the entries!", error);
      });
  };

  const filterEntriesByDate = (date) => {
    const selectedDateOnly = dayjs(date).startOf("day");
    const filtered = filterEntries.filter((entry) => {
      const entryDateOnly = dayjs(entry.updated_at).startOf("day");
      return selectedDateOnly.isSame(entryDateOnly, "day");
    });

    const sortedFilteredEntries = filtered.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );

    setTempFilterEntries(sortedFilteredEntries);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewEntry((prevEntry) => {
      if (name === "notes") {
        const prefix = "Diet: ";
        let newValue = value;
        if (!newValue.startsWith(prefix)) {
          newValue = prefix;
        }
        return {
          ...prevEntry,
          [name]: newValue,
        };
      }

      return {
        ...prevEntry,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };
  const handleAddEntry = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    AxiosAuthInstance.post(`${Constant.BASE_URL}/hospital-round`, newEntry)
      .then((response) => {
        setEntries((prevEntries) => [...prevEntries, response.data]);
        setNewEntry({
          room: "",
          first_name: "",
          last_name: "",
          age: "",
          mrn: "",
          diagnosis: "",
          procedure: "",
          notes: "Diet: ",
          facility: "PHH",
          so: false,
          dc: false,
        });
        setIsEditing(false);
        setIsAdd(false);
        fetchEntries();
        setWarningState("false");
        handleClearForm();
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
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const handleUpdate = async () => {
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
      setIsEditings(false);
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
      fetchEntries();
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
        setIsEditings(true);
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
    setIsEditings(false);
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
    fetchEntries();
    setWarningState("false");
  };

  const handleClearForm = () => {
    setNewEntry({
      room: "",
      first_name: "",
      last_name: "",
      age: "",
      mrn: "",
      diagnosis: "",
      procedure: "",
      notes: "Diet: ",
      facility: "PHH",
      so: false,
      dc: false,
    });
    setErrors("");
    setErrorMessage();
    setIsEditing(false);
    setEditingId(null);
  };

  const handleDeleteEntry = (id) => {
    AxiosAuthInstance.patch(`${Constant.BASE_URL}/hospital-round/${id}`, {
      is_archived: true,
    })
      .then(() => {
        fetchEntries();
        setShowModal(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage(
            "Unauthorized access. You do not have permission to add or update entries."
          );
        } else if (error.response && error.response.status === 404) {
          setErrorMessages("Cannot delete records not created today.");
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
    setErrorMessages("");
  };
  const warnModal = () => {
    setWarning(true);
  };
  const warnClose = () => {
    setWarning(false);
    setWarningState("false");
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
        fetchEntries();
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

  // const UpdateCheckboxChange = (id, field, newValue) => {
  //   const updatedField = { [field]: newValue };

  //   AxiosAuthInstance.put(
  //     `${Constant.BASE_URL}/hospital-sodcback/${id}`,
  //     updatedField
  //   )
  //     .then((response) => {
  //       console.log("Individual update response:", response.data);
  //       fetchEntries();
  //       window.location.reload();
  //     })
  //     .catch((error) => {
  //       handleError(error);
  //     });
  // };
  const UpdateCheckboxChange = (id, field, newValue) => {
    const updatedField = { [field]: newValue };

    AxiosAuthInstance.put(`${Constant.BASE_URL}/hospital-sodcback/${id}`, updatedField)
      .then((response) => {
        console.log("Individual update response:", response.data);
        fetchEntries();
        window.location.reload();
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

  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    setName(e.target.value);
  };

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   navigate(`/search-by-name?name=${encodeURIComponent(name)}`);
  // };
  const handleSearchSubmit = (e) => {
    // e.preventDefault();
    navigate(`/hospital-round-search?name=${encodeURIComponent(name)}`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddEntry();
  };
  const makeHidden = () => {
    setIsEditing(false);
    setIsAdd(false);
  };

  const handlePrint = () => {
    const options = { year: "numeric", month: "long" };
    const content = document.getElementById("hp-rounds-print").outerHTML;
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
                <title>Hospital Rounds </title>
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
                    .hp-round td {
                      height: 60px !important;
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
                    #dateprint{
                      position: absolute;
                      right: -100px;
                      top: -20px;
                      background:rgb(61, 56, 54);
                      border-radius: 25px;
                      color: #fff;
                    }
                    #hide-print, #remove-add-print{
                      display: none;
                    }
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

  const Archivedroundprint = () => {
    const options = { year: "numeric", month: "long" };
    const content = document.getElementById("archive").outerHTML;
    const printWindow = document.createElement("iframe");
    const date= selectedDate.format("MM/DD/YYYY");
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
                <title>Archived Rounds</title>
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
                       h1{
                         text-align:center;
                         margin: 0 0 60px 0;
                         font-size:  25px;
                         font-weight: 700;
                        
                       }
                    #hide-print, #remove-add-print{
                      display: none;
                    }
           </style>
            </head>
            
          <body class="bg-white">
             <h1>Archived Rounds - ${date}</h1>
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

  if (loading) {
    return <Preloader />;
  }
  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] flex content-center sticky top-0 z-20">
        <MasterNav edit={isEditing} add={isAdd} warn={warnModal} />
      </div>

      <div className="body-content bg-[#ECECEC] pb-0" id="hp-rounds-print">
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
                {format(new Date(), "MM/dd/yyyy")}
              </span>
            </p>

            <button
              onClick={
                handlePrint}
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
        <div className="w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 mb-0">
          <div
            className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg"
            id="increase-size"
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
                {entries.map((entry, index) =>
                  editingId === entry.id ? (
                    <>
                      <tr className="text-left border-2 inter-medium text-[14px]">
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            name="room"
                            className="w-[60px] h-[80px] mt-[5px] border-[2px] border-[#000] text-center"
                            value={newEntry.room}
                            onChange={handleInputChange}
                          />
                          {errors && errors.room && (
                            <p className="text-red-800">
                              <small> {errors.room} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            name="first_name"
                            className="w-[80px] h-[80px] mt-[5px] border-[2px] border-[#000] text-center"
                            value={newEntry.first_name}
                            onChange={handleInputChange}
                          />
                          {errors && errors.first_name && (
                            <p className="text-red-800">
                              <small> {errors.first_name} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            name="last_name"
                            className="w-[80px] h-[80px] mt-[5px] border-[2px] border-[#000] text-center"
                            value={newEntry.last_name}
                            onChange={handleInputChange}
                          />
                          {errors && errors.last_name && (
                            <p className="text-red-800">
                              <small> {errors.last_name} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            name="age"
                            className="w-[50px] h-[80px] mt-[5px] border-[1px] border-[#000] text-center"
                            value={newEntry.age}
                            onChange={handleInputChange}
                          />
                          {errors && errors.age && (
                            <p className="text-red-800">
                              <small> {errors.age} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            name="mrn"
                            className="w-[70px] 2xl:w-[80px] h-[80px] mt-[5px] border-[1px] border-[#000] text-center"
                            value={newEntry.mrn}
                            onChange={handleInputChange}
                            required
                          />
                          {errors && errors.mrn && (
                            <p className="text-red-800">
                              <small> {errors.mrn} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <textarea
                            name="diagnosis"
                            className="w-[150px] 2xl:w-[200px] mt-[5px] h-[80px]  border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                            placeholder="Diagnosis"
                            value={newEntry.diagnosis}
                            onChange={handleInputChange}
                          ></textarea>
                          {errors && errors.diagnosis && (
                            <p className="text-red-800">
                              <small> {errors.diagnosis} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <textarea
                            className="w-[150px] 2xl:w-[200px] mt-[5px] h-[80px]  border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                            placeholder="Procedure"
                            name="procedure"
                            value={newEntry.procedure}
                            onChange={handleInputChange}
                          ></textarea>
                          {errors && errors.procedure && (
                            <p className="text-red-800">
                              <small> {errors.procedure} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <textarea
                            className="w-[150px] 2xl:w-[200px] mt-[5px] h-[80px]  border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                            placeholder="Diet: "
                            name="notes"
                            value={newEntry.notes}
                            onChange={handleInputChange}
                          ></textarea>
                          {errors && errors.notes && (
                            <p className="text-red-800">
                              <small> {errors.notes} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            className="w-[50px] h-[75px] mt-[5px] border-[1px] border-[#000] text-center"
                            name="facility"
                            value={newEntry.facility}
                            onChange={handleInputChange}
                          />
                          {errors && errors.facility && (
                            <p className="text-red-800">
                              <small> {errors.facility} </small>
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          {isEditing && (
                            <div className="flex flex-col mt-[5px] items-center justify-center gap-y-2">
                              <button
                                className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                                onClick={handleUpdate}
                              >
                                <FontAwesomeIcon icon={faCheck} size="lg" />
                              </button>
                              <button
                                className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                                onClick={() => {
                                  handleUpdates();
                                  handleClearForm();
                                }}
                              >
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                              </button>
                            </div>
                          )}
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
                          {(userRole === 1 ||
                            userRole === 2 ||
                            userRole === 3 ||
                            userRole === 4) && (
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
                                  <div className="absolute left-[76px]">
                                    <button
                                      id="dateprint"
                                      className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                                    >
                                      {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                      {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                      {dayjs
                                        .utc(entry.created_at)
                                        .format("MM/DD/YYYY")}
                                    </button>
                                  </div>
                                </>
                              )}
                              {isEditing && (
                                <div className="delete-icon absolute left-[100px]">
                                  <button
                                    className="bg-[#B4C6D9] border-2 w-[55px] border-white px-1 py-1 rounded-md my-[13px] drop-shadow"
                                    onClick={() => {
                                      setIsAdd(false);
                                      handleEdit(entry.id, entry);
                                      setWarningState("true");
                                    }}
                                  >
                                    Edit
                                  </button>
                                  {entry.is_editing == 0 ? (
                                    <>
                                      <button
                                        className="bg-[#D8ADAD] border-2 w-[55px] border-white px-1 py-1 rounded-md my-[15px] drop-shadow"
                                        onClick={() => openModal(entry.id)}
                                      >
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="bg-[#D8ADAD] border-2 w-[55px] border-white px-1 py-1 rounded-md my-2 drop-shadow"
                                        onClick={() => {
                                          setCurrentlyDelete(true);
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    </>
                  )
                )}

                {isAdd && (
                  <tr className="text-left border-2 inter-medium text-[14px]">
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="room"
                        className="w-[60px] h-[80px] mt-[5px] border-[2px] border-[#000] text-center"
                        value={newEntry.room}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.room && (
                        <p className="text-red-800">
                          <small> {errors.room} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="first_name"
                        className="w-[80px] h-[80px] mt-[5px]  border-[2px] border-[#000] text-center"
                        value={newEntry.first_name}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.first_name && (
                        <p className="text-red-800">
                          <small> {errors.first_name} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="last_name"
                        className="w-[80px] h-[80px] mt-[5px]  border-[2px] border-[#000] text-center"
                        value={newEntry.last_name}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.last_name && (
                        <p className="text-red-800">
                          <small> {errors.last_name} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="age"
                        className="w-[50px] h-[80px] mt-[5px] border-[1px] border-[#000] text-center"
                        value={newEntry.age}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.age && (
                        <p className="text-red-800">
                          <small> {errors.age} </small>
                        </p>
                      )}
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
                      {errors && errors.mrn && (
                        <p className="text-red-800">
                          <small> {errors.mrn} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <textarea
                        name="diagnosis"
                        className="w-[150px] 2xl:w-[200px] mt-[5px] h-[80px] border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                        placeholder="Diagnosis"
                        value={newEntry.diagnosis}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors && errors.diagnosis && (
                        <p className="text-red-800">
                          <small> {errors.diagnosis} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <textarea
                        className="w-[150px] 2xl:w-[200px] mt-[5px] h-[80px] border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                        placeholder="Procedure"
                        name="procedure"
                        value={newEntry.procedure}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors && errors.procedure && (
                        <p className="text-red-800">
                          <small> {errors.procedure} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <textarea
                        className="w-[150px] 2xl:w-[200px] mt-[5px] h-[80px] border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                        placeholder="Diet: "
                        name="notes"
                        value={newEntry.notes}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors && errors.notes && (
                        <p className="text-red-800">
                          <small> {errors.notes} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        className="w-[50px] h-[75px] border-[1px] mt-[5px] border-[#000] text-center"
                        name="facility"
                        value={newEntry.facility}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.facility && (
                        <p className="text-red-800">
                          <small> {errors.facility}</small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      {isEditing && (
                        <div className="flex flex-col mt-[5px] items-center justify-center gap-y-2">
                          <button
                            className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                            onClick={handleSubmit}
                          >
                            <FontAwesomeIcon icon={faCheck} size="lg" />
                          </button>
                          <button
                            className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                            onClick={() => {
                              setIsAdd(false);
                              handleClearForm();
                            }}
                          >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {!isEditing && (
                  <tr
                    className="text-left border-2 inter-medium text-[14px]"
                    id="remove-add-print"
                  >
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      {(userRole === 1 ||
                        userRole === 2 ||
                        userRole === 3 ||
                        userRole === 4) && (
                        <button
                          className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[100%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white z-[9]"
                          onClick={() => {
                            setIsEditing(true);
                            setIsAdd(true);
                          }}
                        >
                          Add Entries
                        </button>
                      )}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 mt-[80px]">
        <div className="relative bg-white w-100 px-10 rounded-md pt-5 pb-10 shadow-lg">
          <div className="w-[85%] absolute bg-[#657E98] items-center text-center py-4 rounded-xl m-auto left-0 right-0 top-[-40px] flex justify-between px-[2%]">
            <div className="search bg-white rounded-xl w-[392px] py-2 text-center flex gap-4 px-5 items-center">
              <p className="inter-medium text-[16px]">Search By Name:</p>
              <input
                type="text"
                placeholder="Jonathan Smith"
                value={name}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
              {isAdd ? (
                <>
                  <button
                    onClick={() => setWarning(true)}
                    className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                  >
                    <FontAwesomeIcon icon={faAngleRight} size="xl" />
                  </button>
                </>
              ) : isEditing ? (
                <>
                  <button
                    onClick={() => setWarning(true)}
                    className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                  >
                    <FontAwesomeIcon icon={faAngleRight} size="xl" />
                  </button>
                </>
              ) : (
                <>
                  <form onSubmit={handleSearchSubmit}>
                    <Link to={`/hospital-round-search?name=${name}`}>
                      <button
                        type="submit"
                        className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                      >
                        <FontAwesomeIcon icon={faAngleRight} size="xl" />
                      </button>
                    </Link>
                  </form>
                </>
              )}
            </div>
            <h1 className="text-white text-center inter-medium text-[24px] mx-auto">
              Archived Rounds
            </h1>
            <button
              onClick={Archivedroundprint}
              id="hide-print"
              type="button"
              className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px]"
            >
              Print Rounds
            </button>
            {isAdd || isEditing ? (
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
                <Celender
                  isCalendarOpen={isCalendarOpen}
                  setIsCalendarOpen={setIsCalendarOpen}
                />
              </>
            )}
          </div>

          <div className="round-list pb-10 pt-[60px] w-[85%] mx-auto flex justify-between select-none">
            <div
              className="prev start-5 top-3 border-none bg-[#657E98] border-2 h-[30px] w-[30px] flex justify-center items-center rounded text-white"
              onClick={handleLeft}
            >
              {" "}
              <FontAwesomeIcon icon={faAngleLeft} size="xl" />
            </div>
            {dates.map((date, index) => {
              const isFuture = dayjs(date).isAfter(dayjs(), "day");

              return (
                <div
                  key={index}
                  className={`
        item-r mx-2 w-[150px] h-[30px] 
        ${
          isFuture
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#B4C6D9] cursor-pointer"
        } 
        rounded-md py-1 text-center inter-medium text-[14px] 
        ${dayjs(date).isSame(selectedDate, "day") ? "active" : ""}
      `}
                  onClick={() => {
                    if (!isFuture) handleDateSelect(date);
                  }}
                >
                  {dayjs(date).format("MM/DD")}
                </div>
              );
            })}
            <div
              className={`prev start-5 top-3 border-none ${
                isRightDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#657E98] cursor-pointer"
              } border-2 h-[30px] w-[30px] flex justify-center items-center rounded text-white`}
              onClick={!isRightDisabled ? handleRight : undefined}
            >
              <FontAwesomeIcon icon={faAngleRight} size="xl" />
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-center font-medium mt-5">
              {errorMessage}
            </div>
          )}

          <div id="archive">
            <div id="increase-size">
              <table className="hp-round hp-rounds-archived">
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
                    <th>S/O D/C</th>
                  </tr>
                </thead>
                <tbody>
                  {tempFilterEntries.length > 0 ? (
                    tempFilterEntries.map((entry, index) => (
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
                            <input
                              className="mark"
                              id={`cb4-back-${index}`}
                              type="checkbox"
                              name="so"
                              checked={entry.so}
                              onChange={() =>
                                UpdateCheckboxChange(entry.id, "so", !entry.so)
                              }
                              disabled={
                                entry.is_archived === 1 || entry.dc === 1
                              }
                            />
                            <label htmlFor={`cb4-back-${index}`}></label>

                            <input
                              className="mark"
                              id={`cb5-back-${index}`}
                              type="checkbox"
                              name="dc"
                              checked={entry.dc}
                              onChange={() =>
                                UpdateCheckboxChange(entry.id, "dc", !entry.dc)
                              }
                              disabled={
                                entry.is_archived === 1 || entry.so === 1
                              }
                            />
                            <label htmlFor={`cb5-back-${index}`}></label>
                            <div className="absolute left-[76px]" id="date-prints">
                              <button className="hight-print bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none">
                                {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                {dayjs
                                  .utc(entry.created_at)
                                  .format("MM/DD/YYYY")}
                              </button>
                            </div>
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
        deleteMessage={errorMessages}
      />
      <WarningModal
        warn={warning}
        closeWarn={warnClose}
        saveData={handleAddEntry}
        updateData={handleUpdate}
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

export default HospitalRound;
