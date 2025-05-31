import React from 'react';

// Sample data
const schedule = [
  { id: 1, name: 'Dr. Smith', start_time: '09:00' },
  { id: 2, name: 'Dr. Jones', start_time: '10:00' },
  { id: 2, name: 'Dr. Jones', start_time: '10:00' },
  { id: 1, name: 'Dr. Smith', start_time: '10:15' }, 
  { id: 1, name: 'Dr. Smith', end_time: '09:30' },
  // More items...
];

// Helper function to combine times
const combineTimes = (entries) => {
  let combined = {};
  entries.forEach(entry => {
    if (entry.start_time) combined.start_time = entry.start_time;
    if (entry.end_time) combined.end_time = entry.end_time;
  });
  return combined;
};

// Group schedule by surgeon ID and combine times
const getUniqueSchedule = (schedule) => {
  const grouped = schedule.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = { ...item };
    } else {
      acc[item.id] = { ...acc[item.id], ...combineTimes([acc[item.id], item]) };
    }
    return acc;
  }, {});

  return Object.values(grouped);
};

const renderScheduleWithCollapsing = (surgeon) => {
  return (
    <div key={surgeon.id}>
      <h2>{surgeon.name}</h2>
      <p>Start Time: {surgeon.start_time || 'N/A'}</p>
      <p>End Time: {surgeon.end_time || 'N/A'}</p>
      {/* Add more rendering logic here */}
    </div>
  );
};

const ScheduleComponent = () => {
  const uniqueSchedule = getUniqueSchedule(schedule);

  return (
    <div>
      {uniqueSchedule.map(surgeon => renderScheduleWithCollapsing(surgeon))}
    </div>
  );
};

export default ScheduleComponent;
