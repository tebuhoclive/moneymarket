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

interface IProps {
  isVisible: (show: boolean) => void;
}
const RecordDepositLanding = observer(({ isVisible }: IProps) => {
  const [loading, setLoading] = useState(false);
  const { store } = useAppContext();

  const [showSingleDepositDepositModal, setShowSingleDepositDepositModal] = useState(false);
  const [showSplitDepositDepositModal, setShowSplitDepositDepositModal] = useState(false);

  const handleRecordNewDeposit = () => {
    setShowSingleDepositDepositModal(true);
    store.depositTransaction.clearSelected();
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_DEPOSIT_MODAL);
  };

  const handleRecordNewSplitDeposit = () => {
    setShowSplitDepositDepositModal(true);
    store.depositTransaction.clearSelected();
    showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_SPLIT_DEPOSIT_MODAL);
  };

  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_NEW_DEPOSIT_FORM_MODAL)
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
          <HeadsUpAlert />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button onClick={handleRecordNewDeposit} className="btn btn-primary">Single Manual Deposit</button>
            <button onClick={handleRecordNewSplitDeposit} className="btn btn-primary">Manual Split Deposit</button>
          </div>
        </div>

        <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_DEPOSIT_MODAL}>
          {
            showSingleDepositDepositModal && <DepositModal />
          }
        </Modal>
        <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_SPLIT_DEPOSIT_MODAL}>
          {
            showSplitDepositDepositModal && <RecordSplitDepositModal />
          }
        </Modal>
      </ErrorBoundary>
    </>
  );
});
export default RecordDepositLanding;
