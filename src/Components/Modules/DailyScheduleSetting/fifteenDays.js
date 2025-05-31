import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faPlus,
    faCheck,
    faTimes,
    faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import dayjs from 'dayjs';

const FifteenDays = () => {
    const [errors, setErrors] = useState({});

    const today = new Date();
    const fifteenDates = Array.from({ length: 15 }, (_, index) =>
        dayjs().subtract(index, "day")
    );

    const [selectedDate, setSelectedDate] = useState(today);

    const handleDateSelect = (date) => {

    };

    return (
        <>
            <div className="surgery-schedule relative">
                <div className="flex bg-white rounded-xl py-4 px-20 justify-between overflow-hidden">
                    <FontAwesomeIcon
                        icon={faAngleLeft}
                        size="xl"
                        className="item border-2 border-black px-[20px] py-1 rounded-md inter-medium content-center"
                    />
                    {fifteenDates.map((date, index) => (
                        <div
                            key={index}
                            className={`item border-2 border-black px-2 py-1 rounded-md inter-medium content-center ${date.isSame(selectedDate, "day") ? "active" : ""
                                }`}
                            onClick={() => handleDateSelect(date)}
                        >
                            {date.format("MM/DD")}
                        </div>
                    ))}
                    <FontAwesomeIcon
                        icon={faAngleRight}
                        size="xl"
                        className="item border-2 border-black py-1 rounded-md inter-medium content-center px-[20px]"
                    />
                </div>
            </div>
        </>
    );
}

export default FifteenDays;
