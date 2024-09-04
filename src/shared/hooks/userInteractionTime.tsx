import { useEffect, useState, useRef } from 'react';

const useInactivityTimer = (timeout: number = 10000) => {
    const [isInactive, setIsInactive] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleUserActivity = () => {
            setIsInactive(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                setIsInactive(true);
            }, timeout);
        };

        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        events.forEach(event => window.addEventListener(event, handleUserActivity));

        handleUserActivity(); // Initialize the timer

        return () => {
            events.forEach(event => window.removeEventListener(event, handleUserActivity));
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeout]);

    return isInactive;
};

export default useInactivityTimer;
