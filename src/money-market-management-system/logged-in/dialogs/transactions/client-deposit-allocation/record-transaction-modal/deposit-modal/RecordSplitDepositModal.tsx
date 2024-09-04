import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../../shared/functions/ModalShow";
import swal from "sweetalert";
import { getEntityId, getMMAProduct } from "../../../../../../../shared/functions/MyFunctions";
import MODAL_NAMES from "../../../../ModalName";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import SplitDepositForm from "./RecordSplitDepositForm";
import { defaultDepositTransaction, IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { SplitDepositDuplicates } from "../../duplicate-flag-outs/DuplicateTransactionsFlag";

export const RecordSplitDepositModal = observer(() => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Form");
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [deposit, setDeposit] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
  const [splitTransactions, setSplitTransactions] = useState<IDepositTransaction[]>([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState("");
  const [transactionUpdated, setTransactionUpdated] = useState(0);
  const [loading, setLoading] = useState(false);
  let [onClearFileComponent, setOnClearFileComponent] = useState(false);
  const deposits = store.depositTransaction.all.map((t) => { return t.asJson });
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowOtherSource(value === "Other");

    // Clear the input field value when the user switches from 'Other' to another option
    if (value === "Other") {
      setDeposit({
        ...deposit,
        sourceOfFunds: deposit.sourceOfFunds,
      });
    } else {
      setDeposit({
        ...deposit,
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
        text: `Do you want to record a Deposit that will be future dated to ${selectedDate
          }`,
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {
        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now recording a Deposit that will be future dated to ${selectedDate
              }`,
          });

          setDeposit({ ...deposit, valueDate: valueDate, depositTransactionProcess: "Future-Dated" });
        }
        setLoading(false);
      });
    } else if (selectedDate < today) {
      swal({
        title: "Transaction Back Dating",
        text: `Do you want to capture a Split Deposit that will be back dated to ${selectedDate}`,
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {

        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now capturing a Deposit that will be back dated to ${selectedDate}`,
          });

          setDeposit({
            ...deposit, valueDate: valueDate, depositTransactionProcess: "Back-Dated"
          });
        }
        setLoading(false);
      });
    } else {

      setDeposit({
        ...deposit, valueDate: valueDate, depositTransactionProcess: "Normal"
      });
    }
  };
  const handleSubmit = async () => {
    let count = 0;
    setLoading(true)
    const mainTransaction: IDepositTransaction = {
      ...deposit,
      amount: deposit.amount,
      depositNodeType: "Parent",
      bankTransactionDate: 0,
      bankValueDate: 0,
      allocationStatus: "Manually Allocated",
      transactionDate: Date.now(),
      capturedBy: store.auth.meUID || "",
      sourceBank: deposit.sourceBank,
      bankReference: "Deposit",
      valueDate: deposit.valueDate || Date.now(),
      productCode: getMMAProduct(deposit.accountNumber, store),
      sourceOfFunds: deposit.sourceOfFunds,
      sourceOfFundsAttachment: deposit.sourceOfFundsAttachment,
      proofOfPaymentAttachment: deposit.proofOfPaymentAttachment,
      transactionType: "Split",
      transactionStatus: "First Level",
      createdAtTime: {
        firstLevelQueue: Date.now()
      },
      transactionAction: "Split",
      depositTransactionProcess: deposit.depositTransactionProcess,
    };
    try {
      await api.depositTransaction.create(mainTransaction);
      const savedMainTransactionId = mainTransaction.id;
      if (!savedMainTransactionId) {
        throw new Error("Failed to save main transaction or retrieve its ID");
      }
      const parentTransactionId = savedMainTransactionId;
      if (SplitDepositDuplicates(deposits, parentTransactionId, splitTransactions)) {
        setLoading(false);
        swal({
            icon: "warning",
            text: "Duplicate transactions found. Please check your transactions and try again.",
        });
        return;
    }
      for (const transaction of splitTransactions) {
        const _transaction: IDepositTransaction = {
          ...mainTransaction,
          id: "",
          entityNumber: getEntityId(store, transaction.accountNumber),
          accountNumber: transaction.accountNumber,
          amount: transaction.amount,
          parentTransaction: parentTransactionId,
          sourceBank: mainTransaction.sourceBank,
          bankReference: transaction.bankReference ?? "Deposit",
          productCode: getMMAProduct(transaction.accountNumber, store),
          depositNodeType: "Child",
          emailAddress: transaction.emailAddress
        };

        await api.depositTransaction.create(_transaction);
        count++;
        const progress = ((count / splitTransactions.length) * 100).toFixed(2); //
        setTransactionUpdated(count);
        setProgressPercentage(progress);
      }
      await api.depositTransaction.update(mainTransaction); //check
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
        title: "Save Split Deposit as Draft?",
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {
        if (edit) {
          setLoadingSave(true);
          const saveTransaction: IDepositTransaction = {
            id: "",
            entityNumber: deposit.entityNumber,
            accountNumber: deposit.accountNumber,
            bankTransactionDate: 0,
            bankValueDate: 0,
            amount: deposit.amount,
            sourceBank: deposit.sourceBank,
            bankReference: "Deposit",
            valueDate: deposit.valueDate || Date.now(),
            transactionDate: Date.now(),
            allocationStatus: "Manually Allocated",
            transactionType: "Split",
            productCode: getMMAProduct(deposit.accountNumber, store),
            sourceOfFunds: deposit.sourceOfFunds,
            proofOfPaymentAttachment: deposit.proofOfPaymentAttachment,
            sourceOfFundsAttachment: deposit.sourceOfFundsAttachment,
            transactionStatus: "Draft",
            createdAtTime: {
              transactionQueue: Date.now()
            },
            depositNodeType: "Parent",
            statementIdentifier: `ID-${deposit.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${deposit.amount}-${deposit.bankReference}`,
            depositTransactionProcess: deposit.depositTransactionProcess,
            description: deposit.description
          };

          try {
            let count = 0;
            await api.depositTransaction.create(saveTransaction);
            const savedMainTransactionId = saveTransaction.id;

            if (!savedMainTransactionId) {
              throw new Error("Failed to save main transaction or retrieve its ID");
            }

            const parentTransactionId = savedMainTransactionId;

            for (const transaction of splitTransactions) {
              const _transaction: IDepositTransaction = {
                ...saveTransaction,
                id: "",
                entityNumber: getEntityId(store, transaction.accountNumber),
                accountNumber: transaction.accountNumber,
                amount: transaction.amount,
                parentTransaction: parentTransactionId,
                sourceBank: saveTransaction.sourceBank,
                bankReference: transaction.bankReference,
                productCode: getMMAProduct(transaction.accountNumber, store),
                depositNodeType: "Child",
                emailAddress: transaction.emailAddress
              };

              await api.depositTransaction.create(_transaction);
              count++;
              const progress = ((count / splitTransactions.length) * 100).toFixed(2);
              setTransactionUpdated(count);
              setProgressPercentage(progress);
            }
            onCancel();
            setLoading(false);
            setLoadingSave(false);
            store.depositTransaction.clearSelected();
            setDeposit({
              ...defaultDepositTransaction,
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
    setDeposit(defaultDepositTransaction)
    setOnClearFileComponent(true);
    setSplitTransactions([]);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_SPLIT_DEPOSIT_MODAL);
  };
  const onClear = () => {
    setDeposit(defaultDepositTransaction);
    setSplitTransactions([]);
    setOnClearFileComponent(true);
  };
  const modalTitle = () => {
    switch (deposit.depositTransactionProcess) {
      case "Back-Dated":
        return "NEW BACK DATED SPLIT DEPOSIT TRANSACTION"
      case "Future-Dated":
        return "NEW FUTURE DATED SPLIT DEPOSIT TRANSACTION"
      case "Normal":
        return "NEW MANUAL SPLIT DEPOSIT TRANSACTION"
      default:
        return "NEW MANUAL SPLIT DEPOSIT TRANSACTION";
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
      <div className="uk-margin-small-bottom uk-text-right">
        <button className={`btn ${selectedTab === "Form" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Form")}>
          Deposit View
        </button>

        <button className={`btn ${selectedTab === "Allocation" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Allocation")}>
          Allocation View
        </button>

        <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
          Statement View
        </button>

      </div>
      <SplitDepositForm
        onCancel={onCancel}
        handleSubmit={handleSubmit}
        handleDateChange={handleDateChange}
        onClear={onClear}
        loading={loading}
        deposit={deposit}
        loadingSave={loadingSave}
        selectedTab={selectedTab}
        setDeposit={setDeposit}
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
