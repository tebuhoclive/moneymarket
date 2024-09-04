import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../ModalName";
import { defaultDepositTransaction, IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import ViewSplitDepositForm from "./ViewSplitDepositForm";

interface IShowProp {
  setShowReturnModal: (show: boolean) => void;
}

export const ViewSplitDepositModal = observer((props: IShowProp) => {
  const { api,store } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Form");
  const { setShowReturnModal } = props;
  const [deposit, setDeposit] = useState<IDepositTransaction>({
    ...defaultDepositTransaction,
  });
  const [splitTransactions, setSplitTransactions] = useState<IDepositTransaction[]>([]);

  const onCancel = () => {
    setShowReturnModal(false);
    setDeposit(defaultDepositTransaction)
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL);
  };

  const onClear = () => {
    setDeposit(defaultDepositTransaction);
    setSplitTransactions([]);
  };
  useEffect(() => {
    const saved = store.depositTransaction.getChildTransactions(deposit.id);
    const loadSavedTransactions = () => {
      const data: any[] = [];

      saved.forEach((transaction) => {
        data.push(transaction);
      });

      setSplitTransactions(data)
    }
    loadSavedTransactions();
  }, [deposit.id, store.depositTransaction])

  useEffect(() => {
    if (store.depositTransaction.selected) {
      setDeposit(store.depositTransaction.selected);
    }
  }, [store.depositTransaction.selected]);
  useEffect(() => {
    const loadData = async () => {
        if (deposit.id) {
            await api.depositTransactionAudit.getAll(
              deposit.id
            );
        }
    };
    loadData();
}, [api.depositTransactionAudit, api.user, deposit.id]);


  const modalTitle = () => {
    switch (deposit.depositTransactionProcess) {
      case "Back-Dated":
        return "BACK DATED SPLIT DEPOSIT TRANSACTION VIEW"
      case "Future-Dated":
        return "FUTURE DATED SPLIT DEPOSIT TRANSACTION VIEW"
      case "Normal":
        return "SPLIT DEPOSIT TRANSACTION VIEW"
      default:
        return "SPLIT DEPOSIT TRANSACTION VIEW";
    }
  }

  return (
    <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
      <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel}></button>
      <div className="form-title">
        <h3 style={{ marginRight: "1rem" }}>
          Deposit
        </h3>
        <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
        <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
          {modalTitle()} 
        </h3>
      </div>
      <hr />
      <div className="uk-margin-bottom uk-text-right">
        <button className={`btn ${selectedTab === "Form" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Form")}>
          Deposit View
        </button>

        <button className={`btn ${selectedTab === "Allocation" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Allocation")}>
          Allocation View
        </button>

        <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
          Statement View
        </button>

        <button className={`btn ${selectedTab === "Audit-Trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Audit-Trail")}>
          Audit Trail
        </button>

      </div>

      <ViewSplitDepositForm
        onCancel={onCancel}
        onClear={onClear}
        loading={false}
        deposit={deposit}
        loadingSave={false}
        selectedTab={selectedTab}
        onClearFileComponent={false}
        splitTransactions={splitTransactions}
      />
    </div>
  )
});
