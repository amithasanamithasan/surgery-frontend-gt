import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import DeleteModal from "./DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faCircle, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { format } from 'date-fns';
const SearchByName = () => {
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [entries, setEntries] = useState([]);
  const [filterEntries, setFilterEntries] = useState([]);
  const [tempFilterEntries, setTempFilterEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const name = searchParams.get("name");
  const [nam, setNam] = useState("");
  const navigate = useNavigate();

  const today = dayjs();
  const dates = Array.from({ length: 7 }, (_, index) =>
    today.subtract(index, "day")
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [dataEditing, setDataEditing] = useState(false);
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
  const handleEdit = (id, entry) => {
    setIsEditing(true);
    setEditingId(id);
    setNewEntry(entry);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };
  // -------------------------------
  useEffect(() => {
    if (name) {
      fetchEntriesByName(name);
    }
  }, [name]);

  const fetchEntriesByName = (name) => {

    if (!name) {
      console.error("Name parameter is required.");
      return;
    }

    AxiosAuthInstance.get(`${Constant.BASE_URL}/hospital-round/search-by-name`, { params: { name } })
      .then((response) => {
        // const allEntries = response.data;
        const allEntries = response.data.map((entry) => ({
          ...entry,
          room: String(entry.room).padStart(2, '0'),
        }));
        // Filter for active entries based on name
        const filteredEntries = allEntries.filter(
          (entry) =>
            entry.is_archived === 0 &&
            entry.so === 0 &&
            entry.dc === 0 &&
            (entry.first_name.toLowerCase().includes(name.toLowerCase()) ||
              entry.last_name.toLowerCase().includes(name.toLowerCase()))
        );
        setEntries(filteredEntries);
        // Filter for archived entries or those with so or dc set
        const belowFilteredEntries = allEntries.filter(
          (entry) =>
            (entry.is_archived === 1 || entry.so === 1 || entry.dc === 1) &&
            (entry.first_name.toLowerCase().includes(name.toLowerCase()) ||
              entry.last_name.toLowerCase().includes(name.toLowerCase()))
        );
        setFilterEntries(belowFilteredEntries);
        filterEntriesByDate(selectedDate, belowFilteredEntries);
      })
      .catch((error) => {
        console.error("Error fetching entries by name:", error);
      });
  };
  const handleSubmit = () => {
    if (!editingId) return;
    AxiosAuthInstance.put(`${Constant.BASE_URL}/hospital-round/${editingId}`, newEntry)
      .then((response) => {
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
        fetchEntriesByName(name);
      })
      .catch((error) => handleErrors(error));
  };

  const handleErrors = (error) => {
    if (error.response && error.response.status === 403) {
      setErrorMessage("Unauthorized access. You do not have permission to edit entries.");
    } else if (error.response && error.response.data && error.response.data.errors) {
      setErrors(error.response.data.errors);
    } else {
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const filterEntriesByDate = (date, entriesToFilter = filterEntries) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const filtered = entriesToFilter.filter((entry) => {
      const updatedDateFormatted = dayjs(entry.updated_at).format("YYYY-MM-DD");
      return dayjs(updatedDateFormatted).isSame(formattedDate, "day");
    });

    const sortedFilteredEntries = filtered.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );

    setTempFilterEntries(sortedFilteredEntries);
  };

  const handleDeleteEntry = (id) => {
    AxiosAuthInstance.patch(`${Constant.BASE_URL}/hospital-round/${id}`, {
      is_archived: true,
    })
      .then(() => {
        fetchEntriesByName();
        setShowModal(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage("Unauthorized access. You do not have permission to add or update entries.");
        } else if (error.response && error.response.data && error.response.data.errors) {
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

  const handleCheckboxChange = (id, field) => {
    console.log(`Checkbox change: id=${id}, field=${field}`);
    const updatedField = field === "so" ? { so: true, dc: false } : { so: false, dc: true };
    AxiosAuthInstance.put(
      `${Constant.BASE_URL}/hospital-sodc/${id}`,
      updatedField
    )
      .then((response) => {
        console.log("Update response:", response.data);
        fetchEntriesByName(name);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setErrorMessage("Unauthorized access. You do not have permission to add or update entries.");
        } else if (error.response && error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "An unexpected error occurred" });
        }
      });
  };

  const UpdateCheckboxChange = (id, field, newValue) => {
    const updatedField = { [field]: newValue };
    AxiosAuthInstance.put(`${Constant.BASE_URL}/hospital-sodcback/${id}`, updatedField)
      .then((response) => {
        console.log("Individual update response:", response.data);
        fetchEntriesByName(name);
      })
      .catch((error) => {
        handleError(error);
      });
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 403) {
      setErrorMessage("Unauthorized access. You do not have permission to add entries.");
    } else if (error.response && error.response.data && error.response.data.errors) {
      setErrors(error.response.data.errors);
    } else {
      setErrors({ general: "An unexpected error occurred" });
    }
  };


  const handleSearchChange = (e) => {
    setNam(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search-by-name?name=${encodeURIComponent(name)}`);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    filterEntriesByDate(date);
  };
  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] flex content-center sticky top-0 z-20">
        <MasterNav />
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
                {name}
              </span>
            </p>
          </div>
        </div>

        <div className="w-[1400px] mx-auto py-3 relative pt-0 mb-10">
          <div className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg">
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
                  <th>S/O <br /> D/C</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  <>
                    {entries.map((entry, index) => (
                      editingId === entry.id ? (
                        <>
                          <tr key={index} className="text-left border-2 inter-medium text-[14px]">
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
                                className="w-[50px] h-[80px] mt-[5px] border-[1px] border-[#000] text-center"
                                value={newEntry.age}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="mrn"
                                className="w-[80px] h-[80px] mt-[5px] border-[1px] border-[#000] text-center"
                                value={newEntry.mrn}
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <textarea
                                name="diagnosis"
                                className="w-[200px] h-[80px] mt-[5px] formx border-[1px] border-[#000] bg-white"
                                // placeholder="Diagnosis"
                                value={newEntry.diagnosis}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <textarea
                                name="procedure"
                                className="w-[200px] h-[80px] mt-[5px] formx border-[1px]  border-[#000] bg-white"
                                // placeholder="Procedure"
                                value={newEntry.procedure}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <textarea
                                name="notes"
                                className="w-[200px] formx h-[80px] mt-[5px]  border-[1px]  border-[#000] bg-white"
                                // placeholder="Notes"
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
                                  onClick={handleSubmit}
                                  className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                                >
                                  <FontAwesomeIcon icon={faCheck} className="text-white px-0" size="lg"></FontAwesomeIcon>
                                </button>
                                <button
                                  onClick={handleClearForm}
                                  className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                                >
                                  <FontAwesomeIcon icon={faTimes} className="text-white px-[2px]" size="lg"></FontAwesomeIcon>
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
                                <input
                                  className="mark"
                                  id={`cb4-back-${index}`}
                                  type="checkbox"
                                  name="so"
                                  checked={entry.so}
                                  onChange={() =>
                                    handleCheckboxChange(entry.id, "so")
                                  }
                                  disabled={entry.dc}
                                />
                                <label htmlFor={`cb4-back-${index}`}></label>
                                <input
                                  className="mark"
                                  id={`cb5-back-${index}`}
                                  type="checkbox"
                                  name="dc"
                                  checked={entry.dc}
                                  onChange={() =>
                                    handleCheckboxChange(entry.id, "dc")
                                  }
                                  disabled={entry.so}
                                />
                                <label htmlFor={`cb5-back-${index}`}></label>

                                {dataEditing && (
                                  <>
                                    {dayjs(entry.created_at).isSame(dayjs(), "day") ? (
                                      <>
                                        <div className="absolute top-[10px] left-[80px]">
                                          <button
                                            className="bg-[#B4C6D9] w-[65px] border-2 border-white px-4 py-1 rounded-md my-2 drop-shadow"
                                            onClick={() => handleEdit(entry.id, entry)}
                                          >
                                            Edit
                                          </button>
                                        </div>
                                        <div className="absolute bottom-[10px] left-[76px]">
                                          <button
                                            className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                                          >
                                            {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                            {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                            {dayjs.utc(entry.created_at).format("MM/DD/YYYY")}
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="absolute left-[76px]">
                                          <button
                                            className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                                          >
                                            {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                            {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                            {dayjs.utc(entry.created_at).format("MM/DD/YYYY")}
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </>
                                )}
                                {!dataEditing && (
                                  <div className="absolute left-[76px]">
                                    <button
                                      className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                                    >
                                      {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                      {dayjs.utc(entry.created_at).format("MM/DD/YYYY")}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr >
                        </>
                      )
                    ))}
                    {entries && (
                      editingId ? (
                        <tr className="text-left border-2 inter-medium text-[14px]">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            {entries.some(entry =>
                              dayjs(entry.created_at).isSame(dayjs(), "day")
                            ) && (
                                <button
                                  className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[100%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white z-[9]"
                                  onClick={handleClearForm}
                                >
                                  {dataEditing ? "Exit" : "Edit Entries"}
                                </button>
                              )}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      ) : (
                        <tr className="text-left border-2 inter-medium text-[14px]">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            {entries.some(entry =>
                              dayjs(entry.created_at).isSame(dayjs(), "day")
                            ) && (
                                <button
                                  className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[100%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white z-[9]"
                                  onClick={handleToggleEdit}
                                >
                                  {dataEditing ? "Exit" : "Edit Entries"}
                                </button>
                              )}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      )
                    )}
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
      </div >

      <div className="w-[1400px] mx-auto py-3 relative pt-0 mt-[80px]">
        <div className="relative bg-white w-100 px-10 rounded-md pt-5 pb-10 shadow-lg">
          <div className="w-[85%] absolute bg-[#657E98] items-center text-center py-4 rounded-xl m-auto left-0 right-0 top-[-12%] flex justify-start px-[2%]">
            <div className="search bg-white rounded-xl w-[392px] py-2 text-center flex gap-4 px-5 items-center">
              <p className="inter-medium text-[16px]">Search By Name:</p>
              <input
                type="text"
                placeholder={name}
                value={nam}
                onChange={handleSearchChange}
              />
              <form onSubmit={handleSearchSubmit}>
                <Link to={`/hospital-round-search?name=${nam}`}>
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                  >
                    <FontAwesomeIcon icon={faAngleRight} size="xl" />
                  </button>
                </Link>
              </form>
            </div>
            <h1 className="text-white inter-medium text-[24px] ms-[100px]">
            Archived Rounds
            </h1>
          </div>

          <div className="round-list pb-10 pt-[60px] w-[85%] mx-auto flex justify-between">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`item-r mx-2 w-[150px] h-[30px] bg-[#B4C6D9] cursor-pointer rounded-md py-1 text-center inter-medium text-[14px] ${date.isSame(selectedDate, "day") ? "active" : ""
                  }`}
                onClick={() => handleDateSelect(date)}
              >
                {date.format("MM/DD")}
              </div>
            ))}
          </div>

          {/* Table for Filtered Entries */}
          <table className="hp-round muted">
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
                <th>S/O <br /> D/C</th>
              </tr>
            </thead>
            <tbody>
              {tempFilterEntries.length > 0 ? (
                tempFilterEntries.map((filterEntry, index) => (
                  <tr
                    key={filterEntry.id}
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
                          id={`cb4-back-${filterEntry.id}`}
                          type="checkbox"
                          name="so"
                          checked={filterEntry.so}
                          onChange={() => UpdateCheckboxChange(filterEntry.id, "so", !filterEntry.so)}
                          disabled={filterEntry.is_archived === 1 || filterEntry.dc === 1}
                        />
                        <label htmlFor={`cb4-back-${filterEntry.id}`}></label>

                        <input
                          className="mark"
                          id={`cb5-back-${filterEntry.id}`}
                          type="checkbox"
                          name="dc"
                          checked={filterEntry.dc}
                          onChange={() => UpdateCheckboxChange(filterEntry.id, "dc", !filterEntry.dc)}
                          disabled={filterEntry.is_archived === 1 || filterEntry.so === 1}
                        />
                        <label htmlFor={`cb5-back-${filterEntry.id}`}></label>
                      </div>
                      <div className="absolute top-[35%] left-[76px]">
                        <button
                          className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                        >
                          {format(new Date(filterEntry.created_at), 'MM/dd/yyyy')}
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

      <DeleteModal
        show={showModal}
        onClose={closeModal}
        onDelete={() => handleDeleteEntry(selectedEntryId)}
      />
    </>
  );
};

export default SearchByName;
