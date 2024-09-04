import { observer } from "mobx-react-lite";
import swal from "sweetalert";
import { useEffect, useState } from "react";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getEntityId, getMMAProduct } from "../../../../../../shared/functions/MyFunctions";
import showModalFromId, { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import { SplitWithdrawalDuplicates } from "../../client-deposit-allocation/duplicate-flag-outs/DuplicateTransactionsFlag";
import AmendSplitWithdrawalForm from "./AmendSplitWithdrawalForm";
import Modal from "../../../../../../shared/components/Modal";
import { DeleteSplitWithdrawalModal } from "./DeleteSplitWithdrawalModal";
interface IProps {
  isVisible: (value: boolean) => void;
}
export const AmendSplitWithdrawalModal = observer(({ isVisible }: IProps) => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Form");
  const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
  const [splitTransactions, setSplitTransactions] = useState<IWithdrawalTransaction[]>([]);
  const [loadingSave, setLoadingSave] = useState(false);
  // const [toDelete, setToDelete] = useState<IWithdrawalTransaction[]>([]);
  const [progressPercentage, setProgressPercentage] = useState("");
  const [transactionUpdated, setTransactionUpdated] = useState(0);
  const [loading, setLoading] = useState(false);
  let [onClearFileComponent, setOnClearFileComponent] = useState(false);
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valueDate = event.target.valueAsNumber;
    const selectedDate = dateFormat_YY_MM_DD(valueDate);
    const today = dateFormat_YY_MM_DD(Date.now());
    // if (splitTransactions.length > 0 && !splitTransactions.every(transaction => transaction.productCode === splitTransactions[0].productCode)) {
    //   console.log("Is it ", splitTransactions);
    //   swal({
    //     icon: "warning",
    //     text: `Cannot backdate split transactions from different products.`,
    //   });
    // }
    // else 
    if (selectedDate > today) {
      swal({
        title: "Transaction Future Dating",
        text: `Do you want to record a Withdrawal that will be future dated to ${selectedDate
          }`,
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {
        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now recording a Withdrawal that will be future dated to ${selectedDate
              }`,
          });

          setWithdrawalTransaction({ ...withdrawalTransaction, valueDate: valueDate, withdrawalTransactionProcess: "Future-Dated" });
        }
        setLoading(false);
      });
    } else if (selectedDate < today) {
      swal({
        title: "Transaction Back Dating",
        text: `Do you want to capture a Split Withdrawal that will be back dated to ${selectedDate}`,
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {

        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now capturing a Withdrawal that will be back dated to ${selectedDate}`,
          });

          setWithdrawalTransaction({
            ...withdrawalTransaction, valueDate: valueDate, withdrawalTransactionProcess: "Back-Dated"
          });
        }
        setLoading(false);
      });
    } else {
      setWithdrawalTransaction({
        ...withdrawalTransaction, valueDate: valueDate, withdrawalTransactionProcess: "Normal"
      });
    }
  };
  const handleSubmit = async () => {
    let count = 0;
    setLoading(true);
    const mainTransaction: IWithdrawalTransaction = {
      ...withdrawalTransaction,
      amount: withdrawalTransaction.amount,
      withdrawalNodeType: "Parent",
      allocationStatus: "Manually Allocated",
      transactionDate: Date.now(),
      capturedBy: store.auth.meUID || "",
      bankReference: "Withdrawal",
      valueDate: withdrawalTransaction.valueDate || Date.now(),
      productCode: getMMAProduct(withdrawalTransaction.accountNumber, store),
      transactionType: "Split",
      transactionStatus: "First Level",
      createdAtTime: {
        firstLevelQueue: Date.now()
      },
      transactionAction: "Split",
      withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess,
    };
    try {
      await api.withdrawalTransaction.update(mainTransaction);
      const savedMainTransactionId = mainTransaction.id;
      if (!savedMainTransactionId) {
        throw new Error("Failed to save main transaction or retrieve its ID");
      }
      const parentTransactionId = savedMainTransactionId;
      for (const transaction of splitTransactions) {
        const _transaction: IWithdrawalTransaction = {
          ...mainTransaction,
          id: transaction.id,
          entityNumber: getEntityId(store, transaction.accountNumber),
          clientBankingDetails: transaction.clientBankingDetails,
          accountNumber: transaction.accountNumber,
          amount: transaction.amount,
          parentTransaction: parentTransactionId,
          bankReference: transaction.bankReference ?? "Withdrawal",
          productCode: getMMAProduct(transaction.accountNumber, store),
          withdrawalNodeType: "Child",
          emailAddress: transaction.emailAddress
        };
        if (transaction.id !== "") {
          await api.withdrawalTransaction.update(_transaction);

        } else {
          await api.withdrawalTransaction.create(_transaction);
        } count++;
        const progress = ((count / splitTransactions.length) * 100).toFixed(2); //
        setTransactionUpdated(count);
        setProgressPercentage(progress);
      }
      await api.withdrawalTransaction.update(mainTransaction); //check
      swal({
        icon: "success",
        text: "Transaction submitted for First Level Approval",
      });
      setLoading(false)
      onCancel()
    } catch (error) {
    }
  };
  const handleSave = async () => {
    if (splitTransactions.length !== 0 && splitTransactions.some(transaction => transaction.accountNumber !== "")) {
      swal({
        title: "Save Split Withdrawal as Draft?",
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {
        if (edit) {
          let count = 0;
          setLoadingSave(true);
          const mainTransaction: IWithdrawalTransaction = {
            ...withdrawalTransaction,
            amount: withdrawalTransaction.amount,
            withdrawalNodeType: "Parent",
            allocationStatus: "Manually Allocated",
            transactionDate: Date.now(),
            capturedBy: store.auth.meUID || "",
            bankReference: "Withdrawal",
            valueDate: withdrawalTransaction.valueDate || Date.now(),
            productCode: getMMAProduct(withdrawalTransaction.accountNumber, store),
            transactionType: "Split",
            transactionStatus: "Draft",
            createdAtTime: {
              transactionQueue: Date.now()
            },
            transactionAction: "Split",
            withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess,
          };
          try {
            await api.withdrawalTransaction.update(mainTransaction);
            const savedMainTransactionId = mainTransaction.id;
            if (!savedMainTransactionId) {
              throw new Error("Failed to save main transaction or retrieve its ID");
            }
            const parentTransactionId = savedMainTransactionId;
            for (const transaction of splitTransactions) {
              const _transaction: IWithdrawalTransaction = {
                ...mainTransaction,
                id: transaction.id,
                entityNumber: getEntityId(store, transaction.accountNumber),
                clientBankingDetails: transaction.clientBankingDetails,
                accountNumber: transaction.accountNumber,
                amount: transaction.amount,
                parentTransaction: parentTransactionId,
                bankReference: transaction.bankReference ?? "Withdrawal",
                productCode: getMMAProduct(transaction.accountNumber, store),
                withdrawalNodeType: "Child",
                emailAddress: transaction.emailAddress
              };
              if (transaction.id !== "") {
                await api.withdrawalTransaction.update(_transaction);

              } else {
                await api.withdrawalTransaction.create(_transaction);
              } count++;
              const progress = ((count / splitTransactions.length) * 100).toFixed(2); //
              setTransactionUpdated(count);
              setProgressPercentage(progress);
            }
            await api.withdrawalTransaction.update(mainTransaction); //check
            swal({
              icon: "success",
              text: "Transaction Saved as Draft",
            });
            setLoadingSave(false);
            onCancel()
          } catch (error) {
          }
        } else {
          swal({
            icon: "error",
            text: "Transaction cancelled!",
          });
        }
      });
    } else {
      swal({
        icon: "error",
        text: "To Save a Draft, at least allocate amount to one account",
      });
    }
  };
  const onDelete = () => {
    store.withdrawalTransaction.select(withdrawalTransaction);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DELETE_SPLIT_WITHDRAWAL_TRANSACTION_MODAL);
  };
  const onCancel = () => {
    store.withdrawalTransaction.clearSelected();
    setWithdrawalTransaction(defaultWithdrawalTransaction);
    isVisible(false);
    setOnClearFileComponent(true);
    setSplitTransactions([]);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_TRANSACTION_MODAL);
  };
  const onClear = () => {
    setWithdrawalTransaction(defaultWithdrawalTransaction);
    setSplitTransactions([]);
    setOnClearFileComponent(true);
  };
  const modalTitle = () => {
    switch (withdrawalTransaction.withdrawalTransactionProcess) {
      case "Back-Dated":
        return "AMEND BACK DATED SPLIT Withdrawal TRANSACTION"
      case "Future-Dated":
        return "AMEND FUTURE DATED SPLIT Withdrawal TRANSACTION"
      case "Normal":
        return "AMEND MANUAL SPLIT Withdrawal TRANSACTION"
      default:
        return "AMEND MANUAL SPLIT Withdrawal TRANSACTION";
    }
  }
  useEffect(() => {
    if (store.withdrawalTransaction.selected) {
      setWithdrawalTransaction(store.withdrawalTransaction.selected);
      const saved = store.withdrawalTransaction.getWithdrawalChildTransactions(store.withdrawalTransaction.selected.id);
      const loadSavedTransactions = () => {
        const data: any[] = [];
        saved.forEach((transaction) => {
          data.push(transaction);
        });
        setSplitTransactions(data)
      }
      loadSavedTransactions();
    }
  }, [withdrawalTransaction.id, store.withdrawalTransaction, store.withdrawalTransaction.selected]);
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
      <div className="uk-margin-small-bottom uk-text-right">
        <button className={`btn ${selectedTab === "Form" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Form")}>
          Withdrawal View
        </button>
        <button className={`btn ${selectedTab === "Allocation" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Allocation")}>
          Allocation View
        </button>

        <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
          Statement View
        </button>
        <Modal modalId={MODAL_NAMES.BACK_OFFICE.DELETE_SPLIT_WITHDRAWAL_TRANSACTION_MODAL}>
          <DeleteSplitWithdrawalModal />
        </Modal>
      </div>
      <AmendSplitWithdrawalForm
        onCancel={onCancel}
        handleSubmit={handleSubmit}
        handleDateChange={handleDateChange}
        onClear={onClear}
        loading={loading}
        withdrawalTransaction={withdrawalTransaction}
        loadingSave={loadingSave}
        selectedTab={selectedTab}
        setWithdrawalTransaction={setWithdrawalTransaction}
        handleSave={handleSave}
        onClearFileComponent={onClearFileComponent}
        setOnClearToFalse={setOnClearFileComponent}
        splitTransactions={splitTransactions}
        setSplitTransactions={setSplitTransactions}
        onDelete={onDelete}
      />
    </div>
  )
});
