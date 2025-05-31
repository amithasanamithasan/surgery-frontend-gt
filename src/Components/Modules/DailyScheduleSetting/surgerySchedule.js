// import React, { useState, useEffect } from 'react';
// import dayjs from 'dayjs';
// import isBetween from 'dayjs/plugin/isBetween';
// import advancedFormat from 'dayjs/plugin/advancedFormat';
// import duration from 'dayjs/plugin/duration';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import { AxiosAuthInstance } from "../../../AxiosInterceptors";
// import Constant from "../../../Constant";
// import EventCard from './EventCard';

// dayjs.extend(isBetween);
// dayjs.extend(duration);
// dayjs.extend(advancedFormat);

// const SurgerySchedule = () => {
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [schedule, setSchedule] = useState([]);
//   const [earliestStartTime, setEarliestStartTime] = useState("");
//   const [latestEndTime, setLatestEndTime] = useState("");
//   const [timeSlots, setTimeSlots] = useState([]);
//   const daysInMonth = selectedDate.daysInMonth();
//   const daysArray = Array.from({ length: daysInMonth }, (_, index) => selectedDate.startOf('month').add(index, "day"));
//   const [visibleStartIndex, setVisibleStartIndex] = useState(selectedDate.date() - 1);

//   const handleDateSelect = (date) => {
//     setSelectedDate(date);
//   };

//   const scrollLeft = () => {
//     setVisibleStartIndex(prev => Math.max(prev - 15, 0));
//   };

//   const scrollRight = () => {
//     setVisibleStartIndex(prev => Math.min(prev + 15, daysInMonth - 15));
//   };

//   const parseEventTimes = (start_time, end_time, selectedDate) => {
//     const startDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${start_time}`, "YYYY-MM-DDTHH:mm:ss");
//     const endDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${end_time}`, "YYYY-MM-DDTHH:mm:ss");

//     if (startDateTime.isValid() && endDateTime.isValid()) {
//       return {
//         start_time: startDateTime.format('HH:mm:ss'),
//         end_time: endDateTime.format('HH:mm:ss'),
//       };
//     } else {
//       console.error(`Invalid date for event start_time: ${start_time} or end_time: ${end_time}`);
//       return {
//         start_time: 'Invalid Time',
//         end_time: 'Invalid Time',
//       };
//     }
//   };

//   useEffect(() => {
//     const fetchScheduleForDate = async () => {
//       setSchedule([]);
//       try {
//         const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/daily-schedule-data`, {
//           params: { event_date: selectedDate.format('YYYY-MM-DD') },
//         });

//         console.log('Schedule response:', response.data);

//         const formattedSchedule = response.data.schedule.map(surgeon => ({
//           surgeon: surgeon.surgeon,
//           events: surgeon.events.map(event => {
//             const { start_time, end_time } = parseEventTimes(event.start_time, event.end_time, selectedDate);
//             return {
//               ...event,
//               start_time,
//               end_time,
//             };
//           })
//         }));

//         console.log('Formatted Schedule:', formattedSchedule);
//         setSchedule(formattedSchedule);

//         // const parsedStart = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${response.data.earliest_start_time}`, "YYYY-MM-DDTHH:mm:ss");
//         // const parsedEnd = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${response.data.latest_end_time}`, "YYYY-MM-DDTHH:mm:ss");

//         const parsedStart = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${response.data.office_time_slots[0].start_time}`, "YYYY-MM-DDTHH:mm:ss");
//         const parsedEnd = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${response.data.office_time_slots[0].end_time}`, "YYYY-MM-DDTHH:mm:ss").add(15, 'minute');

//         if (parsedStart.isValid() && parsedEnd.isValid()) {
//           setEarliestStartTime(parsedStart.format('HH:mm:ss'));
//           setLatestEndTime(parsedEnd.format('HH:mm:ss'));
//           setTimeSlots(generateTimeSlots(parsedStart, parsedEnd));
//         } else {
//           console.error("Invalid start or end time", { parsedStart, parsedEnd });
//         }
//       } catch (error) {
//         console.error("Error fetching schedule:", error);
//         setSchedule([]);
//       }
//     };

//     fetchScheduleForDate();
//   }, [selectedDate]);

//   const generateTimeSlots = (start, end) => {
//     let slots = [];
//     let current = start.clone();
//     const endTime = end.clone();

//     while (current.isBefore(endTime)) {
//       slots.push(current.format('HH:mm:ss'));
//       current = current.add(15, 'minute');
//     }

//     console.log("Generated Time Slots:", slots);
//     return slots;
//   };

//   const renderScheduleWithCollapsing = (time, surgeon) => {
//     const event_date = dayjs(surgeon.events.event_date).format('YYYY-MM-DD');
//     const eventAtTime = surgeon.events.find(scheduleEvent => {
//       const format = 'HH:mm:ss';
//       const startTime = dayjs(`${event_date} ${scheduleEvent.start_time}`, format).add(-1, 'minute');
//       const checkTime = dayjs(`${event_date} ${time}`, format);
//       const endTime = dayjs(`${event_date} ${scheduleEvent.end_time}`, format).add(1, 'minute');

//       const result = checkTime.isBetween(startTime, endTime);
//       return result;
//     });

//     console.log('Event found:', eventAtTime);

//     if (eventAtTime) {
//       const eventStart = dayjs(`${event_date} ${eventAtTime.start_time}`, 'HH:mm:ss');
//       const eventEnd = dayjs(`${event_date} ${eventAtTime.end_time}`, 'HH:mm:ss');
//       const durationInMinutes = eventEnd.diff(eventStart, 'minute');
//       const rowSpan = Math.ceil(durationInMinutes / 15);

//       console.log('Rendering event:', rowSpan);
//       // console.log('Row span:', rowSpan);

//       return (
//         <td
//           key={eventAtTime.id}
//           // rowSpan={rowSpan}
//           className="py-2 px-4 border-b text-center"
//         >
//           <EventCard
//             color="lightblue"
//             title={eventAtTime.procedure || eventAtTime.event_note}
//             subtitle={`${eventAtTime.patient_first_name || ''} ${eventAtTime.patient_last_name || ''}`}
//             description={`MRN: ${eventAtTime.patient_mrn || ''}, Case Number: ${eventAtTime.case_number || ''}`}
//             link={`/edit-event/${eventAtTime.id}`}
//             border=''
//           // height={`${rowSpan * 50}px`}
//           />
//         </td>
//       );
//     } else {
//       return <td key={`${time}-${surgeon.surgeon}`} className="py-2 px-4 border-b text-center"></td>;
//     }
//   };

//   return (
//     <>
//       <div className="surgery-schedule relative">
//         <div className="flex bg-white rounded-xl py-4 px-20 justify-between overflow-hidden">
//           <FontAwesomeIcon
//             icon={faAngleLeft}
//             size="xl"
//             className="item border-2 border-black px-2 py-1 rounded-md inter-medium content-center cursor-pointer"
//             onClick={scrollLeft}
//           />
//           {daysArray.slice(visibleStartIndex, visibleStartIndex + 15).map((date, index) => (
//             <div
//               key={date.format('YYYY-MM-DD')}
//               className={`item border-2 border-black px-2 py-1 rounded-md inter-medium text-[14px] content-center ${date.isSame(selectedDate, "day") ? "active" : ""}`}
//               onClick={() => handleDateSelect(date)}
//             >
//               {date.format("MM/DD")}
//             </div>
//           ))}
//           <FontAwesomeIcon
//             icon={faAngleRight}
//             size="xl"
//             className="item border-2 border-black px-2 py-1 rounded-md inter-medium content-center cursor-pointer"
//             onClick={scrollRight}
//           />
//         </div>
//       </div>

//       <div className="w-[1400px] mx-auto py-3 relative pt-10 mb-10">
//         <div className="bg-white w-100 px-10 rounded-md pt-5 pb-10 shadow-md border-[1px] border-gray-200">
//           <table className="table-fixed w-full border-collapse border border-gray-300">
//             <thead>
//               <tr>
//                 <th className="border border-gray-300 p-2 text-center">Time</th>
//                 {schedule.map(surgeon => (
//                   <th key={surgeon.surgeon} className="border border-gray-300 p-2 text-center">{surgeon.surgeon}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {timeSlots.map(time => (
//                 <tr key={time}>
//                   <td className="border border-gray-300 p-2 text-center">{time}</td>
//                   {schedule.map(surgeon => renderScheduleWithCollapsing(time, surgeon))}
//                 </tr>
//               ))}

//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SurgerySchedule;


// //