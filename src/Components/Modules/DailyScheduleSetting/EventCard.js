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
  item_vac,
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
      <div
        className={`visible-table transition cursor-pointer ${
          diable ? "pointer-events-none" : ""
        } left-0 absolute w-full top-2 ${
          purposeformetting == "Meeting" ? "z-[2]" : "z-[1]"
        } 
      hover:z-[3] opacity-[0.9] hover:opacity-[1]`}
        onClick={() => {
          openModal(link);
        }}
      >
        <div
          className={`relative px-2 ${rowlist <= 5 ? "py-[5px]" : "py-2"}  ${
            item_vac == "fit" ? "" : "widthdp"
          } rounded-md ${
            sourgeon_d || surgeon_d === "P"
              ? "border-[5px] border-[#ABABAB] force-border"
              : ""
          }`}
          style={{
            backgroundColor: color,
            height: fullHeight ? "100%" : height || "auto",
          }}
        >
          {/* //MRN  and Location  */}
          <div className="flex justify-between">
            {/* MRN Number  */}
            <div>
              {patient_mrn && (
                <p
                  className={`text-left print-bolds inter-bold ${
                    rowlist <= 4
                      ? "text-[10px] 2xl:text-[12px]"
                      : rowlist <= 6
                      ? "text-[10px] 2xl:text-[12px]"
                      : "text-[10px] 2xl:text-[12px]"
                  }`}
                >
                  MRN {patient_mrn}
                </p>
              )}
            </div>

            {/* {sourgeon_d && (
              <p className="text-right inter-bold text-[10px] 2xl:text-[12px]">
                {sourgeon_d} /{" "}
                {event_location && (
                  <span className="text-right inter-bold text-[10px] 2xl:text-[12px]">
                    {event_location}
                  </span>
                )}
              </p>
            )} */}
            {/* {sourgeon_d && (
              <p
                className={`text-right inter-bold ${
                  rowlist <= 4
                    ? "text-[10px] 2xl:text-[12px]"
                    : "text-[10px] 2xl:text-[12px]"
                }`}
              >
                {sourgeon_d} /{" "}
                {event_location && (
                  <span
                    className={`text-right inter-bold ${
                      rowlist <= 4
                        ? "text-[10px] 2xl:text-[12px]"
                        : "text-[10px] 2xl:text-[12px]"
                    }`}
                  >
                    {event_location}
                  </span>
                )}
              </p>
            )} */}
            {/* procedure  */}
            {surgeon_d && (
              <p
                className={`text-right print-bolds inter-bold ${
                  rowlist <= 4
                    ? "text-[10px] 2xl:text-[12px]"
                    : "text-[10px] 2xl:text-[12px]"
                }`}
              >
                {surgeon_d} /{" "}
                {event_location && (
                  <span
                    className={`text-right print-bolds inter-bold ${
                      rowlist <= 4
                        ? "text-[10px] 2xl:text-[12px]"
                        : "text-[10px] 2xl:text-[12px]"
                    }`}
                  >
                    {event_location}
                  </span>
                )}
              </p>
            )}
          </div>
          {/* patient  */}
          {patient_name && (
            <h4
              className={`text-left print-bolds inter-bold  ${
                rowlist > 5 ? "mt-[0px]" : "mt-[-2px]"
              } ${
                rowlist <= 4
                  ? "hidden"
                  : rowlist <= 6
                  ? "text-[12px] 2xl:text-[14px] mt-[-3px]"
                  : "text-[10px] 2xl:text-[14px] mt-2"
              }`}
            >
              {patient_name}
            </h4>
          )}

          {/* process */}
          {procedure && (
            <p
              className={`text-left print-text inter-regular leading-none ${
                rowlist <= 4 ? "hidden" : "text-[10px] 2xl:text-[12px]"
              } ${rowlist > 5 ? "mt-0" : "mt-[-2px]"}`}
            >
              {rowlist <= 6 ? procedure.substring(0, 35) + " ..." : procedure}
              {/* {procedure} */}
            </p>
          )}

          {/* title  */}
          {(titles || title) && (
            <h3
              className={`inter-bold print-bolds text-left ${
                rowlist <= 4
                  ? "text-[10px] 2xl:text-[12px]"
                  : rowlist <= 6
                  ? "text-[10px] 2xl:text-[14px]"
                  : "text-[10px] 2xl:text-[14px]"
              }`}
            >
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
          {meeting_note && (
            <p
              className={`text-left print-bolds inter-bold ${
                rowlist <= 4
                  ? "text-[10px] 2xl:text-[12px]"
                  : rowlist <= 6
                  ? "text-[10px] 2xl:text-[12px]"
                  : "text-[10px] 2xl:text-[12px]"
              }`}
            >
              {/* {meeting_note} */}
              {/* {rowlist <= 4
                ? meeting_note.substring(0, 40) + " ..."
                : meeting_note} */}
              {rowlist <= 3
                ? meeting_note.substring(0, 35) + " ..."
                : rowlist <= 5
                ? meeting_note.substring(0, 70) + " ..."
                : meeting_note}
            </p>
          )}
          {office_note && (
            <p
              className={`text-left print-text inter-regular ${
                rowlist <= 3
                  ? "hidden"
                  : rowlist <= 6
                  ? "text-[10px] 2xl:text-[12px]"
                  : "text-[10px] 2xl:text-[12px]"
              }`}
            >
              {/* {office_note} */}
              {rowlist <= 5
                ? office_note.substring(0, 25) + " ..."
                : office_note}
            </p>
          )}
        </div>
      </div>

      {/* ----------------Modal--------------- */}
      {showModal && !adjust && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="pt-8 rounded relative">
            <EditEventtest
              onClose={closeModal}
              idParams={link}
              fetchDatas={data}
            />
          </div>
        </div>
      )}
      {showModal && adjust && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="pt-8 rounded relative">
            <EditEventOffice
              onClose={closeModal}
              idParams={link}
              fetchDatas={data}
              dates={date}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;
