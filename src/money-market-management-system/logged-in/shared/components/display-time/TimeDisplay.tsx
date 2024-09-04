import React, { useEffect, useState } from 'react';
import './TimeDisplay.scss';

const TimeDisplay: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        // <div className="time-display">
        //     {time.getFullYear()}-{time.getMonth()}
        // </div>
        <></>
    );
};

export default TimeDisplay;
