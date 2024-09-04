import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import TransactionsTabs from "./TransactionsTabs";
import "./Transactions.scss";
import Modal from "../../../../../../shared/components/Modal";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../../shared/functions/Context";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import WithdrawalModal from "../../../../dialogs/transactions/withdrawal-transaction/capture-amend-return/RecordWithdrawalModal";
import Toolbar, { ToolbarNew } from "../../../../shared/components/toolbar/Toolbar";
import WithdrawalTransactionModel, { WithdrawalTransactionStatus } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";

import { WithdrawalProcessedPaymentsGrid } from "../../withdrawal-transaction/queues/WithdrawalProcessedPaymentsGrid";
import { CorrectedWithdrawalTransactionsQueueGrid } from "../../withdrawal-transaction/queues/CorrectedWithdrawalTransactionsQueueGrid";
import WithdrawalDeletedTabs from "./withdrawal-deleted-tabs/WithdrawalDeletedTabs";
import { DeletedWithdrawalTransactionsQueueGrid } from "../../withdrawal-transaction/queues/DeletedWithdrawalTransactionsQueueGrid";
import WithdrawalPaymentQueueGrid from "../../withdrawal-transaction/queues/WithdrawalPaymentQueueGrid";
import WithdrawalTransactionQueueGrid from "../../withdrawal-transaction/queues/WithdrawalTransactionQueueGrid";
import { WithdrawalFirstLevelApprovalGrid } from "../../withdrawal-transaction/queues/WithdrawalFirstLevelApprovalGrid";
import { WithdrawalSecondLevelApprovalGrid } from "../../withdrawal-transaction/queues/WithdrawalSecondLevelApprovalGrid";
import WithdrawalBatchedPaymentsGrid from "../../withdrawal-transaction/queues/WithdrawalBatchedPaymentsGrid";
import RecordWithdrawalLanding from "../../../../../../shared/components/alert/RecordWithdrawalLanding";
import CloseOutModalNew from "../../../../dialogs/transactions/withdrawal-transaction/CloseModalNew";

