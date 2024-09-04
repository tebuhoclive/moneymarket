// ProgressBar.js
import React from 'react';
import './Progress.scss'; // Import the Sass file for styling

interface IProps {
  progress: number;
}

const ProgressBar = ({ progress }: IProps) => {
  return (
    <div className="new-progress">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default ProgressBar;
