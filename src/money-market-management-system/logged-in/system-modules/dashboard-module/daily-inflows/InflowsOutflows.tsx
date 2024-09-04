import { useEffect, useState } from "react";

import swal from "sweetalert";

import MODAL_NAMES from "../../../dialogs/ModalName";
import DepositIndividualModal from "../../../dialogs/transactions/deposit-to-asset-manager/DepositIndividualModal";
import WithdrawalIndividualCorporateModal from "../../../dialogs/transactions/withdrawal-from-asset-manager/WithdrawalIndividualModal";
import DepositCorporateModal from "../../../dialogs/transactions/deposit-to-asset-manager/DepositCorporateModal";

import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import TransactionInflowModel from "../../../../../shared/models/TransactionInflowModel";
import TransactionOutflowModel from "../../../../../shared/models/TransactionOutflowModel";
import Modal from "../../../../../shared/components/Modal";

const InflowsOutflows = () => {
  const { api, store } = useAppContext();
  const user = store.auth.meJson;
  const [loading, setLoading] = useState(false);

  // Get the current date and time as a timestamp (in milliseconds)
  const currentTimeStamp = Date.now();

  // Get the start of the current day (midnight) as a timestamp
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayTimeStamp = startOfDay.getTime();

  // Get the end of the current day (11:59:59.999 PM) as a timestamp
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayTimeStamp = endOfDay.getTime();

  const inflows = store.inflow.all.filter(
    (today) =>
      today.asJson.transactionDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.status === "running"
  );
  const outflows = store.outflow.all.filter(
    (today) =>
      today.asJson.transactionDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.status === "running"
  );

  // Create separate arrays for each product in-flow
  const individualInflows: TransactionInflowModel[] = [];
  const corporateInflows: TransactionInflowModel[] = [];
  const taxFreeInflows: TransactionInflowModel[] = [];

  // Create separate arrays for each product out-flow
  const individualOutflows: TransactionOutflowModel[] = [];
  const corporateOutflows: TransactionOutflowModel[] = [];
  const taxFreeOutflows: TransactionOutflowModel[] = [];
  const hasAssetManagerFlowPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Asset Manager Flows" && feature.create === true
  );
  inflows.forEach((inflow) => {
    const product = inflow.asJson.product;
    switch (product) {
      case "oU2sIjtXHAJnslqFqw8Y":
        individualInflows.push(inflow);
        break;
      case "1AxqDiOAwMf0WPKjMib8":
        corporateInflows.push(inflow);
        break;
      case "lLgaoiwKyYlJPfnCE0nD":
        taxFreeInflows.push(inflow);
        break;
      default:
        break;
    }
  });

  outflows.forEach((outflow) => {
    const product = outflow.asJson.product;
    switch (product) {
      case "oU2sIjtXHAJnslqFqw8Y":
        individualOutflows.push(outflow);
        break;
      case "1AxqDiOAwMf0WPKjMib8":
        corporateOutflows.push(outflow);
        break;
      case "lLgaoiwKyYlJPfnCE0nD":
        taxFreeOutflows.push(outflow);
        break;
      default:
        break;
    }
  });

  // Calculate total amounts for each product in-flow
  const individualInflowsTotalAmount = individualInflows.reduce(
    (sum, inflow) => sum + inflow.asJson.amount,
    0
  );
  const corporateInflowsTotalAmount = corporateInflows.reduce(
    (sum, inflow) => sum + inflow.asJson.amount,
    0
  );
  const taxFreeInflowTotalAmount = taxFreeInflows.reduce(
    (sum, inflow) => sum + inflow.asJson.amount,
    0
  );

  // Calculate total amounts for each product out-flow
  const individualOutflowsTotalAmount = individualOutflows.reduce(
    (sum, outflow) => sum + outflow.asJson.amount,
    0
  );
  const corporateOutflowsTotalAmount = corporateOutflows.reduce(
    (sum, outflow) => sum + outflow.asJson.amount,
    0
  );
  const taxFreeOutflowsTotalAmount = taxFreeOutflows.reduce(
    (sum, outflow) => sum + outflow.asJson.amount,
    0
  );

  // Calculate net amounts for each product inflow and out-flow
  const individualNetTotalAmount =
    individualInflowsTotalAmount - individualOutflowsTotalAmount;
  const corporateNetTotalAmount =
    corporateInflowsTotalAmount - corporateOutflowsTotalAmount;
  const taxFreeNetTotalAmount =
    taxFreeInflowTotalAmount - taxFreeOutflowsTotalAmount;

  // Calculate the total sum of all product amounts in-flow
  const totalInflowSum =
    individualInflowsTotalAmount +
    corporateInflowsTotalAmount +
    taxFreeInflowTotalAmount;

  // Calculate the total sum of all product amounts out-flow
  const totalOutflowSum =
    individualOutflowsTotalAmount +
    corporateOutflowsTotalAmount +
    taxFreeOutflowsTotalAmount;

  // Calculate the total sum of all product amounts out-flow
  const netFlowSum = totalInflowSum - totalOutflowSum;

  // const viewIndividualInflowTransactions = () => {
  //   showModalFromId(MODAL_NAMES.INFLOWS.INDIVIDUAL_INFLOW_TRANSACTIONS_MODAL);
  // };

  const onDepositToAssetManager = () => {
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.DEPOSIT_TO_ASSET_MANAGER
        .INDIVIDUAL_CORPORATE_MODAL
    );
  };

  const onDepositToAssetManagerCorporate = () => {
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.DEPOSIT_TO_ASSET_MANAGER.CORPORATE_MODAL
    );
  };

  const onWithdrawFromAssetManager = () => {
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.WITHDRAW_FROM_ASSET_MANAGER
        .INDIVIDUAL_CORPORATE_MODAL
    );
  };
  const onWithdrawFromAssetManagerCorporate = () => {
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.WITHDRAW_FROM_ASSET_MANAGER
        .INDIVIDUAL_CORPORATE_MODAL
    );
  };

  useEffect(() => {
    const loadDailyFlows = async () => {
      setLoading(true);
      try {
        await api.inflow.getAll();
        await api.outflow.getAll();
      } catch (error) {
        swal({
          icon: "Error",
          text: "Could not load the data from the database",
        });
      }
      setLoading(false);
    };
    loadDailyFlows();
  }, [api.inflow, api.outflow, api.product]);
  return (
    <ErrorBoundary>
      <div className="uk-overflow-auto" style={{overflow:"scroll"}}>
        <table
          className="uk-table uk-table-small uk-table-divider kit-table uk-table-responsive"
          style={{ width: "100%",overflow:"scroll" }}
        >
          <thead>
            <tr>
              <th>Product</th>
              <th>
                Inflows <span uk-icon="arrow-down"></span>
              </th>
              <th>
                Outflows <span uk-icon="arrow-up"></span>
              </th>
              <th>
                Net <span uk-icon="arrow-up"></span>
                <span uk-icon="arrow-down"></span>
              </th>
              {hasAssetManagerFlowPermission && (
                <th>Action{/* <span uk-icon="file-edit"></span> */}</th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Individual</td>
              <td>{(individualInflowsTotalAmount)}</td>
              <td>{(individualOutflowsTotalAmount)}</td>
              <td>{(individualNetTotalAmount)}</td>
              {hasAssetManagerFlowPermission && (
                <td>
                  <>
                    {individualNetTotalAmount > 0 ? (
                      <button
                        className="btn btn-primary"
                        onClick={onDepositToAssetManager}
                      >
                        Deposit to Asset Manager
                      </button>
                    ) : individualNetTotalAmount < 0 ? (
                      <button
                      style={{ color: "white" }}
                        className="btn btn-primary"
                        onClick={onWithdrawFromAssetManager}
                      >
                        Withdraw from Asset Manager
                      </button>
                    ) : (
                      <button className="btn btn-primary" disabled>
                        Deposit/Withdraw
                      </button>
                    )}
                  </>
                </td>
              )}
            </tr>

            <tr>
              <td>Corporate</td>
              <td>{(corporateInflowsTotalAmount)}</td>
              <td>{(corporateInflowsTotalAmount)}</td>
              <td>{(corporateNetTotalAmount)}</td>

              {/* <td> */}
              {/* <button className="btn btn-primary uk-display-block">
                  Deposit to Assest Manager
                </button> */}
              {/* <>
                  {corporateNetTotalAmount > 0 && (
                    <button className="btn btn-primary uk-display-block">
                      Deposit to Assest Manager
                    </button>
                  )}
                  {corporateNetTotalAmount < 0 && (
                    <button className="btn btn-primary uk-display-block">
                      Withdraw from Assest Manager
                    </button>
                  )}
                  {corporateNetTotalAmount === 0 && (
                    <button
                      className="btn btn-primary uk-display-block"
                      disabled
                    >
                      Deposit/Withdraw
                    </button>
                  )}
                </> */}
              {/* </td> */}

              {hasAssetManagerFlowPermission && (
                <td>
                  <>
                    {corporateNetTotalAmount > 0 && (
                      <button
                        className="btn btn-primary uk-display-block"
                        onClick={onDepositToAssetManagerCorporate}
                      >
                        Deposit to Asset Manager
                      </button>
                    )}
                    {corporateNetTotalAmount < 0 && (
                      <button
                        className="btn btn-primary uk-display-block"
                        onClick={onWithdrawFromAssetManagerCorporate}
                      >
                        Withdraw from Asset Manager
                      </button>
                    )}
                    {corporateNetTotalAmount === 0 && (
                      <button
                        className="btn btn-primary uk-display-block"
                        disabled
                      >
                        Deposit/Withdraw
                      </button>
                    )}
                  </>
                </td>
              )}
            </tr>
            <tr>
              <td>Tax Free (Institutional) </td>
              <td>{(taxFreeInflowTotalAmount)}</td>
              <td>{(taxFreeOutflowsTotalAmount)}</td>
              <td>{(taxFreeNetTotalAmount)}</td>

              {/* <td>
                <button className="btn btn-primary uk-display-block">
                  Deposit to Assest Manager
                </button>
                <>
                  {taxFreeNetTotalAmount > 0 && (
                    <button className="btn btn-primary uk-display-block">
                      Deposit to Assest Manager
                    </button>
                  )}
                  {taxFreeNetTotalAmount < 0 && (
                    <button className="btn btn-primary uk-display-block">
                      Withdraw from Assest Manager
                    </button>
                  )}
                  {taxFreeNetTotalAmount === 0 && (
                    <button
                      className="btn btn-primary uk-display-block"
                      disabled
                    >
                      Deposit/Withdraw
                    </button>
                  )}
                </>
              </td> */}

              {hasAssetManagerFlowPermission && (
                <td>
                  <>
                    {taxFreeNetTotalAmount > 0 && (
                      <button className="btn btn-primary uk-display-block">
                        Deposit to Assest Manager
                      </button>
                    )}
                    {taxFreeNetTotalAmount < 0 && (
                      <button className="btn btn-primary uk-display-block">
                        Withdraw from Assest Manager
                      </button>
                    )}
                    {taxFreeNetTotalAmount === 0 && (
                      <button
                        className="btn btn-primary uk-display-block"
                        disabled
                      >
                        Deposit/Withdraw
                      </button>
                    )}
                  </>
                </td>
              )}
            </tr>
            <tr>
              <td>
                <b>Total</b>
              </td>
              <td>
                <b>{(totalInflowSum)}</b>
              </td>
              <td>
                <b>{(totalOutflowSum)}</b>
              </td>
              <td>
                <b>{(netFlowSum)}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.DEPOSIT_TO_ASSET_MANAGER
            .INDIVIDUAL_CORPORATE_MODAL
        }
      >
        <DepositIndividualModal
          inflows={individualInflowsTotalAmount}
          outflows={individualOutflowsTotalAmount}
          netflow={individualNetTotalAmount}
          transactions={individualInflows}
        />
      </Modal>
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.DEPOSIT_TO_ASSET_MANAGER.CORPORATE_MODAL
        }
      >
        <DepositCorporateModal
          inflows={corporateInflowsTotalAmount}
          outflows={corporateOutflowsTotalAmount}
          netflow={corporateNetTotalAmount}
          transactions={corporateInflows}
        />
      </Modal>
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.WITHDRAW_FROM_ASSET_MANAGER
            .INDIVIDUAL_CORPORATE_MODAL
        }
      >
        <WithdrawalIndividualCorporateModal
          inflows={individualInflowsTotalAmount}
          outflows={individualOutflowsTotalAmount}
          netflow={individualNetTotalAmount}
          transactions={individualOutflows}
        />
      </Modal>
    </ErrorBoundary>
  );
};

export default InflowsOutflows;
