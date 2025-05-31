import React, { useEffect, useState } from "react";
import EditEventtest from "./EditEvent";
import EditEventOffice from "./EditEventOffice";
// import EditEventOffice from "./EditEventOffice";

const EventCard = ({
  color,
  title,
  titles,
  patient_name,
  procedure,
  event_location,
  sourgeon_d,
  surgeon_d,
  patient_mrn,
  link,
  event_note_metting,
  fullHeight,
  height,
  rowlist,
  data,
  diable,
  purposeformetting,
  adjust,
  date,
  office_note,
  meeting_note,
  item_vac
}) => {
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const openModal = (id) => {
    setUserId(id);
    console.log(id);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <>
      {/* <div className="cursor-pointer" onClick={() => { openModal(link) }}> */}
      <div className={`visible-table transition cursor-pointer ${diable ? "pointer-events-none" : ""} left-0 absolute w-full top-2 ${purposeformetting == "Meeting" ? "z-[2]" : "z-[1]"} 
      hover:z-[3] opacity-[0.9] hover:opacity-[1]`} onClick={() => { openModal(link) }}>
        <div
          className={`relative px-2 py-1 ${item_vac == "fit" ? "" : "widthdp"} rounded-md ${sourgeon_d || surgeon_d === "P" ? "border-[5px] border-[#ABABAB]" : ""
            }`}
          style={{
            backgroundColor: color,
            height: fullHeight ? "100%" : height || "auto",
          }}

        >
          {sourgeon_d && (
            <p className="text-right inter-bold text-[12px] 2xl:text-[16px]">
              {sourgeon_d} /{" "}
              {event_location && (
                <span className="text-right inter-bold text-[12px] 2xl:text-[16px]">
                  {event_location}
                </span>
              )}
            </p>
          )}

          {/* procedure  */}
          {surgeon_d && (
            <p className={`text-right inter-bold ${rowlist <= 5 ? "text-[10px] 2xl:text-[14px]" : "text-[12px] 2xl:text-[16px]"}`} >
              {surgeon_d} /{" "}
              {event_location && (
                <span className={`text-right inter-bold ${rowlist <= 5 ? "text-[10px] 2xl:text-[14px]" : "text-[12px] 2xl:text-[16px]"}`}>
                  {event_location}
                </span>
              )}
            </p>
          )}

          {/* patient  */}
          {patient_name && (
            <h4
              className={`text-left inter-bold ${rowlist <= 4
                ? "hidden"
                : rowlist <= 6
                  ? "text-[10px] 2xl:text-[14px]"
                  : "text-[12px] 2xl:text-[20px]"
                }`}
            >
              {patient_name}
            </h4>
          )}

          {/* MRN Number  */}
          {(patient_mrn) && (
            <p className={`text-left inter-regular ${rowlist <= 8 ? "hidden" : "text-[12px] 2xl:text-[16px]"}`}>
              {patient_mrn}
            </p>
          )}

          {/* process */}
          {procedure && (
            <p
              className={`text-left inter-regular ${rowlist <= 6 ? "hidden" : "text-[10px] 2xl:text-[15px] leading-[16px]"} ${rowlist > 6 ? "mt-1" : ""}`}
            >
              {rowlist <= 8 ? procedure.substring(0, 25) + " ..." : procedure}
              {/* {procedure} */}
            </p>
          )}
          {/* title  */}
          {(titles || title) && (
            <h3 className={`inter-bold text-left ${rowlist <= 5 ? "text-[12px] 2xl:text-[16px]" : "text-[14px] 2xl:text-[20px]"}`}>
              {titles || title}
            </h3>
          )}
          {/* Surgeon name  */}
          {/* {(sourgeon_name || surgeon_name) && (
            <p className={`text-left inter-regular ${rowlist <= 4 ? "hidden" : "text-[12px] 2xl:text-[16px]"}`}>
              {sourgeon_name || surgeon_name}
            </p>
          )} */}
          {/* Metting note  */}
          {(meeting_note) && (
            <p className={`text-left inter-regular ${rowlist <= 6 ? "hidden" : "text-[12px] 2xl:text-[16px]"}`}>
              {meeting_note}
            </p>
          )}
          {(office_note) && (
            <p className={`text-left inter-regular ${rowlist <= 4 ? "hidden" : "text-[12px] 2xl:text-[16px]"}`}>
              {office_note}
            </p>
          )}
        </div>
      </div>

      {/* ----------------Modal--------------- */}
      {
        showModal && !adjust && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="pt-8 rounded relative">
              <EditEventtest onClose={closeModal} idParams={link} fetchDatas={data} />
            </div>
          </div>
        )
      }
      {
        showModal && adjust && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="pt-8 rounded relative">
              <EditEventOffice onClose={closeModal} idParams={link} fetchDatas={data} dates={date} />
            </div>
          </div>
        )
      }
    </>
  );
};

export default EventCard;
