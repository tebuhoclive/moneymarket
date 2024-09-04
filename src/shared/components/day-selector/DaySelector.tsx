import { observer } from "mobx-react-lite";
import React, { ChangeEvent, useState } from "react";

interface DaySelectProps {
    onChange: (selectedDay: string) => void;
  }
  
const DaySelector = observer((props:DaySelectProps) => {
    const [selectedDay, setSelectedDay] = useState<string>("");

    const {onChange} = props;

    const handleDayChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedDay(selectedValue);
        onChange(selectedValue); // Call the parent component's onChange callback
    };
    const options = [];

    for (let i = 1; i <= 31; i++) {
        let daySuffix: string;

        if (i === 1 || i === 21 || i === 31) {
            daySuffix = "st";
        } else if (i === 2 || i === 22) {
            daySuffix = "nd";
        } else if (i === 3 || i === 23) {
            daySuffix = "rd";
        } else {
            daySuffix = "th";
        }

        options.push(
            <option key={i} value={i}>
              {  `Every ${i} ${daySuffix} day of the month`}
            </option>
        );
    }

    return (
        <div>
            <select id="daySelect" className="uk-select uk-width-1-2" value={selectedDay} onChange={handleDayChange}>
                <option value="">Select a day</option>
                {options}
                <option>Every last day of the month</option>
            </select>
        </div>
    );
});

export default DaySelector;

