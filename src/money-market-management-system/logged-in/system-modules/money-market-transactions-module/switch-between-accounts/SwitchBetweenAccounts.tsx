import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import Modal from "../../../../../shared/components/Modal";
import { useAppContext } from "../../../../../shared/functions/Context";
import SwitchBetweenAccountTabs from "./SwitchBetweenAccountTabs";
import SwitchTransactionQueueDataGrid from "./switch-status/SwitchTransactionQueueDataGrid";
import FirstLevelApprovalDataGrid from "./switch-status/FirstLevelApprovalDataGrid";
import SecondLevelApprovalDataGrid from "./switch-status/SecondLevelApprovalDataGrid";
import CompletedDataGrid from "./switch-status/CompletedDataGrid";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import MODAL_NAMES from "../../../dialogs/ModalName";
import BackDatedDataGrid from "./switch-status/BackDatedGrid";
import DeletedDataGrid from "./switch-status/DeletedSwitchDataGrid";
import AmendSwitchModal from "../../../dialogs/transactions/switch/AmendSwitchModal";
import SwitchTransactionModel, {
  SwitchTransactionStatus,
} from "../../../../../shared/models/SwitchTransactionModel";
import RecordEntitySwitchModal from "../../../dialogs/transactions/switch/RecordEntitySwitchModal";
import RecordEntitySwitchModalCloseOut from "../../../dialogs/transactions/switch/RecordEntitySwitchModalCloseOut";
import ArchivedDataGrid from "./switch-status/ArchivedDataGrid";

const SwitchBetweenAccounts = observer(() => {
  const { api, store } = useAppContext();
  const [selectedTab, setSelectedTab] = useState(
    "switch-transaction-queue-tab"
  );
  const [focusTransactionQueue, setFocusTransactionQueue] = useState<string>("All");
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFocusTransactionQueue(event.target.value);
  };
  const [showOnSubmitModalCloseOut, setShowOnSubmitModalCloseOut] = useState<boolean>(false);

  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const handleSwitchBetweenEntities = () => {
    setShowOnSubmitModal(true)
    showModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_MODAL);
  };
  const handleSwitchBetweenEntitiesCloseOut = () => {
    setShowOnSubmitModalCloseOut(true)
    showModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_MODAL_CLOSE_OUT);
  };

  const sortAndFilterData = (data: SwitchTransactionModel[], filterCondition: (item: SwitchTransactionModel) => boolean): SwitchTransactionModel[] => {
    return store.switch.all
      .sort(
        (a, b) =>
          new Date(b.asJson.valueDate || 0).getTime() -
          new Date(a.asJson.valueDate || 0).getTime()
      ).filter(filterCondition);
  };

  const getDataByStatus = (status: SwitchTransactionStatus) => {
    return sortAndFilterData(
      store.switch.all,
      (c) => c.asJson.switchStatus === status
    ).map((c) => {
      return c.asJson;
    });
  };

  const transactionQueue = getDataByStatus("Draft");
  const firstLevelApproval = getDataByStatus("First Level");
  const secondLevelApproval = getDataByStatus("Second Level");
  const completed = getDataByStatus("Completed");
  const deleted = getDataByStatus("Deleted");
  const archived = getDataByStatus("Archived");
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([api.switch.getAll()]);
      } catch (error) {
        // Handle errors here
        console.error("Error fetching data:", error);
      }
    };

    loadData();
  }, [api.switch]);

  return (
    <ErrorBoundary>
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand uk-margin">
          <div className="sticky-top">
            <Toolbar
              title="Switches"
              rightControls={
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleSwitchBetweenEntities}>
                    Record Switch
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSwitchBetweenEntitiesCloseOut}
                  >
                    Record Switch Close Out
                  </button>
                  <div className="uk-button-group">
                    <div className="ijg-form">
                      <select value={focusTransactionQueue} onChange={(e) => handleOptionChange(e)} name="" id="">
                        <option disabled value="All">Transaction Type Filter</option>
                        <option value="All">All</option>
                        <option value="Manual Switch">Manual Switches</option>
                        <option value="Manual Switch Close Out">Manual Close Outs</option>
                        <option disabled value="Online Switch">Online Withdrawals</option>
                        <option disabled value="Online Switch Close Out">Online Close Outs</option>
                      </select>
                    </div>
                    <button onClick={() => setFocusTransactionQueue("All")} className="btn btn-primary" disabled={focusTransactionQueue === "All"}>Reset</button>
                  </div>
                </>
              }
            />
            <hr />
            <div className="uk-margin">
              <Toolbar
                leftControls={
                  <SwitchBetweenAccountTabs
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                  />
                }
              />
            </div>
          </div>
          <ErrorBoundary>
            <div>
              {selectedTab === "switch-transaction-queue-tab" && (
                <SwitchTransactionQueueDataGrid data={transactionQueue} transactionFilter={focusTransactionQueue} />
              )}
              {selectedTab === "first-level-approval-tab" && (
                <FirstLevelApprovalDataGrid data={firstLevelApproval} transactionFilter={focusTransactionQueue} />
              )}

              {selectedTab === "second-level-approval-tab" && (
                <SecondLevelApprovalDataGrid data={secondLevelApproval} transactionFilter={focusTransactionQueue} />
              )}

              {selectedTab === "completed-tab" && (
                <CompletedDataGrid data={completed} transactionFilter={focusTransactionQueue} />
              )}

              {selectedTab === "deleted-tab" && (
                <DeletedDataGrid data={deleted} transactionFilter={focusTransactionQueue} />
              )}
               {selectedTab === "archived-tab" && (
                <ArchivedDataGrid data={archived} transactionFilter={focusTransactionQueue} />
              )}
            </div>
          </ErrorBoundary>
        </div>
      </div>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_MODAL}>
        {showOnSubmitModal && <RecordEntitySwitchModal setVisible={setShowOnSubmitModal} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_MODAL_CLOSE_OUT}>
      {showOnSubmitModalCloseOut &&<RecordEntitySwitchModalCloseOut setVisible={setShowOnSubmitModalCloseOut} />}  
      </Modal>

    </ErrorBoundary>
  );
});
export default SwitchBetweenAccounts;
