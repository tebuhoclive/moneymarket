import React from 'react';
import './OfflinePage.scss';

export const OfflinePage = () => {
    return (
        <div className="offline-page">
            <div className="offline-content">
                <h1>Oops! You are offline</h1>
                <p>Please check your internet connection and try again.</p>
                <div className="offline-illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128">
                        <path fill="#fdd835" d="M32 5.333c-14.7 0-26.667 11.967-26.667 26.667 0 14.7 11.967 26.667 26.667 26.667s26.667-11.967 26.667-26.667C58.667 17.3 46.7 5.333 32 5.333zM32 55.333c-10.983 0-19.833-8.85-19.833-19.833S21.017 15.667 32 15.667 51.833 24.517 51.833 35.5 42.983 55.333 32 55.333z" />
                        <path fill="#424242" d="M32 41.833c-3.5 0-6.333-2.833-6.333-6.333s2.833-6.333 6.333-6.333 6.333 2.833 6.333 6.333-2.833 6.333-6.333 6.333zm0-9.667c-1.833 0-3.333 1.5-3.333 3.333s1.5 3.333 3.333 3.333 3.333-1.5 3.333-3.333-1.5-3.333-3.333-3.333z" />
                    </svg>
                </div>
                <button className="retry-button" onClick={() => window.location.reload()}>Retry</button>
            </div>
        </div>
    );
};
