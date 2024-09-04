import { observer } from "mobx-react-lite";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import "./HeadsUpAlert.scss";
import InfoIcon from '@mui/icons-material/Info';

const WithdrawalHeadsUp = observer(() => {
  return (
    <>
   <ErrorBoundary>
        <div className="heads-up-alert">
          <div>
            <InfoIcon />
            <h3>Heads Up!</h3>
          </div>
          <div>What kind of withdrawal would you like to do?</div>
        </div>
      </ErrorBoundary>
    </>
  );
});
export default WithdrawalHeadsUp;
