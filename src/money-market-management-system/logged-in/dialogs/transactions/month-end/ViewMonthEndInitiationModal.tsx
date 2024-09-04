import { useEffect, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { initiateMonthEnd } from "../../../../../shared/functions/transactions/MonthEndRunFunctions";
import swal from "sweetalert";
import { CustomOpenAccordion } from "../../../../../shared/components/accordion/Accordion";
import { IMonthEndRun, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";


interface IProps {
  setIsVisible: (show: boolean) => void;
}

const ViewMonthEndInitiationModal = observer(({ setIsVisible }: IProps) => {

  const { api, store } = useAppContext();

  const [loading, setLoading] = useState<boolean>(false);

  const monthEnd = store.monthEndRun.selected;
  const [monthEndRun, setMonthEndRun] = useState<IMonthEndRun>({ ...defaultMonthEndRun });

  const onCancel = () => {
    setIsVisible(false);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
    store.monthEndRun.clearSelected();
  };

  const products = store.product.all;
  const moneyMarketAccounts = store.mma.all;

  const getTotalAccounts = (productCode: string) => {
    const accounts = moneyMarketAccounts.filter(accounts => accounts.asJson.accountType === productCode).length;
    return accounts;
  }

  const handleUpdateMonthEndRun = () => {

    swal({
      icon: "warning",
      text: 'Are you sure you want to initiate the Month End Run?',
      buttons: ["Cancel", "Initiate"],
      dangerMode: true,
    }).then(async (edit) => {
      setLoading(true);
      if (edit && monthEnd) {
        try {
          // initiateMonthEnd(monthEnd, api);
        } catch (error) {

        }
        swal({
          icon: "success",
          text: "Month End Run has been initiated",
        });
        onCancel();
      }
    });
  };



  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          type="button"
          data-uk-close
        ></button>
        <h3 className="main-title-sm text-to-break">
          Month-end Run (In-Progress)
        </h3>
        <hr />
        {
          monthEnd && <div className="dialog-content uk-position-relative">

            <div className="uk-grid">
              <div className="uk-width-1-3 uk-margin-top">
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-2">Month End Date:</p>
                  <p className="uk-text-italic uk-width-1-2">{dateFormat_YY_MM_DD(monthEnd.date)}</p>
                </div>
                <hr className="uk-width-1-1" />
                <div className="uk-grid">
                  <p className="uk-text-bold uk-width-1-2">Run Status:</p>
                  <p className="uk-text-italic uk-width-1-2">{monthEnd.status}</p>
                </div>
              </div>

              <div className="uk-width-expand">
                <form className="uk-grid uk-grid-small"
                  data-uk-grid>
                  <div className="uk-form-controls uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="">
                      Month-End Date
                    </label>
                    <input
                      className="uk-input uk-form-small" type="date" name="" id=""
                      min={dateFormat_YY_MM_DD(Date.now())}
                      defaultValue={dateFormat_YY_MM_DD(monthEnd.date)}
                      onChange={(e) => setMonthEndRun({ ...monthEndRun, date: e.target.valueAsNumber })}
                    />
                  </div>
                </form>
              </div>

            </div>

            <div className="uk-grid">
              <div className="uk-width-1-1">

                <CustomOpenAccordion title={"Total Accounts Per Product"}>
                  <table className="uk-table">
                    <thead>
                      <tr>
                        <th>Product Code</th>
                        <th>Product Name</th>
                        <th>Total Accounts</th>
                        <th>Balance</th>
                      </tr>
                    </thead>

                    <tbody>
                      {
                        products.map(product => (
                          <tr key={product.asJson.id}>
                            <td>{product.asJson.productName}</td>
                            <td>{product.asJson.productCode}</td>
                            <td>{getTotalAccounts(product.asJson.productCode)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </CustomOpenAccordion>

              </div>
            </div>

            <div className="uk-grid">
              <div className="uk-width-1-1">
                <button className="btn btn-primary" type="button" onClick={handleUpdateMonthEndRun}>
                  Update  {" "}
                  {loading && <div className="uk-margin-small-left" data-uk-spinner={"ratio:.5"}></div>}
                </button>
                <button className="btn btn-danger" type="button" onClick={onCancel}>
                  Cancel
                </button>
              </div>
            </div>

          </div>
        }
      </div>
    </ErrorBoundary>
  );
});

export default ViewMonthEndInitiationModal;
