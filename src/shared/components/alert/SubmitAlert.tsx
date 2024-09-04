import React from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import "./SubmitAlert.scss";
interface AlertProps {
  heading?: string;
  message?: string;
  onCancel?: () => void;
  onYes?: () => void;
  submitLoading: boolean;
}

const SubmitAlert: React.FC<AlertProps> = (props) => {
  return (
    <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <div className="submit-alert">
        <div className="heading">
          <WarningAmberIcon style={{ fontSize: "23px", color: "yellow" }} />
          <h3>Warning!</h3>
        </div>
        <h4>Are you sure you want to {props.message}?</h4>
        <div className="alert-buttons">
          <button
            className="button-yes"
            onClick={props.onYes}
            disabled={props.submitLoading}
          >
            {props.submitLoading ? (
              <>
                Yes <svg className="custom-spinner" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </>
            ) : (
              "Yes"
            )}
          </button>
          <button
            className="button-cancel"
            onClick={props.onCancel}
            disabled={props.submitLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitAlert;