import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import swal from "sweetalert";
import Select from "react-select";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import "./HeadsUpAlert.scss";
import InfoIcon from '@mui/icons-material/Info';

const RecordDepositModal = observer(() => {
  return (
    <>
   <ErrorBoundary>
        <div className="heads-up-alert">
          <div>
            <InfoIcon />
            <h3>Heads Up!</h3>
          </div>
          <div>What kind of deposit would you like to do?</div>
        </div>
      </ErrorBoundary>
    </>
  );
});
export default RecordDepositModal;
