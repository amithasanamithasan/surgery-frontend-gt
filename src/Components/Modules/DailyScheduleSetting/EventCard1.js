import React, { useEffect, useState } from "react";
import EditEventtest from "./EditEvent";

const EventCard = ({
  color,
  title,
  titles,
  patient_name,
  procedure,
  event_location,
  sourgeon_d,
  surgeon_d,
  sourgeon_name,
  surgeon_name,
  link,
  border,
  fullHeight,
  height,
  rowlist,
  data,
  diable,
  purposeformetting,
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
      <div className={`transition left-0 cursor-pointer ${diable ? "pointer-events-none" : ""} absolute w-full top-2 ${purposeformetting == "Meeting" ? "z-[2]" : "z-[1]"} 
      hover:z-[3] opacity-[0.9] hover:opacity-[1]`} onClick={() => { openModal(link) }}>
        <div
          className={`relative p-3 widthdp rounded-md ${sourgeon_d || surgeon_d === "P" ? "border-[5px] border-[#ABABAB]" : ""
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
          {surgeon_d && (
            <p className={`text-right inter-bold ${rowlist <= 3 ? "text-[12px]" : "text-[12px] 2xl:text-[16px]"} `}>
              {surgeon_d} /{" "}
              {event_location && (
                <span className={`text-right inter-bold ${rowlist <= 3 ? " text-[12px]" : "text-[12px] 2xl:text-[16px]"} `}>
                  {event_location}
                </span>
              )}
            </p>
          )}
          {patient_name && (
            <h4 className={`text-left inter-bold ${rowlist <= 3 ? " text-[12px]" : "text-[16px] 2xl:text-[20px]"} `}>
              {patient_name}
            </h4>
          )}
          {procedure && (
            <p
              className={`text-left inter-regular ${rowlist <= 3 ? " text-[11px]" : "text-[12px] 2xl:text-[16px]"} ${rowlist > 8 ? "mt-4" : ""
                }`}
            >
              {rowlist <= 4 ? procedure.substring(0, 25) + " ..." : procedure}
            </p>
          )}
          {(titles || title) && (
            <h3 className={`inter-bold text-left ${rowlist <= 2 ? "text-[12px] 2xl:text-[14px]" : "text-[16px] 2xl:text-[20px]"}`}>
              {titles || title}
            </h3>
          )}
          {(sourgeon_name || surgeon_name) && (
            <p className={`text-left inter-regular  ${rowlist <= 2 ? "text-[10px] 2xl:text-[12px]" : "text-[12px] 2xl:text-[16px]"}`}>
              {sourgeon_name || surgeon_name}
            </p>
          )}
        </div>
      </div>

      {/* ----------------Modal--------------- */}
      {
        showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="pt-8 rounded relative">
              <EditEventtest onClose={closeModal} idParams={link} fetchDatas={data} />
            </div>
          </div>
        )
      }

    </>
  );
};

export default EventCard;
