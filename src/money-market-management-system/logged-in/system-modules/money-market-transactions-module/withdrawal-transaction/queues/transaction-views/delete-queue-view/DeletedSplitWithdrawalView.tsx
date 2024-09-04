import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../../../shared/functions/ModalShow";
import { IWithdrawalTransaction, defaultWithdrawalTransaction } from "../../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import MODAL_NAMES from "../../../../../../dialogs/ModalName";
import ViewDeletedSplitWithdrawalForm from "./DeletedSplitWithdrawalViewForm";

interface IShowProp {
  setShowReturnModal: (show: boolean) => void;
}

export const ViewDeletedSplitWithdrawalModal = observer((props: IShowProp) => {
  const { api, store } = useAppContext();

  const [selectedTab, setSelectedTab] = useState("Form");
  const { setShowReturnModal } = props;

  const [withdrawal, setWithdrawal] = useState<IWithdrawalTransaction>({
    ...defaultWithdrawalTransaction,
  });

  const [splitTransactions, setSplitTransactions] = useState<IWithdrawalTransaction[]>([]);

  const onCancel = () => {
    setShowReturnModal(false);
    setWithdrawal(defaultWithdrawalTransaction)
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL);
  };

  const onClear = () => {
    setWithdrawal(defaultWithdrawalTransaction);
    setSplitTransactions([]);
  };

  useEffect(() => {
    const saved = store.withdrawalTransaction.getWithdrawalChildTransactions(withdrawal.id);
    const loadSavedTransactions = () => {
      const data: any[] = [];

      saved.forEach((transaction) => {
        data.push(transaction);
      });

      setSplitTransactions(data)
    }
    loadSavedTransactions();
  }, [withdrawal.id, store.withdrawalTransaction])

  useEffect(() => {
    if (store.withdrawalTransaction.selected) {
      setWithdrawal(store.withdrawalTransaction.selected);
    }
  }, [store.withdrawalTransaction.selected]);

  useEffect(() => {
    const loadData = async () => {
      if (withdrawal.id) {
        await api.withdrawalTransactionAudit.getAll(
          withdrawal.id
        );
      }
    };
    loadData();
  }, [api.withdrawalTransactionAudit, api.user, withdrawal.id]);


  const modalTitle = () => {
    switch (withdrawal.withdrawalTransactionProcess) {
      case "Back-Dated":
        return "DELETE BACK DATED SPLIT WITHDRAWAL TRANSACTION VIEW"
      case "Future-Dated":
        return "DELETE FUTURE DATED SPLIT WITHDRAWAL TRANSACTION VIEW"
      case "Normal":
        return "DELETE SPLIT WITHDRAWAL TRANSACTION VIEW"
      default:
        return "DELETE SPLIT WITHDRAWAL TRANSACTION VIEW";
    }
  }

  return (
    <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
      <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel}></button>
      <div className="form-title">
        <h3 style={{ marginRight: "1rem" }}>
          Withdrawal
        </h3>
        <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
        <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
          {modalTitle()}
        </h3>
      </div>
      <hr />
      <div className="uk-margin-bottom uk-text-right">
        <button className={`btn ${selectedTab === "Form" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Form")}>
          Withdrawal Details
        </button>

        <button className={`btn ${selectedTab === "Allocation" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Allocation")}>
          Allocation View
        </button>

        <button className={`btn ${selectedTab === "Audit-Trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Audit-Trail")}>
          Audit Trail
        </button>

        <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
          Statement View
        </button>

      </div>

      <ViewDeletedSplitWithdrawalForm
        onCancel={onCancel}
        onClear={onClear}
        loading={false}
        withdrawal={withdrawal}
        loadingSave={false}
        selectedTab={selectedTab}
        onClearFileComponent={false}
        splitTransactions={splitTransactions}
      />
    </div>
  )
});
