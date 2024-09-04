// ProgressBar.js
import "./ProgressBar.scss"

import React from 'react';

interface ProgressBarProps {
  totalItems: number;
  progress: number;
  title?: string; // Make the title optional
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalItems, progress, title }) => {


  return (
    <div className="progressBar">
      {title && <div className="main-title-sm">{title}</div>}
      <div className="progressBar__bar">
        <div
          className="progressBar__fill"
          style={{ width: `${progress}%` }}
        >
          <p className="progress-view"></p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
