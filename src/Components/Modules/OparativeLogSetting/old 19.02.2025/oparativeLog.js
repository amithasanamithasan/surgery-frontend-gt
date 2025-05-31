import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { useNavigate, Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import DeleteModal from "./DeleteModal";
import WarningModal from "./WarningModal";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faCheck,
  faTimes,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import Celender from "./celender";
import OperationsToDate from "./operationsToDate ";
import Preloader from "../../Partials/preLoader";

const OparativeLog = () => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filterEntries, setFilterEntries] = useState([]);
  const sortedFilteredEntries = filterEntries.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const today = new Date();

  const dates = Array.from({ length: 7 }, (_, index) =>
    dayjs().subtract(index, "day")
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [surgeons, setSurgeons] = useState([]);
  const [isEditings, setIsEditings] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdd, setIsAdd] = useState(null);
  const [newEntry, setNewEntry] = useState({
    first_name: "",
    last_name: "",
    mrn: "",
    surgeon: "",
    assistant: "",
    diagnosis: "",
    procedure: "",
    facility: "PHH",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState(false);
  const [warningState, setWarningState] = useState("false");
  const [Something, setSomething] = useState(false);

  const fetchEntries = () => {
    AxiosAuthInstance.get(`${Constant.BASE_URL}/oparative-log`)
      .then((response) => {
        const allEntries = response.data;
        const filteredEntries = allEntries.filter(
          (entry) => entry.is_archived === 0
        );
        setEntries(filteredEntries);
        // By default, filter entries by today's date
        filterEntriesByDate(today, filteredEntries);
      })
      .catch((error) => {
        console.error("There was an error fetching the entries!", error);
      }).finally(() => {
        setLoading(false);
      })
  };

  const fetchSurgeons = async () => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/surgeons`
      );
      setSurgeons(response.data);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
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

  useEffect(() => {
    fetchEntries();
    fetchSurgeons();
    fetchUserData();
  }, []);

  const availableAssistants = surgeons.filter(
    (assistant) => assistant.id !== newEntry.surgeon
  );

  const filterEntriesByDate = (date, entriesToFilter = entries) => {
    const filtered = entries.filter((entry) =>
      dayjs(entry.created_at).isSame(date, "day")
    );

    setFilterEntries(filtered);
  };

  useEffect(() => {
    filterEntriesByDate(selectedDate);
  }, [entries, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry((prevEntry) => ({
      ...prevEntry,
      [name]: type === "checkbox" ? checked : value,
      [name]: value === "null" ? null : value,
    }));
  };

  const handleAddEntry = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    AxiosAuthInstance.post(`${Constant.BASE_URL}/oparative-log`, {
      ...newEntry,
      surgeon: parseInt(newEntry.surgeon, 10),
      assistant: parseInt(newEntry.assistant, 10),
    })
      .then((response) => {
        setEntries((prevEntries) => [...prevEntries, response.data]);
        setNewEntry({
          first_name: "",
          last_name: "",
          mrn: "",
          surgeon: "",
          assistant: "",
          diagnosis: "",
          procedure: "",
          facility: "PHH",
        });
        setIsEditing(false);
        setIsAdd(false);
        setIsEditings(false);
        handleClearForm();
        setErrorMessage();
        fetchEntries();
        navigate(0);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage("Unauthorized access. You do not have permission to add entries.");
        } else if (error.response && error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "An unexpected error occurred" });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleClearForm = () => {
    setNewEntry({
      first_name: "",
      last_name: "",
      mrn: "",
      surgeon: "",
      assistant: "",
      diagnosis: "",
      procedure: "",
      facility: "PHH",
    });
    setErrors("");
    setErrorMessage();
    setIsAdd(false);
    setIsEditings(false);
    setEditingId(null);
  };

  const handleDeleteEntry = (id) => {
    AxiosAuthInstance.patch(`${Constant.BASE_URL}/oparative-log/${id}`, {
      is_archived: true,
    })
      .then(() => {
        fetchEntries();
        setIsEditing(false);
        setShowModal(false);
        setErrorMessage();
        navigate(0);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage("Unauthorized access. You do not have permission to add entries.");
        } else if (error.response && error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "An unexpected error occurred" });
        }
      });
  };
  const handleUpdate = () => {
    if (!editingId) return;
    const requiredFields = ['first_name', 'last_name', 'mrn', 'surgeon', 'diagnosis', 'procedure', 'facility'];
    let hasEmptyFields = false;

    const newErrors = {};
    for (const field of requiredFields) {
      if (!newEntry[field]) {
        newErrors[field] = `Please fill out the ${field} field.`;
        hasEmptyFields = true;
      }
    }

    if (hasEmptyFields) {
      setErrors(newErrors);
      return;
    }
    AxiosAuthInstance.put(`${Constant.BASE_URL}/oparative-log/${editingId}`, newEntry)
      .then(response => {
        setIsEditings(false);
        setEditingId(null);
        setNewEntry({ first_name: "", last_name: "", mrn: "", surgeon: "", diagnosis: "", procedure: "", facility: "" });
        handleClearForm();
        fetchEntries();
        setIsAdd(false);
        navigate(0);
      })
  };

  const handleEdit = (id, entry) => {
    setIsEditings(true);
    setEditingId(id);
    setNewEntry(entry);
  };

  const openModal = (id) => {
    console.log(`Opening modal for entry ID: ${id}`);
    setSelectedEntryId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEntryId(null);
  };
  const warnModal = () => {
    setWarning(true);
  }
  const warnClose = () => {
    setWarning(false);
    setWarningState("false");
  }
  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    setName(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/oparative-log-search/search-by-name?name=${encodeURIComponent(name)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddEntry();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    filterEntriesByDate(date);
  };

  const makeHidden = () => {
    setIsEditing(false);
    setIsAdd(false);
  }

  console.log(Something, isAdd);

  if (loading) {
    return <Preloader />
  }
  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] flex content-center sticky top-0 z-20">
        <MasterNav edit={isEditings} add={isAdd} warn={warnModal} />
      </div>

      {errorMessage && (
        <div className="text-red-500 text-center font-medium mt-5">
          {errorMessage}
        </div>
      )}

      <div className="body-content bg-[#ECECEC] pb-0">
        <div className="w-[1165px] mx-auto py-3">
          <div className="administration my-5 bg-[#B4C6D9] h-[75px] px-5 py-5 rounded-xl text-center flex items-center">
            <div className="search bg-white rounded-xl w-[392px] h-[50px] py-2 text-center flex gap-4 px-5 items-center">
              <p className="inter-medium text-[16px]">Search By Name:</p>
              <input
                type="text"
                placeholder="Jonathan Smith"
                value={name}
                onChange={handleSearchChange}
                required
              />
              {isAdd ? (
                <>
                  <button
                    onClick={warnModal}
                    className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                  >
                    <FontAwesomeIcon icon={faAngleRight} size="xl" />
                  </button>
                </>
              ) : Something ? (
                <>
                  <button
                    onClick={warnModal}
                    className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                  >
                    <FontAwesomeIcon icon={faAngleRight} size="xl" />
                  </button>
                </>
              ) : !Something ? (
                <>
                  <form onSubmit={handleSearchSubmit}>
                    <Link to={`/oparative-log-search?name=${name}`}>
                      <button
                        type="submit"
                        className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                      >
                        <FontAwesomeIcon icon={faAngleRight} size="xl" />
                      </button>
                    </Link>
                  </form>
                </>
              ) : (
                <>
                  Not to do with this!
                </>
              )}
            </div>

            <p className="mx-auto inter-medium text-[24px] flex items-center ms-10">
              Operative Log
              <strong style={{ fontSize: "10px", padding: "0 20px" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="px-[20px]"
                />
              </strong>
              <span className="inter-bold">
                {selectedDate
                  ? ` ${dayjs(selectedDate).format("MM/DD/YYYY")}`
                  : "No Date Selected"}
              </span>
            </p>

            <div className="flex items-center">
              {isAdd ? (
                <>
                  <button
                    className="right-0 border-2 w-[175px] text-[18px] inter-medium h-[35px] rounded-md border-none bg-white hover:bg-[#657E98] hover:text-white drop-shadow-2xl"
                    onClick={() => warnModal()}
                  >
                    Select Date
                  </button>
                </>
              ) : Something ? (
                <>
                  <button
                    className="right-0 border-2 w-[175px] text-[18px] inter-medium h-[35px] rounded-md border-none bg-white hover:bg-[#657E98] hover:text-white drop-shadow-2xl"
                    onClick={() => warnModal()}
                  >
                    Select Date
                  </button>
                </>
              ) : !Something ? (
                <>
                  <Celender
                    isCalendarOpen={isCalendarOpen}
                    setIsCalendarOpen={setIsCalendarOpen}
                  />
                </>
              ) : (
                <>
                  Not to do with this!
                </>
              )}
            </div>
          </div>
          <div className="round-list mt-8 mb-9 bg-white px-2 py-2 rounded-md mx-auto flex justify-between">
            {dates.map((date, index) => (
              <button
                key={index}
                className={`item-r mx-2 w-[150px] h-[30px] bg-[#B4C6D9] cursor-pointer rounded-md py-1 text-center inter-medium text-[14px] ${date.isSame(selectedDate, "day") ? "active" : ""
                  }`}
                onClick={() => handleDateSelect(date)}
                disabled={isAdd || isEditings || editingId}
              >
                {date.format("MM/DD")}
              </button>
            ))}
          </div>
        </div>
        <div className="w-[1400px] mx-auto py-3 relative pt-0 mb-10">
          <div className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg">
            <table className="operative">
              <thead>
                <tr className="text-center inter-bold text-[14px] py-2">
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>MRN</th>
                  <th>Surgeon</th>
                  <th>Assistant</th>
                  <th>Diagnosis</th>
                  <th>Procedure</th>
                  <th>Facility</th>
                </tr>
              </thead>
              <tbody>
                {sortedFilteredEntries.length > 0 ? (
                  sortedFilteredEntries.map((entry, index) => (
                    editingId === entry.id ? (
                      <>
                        <tr key={index} className="text-left border-2 inter-medium text-[14px]">
                          <td style={{ verticalAlign: "top" }}>
                            <input
                              type="text"
                              name="first_name"
                              // placeholder="First name"
                              className="w-[80px] border-[2px] mt-[5px] border-[#000] h-[80px] text-center"
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
                              className="w-[80px] h-[80px] mt-[5px] border-[2px] border-[#000] text-center"
                              // placeholder="Last name"
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
                              name="mrn"
                              className="w-[80px] h-[80px] mt-[5px] border-[2px] border-[#000]  text-center"
                              // placeholder="MRN No."
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
                          <td style={{ verticalAlign: "center" }}>
                            <select
                              name="surgeon"
                              className="w-[80px] h-[20px] mt-[5px]  text-center"
                              value={newEntry.surgeon}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              {surgeons.map((surgeon) => (
                                <option key={surgeon.id} value={surgeon.id}>
                                  {surgeon.initial}
                                </option>
                              ))}
                            </select>
                            {errors.surgeon && (
                              <span className="text-red-800">
                                {errors.surgeon}
                              </span>
                            )}
                          </td>
                          <td style={{ verticalAlign: "center" }}>
                            <select
                              name="assistant"
                              className="w-[80px] h-[20px] mt-[5px]  text-center"
                              value={newEntry.assistant}
                              onChange={handleInputChange}
                              required
                            >
                              {/* <option value="" disabled>
                                Select
                              </option> */}
                              <option value="null" >NONE </option>
                              {surgeons.map((assistant) => (
                                <option key={assistant.id} value={assistant.id}>
                                  {assistant.initial}
                                </option>
                              ))}
                            </select>
                            {errors.assistant && (
                              <span className="text-red-800">
                                {errors.assistant}
                              </span>
                            )}
                          </td>
                          <td style={{ verticalAlign: "top" }}>
                            <textarea
                              name="diagnosis"
                              className="w-[340px] h-[80px] mt-[5px]  border-[1px] border-[#000] overflow-hidden bg-white formx padding"
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
                              className="w-[340px] h-[80px] mt-[5px]  border-[1px] border-[#000] overflow-hidden bg-white formx padding"
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
                            <input
                              type="text"
                              className="w-[80px] h-[80px] mt-[5px]  border-[1px] border-[#000] text-center"
                              name="facility"
                              value={newEntry.facility}
                              onChange={handleInputChange}
                              required
                            />
                            {errors && errors.facility && (
                              <p className="text-red-800">
                                <small> {errors.facility} </small>
                              </p>
                            )}
                            {isEditings && (
                              <div className="absolute top-[12px] right-[-60px] flex flex-col gap-2 items-center">
                                <button
                                  className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                                  onClick={() => {
                                    handleUpdate();
                                  }}
                                >
                                  <FontAwesomeIcon icon={faCheck} size="lg" />
                                </button>
                                <button
                                  className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                                  onClick={() => {
                                    handleClearForm();
                                    setSomething(false);
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
                          <td>{entry.first_name}</td>
                          <td>{entry.last_name}</td>
                          <td>{entry.mrn}</td>
                          <td>{entry.surgeon_initial || entry.surgeon}</td>
                          <td>{entry.assistant == null ? "NONE" : entry.assistant_initial || entry.assistant}</td>
                          <td>{entry.diagnosis}</td>
                          <td>{entry.procedure}</td>
                          <td>
                            {entry.facility}
                            {dayjs(selectedDate).isSame(today, "day") &&
                              isEditings && (
                                <>
                                  <div className="delete-icon absolute left-[120px] gap-y-2">
                                    <button
                                      className="bg-[#B4C6D9] w-[55px] border-2 border-white px-1 py-1 rounded-md drop-shadow"
                                      onClick={() => {
                                        setIsAdd(false);
                                        handleEdit(entry.id, entry);
                                        setWarningState("true");
                                        setSomething(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="bg-[#D8ADAD] w-[55px] border-2 border-white px-1 py-1 rounded-md drop-shadow"
                                      onClick={() => openModal(entry.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                          </td>
                        </tr>
                      </>
                    )
                  ))
                ) : (
                  <tr></tr>
                )}
                {isAdd && (
                  <tr className="text-left border-2 inter-medium text-[14px]">
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="first_name"
                        // placeholder="First name"
                        className="w-[80px] mt-[5px] border-2 border-[#000] h-[80px] text-center"
                        value={newEntry.first_name}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.first_name && (
                        <p className="text-red-800">
                          <small> {errors.first_name[0]} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="last_name"
                        className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
                        // placeholder="Last name"
                        value={newEntry.last_name}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.last_name && (
                        <p className="text-red-800">
                          <small> {errors.last_name[0]} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        name="mrn"
                        className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
                        // placeholder="MRN No."
                        value={newEntry.mrn}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.mrn && (
                        <p className="text-red-800">
                          <small> {errors.mrn[0]} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "center" }}>
                      <select
                        name="surgeon"
                        className="w-[80px] h-[20px] mt-[5px]   text-center"
                        value={newEntry.surgeon}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {surgeons.map((surgeon) => (
                          <option key={surgeon.id} value={surgeon.id}>
                            {surgeon.initial}
                          </option>
                        ))}
                      </select>
                      {errors.surgeon && (
                        <span className="text-red-800">
                          <small>{errors.surgeon[0]}</small>
                        </span>
                      )}
                    </td>
                    <td style={{ verticalAlign: "center" }}>
                      <select
                        name="assistant"
                        className="w-[80px] h-[20px] mt-[5px]  text-center"
                        value={newEntry.assistant}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="null">NONE </option>
                        {surgeons.map((assistant) => (
                          <option key={assistant.id} value={assistant.id}>
                            {assistant.initial}
                          </option>
                        ))}
                      </select>
                      {errors.assistant && (
                        <p className="text-red-800">
                          <small>{errors.assistant[0]}</small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <textarea
                        name="diagnosis"
                        className="w-[340px] h-[80px] mt-[5px]  border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                        placeholder="Diagnosis"
                        value={newEntry.diagnosis}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors && errors.diagnosis && (
                        <p className="text-red-800">
                          <small> {errors.diagnosis[0]} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <textarea
                        className="w-[340px] h-[80px] mt-[5px] border-[1px] border-[#000] overflow-hidden bg-white formx padding"
                        placeholder="Procedure"
                        name="procedure"
                        value={newEntry.procedure}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors && errors.procedure && (
                        <p className="text-red-800">
                          <small> {errors.procedure[0]} </small>
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      <input
                        type="text"
                        className="w-[80px] h-[80px] mt-[5px]  border-[1px] border-[#000] text-center"
                        name="facility"
                        value={newEntry.facility}
                        onChange={handleInputChange}
                        required
                      />
                      {errors && errors.facility && (
                        <p className="text-red-800">
                          <small> {errors.facility[0]} </small>
                        </p>
                      )}
                      {isEditings && (
                        <div className="absolute top-[12px] right-[-60px] flex flex-col gap-2 items-center">
                          <button
                            className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                            onClick={handleSubmit}
                          >
                            <FontAwesomeIcon icon={faCheck} size="lg" />
                          </button>
                          <button
                            className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                            onClick={() => {
                              handleClearForm();
                              setSomething(false);
                            }}
                          >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {dayjs(selectedDate).isSame(today, "day") && !isAdd && !isEditings && (
                  <tr className="text-left border-2 inter-medium text-[14px]">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      {(userRole === 1 || userRole === 3) && (
                        <button
                          className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[50%] top-[50%] transform-translate-50 text-center bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white"
                          onClick={() => {
                            setIsAdd(true);
                            setIsEditings(true);
                          }}
                        >
                          Add New Entry
                        </button>
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[1400px] mx-auto py-3 pt-0 mt-[80px]">
        <OperationsToDate />
      </div>

      {showModal && (
        <DeleteModal
          show={showModal}
          onClose={closeModal}
          onDelete={() => handleDeleteEntry(selectedEntryId)}
        />
      )}
      <WarningModal
        warn={warning}
        closeWarn={warnClose}
        saveData={handleAddEntry}
        updateData={handleUpdate}
        upORadd={warningState}
        clear={handleClearForm}
        hide={makeHidden}
      />
    </>
  );
};

export default OparativeLog;
