import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import RecordDepositLanding from "../../../../../shared/components/alert/RecordDepositLanding";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../dialogs/ModalName";
import BankStatementUploadModal from "../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/bank-upload-modal/BankStatementUploadModal";
import BankStatementUploadTabs from "./BankStatementUploadTabs";
import AutoAllocatedTab from "./extra-tabs/auto-allocated/AutoAllocatedTab";
import DeletedTransactionsTabs from "./transaction-status/deleted/DeletedDepositsTabs";
import DepositTransactionsQueueGrid from "./transaction-status/DepositTransactionsQueueGrid";
import Toolbar, { ToolbarNew } from "../../../shared/components/toolbar/Toolbar";
import Modal from "../../../../../shared/components/Modal";
import NonDepositTransactionsGrid from "./transaction-status/NonDepositTransactionsGrid";
import UnallocatedTransactionsGrid from "./transaction-status/UnAllocatedTransactionsGrid";
import SecondLevelApprovalDataGrid from "./transaction-status/DepositSecondLevelApprovalGrid";
import FirstLevelApprovalDataGrid from "./transaction-status/DepositFirstLevelApprovalGrid";
import CompletedTransactionsGrid from "./transaction-status/CompletedDepositsGrid";
import DeletedAfterProcessedQueueGrid from "./transaction-status/deleted/DeletedProcessedDepositsGrid"
import DeletedBeforeProcessedQueueGrid from "./transaction-status/deleted/DeletedNonDepositsGrid";
import GetArchivedTransactionsButton from "../../../shared/components/archive-button-component/ArchiveButton";
import CompletedArchivedDepositsGrid from "./transaction-status/CompletedArchivedDepositsGrid";

