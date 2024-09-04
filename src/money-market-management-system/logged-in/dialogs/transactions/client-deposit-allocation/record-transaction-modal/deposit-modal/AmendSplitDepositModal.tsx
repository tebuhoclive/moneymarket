import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../../shared/functions/ModalShow";
import swal from "sweetalert";
import { getEntityId, getMMAProduct } from "../../../../../../../shared/functions/MyFunctions";
import MODAL_NAMES from "../../../../ModalName";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { defaultDepositTransaction, IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import AmendSplitDepositForm from "./AmendSplitDepositForm";
interface IShowProp {
  isVisible: (show: boolean) => void;
}

export const AmendSplitDepositModal = observer((props: IShowProp) => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Form");
  const { isVisible } = props;
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [deposit, setDeposit] = useState<IDepositTransaction>({
    ...defaultDepositTransaction,
  });
  const [splitTransactions, setSplitTransactions] = useState<IDepositTransaction[]>([]);
  const [toDelete, setToDelete] = useState<IDepositTransaction[]>([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState("");
  const [transactionUpdated, setTransactionUpdated] = useState(0);
  const [loading, setLoading] = useState(false);
  let [onClearFileComponent, setOnClearFileComponent] = useState(false);
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
  const handleUpdateAndSubmit = async () => {
    let count = 0;
    setLoading(true)
    const mainTransaction: IDepositTransaction = {
      ...deposit,
      amount: deposit.amount,
      depositNodeType: "Parent",
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
      await api.depositTransaction.update(mainTransaction);

      const parentTransactionId = mainTransaction.id;

      for (const transaction of splitTransactions) {
        const _transaction: IDepositTransaction = {
          ...mainTransaction,
          id: transaction.id,
          bankTransactionDate: 0,
          bankValueDate: 0,
          entityNumber: getEntityId(store, transaction.accountNumber),
          accountNumber: transaction.accountNumber,
          amount: transaction.amount,
          parentTransaction: parentTransactionId,
          sourceBank: mainTransaction.sourceBank,
          bankReference: transaction.bankReference,
          productCode: getMMAProduct(transaction.accountNumber, store),
          depositNodeType: "Child",
          emailAddress: transaction.emailAddress
        };
        if (transaction.id !== "") {
          await api.depositTransaction.update(_transaction);
console.log("transaction id is valid",transaction);

        } else {

          // await api.depositTransaction.create(_transaction);
        }
        count++;
        const progress = ((count / splitTransactions.length) * 100).toFixed(2); //
        setTransactionUpdated(count);
        setProgressPercentage(progress);
      }
      console.log("my main transaction final",mainTransaction);
      console.log("my main transaction final",mainTransaction);
      
      // await api.depositTransaction.update(mainTransaction); //check
      swal({
        icon: "success",
        text: "Transaction submitted for First Level Approval",
      });
      onCancel();
    } catch (error) {
    }
    setLoading(false)
  };
  const handleUpdateAndSave = async () => {
    if (splitTransactions.length !== 0) {
      swal({
        title: "Save Split Deposit as Draft?",
        icon: "warning",
        buttons: ["Cancel", "Yes"],
        dangerMode: true,
      }).then(async (edit) => {
        if (edit) {
          setLoadingSave(true);
          const saveTransaction: IDepositTransaction = {
            id: deposit.id,
            entityNumber: deposit.entityNumber,
            accountNumber: deposit.accountNumber,
            bankTransactionDate: 0,
            bankValueDate: 0,
            amount: deposit.amount,
            sourceBank: deposit.sourceBank,
            bankReference: "Deposit",
            valueDate: deposit.valueDate || Date.now(),
            transactionDate: deposit.transactionDate,
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
            description: deposit.description,

          };

          try {
            let count = 0;
            await api.depositTransaction.update(saveTransaction);
   
            const parentTransactionId = deposit.id;

            for (const transaction of splitTransactions) {
              const _transaction: IDepositTransaction = {
                ...deposit,
                id: transaction.id,
                bankTransactionDate: 0,
                bankValueDate: 0,
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
              if (transaction.id !== "") {
                await api.depositTransaction.update(_transaction);

              } else {
                await api.depositTransaction.create(_transaction);
              }
              count++;
              const progress = ((count / splitTransactions.length) * 100).toFixed(2); //
              setTransactionUpdated(count);
              setProgressPercentage(progress);
            }

            for (const transaction of toDelete) {
              await api.depositTransaction.delete(transaction);
              count++;
              const progress = ((count / splitTransactions.length) * 100).toFixed(2); //
              setTransactionUpdated(count);
              setProgressPercentage(progress);
            }

            onCancel();
            setLoading(false);
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
    isVisible(false);
    setDeposit(defaultDepositTransaction)
    setSplitTransactions([]);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_TRANSACTION_MODAL);
  };
  const onClear = () => {
    setDeposit(defaultDepositTransaction);
    setSplitTransactions([]);
  };
  useEffect(() => {
    if (store.depositTransaction.selected) {
      setDeposit(store.depositTransaction.selected);
      const saved = store.depositTransaction.getChildTransactions(store.depositTransaction.selected.id);
      const loadSavedTransactions = () => {
        const data: any[] = [];
        saved.forEach((transaction) => {
          data.push(transaction);
        });

        setSplitTransactions(data)
      }
      loadSavedTransactions();
    }
  }, [deposit.id, store.depositTransaction, store.depositTransaction.selected]);

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
        return "AMEND BACK DATED SPLIT DEPOSIT TRANSACTION"
      case "Future-Dated":
        return "AMEND FUTURE DATED SPLIT DEPOSIT TRANSACTION"
      case "Normal":
        return "AMEND MANUAL SPLIT DEPOSIT TRANSACTION"
      default:
        return "AMEND MANUAL SPLIT DEPOSIT TRANSACTION";
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
          Audit Trail        </button>
      </div>

      <AmendSplitDepositForm
        onCancel={onCancel}
        handleUpdateAndSubmit={handleUpdateAndSubmit}
        handleDateChange={handleDateChange}
        onClear={onClear}
        loading={loading}
        deposit={deposit}
        loadingSave={loadingSave}
        selectedTab={selectedTab}
        setDeposit={setDeposit}
        handleUpdateAndSave={handleUpdateAndSave}
        onClearFileComponent={onClearFileComponent}
        setOnClearToFalse={setOnClearFileComponent}
        toDelete={toDelete}
        splitTransactions={splitTransactions}
        setSplitTransactions={setSplitTransactions}
        setToDelete={setToDelete}
        showOtherSource={showOtherSource}
        handleSourceChange={handleSourceChange}
      />
    </div>
  )
});
