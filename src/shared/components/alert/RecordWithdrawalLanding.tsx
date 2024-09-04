import { useState } from "react";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import HeadsUpAlert from "./HeadsUpAlert";
import showModalFromId, { hideModalFromId } from "../../functions/ModalShow";
import MODAL_NAMES from "../../../money-market-management-system/logged-in/dialogs/ModalName";
import Modal from "../Modal";
import DepositModal from "../../../money-market-management-system/logged-in/dialogs/transactions/client-deposit-allocation/DepositModal";
import { useAppContext } from "../../functions/Context";
import { RecordSplitDepositModal } from "../../../money-market-management-system/logged-in/dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/RecordSplitDepositModal";
import RecordWithdrawalModal from "../../../money-market-management-system/logged-in/dialogs/transactions/withdrawal-transaction/capture-amend-return/RecordWithdrawalModal";
import { RecordSplitWithdrawalModal } from "../../../money-market-management-system/logged-in/dialogs/transactions/withdrawal-transaction/split-withdrawals/RecordSplitWithdrawalModal";
import WithdrawalHeadsUp from "./HeadsUpWithdrawalAlert";

interface IProps {
  isVisible: (show: boolean) => void;
}
const RecordWithdrawalLanding = observer(({ isVisible }: IProps) => {
  const [loading, setLoading] = useState(false);
  const { store } = useAppContext();
  const [showSingleWithdrawalModal, setShowSingleWithdrawalModal] = useState(false);
  const [showSplitWithdrawalModal, setShowSplitWithdrawalModal] = useState(false);
  const handleRecordNewWithdrawal = () => {
    setShowSingleWithdrawalModal(true);
    store.withdrawalTransaction.clearSelected();
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_MODAL);
  };
  const handleRecordNewSplitWithdrawal = () => {
    setShowSplitWithdrawalModal(true);
    store.withdrawalTransaction.clearSelected();
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_SPLIT_WITHDRAWAL_MODAL);
  };
  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_LANDING_MODAL)
    isVisible(false);
  };
  return (
    <>
      <ErrorBoundary>
        <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <button
            className="uk-modal-close-default"
            onClick={onCancel}
            disabled={loading}
            type="button"
            data-uk-close
          ></button>
          <WithdrawalHeadsUp />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button onClick={handleRecordNewWithdrawal} className="btn btn-primary">Single Manual Withdrawal</button>
            <button onClick={handleRecordNewSplitWithdrawal} className="btn btn-primary">Manual Split Withdrawal</button>
          </div>
        </div>

        <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_MODAL}>
          {
            showSingleWithdrawalModal && <RecordWithdrawalModal />
          }
        </Modal>
        <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_SPLIT_WITHDRAWAL_MODAL}>
          {
            showSplitWithdrawalModal && <RecordSplitWithdrawalModal />
          }
        </Modal>
      </ErrorBoundary>
    </>
  );
});
export default RecordWithdrawalLanding;
