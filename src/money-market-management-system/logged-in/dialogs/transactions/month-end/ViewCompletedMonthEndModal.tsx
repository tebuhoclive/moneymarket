import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";

const MonthEndInitiationModal = observer(() => {
  const {  store } = useAppContext();

  const monthEnd = store.monthEndRun.selected;

  const individualAccounts = monthEnd?.processedAccounts.filter(accounts => accounts.accountType === "IJGMMS-L");
  const corporateAccounts = monthEnd?.processedAccounts.filter(accounts => accounts.accountType === "IJGCMMS-L");
  const taxAccounts = monthEnd?.processedAccounts.filter(accounts => accounts.accountType === "IJGIMMS-L");

  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
    store.monthEndRun.clearSelected();
  };

  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          type="button"
          data-uk-close
        ></button>
        <h3 className="main-title-sm text-to-break">
          Month-end Run
        </h3>
        <hr />
        {
          monthEnd && <div className="dialog-content uk-position-relative">
            <div className="uk-grid">
              <div className="uk-width-1-1 uk-margin-bottom">
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-5">Run Date:</p>
                  <p className="uk-text-italic">{dateFormat_YY_MM_DD(monthEnd.date)}</p>
                </div>
                <hr className="uk-width-1-3" />
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-5">Run Start Time:</p>
                  <p className="uk-text-italic">{monthEnd.runStartTime}</p>
                </div>
                <hr className="uk-width-1-3" />
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-5">Run End Time:</p>
                  <p className="uk-text-italic">{monthEnd.runEndTime}</p>
                </div>
                <hr className="uk-width-1-3" />
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-5">Time Elapsed:</p>
                  <p className="uk-text-italic">{monthEnd.runEndTime - monthEnd.runStartTime}</p>
                </div>
                <hr className="uk-width-1-3" />
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-5">Run Status:</p>
                  <p className="uk-text-italic">{monthEnd.status}</p>
                </div>
                <hr className="uk-width-1-3" />
              </div>
              <div className="uk-width-1-1">
                <table className="uk-table">
                  <thead>
                    <tr>
                      <th>Total IJG MMS Accounts</th>
                      <th>Total IJG CMMS Accounts</th>
                      <th>Total IJG IMMS Accounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{individualAccounts?.length}</td>
                      <td>{corporateAccounts?.length}</td>
                      <td>{taxAccounts?.length}</td>
                    </tr>
                  </tbody>
                </table>
                {/* <table className="uk-table">
                  <thead>
                    <tr>
                      <th>Total IJG MMS Interest</th>
                      <th>Total IJG CMMS Interest</th>
                      <th>Total IJG IMMS Interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{monthEnd.processedAccounts.length}</td>
                      <td>{monthEnd.processedAccounts.length}</td>
                      <td>{monthEnd.processedAccounts.length}</td>
                    </tr>
                  </tbody>
                </table> */}
              </div>
            </div>

          </div>
        }
      </div>
    </ErrorBoundary>
  );
});

export default MonthEndInitiationModal;
