import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { useLocation } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import OperationsToDate from "./operationsToDate ";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Celender from "./celender";
import { faAngleRight, faCircle, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import moment from 'moment';
import { format } from 'date-fns';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
const SearchByDateOL = () => {
  const [entries, setEntries] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const date = query.get("date");
  const [dataEditing, setDataEditing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [surgeons, setSurgeons] = useState([]);
  const [errors, setErrors] = useState({});
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
    setNewEntry((prev) => ({
      ...prev,
      [name]: value === "null" ? null : value,
    }));
  };
  const handleSubmit = () => {
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
        setNewEntry({ first_name: "", last_name: "", mrn: "", surgeon: "", diagnosis: "", procedure: "", facility: "" });
        handleClearForm();
        fetchData(date);
        setIsEditing(false);
        setEditingId(null);
      })
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };
  const fetchEntries = () => {
    AxiosAuthInstance.get(`${Constant.BASE_URL}/oparative-log`)
      .then((response) => {
        setEntries(response.data);
      })
      .catch((error) => {
        console.error("Error fetching all entries:", error);
      });
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
  // -------------------------------
  useEffect(() => {
    fetchSurgeons();
    if (date) {
      fetchData(date);
    }
  }, [date]);

  const fetchData = (date) => {
    AxiosAuthInstance.get(`${Constant.BASE_URL}/oparative-log/search-by-date?date=${date}`)
      .then(response => {
        console.log("Response Data:", response.data);
        setEntries(response.data.data);
        setCanEdit(response.data.canEdit);
      })
      .catch(error => {
        console.error("Error fetching data by date:", error);
      });
  };

  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] flex content-center sticky top-0 z-20">
        <MasterNav />
      </div>

      <div className="body-content bg-[#ECECEC] pb-0">
        <div className="w-[1165px] mx-auto py-3">
          <div className="administration my-5 bg-[#B4C6D9] h-[75px] px-5 py-5 rounded-xl text-center flex items-center">
            <p className="mx-auto inter-medium text-[24px] flex items-center me-52">
              Operative Log
              <strong style={{ fontSize: "10px", padding: "0 10px" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="px-[20px]"
                />
              </strong>
              <span className="inter-bold">
                {date ? ` ${dayjs.utc(date).format("MM/DD/YYYY")}` : "No Date Selected"}
              </span>
            </p>

            <Celender
              isCalendarOpen={isCalendarOpen}
              setIsCalendarOpen={setIsCalendarOpen}
            />
          </div>
        </div>

        <div className="w-[1400px] mx-auto py-3 relative pt-0 mb-10">
          <div className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg">
            <table className="operative">
              <thead>
                <tr className="text-center inter-bold text-[14px]">
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
                {entries.length > 0 ? (
                  entries.map((entry, index) => (
                    editingId === entry.id ? (
                      <tr key={index} className="text-left border-2 inter-medium text-[14px]">
                        <td style={{ verticalAlign: "top" }}>
                          <input
                            type="text"
                            name="first_name"
                            className="w-[80px] mt-[5px] h-[80px] border-2 border-[#000] text-center"
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
                            className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
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
                            className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
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
                          <select
                            name="surgeon"
                            className="w-[80px] h-[80px] mt-[5px] outline-gray-300 text-center"
                            value={newEntry.surgeon}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="" disabled>Select</option>
                            {surgeons.map((surgeon) => (
                              <option key={surgeon.id} value={surgeon.id}>
                                {surgeon.initial}
                              </option>
                            ))}
                          </select>
                          {errors.surgeon && (
                            <span className="text-red-800">
                              <small>{errors.surgeon}</small>
                            </span>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <select
                            name="assistant"
                            className="w-[80px] h-[80px] mt-[5px] outline-gray-300 text-center"
                            value={newEntry.assistant}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="null">NONE </option>
                            {surgeons.map((assistant) => (
                              <option key={assistant.id} value={assistant.id}>
                                {assistant.initial}
                              </option>
                            ))}
                          </select>
                          {errors.assistant && (
                            <span className="text-red-800">
                              <small>{errors.assistant}</small>
                            </span>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <textarea
                            name="diagnosis"
                            className="w-[330px] h-[80px] border-[1px] border-[#000] mt-[5px] overflow-hidden bg-white formx padding"
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
                            className="w-[330px] h-[80px]  border-[1px] border-[#000] mt-[5px] overflow-hidden bg-white formx padding"
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
                              <small> {errors.facility[0]} </small>
                            </p>
                          )}
                          <div className="absolute top-[12px] right-[-60px] flex flex-col gap-2 items-center">
                            <button
                              className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                              onClick={handleSubmit}
                            >
                              <FontAwesomeIcon icon={faCheck} size="lg" />
                            </button>
                            <button
                              className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                              onClick={handleClearForm}
                            >
                              <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={index} className="text-left border-2 inter-medium text-[14px]">
                        <td>{entry.first_name}</td>
                        <td>{entry.last_name}</td>
                        <td>{entry.mrn}</td>
                        <td>{entry.surgeon_initial || entry.surgeon}</td>
                        <td>{ entry.assistant == null ? "NONE" : entry.assistant_initial || entry.assistant}</td>
                        <td>{entry.diagnosis}</td>
                        <td>{entry.procedure}</td>
                        <td>
                          {entry.facility}
                          {dataEditing && (
                            <>
                              <div className="absolute top-[10px] left-[110px]">
                                <button
                                  className="bg-[#B4C6D9] border-2 border-white px-4 py-1 rounded-md my-2 drop-shadow"
                                  onClick={() => handleEdit(entry.id, entry)}
                                >
                                  Edit
                                </button>
                              </div>
                              <div className="absolute bottom-[10px] left-[106px]">
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
                          {!dataEditing && (
                            <div className="absolute top-[35%] left-[106px]">
                              <button
                                className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                              >
                                {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                {dayjs.utc(entry.created_at).format("MM/DD/YYYY")}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No entries found.
                    </td>
                  </tr>
                )}
                <tr className="text-left border-2 inter-medium text-[14px]">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    {canEdit ? (
                      <button
                        className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[50%] top-[50%] transform-translate-50 text-center bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white"
                        onClick={handleToggleEdit}
                      >
                        {dataEditing ? "Exit" : "Edit Entries"}
                      </button>
                    ) : (
                      <></>
                    )}
                  </td>
                  <td></td>
                  <td></td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[1400px] mx-auto py-3 relative pt-0 mt-[80px]">
        <OperationsToDate />
      </div>
    </>
  );
};

export default SearchByDateOL;
