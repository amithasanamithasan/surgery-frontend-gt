import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import OperationsToDate from "./operationsToDate ";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faCircle,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Calender from "./celender";
import WarningModal from "./WarningModal";
import dayjs from "dayjs";
import { format } from "date-fns";
const SearchByNameOL = () => {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dataEditing, setDataEditing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [surgeons, setSurgeons] = useState([]);
  const [errors, setErrors] = useState({});
  const [warning, setWarning] = useState(false);
  const [warningState, setWarningState] = useState("false");
  const [something, setSomething] = useState("false");

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
    // Implement save functionality here
    if (!editingId) return;
    const requiredFields = [
      "first_name",
      "last_name",
      "mrn",
      "surgeon",
      "diagnosis",
      "procedure",
      "facility",
    ];
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
    AxiosAuthInstance.put(
      `${Constant.BASE_URL}/oparative-log/${editingId}`,
      newEntry
    ).then((response) => {
      setNewEntry({
        first_name: "",
        last_name: "",
        mrn: "",
        surgeon: "",
        assistant: "",
        diagnosis: "",
        procedure: "",
        facility: "",
      });
      handleClearForm();
      fetchEntriesByName(nameed);
      setIsEditing(false);
      setEditingId(null);
    });
  };
  const warnModal = () => {
    setWarning(true);
  };
  const warnClose = () => {
    setWarning(false);
    setWarningState("false");
  };
  const handleClearForm = () => {
    setErrors("");
    setIsEditing(false);
    setEditingId(null);
  };
  const fetchSurgeons = async () => {
    try {
      const response = await AxiosAuthInstance.get(
        `${Constant.BASE_URL}/surgeons-none`
      );
      setSurgeons(response.data);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
    }
  };
  // -------------------------------
  const nameed = searchParams.get("name");
  useEffect(() => {
    fetchSurgeons();
    const nameParam = searchParams.get("name");
    if (nameParam) {
      setName(nameParam);
      fetchEntriesByName(nameParam);
    } else {
      fetchEntries();
    }
  }, [searchParams]);

  const fetchEntriesByName = (name) => {
    AxiosAuthInstance.get(
      `${
        Constant.BASE_URL
      }/oparative-log/search-by-name?name=${encodeURIComponent(name)}`
    )
      .then((response) => {
        setEntries(response.data);
      })
      .catch((error) => {
        console.error("Error fetching entries by name:", error);
      });
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

  const handleSearchChange = (e) => {
    setName(e.target.value);
  };

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   navigate(`/search-by-name?name=${encodeURIComponent(name)}`);
  // };
  const handleSearchSubmit = (e) => {
    // e.preventDefault();
    navigate(`/oparative-log-search?name=${encodeURIComponent(name)}`);
  };
  const makeHidden = () => {
    setSomething("false");
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
                <title>Operative Log</title>
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
                    .operative td {
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
                      right: -160px;
                      top: 45%;
                      transform: translateY(-50%);
                      background: rgb(82, 74, 70);
                      border-radius: 25px;
                      color: white;
                      
                    }
                    .hight-prints{
                      display:flex;
                      justify-content:center;
                      align-items:center;
                      height:10px;
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
        <MasterNav editPage={something} warn={warnModal} />
      </div>

      <div className="body-content bg-[#ECECEC] pb-0">
        <div className="w-[1165px] mx-auto py-3">
          <div className="administration my-5 bg-[#B4C6D9] h-[75px] px-5 py-5 rounded-xl text-center flex items-center">
            <div className="searchs bg-white rounded-xl w-[380px] h-[50] py-2 text-center flex gap-4 px-5 items-center">
              <p className="inter-medium text-[16px] w-[190px]">
                Search By Name:
              </p>

              {something === "true" ? (
                <>
                  <div className="flex" onSubmit={handleSearchSubmit}>
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
                      required
                    />

                    <button
                      onClick={warnModal}
                      className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                    >
                      <FontAwesomeIcon icon={faAngleRight} size="xl" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <form className="flex" onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      placeholder="Jonathan Smith"
                      value={name}
                      onChange={handleSearchChange}
                      required
                    />
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
              )}
            </div>

            <p className="ms-[80px] inter-medium text-[25px] flex items-center">
              Operative Log
              <strong style={{ fontSize: "10px", padding: "0 10px" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="px-[20px]"
                />
              </strong>
              <span className="inter-bold">
                {nameed}
                {/* {entries.length > 0
                  ? `${entries[0].first_name} ${entries[0].last_name}`
                  : "No Entries Found"} */}
              </span>
            </p>
            <div className="relative right-[-200px]">
              <button
                onClick={Archivedroundprint}
                id="hide-print"
                type="button"
                className="border-none w-[165px] h-[35px] rounded bg-white mx-2 inter-medium text-[18px] "
              >
                Print Logs
              </button>
            </div>
            {/* <Calender /> */}
          </div>
        </div>

        <div
          id="archive"
          className="w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 mb-10"
        >
          <div
            id="increase-size"
            className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg"
          >
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
                  <>
                    {entries.map((entry, index) =>
                      editingId === entry.id ? (
                        <>
                          <tr className="text-left border-2 inter-medium text-[14px]">
                            <td style={{ verticalAlign: "top" }}>
                              <input
                                type="text"
                                name="first_name"
                                className="w-[80px] h-[80px] mt-[5px] border-2 border-[#000] text-center"
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
                                {surgeons.map((surgeon) =>
                                  surgeon.initial !== "NONE" ? (
                                    <option key={surgeon.id} value={surgeon.id}>
                                      {surgeon.initial}
                                    </option>
                                  ) : null
                                )}
                              </select>
                              {errors.surgeon && (
                                <span className="text-red-800">
                                  <small> {errors.surgeon}</small>
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
                                {/* <option value="null">
                                  NONE
                                </option> */}
                                {surgeons.map((assistant) => (
                                  <option
                                    key={assistant.id}
                                    value={assistant.id}
                                  >
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
                                className="w-[250px] 2xl:w-[330px] h-[80px]  border-[1px] border-[#000] mt-[5px] overflow-hidden bg-white formx padding"
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
                                className="w-[250px] 2xl:w-[330px] h-[80px]  border-[1px] border-[#000] mt-[5px] overflow-hidden bg-white formx padding"
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
                              <div className="absolute top-[12px] right-[-60px] flex flex-col gap-2 items-center">
                                <button
                                  className="bg-[#58D68D] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#52BE80]"
                                  onClick={() => {
                                    handleSubmit();
                                    setSomething("false");
                                  }}
                                >
                                  <FontAwesomeIcon icon={faCheck} size="lg" />
                                </button>
                                <button
                                  className="bg-[#EC7063] border-2 border-white px-2 py-1 rounded-md drop-shadow hover:bg-[#E74C3C]"
                                  onClick={() => {
                                    handleClearForm();
                                    setSomething("false");
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTimes} size="lg" />
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
                            <td>{entry.first_name}</td>
                            <td>{entry.last_name}</td>
                            <td>{entry.mrn}</td>
                            <td>{entry.surgeon_initial || entry.surgeon}</td>
                            <td>
                              {entry.assistant == null
                                ? "NONE"
                                : entry.assistant_initial || entry.assistant}
                            </td>
                            <td>{entry.diagnosis}</td>
                            <td>{entry.procedure}</td>
                            <td>
                              {entry.facility}
                              {dataEditing && (
                                <>
                                  {dayjs(entry.created_at).isSame(
                                    dayjs(),
                                    "day"
                                  ) ? (
                                    <>
                                      <div className="absolute top-[10px] left-[110px]">
                                        <button
                                          className="bg-[#B4C6D9] border-2 border-white px-4 py-1 rounded-md my-2 drop-shadow"
                                          onClick={() => {
                                            handleEdit(entry.id, entry);
                                            setSomething("true");
                                          }}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                      <div className="absolute bottom-[10px] left-[106px]">
                                        <button className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none">
                                          {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                          {dayjs
                                            .utc(entry.created_at)
                                            .format("MM/DD/YYYY")}
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div  id="date-print" className="absolute top-[35%] left-[106px]">
                                        <button
                                          
                                          className=" hight-prints bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
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
                                </>
                              )}
                              {!dataEditing && (
                                <div className="absolute top-[35%] left-[106px]">
                                  <button
                                    id="date-print"
                                    className="bg-[#554b49] w-[75px] px-1 py-1 my-2 rounded-[47px] drop-shadow text-[10px] text-[white] font-[300] pointer-events-none"
                                  >
                                    {/* {format(new Date(entry.created_at), 'MM/dd/yyyy')} */}
                                    {/* {format(dayjs.utc(entry.created_at).format(), 'MM/dd/yyyy')} */}
                                    {dayjs
                                      .utc(entry.created_at)
                                      .format("MM/DD/YYYY")}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        </>
                      )
                    )}
                    {entries &&
                      (editingId ? (
                        <tr className="text-left border-2 inter-medium text-[14px]">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            {entries.some((entry) =>
                              dayjs(entry.created_at).isSame(dayjs(), "day")
                            ) && (
                              <>
                                <button
                                  className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[50%] top-[50%] transform-translate-50 text-center bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white"
                                  onClick={handleClearForm}
                                >
                                  {dataEditing ? "Exit" : "Edit Entries"}
                                </button>
                              </>
                            )}
                          </td>
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
                            {entries.some((entry) =>
                              dayjs(entry.created_at).isSame(dayjs(), "day")
                            ) && (
                              <>
                                <button
                                  className="drop-shadow-2xl w-[190px] h-[40px] absolute left-[50%] top-[50%] transform-translate-50 text-center bg-white cursor-pointer rounded-md hover:bg-[#657E98] hover:text-white"
                                  onClick={handleToggleEdit}
                                >
                                  {dataEditing ? "Exit" : "Edit Entries"}
                                </button>
                              </>
                            )}
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[1200px] 2xl:w-[1400px] mx-auto py-3 relative pt-0 mt-[80px]">
        <OperationsToDate />
      </div>
      <WarningModal
        warn={warning}
        closeWarn={warnClose}
        updateData={handleSubmit}
        saveData={handleSubmit}
        upORadd={warningState}
        clear={handleClearForm}
        hide={makeHidden}
      />
    </>
  );
};

export default SearchByNameOL;
