import React, { ChangeEvent, useState } from "react";

interface DaySelectProps {
  value:string;
  onChange: (selectedDay: string) => void;
}

const DaySelectorAuthorise: React.FC<DaySelectProps> = ({ onChange }) => {
  const [selectedDay, setSelectedDay] = useState<string>("");

  const handleDayChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedDay(selectedValue);
    onChange(selectedValue); // Call the parent component's onChange callback
  };

  const options: JSX.Element[] = [];

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
        {i}
        {daySuffix}
      </option>
    );
  }

  return (
    <div>
      <label htmlFor="daySelect">Select a Day:</label>
      <select id="daySelect" className="uk-select uk-form-small" value={selectedDay} onChange={handleDayChange}>
        <option value="">Select a day</option>
        {options}
      </select>
    </div>
  );
};

export default DaySelectorAuthorise;