const BankStatementUpload = observer(() => {
  const { store, api } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("deposit-transaction-queue-tab");
  const [selectedDeletedTab, setSelectedDeletedTab] = useState("non-deposits-deleted-view-tab");

  const [focusTransactionQueue, setFocusTransactionQueue] = useState<string>("All");

  const handleOptionChange = (filter: string) => {
    setFocusTransactionQueue(filter);
  };

  const transactions = store.depositTransaction.all.map((transactions) => {
    return transactions.asJson;
  });

  const transactionQueueData = transactions.filter(transactionQueueData => (transactionQueueData.transactionStatus === "Draft" || transactionQueueData.transactionStatus === "Transaction Queue") && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );

  const nonDepositQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Non-Deposit" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );

  const unallocatedQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Unallocated" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );
  const firstLevelQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "First Level" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );
  const secondLevelQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Second Level" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );
  const completedQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Completed" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );
  const completedArchivedQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Archived" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
);
  const deletedAfterProcessedQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Corrected" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );
  const deletedBeforeProcessedQueueData = transactions.filter(transactionQueueData => transactionQueueData.transactionStatus === "Deleted" && transactionQueueData.depositNodeType === "Parent" && (focusTransactionQueue === "All" || transactionQueueData.transactionType === focusTransactionQueue)
  );

  const handleRecordDeposit = () => {
    setShowDepositModal(true);
    store.depositTransaction.clearSelected();
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_NEW_DEPOSIT_FORM_MODAL);
  };

  const handleUploadBankStatement = () => {
    setShowBanKStatementUpload(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.BANK_STATEMENT_UPLOAD_MODAL);
  };

  const getTabName = () => {
    switch (selectedTab) {
      case "deposit-transaction-queue-tab":
        return "Transaction Queue"
      case "deleted-tab":
        return "Deleted Queue";
      case "non-deposits-tab":
        return "Non Deposits";
      case "completed-tab":
        return "Completed";
      case "unallocated-tab":
        return "Unallocated";
      case "first-level-approval-tab":
        return "First Level Approval";
      case "second-level-approval-tab":
        return "Second Level Approval";
      default:
        break;
    }
  }

  useEffect(() => {

    const loadData = async () => {
      try {
        await api.depositTransaction.getAll();
      } catch (error) {
      }
    };

    loadData(); //handle this promise properly
  }, [api.depositTransaction, selectedTab]);


  // Modal rendering logic start
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBanKStatementUpload, setShowBanKStatementUpload] = useState(false);
  // Modal rendering logic end

  return (
    <ErrorBoundary>
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <ToolbarNew
              title={
                <div className="uk-grid uk-grid-small uk-child-width-1-1" data-uk-grid>
                  <h4 className="main-title-lg uk-margin-remove">Deposits</h4>
                  <h4 className="main-title-sm uk-margin-remove">{getTabName()}</h4>
                </div>
              }
              rightControls={
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleRecordDeposit}>
                    Record New
                  </button>
                  <button className="btn btn-primary" onClick={handleUploadBankStatement}>
                    Upload Bank Statement
                  </button>
                  <div className="uk-button-group">
                    <div className="ijg-form">
                      <select value={focusTransactionQueue} onChange={(e) => handleOptionChange(e.target.value)} name="" id="">
                        <option disabled value="All">Filter</option>
                        <option value="All">All</option>
                        <option value="Manual">Manual</option>
                        <option value="CSV File">CSV File</option>
                        <option value="Split">Split</option>
                        <option disabled value="Online">Online</option>
 
                      </select>
                    </div>
                    <button onClick={() => setFocusTransactionQueue("All")} className="btn btn-primary" disabled={focusTransactionQueue === "All"}>Reset</button>
                  </div>
                </>
              }
              leftControls={
                <div className="flex">

                </div>
              }
            />
          </div>
          <hr className="uk-margin-small" />
          <ErrorBoundary>
            <div>
              <Toolbar
                leftControls={
                  <div className="uk-margin-medium-bottom	">
                    {focusTransactionQueue === "All" &&
                      <BankStatementUploadTabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      />
                    }
                    {focusTransactionQueue === "Manual" &&
                      <BankStatementUploadTabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      />
                    }
                    {focusTransactionQueue === "CSV File: Auto-Allocated" &&
                      <AutoAllocatedTab
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      />
                    }
                    {focusTransactionQueue === "CSV File" &&
                      <BankStatementUploadTabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      />
                    }
                    {focusTransactionQueue === "Split" &&
                      <BankStatementUploadTabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      />
                    }
                    {focusTransactionQueue === "Online" &&
                      // <DraftTab
                      //   selectedTab={selectedTab}
                      //   setSelectedTab={setSelectedTab}
                      // />

                      <h4 className="main-title-md uk-text-warning">Queue under development</h4>
                    }
                  </div>
                }
              />
            </div>
            <div className="page-main-card">
              {selectedTab === "deposit-transaction-queue-tab" && (
                <div>
                  <DepositTransactionsQueueGrid data={transactionQueueData} transactionFilter={focusTransactionQueue} loading={loading} />
                </div>
              )}
              {selectedTab === "non-deposits-tab" && (
                <div>
                  <NonDepositTransactionsGrid data={nonDepositQueueData} transactionFilter={focusTransactionQueue} loading={loading} />
                </div>
              )}

              {selectedTab === "first-level-approval-tab" && (
                <div>
                  <FirstLevelApprovalDataGrid data={firstLevelQueueData} transactionFilter={focusTransactionQueue} loading={false} />
                </div>
              )}

              {selectedTab === "second-level-approval-tab" && (
                <div>
                  <SecondLevelApprovalDataGrid data={secondLevelQueueData} transactionFilter={focusTransactionQueue} loading={false} />
                </div>
              )}

              {selectedTab === "unallocated-tab" &&
                <div>
                  <UnallocatedTransactionsGrid data={unallocatedQueueData} transactionFilter={focusTransactionQueue} loading={loading} />
                </div>
              }

              {selectedTab === "request-source-of-funds-tab" &&
                <div>
                  <h4 className="uk-text-warning"><FontAwesomeIcon icon={faWarning} /> Feature under development</h4>
                </div>
              }

              {selectedTab === "completed-tab" &&
                <>
                  <CompletedTransactionsGrid data={completedQueueData} loading={loading} transactionFilter={focusTransactionQueue} />
                </>
              }
               {selectedTab === "archived-tab" &&
                <>
                  <CompletedArchivedDepositsGrid data={completedArchivedQueueData} loading={loading} transactionFilter={focusTransactionQueue} />
                </>
              }

              {selectedTab === "deleted-tab" &&
                <div className="sticky-top">
                  <div className="uk-margin">
                    <Toolbar
                      rightControls={
                        <DeletedTransactionsTabs
                          selectedTab={selectedDeletedTab}
                          setSelectedTab={setSelectedDeletedTab}
                        />
                      }
                    />
                  </div>
                  {selectedDeletedTab ===
                    "deleted-from-statement-view-tab" &&
                    <DeletedAfterProcessedQueueGrid data={deletedAfterProcessedQueueData} loading={loading} transactionFilter={focusTransactionQueue} />
                  }
                  {selectedDeletedTab === "non-deposits-deleted-view-tab" &&
                    <>
                    <div className="uk-text-right">
                    <GetArchivedTransactionsButton />
                    </div>
                      <DeletedBeforeProcessedQueueGrid data={deletedBeforeProcessedQueueData} loading={loading} transactionFilter={focusTransactionQueue} />
                    </>

                  }
                </div>
              }
            </div>
          </ErrorBoundary>
        </div>
      </div>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.BANK_STATEMENT_UPLOAD_MODAL}>
        {showBanKStatementUpload && <BankStatementUploadModal isVisible={setShowBanKStatementUpload} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_NEW_DEPOSIT_FORM_MODAL}>
        {showDepositModal && <RecordDepositLanding isVisible={setShowDepositModal} />}
      </Modal>
    </ErrorBoundary>
  );
});
export default BankStatementUpload;