const Transactions = observer(() => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("transaction-queue-tab");
  const [loading, setLoading] = useState(false);
  const [focusTransactionQueue, setFocusTransactionQueue] = useState<string>("All");
  const [selectedDeletedTab, setSelectedDeletedTab] = useState("non-deposits-deleted-view-tab");

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFocusTransactionQueue(event.target.value);
  };

  const recordWithdrawal = () => {
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_LANDING_MODAL);
  };

  const recordCloseOutWithdrawal = () => {
    showModalFromId(MODAL_NAMES.BACK_OFFICE.CLOSE_MM_ACCOUNT);
  };

  const withdrawalTransactions = store.withdrawalTransaction.all;

  const sortAndFilterWithdrawalData = (data: WithdrawalTransactionModel[], filterCondition: (item: WithdrawalTransactionModel) => boolean): WithdrawalTransactionModel[] => {
    return store.withdrawalTransaction.all
      .sort(
        (a, b) =>
          new Date(b.asJson.valueDate || 0).getTime() -
          new Date(a.asJson.valueDate || 0).getTime()
      ).filter(filterCondition);
  };
  const getWithdrawalDataByTransactionStatus = (status: WithdrawalTransactionStatus) => {
    return sortAndFilterWithdrawalData(
      withdrawalTransactions,
      (c) => 
        c.asJson.transactionStatus === status &&
        c.asJson.withdrawalNodeType === "Parent" &&
        (focusTransactionQueue === "All" || c.asJson.transactionType === focusTransactionQueue)
    ).map((c) => {
      return c.asJson;
    });
  };
  
 
  const handleRecordDeposit = () => {
    setShowWithdrawalModal(true);
    store.withdrawalTransaction.clearSelected();
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_LANDING_MODAL);
  };

  const withdrawalTransactionQueue = getWithdrawalDataByTransactionStatus("Draft");
  const firstLevelApprovalWithdrawals = getWithdrawalDataByTransactionStatus("First Level");
  const secondLevelApprovalWithdrawals = getWithdrawalDataByTransactionStatus("Second Level");
  const paymentQueueWithdrawals = getWithdrawalDataByTransactionStatus("Payment Queue");
  const withdrawalPaymentBatchFiles = store.batches.all.sort((a, b) => new Date(b.asJson.batchedDateTime || 0).getTime() - new Date(a.asJson.batchedDateTime || 0).getTime()
  ).map((b) => {
    return b.asJson;
  });
  const completedQueueWithdrawals = getWithdrawalDataByTransactionStatus("Completed");
  const deletedQueueWithdrawals = getWithdrawalDataByTransactionStatus("Deleted");
  const correctedQueueWithdrawals = getWithdrawalDataByTransactionStatus("Corrected");
  const archivedQueueWithdrawals = getWithdrawalDataByTransactionStatus("Archived");

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
  }, [api.batches, api.withdrawalTransaction, api.switch, api.user]);

  if (loading) return <LoadingEllipsis />;

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(true);

  const getTabName = () => {
    switch (selectedTab) {
      case "transaction-queue-tab":
        return "Transaction Queue"
      case "deleted-tab":
        return "Deleted Queue";
      case "payment-queue-tab":
        return "Payment Queue";
      case "batch-tab":
        return "Batch Files";
      case "processed-tab":
        return "Processed";
      case "first-level-approval-tab":
        return "First Level Approval";
      case "second-level-approval-tab":
        return "Second Level Approval";
      default:
        break;
    }
  }

  return (
    <ErrorBoundary>
      <div className="uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <ToolbarNew
              title={
                <div className="uk-grid uk-grid-small uk-child-width-1-1" data-uk-grid>
                  <h4 className="main-title-lg uk-margin-remove">Withdrawals</h4>
                  <h4 className="main-title-sm uk-margin-remove">{getTabName()}</h4>
                </div>
              }
              rightControls={
                <>
                  <div className="uk-margin-bottom">
                    <button
                      className="btn btn-primary"
                      onClick={recordWithdrawal}>
                      Withdrawal
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={recordCloseOutWithdrawal}>
                      Close Out
                    </button>
                    <div className="uk-button-group">
                      <div className="ijg-form">
                        <select value={focusTransactionQueue} onChange={(e) => handleOptionChange(e)} name="" id="">
                          <option disabled value="All">Transaction Type Filter</option>
                          <option value="All">All</option>
                          <option value="Manual">Manual Withdrawals</option>
                          <option value="Manual Close Out">Manual Close Outs</option>
                          <option value="Split">Split Withdrawals</option>
                          <option disabled value="Online">Online Withdrawals</option>
                          <option disabled value="Online Close Out">Online Close Outs</option>
                        </select>
                      </div>
                      <button onClick={() => setFocusTransactionQueue("All")} className="btn btn-primary" disabled={focusTransactionQueue === "All"}>Reset</button>
                    </div>
                  </div>
                </>
              }
            />

          </div>
          <hr />

          <ErrorBoundary>
            <div className="uk-margin-small-bottom">
              <Toolbar
                leftControls={
                  <TransactionsTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                }
              />
            </div>
            <div className="page-main-card">
              {selectedTab === "transaction-queue-tab" &&
                <WithdrawalTransactionQueueGrid data={withdrawalTransactionQueue} loading={loading} transactionFilter={focusTransactionQueue} />
              }
              {selectedTab === "first-level-approval-tab" &&
                <WithdrawalFirstLevelApprovalGrid data={firstLevelApprovalWithdrawals} loading={loading} transactionFilter={focusTransactionQueue} />

              }
              {selectedTab === "second-level-approval-tab" &&
                <WithdrawalSecondLevelApprovalGrid data={secondLevelApprovalWithdrawals} loading={false} transactionFilter={focusTransactionQueue} />
              }

              {selectedTab === "payment-queue-tab" &&
                <WithdrawalPaymentQueueGrid data={paymentQueueWithdrawals} loading={false} transactionFilter={focusTransactionQueue} />
              }

              {selectedTab === "batch-tab" &&
                <WithdrawalBatchedPaymentsGrid data={withdrawalPaymentBatchFiles} loading={false} transactionFilter={focusTransactionQueue} />
              }
              {selectedTab === "processed-tab" &&
                <WithdrawalProcessedPaymentsGrid data={completedQueueWithdrawals} loading={false} transactionFilter={focusTransactionQueue} />
              }
              {selectedTab === "deleted-tab" &&
                <>
                  <div className="uk-margin">
                    <Toolbar rightControls={
                      <WithdrawalDeletedTabs
                        selectedTab={selectedDeletedTab}
                        setSelectedTab={setSelectedDeletedTab}
                      />
                    }
                    />
                  </div>
                  {selectedDeletedTab === "deleted-from-statement-view-tab" &&
                    <CorrectedWithdrawalTransactionsQueueGrid
                      data={correctedQueueWithdrawals}
                      loading={false}
                      transactionFilter={focusTransactionQueue}
                      selectedDeletedTab={selectedDeletedTab}
                      setSelectedDeletedTab={setSelectedDeletedTab}
                    />
                  }
                  {selectedDeletedTab === "non-deposits-deleted-view-tab" &&
                    <>
                      <DeletedWithdrawalTransactionsQueueGrid
                        data={deletedQueueWithdrawals}
                        loading={false}
                        transactionFilter={focusTransactionQueue}
                        selectedDeletedTab={selectedDeletedTab}
                        setSelectedDeletedTab={setSelectedDeletedTab}
                      />
                    </>
                  }
                </>
              }
            </div>
          </ErrorBoundary>
        </div >
      </div >
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_LANDING_MODAL}>
        <RecordWithdrawalLanding isVisible={setShowWithdrawalModal} />
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.CLOSE_MM_ACCOUNT}>
        <CloseOutModalNew />
      </Modal>



    </ErrorBoundary >
  );
});
export default Transactions;
