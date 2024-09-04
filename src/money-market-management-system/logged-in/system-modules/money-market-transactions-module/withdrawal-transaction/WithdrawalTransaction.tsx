import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import ClientWithdrawalPaymentTabs from "./WithdrawalTransactionTabs";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import MODAL_NAMES from "../../../dialogs/ModalName";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import showModalFromId from "../../../../../shared/functions/ModalShow";

export interface IClientWithdrawalPaymentData {
  index: number;
  reference: string;
  amount: number;
  amountDisplay: string;
  transactionDate: string;
  bank: string;
  allocation: string;
  allocatedBy: string;
  allocationApprovedBy: string;
  transactionStatus: string;
}

const WithdrawalTransaction = observer(() => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("transaction-queue-tab");
  const [loading, setLoading] = useState(false);

  const recordWithdrawal = () => {
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_MODAL);
  };

  const transactions = store.withdrawalTransaction.all;

  const transactionQueueData = transactions.sort((a, b) => {
    const dateA = new Date(a.asJson.transactionDate || 0);
    const dateB = new Date(b.asJson.transactionDate || 0);

    return dateB.getTime() - dateA.getTime();
  }).filter((u) => u.asJson.allocationStatus === "Draft").map((u) => {
    return u.asJson;
  });


  const recordCloseOutDistribution = () => {
    showModalFromId(MODAL_NAMES.BACK_OFFICE.CLOSE_MM_ACCOUNT);
  };

  useEffect(() => {
    const loadData = async () => {
      try {

        await api.withdrawalTransaction.getAll();
        await api.batches.getAll();
      } catch (error) {
        setLoading(false);
      }
    };
    loadData();
  }, [
    api.batches,
    api.withdrawalTransaction,
  ]);

  if (loading) return <LoadingEllipsis />;

  return (
    <ErrorBoundary>
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <Toolbar
              title="Client Withdrawals (Disinvestment)"
              rightControls={
                <div className="uk-margin-bottom">
                  <button
                    className="btn btn-primary"
                    onClick={recordWithdrawal}>
                    Record Withdrawal
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={recordCloseOutDistribution}>
                    Record Close Out
                  </button>
                </div>
              }
            />
            <hr />
          </div>
          <Toolbar
            rightControls={
              <div className="uk-margin-bottom">
                <ClientWithdrawalPaymentTabs
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
              </div>
            }
          />
          <ErrorBoundary>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              {selectedTab === "transaction-queue-tab" &&
                <>{transactionQueueData.length}</>
              }
              {selectedTab === "first-level-approval-tab" &&
                <></>
              }
              {selectedTab === "second-level-approval-tab" &&
                <></>
              }
              {selectedTab === "payment-queue-tab" &&
                <>
                
                </>
              }
              {selectedTab === "batch-tab" &&
                <></>
              }
              {selectedTab === "processed-tab" &&
                <></>
              }
              {selectedTab === "deleted-tab" &&
                <></>
              }
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
});
export default WithdrawalTransaction;
