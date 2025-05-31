import { useEffect, useState } from "react";

const SelectCompnent = ({ callTypes, idx, day, formData,  surgeons, onChange, setFormData }) => {
//  const [data, setFormData] = useState({});
//  console.log(surgeons)
  useEffect(() => {
    // Ensure formData[day] exists
    if (!formData[day]) {
        setFormData((prevData) => ({
        ...prevData,
        [day]: {},
      }));
    } else if (!formData[day]?.[callTypes[idx]]) {
      // Set the initial value in formData if not already set
      const initialSurgeon = surgeons.find((s) => s.id === formData[day]?.[callTypes[idx]]);
      if (initialSurgeon) {
        setFormData((prevData) => ({
          ...prevData,
          [day]: {
            ...prevData[day],
            [callTypes[idx]]: initialSurgeon.id,
          },
        }));
      }
    }
  }, [formData, surgeons, day, callTypes, idx, setFormData]);

  console.log(formData)

  return (
    <select
      name={callTypes[idx]}
      id={`surgeon-${callTypes[idx]}`}
      onChange={(e) => onChange(day, e)}
      value={formData[day]?.[callTypes[idx]] || ""} // Bind the value to the current selected value
      aria-label={`Surgeon ${callTypes[idx]}`}
    >
      <option value="">--</option>
      {surgeons.map((s) => (
        <option value={s.id} key={s.id}>
          {s.initial}
        </option>
      ))}
    </select>
  );
}

export default SelectCompnent;
