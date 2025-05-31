import React, { useState, useEffect } from "react";
import Constant from "../../../Constant";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import DeleteModal from "./DeleteModal";
import { format } from "date-fns";
import dayjs from "dayjs";
import Celender from "./celender";
import OperationsToDate from "./operationsToDate ";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faPlus,
  faCheck,
  faTimes,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";

const SearchByNameOL = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filterEntries, setFilterEntries] = useState([]);
  const [name, setName] = useState(""); // Use state for search name
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Set default to today
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const nameParam = searchParams.get("name");
    if (nameParam) {
      setName(nameParam);
      fetchEntriesByName(nameParam);
    } else {
      fetchEntries();
    }
  }, [searchParams]);

  useEffect(() => {
    filterEntriesByDate(selectedDate);
  }, [entries, selectedDate]);

  const fetchEntries = () => {
    AxiosAuthInstance.get(`${Constant.BASE_URL}/oparative-log`)
      .then((response) => {
        const allEntries = response.data;
        const filteredEntries = allEntries.filter(entry => entry.is_archived === 0);
        setEntries(filteredEntries);
        filterEntriesByDate(selectedDate, filteredEntries);
      })
      .catch((error) => {
        console.error("There was an error fetching the entries!", error);
      });
  };

  const fetchEntriesByName = (name) => {
    AxiosAuthInstance.get(`${Constant.BASE_URL}/oparative-log/search-by-name?name=${encodeURIComponent(name)}`)
      .then((response) => {
        setEntries(response.data); // All entries matching the name
        filterEntriesByDate(selectedDate, response.data);
      })
      .catch((error) => {
        console.error("Error fetching entries by name:", error);
      });
  };

  const filterEntriesByDate = (date, entriesToFilter = entries) => {
    const filtered = entriesToFilter.filter((entry) =>
      dayjs(entry.created_at).isSame(date, "day")
    );
    setFilterEntries(filtered);
  };

  const handleDeleteEntry = (id) => {
    AxiosAuthInstance.patch(`${Constant.BASE_URL}/oparative-log/${id}`, {
      is_archived: true,
    })
      .then(() => {
        fetchEntries();
        setIsEditing(false);
        setShowModal(false);
      })
      .catch((error) => {
        console.error("There was an error archiving the entry!", error);
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

  const handleSearchChange = (e) => {
    setName(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/oparative-log-search/search-by-name?name=${encodeURIComponent(name)}`);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    filterEntriesByDate(date);
  };

  const dates = Array.from({ length: 7 }, (_, index) =>
    dayjs().subtract(index, "day")
  );

  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] flex content-center sticky top-0 z-10">
        <MasterNav />
      </div>

      <div className="body-content bg-[#ECECEC] pb-16">
        <div className="w-[1165px] mx-auto py-3">
          <div className="administration my-5 bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex">

            <div className="search bg-white rounded-xl w-[392px] py-2 text-center flex gap-4 px-5 items-center">
              <p className="inter-medium text-[16px]">Search By Name:</p>
              <input
                type="text"
                placeholder="Jonathan Smith"
                value={name}
                onChange={handleSearchChange}
              />
              <form onSubmit={handleSearchSubmit}>
                <button
                  type="submit"
                  className="px-2 py-1 rounded-md bg-[#657E98] text-white hover:bg-[#000000]"
                >
                  <FontAwesomeIcon icon={faAngleRight} size="xl" />
                </button>
              </form>
            </div>

            <p className="mx-auto inter-medium text-[24px] flex items-center">
              Operative Log
              <strong style={{ fontSize: "10px", padding: "0 20px" }}>
                <FontAwesomeIcon
                  icon={faCircle}
                  size="xs"
                  className="px-[20px]"
                />
              </strong>

              <span className="inter-bold">
                {entries.length > 0
                  ? `${entries[0].first_name} ${entries[0].last_name}`
                  : "No Entries Found"}
              </span>
            </p>
          </div>

          <div className="round-list mt-10 bg-white px-2 py-2 rounded-md mx-auto flex justify-between">
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

        </div>

        <div className="w-[1400px] mx-auto py-3 relative pt-0 mb-10">
          <div className="bg-white w-full px-10 rounded-md pt-5 pb-10 shadow-lg">
            <table className="hp-round">
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
                {filterEntries.length > 0 ? (
                  filterEntries.map((entry, index) => (
                    <tr
                      key={index}
                      className="text-left border-2 inter-medium text-[14px]"
                    >
                      <td>{entry.first_name}</td>
                      <td>{entry.last_name}</td>
                      <td>{entry.mrn}</td>
                      <td>{entry.surgeon_initial || entry.surgeon}</td>
                      <td>{entry.assistant_initial || entry.assistant}</td>
                      <td>{entry.diagnosis}</td>
                      <td>{entry.procedure}</td>
                      <td>{entry.facility}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No entries for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-[1400px] mx-auto py-3 relative pt-0 mt-10">
        <OperationsToDate />
      </div>

      {showModal && (
        <DeleteModal
          show={showModal}
          onClose={closeModal}
          onDelete={() => handleDeleteEntry(selectedEntryId)}
        />
      )}
    </>
  );
};

export default SearchByNameOL;
