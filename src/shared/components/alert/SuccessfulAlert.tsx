import React from "react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import "./SuccessfulAlert.scss";

interface AlertProps {
  heading?: string;
  message?: string;
  buttonText?: string;
  onOkay?: () => void;
}

const SuccessfulAlert: React.FC<AlertProps> = (props) => {
  return (
    <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <div className="successful-alert">
        <div className="content">
          <div className="heading">
            <CheckCircleOutlineIcon style={{ fontSize: "40px", color: "green" }} />
            <h3>Successful</h3>
          </div>
          <h4>You have successfully {props.message}</h4>
          <div className="alert-buttons">
            <button onClick={props.onOkay}>
              {props.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessfulAlert;