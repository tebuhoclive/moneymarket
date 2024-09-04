import { observer } from "mobx-react-lite";
import swal from "sweetalert";
import { useState } from "react";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import RecordSplitWithdrawalForm from "./RecordSplitWithdrawalsForm";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getEntityId, getMMAProduct } from "../../../../../../shared/functions/MyFunctions";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import { SplitWithdrawalDuplicates } from "../../client-deposit-allocation/duplicate-flag-outs/DuplicateTransactionsFlag";

export const RecordSplitWithdrawalModal = observer(() => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Form");
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
  const [splitTransactions, setSplitTransactions] = useState<IWithdrawalTransaction[]>([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState("");
  const [transactionUpdated, setTransactionUpdated] = useState(0);
  const [loading, setLoading] = useState(false);
  let [onClearFileComponent, setOnClearFileComponent] = useState(false);
  const withdrawals = store.withdrawalTransaction.all.map((t) => { return t.asJson });
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowOtherSource(value === "Other");
    // Clear the input field value when the user switches from 'Other' to another option
    if (value === "Other") {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        sourceOfFunds: withdrawalTransaction.sourceOfFunds,
      });
    } else {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        sourceOfFunds: value,
      });
    }
  };
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
      await api.withdrawalTransaction.create(mainTransaction);
      const savedMainTransactionId = mainTransaction.id;
      if (!savedMainTransactionId) {
        throw new Error("Failed to save main transaction or retrieve its ID");
      }
      const parentTransactionId = savedMainTransactionId;
      if (SplitWithdrawalDuplicates(withdrawals, parentTransactionId, splitTransactions)) {
        setLoading(false);
        const willProceed = await swal({
          icon: "warning",
          text: "Duplicate transactions found. Do you want to proceed anyway?",
          buttons: ["Cancel", "Proceed"],
          dangerMode: true,
        });
        if (!willProceed) {
          return
        }
      }
      for (const transaction of splitTransactions) {
        const _transaction: IWithdrawalTransaction = {
          ...mainTransaction,
          id: "",
          entityNumber: getEntityId(store, transaction.accountNumber),
          accountNumber: transaction.accountNumber,
          amount: transaction.amount,
          parentTransaction: parentTransactionId,
          bankReference: transaction.bankReference ?? "Withdrawal",
          productCode: getMMAProduct(transaction.accountNumber, store),
          clientBankingDetails: transaction.clientBankingDetails,
          withdrawalNodeType: "Child",
          emailAddress: transaction.emailAddress
        };
        await api.withdrawalTransaction.create(_transaction);
        count++;
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
          setLoadingSave(true);
          const saveTransaction: IWithdrawalTransaction = {
            id: "",
            entityNumber: withdrawalTransaction.entityNumber,
            accountNumber: withdrawalTransaction.accountNumber,
            amount: withdrawalTransaction.amount,
            bankReference: "Withdrawal",
            valueDate: withdrawalTransaction.valueDate || Date.now(),
            transactionDate: Date.now(),
            allocationStatus: "Manually Allocated",
            transactionType: "Split",
            productCode: getMMAProduct(withdrawalTransaction.accountNumber, store),
            sourceOfFunds: withdrawalTransaction.sourceOfFunds,
            transactionStatus: "Draft",
            createdAtTime: {
              transactionQueue: Date.now()
            },
            withdrawalNodeType: "Parent",
            // statementIdentifier: `ID-${withdrawalTransaction.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${withdrawalTransaction.amount}-${withdrawalTransaction.bankReference}`,
            withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess,
            description: withdrawalTransaction.description,
            clientBankingDetails: "",
            clientInstruction: {
              url: withdrawalTransaction.clientInstruction.url??"",
              reasonForNotAttaching: withdrawalTransaction.clientInstruction.reasonForNotAttaching??""
            },
            sourceOfFundsAttachment: {
              url: "",
              reasonForNotAttaching: ""
            },
            transactionIdentifier: ""
          };

          try {
            let count = 0;
            await api.withdrawalTransaction.create(saveTransaction);
            const savedMainTransactionId = saveTransaction.id;

            if (!savedMainTransactionId) {
              throw new Error("Failed to save main transaction or retrieve its ID");
            }

            const parentTransactionId = savedMainTransactionId;

            for (const transaction of splitTransactions) {
              const _transaction: IWithdrawalTransaction = {
                ...saveTransaction,
                id: "",
                entityNumber: getEntityId(store, transaction.accountNumber),
                accountNumber: transaction.accountNumber,
                amount: transaction.amount,
                clientBankingDetails: transaction.clientBankingDetails,
                parentTransaction: parentTransactionId,
                bankReference: transaction.bankReference,
                productCode: getMMAProduct(transaction.accountNumber, store),
                withdrawalNodeType: "Child",
                emailAddress: transaction.emailAddress
              };
              await api.withdrawalTransaction.create(_transaction);
              count++;
              const progress = ((count / splitTransactions.length) * 100).toFixed(2);
              setTransactionUpdated(count);
              setProgressPercentage(progress);
            }
            onCancel();
            setLoading(false);
            setLoadingSave(false);
            store.withdrawalTransaction.clearSelected();
            setWithdrawalTransaction({
              ...defaultWithdrawalTransaction,
            });
          } catch (error) {
          }
          swal({
            icon: "success",
            text: "Transaction has been saved",
          });
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
  const onCancel = () => {
    setWithdrawalTransaction(defaultWithdrawalTransaction)
    setOnClearFileComponent(true);
    setSplitTransactions([]);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_SPLIT_WITHDRAWAL_MODAL);
  };
  const onClear = () => {
    setWithdrawalTransaction(defaultWithdrawalTransaction);
    setSplitTransactions([]);
    setOnClearFileComponent(true);
  };
  const modalTitle = () => {
    switch (withdrawalTransaction.withdrawalTransactionProcess) {
      case "Back-Dated":
        return "NEW BACK DATED SPLIT Withdrawal TRANSACTION"
      case "Future-Dated":
        return "NEW FUTURE DATED SPLIT Withdrawal TRANSACTION"
      case "Normal":
        return "NEW MANUAL SPLIT Withdrawal TRANSACTION"
      default:
        return "NEW MANUAL SPLIT Withdrawal TRANSACTION";
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

      </div>
      <RecordSplitWithdrawalForm
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
        showOtherSource={showOtherSource}
        handleSourceChange={handleSourceChange}
      />
    </div>
  )
});
