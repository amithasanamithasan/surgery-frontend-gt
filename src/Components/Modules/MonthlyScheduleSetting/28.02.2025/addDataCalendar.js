import React, { useState } from "react";
import axios from "axios";

const MonthlyCallForm = () => {
    const [formData, setFormData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Get the current month and year from the selected date
    const currentMonth = selectedDate.getMonth(); // 0 is January
    const currentYear = selectedDate.getFullYear();

    // Get the first day of the month (0 is Sunday, 1 is Monday, etc.)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Get the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create an array with blanks for days before the first day, followed by the days of the month
    const daysArray = [
        ...Array(firstDayOfMonth).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Split daysArray into weeks of 7 days each
    const weeksArray = [];
    for (let i = 0; i < daysArray.length; i += 7) {
        weeksArray.push(daysArray.slice(i, i + 7));
    }

    const handleSelectChange = (day, event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [day]: {
                ...prevData[day],
                [name]: value,
            },
        }));
    };

    const handleSave = () => {
        // Save formData to Laravel backend
        axios.post("/api/save-monthly-call", { data: formData })
            .then(response => {
                alert("Data saved successfully!");
            })
            .catch(error => {
                console.error("Error saving data:", error);
            });
    };

    const handleMonthChange = (increment) => {
        const newDate = new Date(currentYear, currentMonth + increment, 1);
        setSelectedDate(newDate);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <button onClick={() => handleMonthChange(-1)}>←</button>
                <h2>
                    {selectedDate.toLocaleString("default", { month: "long" })} {currentYear}
                </h2>
                <button onClick={() => handleMonthChange(1)}>→</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
                    {weeksArray.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                            {week.map((day, dayIndex) => (
                                <td key={dayIndex}>
                                    {day ? (
                                        <div className="edit-select">
                                            <div className="border-2 border-black h-9 text-center w-9 rounded-md flex justify-center items-center">
                                                {day}
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <div className="text-[red] w-[50px]">1st</div>
                                                <div className="select-line"></div>
                                                <div className="sltc">
                                                    <select
                                                        name="fristdose"
                                                        onChange={(e) => handleSelectChange(day, e)}
                                                    >
                                                        <option style={{ display: "none" }}></option>
                                                        <option value="AN">AN</option>
                                                        <option value="BM">BM</option>
                                                        <option value="GM">GM</option>
                                                        <option value="NONE">NONE</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <div className="text-[red] w-[50px]">2nd</div>
                                                <div className="select-line"></div>
                                                <div className="sltc">
                                                    <select
                                                        name="seconddose"
                                                        onChange={(e) => handleSelectChange(day, e)}
                                                    >
                                                        <option style={{ display: "none" }}></option>
                                                        <option value="AN">AN</option>
                                                        <option value="BM">BM</option>
                                                        <option value="GM">GM</option>
                                                        <option value="NONE">NONE</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <div className="text-[red] w-[50px]">O AM</div>
                                                <div className="select-line"></div>
                                                <div className="sltc">
                                                    <select
                                                        name="oam"
                                                        onChange={(e) => handleSelectChange(day, e)}
                                                    >
                                                        <option style={{ display: "none" }}></option>
                                                        <option value="AN">AN</option>
                                                        <option value="BM">BM</option>
                                                        <option value="GM">GM</option>
                                                        <option value="NONE">NONE</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <div className="text-[red] w-[50px]">O PM</div>
                                                <div className="select-line"></div>
                                                <div className="sltc">
                                                    <select
                                                        name="opm"
                                                        onChange={(e) => handleSelectChange(day, e)}
                                                    >
                                                        <option style={{ display: "none" }}></option>
                                                        <option value="AN">AN</option>
                                                        <option value="BM">BM</option>
                                                        <option value="GM">GM</option>
                                                        <option value="NONE">NONE</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="edit-item pt-2">
                                                <p className="text-[14px]">
                                                    <span className="pe-5 text-[red]">Vac.</span>
                                                    <span className="px-2">BM</span>
                                                    <span className="px-2">JF</span>
                                                </p>
                                                <p className="text-[14px]">
                                                    <span className="pe-5 text-[red]">CME.</span>
                                                    <span className="px-0">RM</span>
                                                </p>
                                                <p className="text-[14px]">
                                                    <span className="pe-5 text-[red]">Sick</span>
                                                    <span className="px-2">AN</span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="empty-day"></div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default MonthlyCallForm;
