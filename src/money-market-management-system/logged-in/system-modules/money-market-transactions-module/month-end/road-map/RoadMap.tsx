import React from 'react';
import './RoadMap.scss';
import UpdateIcon from '@mui/icons-material/Update';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatementIcon from '@mui/icons-material/Description';

const steps = [
    { label: 'Update Interest', icon: <UpdateIcon style={{ color: "#fff" }} data-uk-tooltip="Here we update the total interest accrued for the month." /> },
    { label: 'Initiate', icon: <CalendarMonthIcon style={{ color: "#fff" }} data-uk-tooltip="In this step, you initiate the month. A record will be created to make provisions for the accounts to be processed." /> },
    { label: 'Run Month', icon: <PlayArrowIcon style={{ color: "#fff" }} data-uk-tooltip="In this step, all active money market accounts will be processed." /> },
    { label: 'Report', icon: <ReportIcon style={{ color: "#fff" }} data-uk-tooltip="In this step, you will see a comprehensive report displaying totals per fund and listing all processed accounts." /> },
    { label: 'Complete', icon: <CheckCircleIcon style={{ color: "#fff" }} data-uk-tooltip="In this step, the system will create a capitalized transaction and compute the balance for the next opening month." /> },
    { label: 'Statement Run', icon: <StatementIcon style={{ color: "#fff" }} data-uk-tooltip="The final step of the month-end process is to initiate the statement run, where all clients will receive their statements via email." /> }
];

const RoadMap = () => {
    return (
        <div className="page uk-section uk-section-small">
            <div className="road-map-container">
                <div className="road-map">
                    <h3 className="main-title-md text-to-break">Month End Roadmap</h3>
                    <div className="stepper">
                        {steps.map((step, index) => (
                            <div className="step" key={index}>
                                <div className="step-icon">{step.icon}</div>
                                <div className="step-label">{step.label}</div>
                                {index < steps.length - 1 && <div className="step-connector"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoadMap;
