import swal from "sweetalert";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { getMMAProduct } from "../../../../../shared/functions/MyFunctions";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { dateFormat_YY_MM_DD, sortAlphabetically } from "../../../../../shared/utils/utils";
import { defaultNaturalPerson, INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { IMoneyMarketAccount, defaultMoneyMarketAccount } from '../../../../../shared/models/money-market-account/MoneyMarketAccount';
import SingleManualDepositForm from "./record-transaction-modal/deposit-modal/SingleManualDepositForm";
import { DepositDuplicates } from "./duplicate-flag-outs/DuplicateTransactionsFlag";

const SingleManualDepositModal = observer(() => {
  const { api, store } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("Form");
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
  const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
  const [selectedClientProfile, setSelectedClientProfile] = useState<INaturalPerson | ILegalEntity | null>();
  const [showOtherSource, setShowOtherSource] = useState(false);

  const currentUser = store.auth.meUID || "";

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];
  const deposits = store.depositTransaction.all.map((t) => { return t.asJson });

  const selectedAccount = store.mma.all.find(
    (mma) => mma.asJson.accountNumber === depositTransaction.accountNumber
  );

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

          setDepositTransaction({ ...depositTransaction, valueDate: valueDate, depositTransactionProcess: "Future-Dated" });
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

          setDepositTransaction({
            ...depositTransaction, valueDate: valueDate, depositTransactionProcess: "Back-Dated"
          });
        }
        setLoading(false);
      });
    } else {

      setDepositTransaction({
        ...depositTransaction, valueDate: valueDate, depositTransactionProcess: "Normal"
      });
    }
  };

  const moneyMarketAccounts = store.mma.all;

  const handleClientAccountChange = (accountNumber: string) => {
    if (accountNumber) {
      const account = moneyMarketAccounts.find(account => account.asJson.accountNumber === accountNumber);
      if (account) {
        const client = clients.find(client => client.asJson.entityId === account.asJson.parentEntity)
        if (client) {
          setSelectedClientProfile(client.asJson);
          setSelectedClientAccount(account.asJson);
          setDepositTransaction(
            {
              ...depositTransaction,
              accountNumber: account.asJson.accountNumber,
              entityNumber: client.asJson.entityId
            }
          )
        }
      }
    } else {

      setSelectedClientProfile(null);
      setSelectedClientAccount(defaultMoneyMarketAccount);
      setDepositTransaction(
        {
          ...depositTransaction,
          accountNumber: '',
          entityNumber: ''
        }
      )
    }
  };

// Function to check if account name contains "Account Closed"
function isAccountClosed(accountName: string) {
  // Regex to match "Account Closed" in the account name, case-insensitive
  const regex = /account closed/i;
  const regexFinal = /closed account/i;
  return regex.test(accountName)||regexFinal.test(accountName);
}

const clientAccountOptions = moneyMarketAccounts
  .filter((mma) => 
    mma.asJson.status === "Active" && !isAccountClosed(mma.asJson.accountName)
  )
  .sort((a, b) => sortAlphabetically(a.asJson.accountName, b.asJson.accountName))
  .map((d) => {
    return {
      label: `${d.asJson.accountNumber} - ${d.asJson.accountName}`,
      value: d.asJson.accountNumber
    }
  });
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowOtherSource(value === "Other");
    // Clear the input field value when the user switches from 'Other' to another option
    if (value === "Other") {
      setDepositTransaction({
        ...depositTransaction,
        sourceOfFunds: depositTransaction.sourceOfFunds,
      });
    } else {
      setDepositTransaction({
        ...depositTransaction,
        sourceOfFunds: value,
      });
    }
  };

  const onClear = () => {
    setDepositTransaction({...defaultDepositTransaction})
    setSelectedClientProfile(defaultNaturalPerson);
    //clear with natural person 
    console.log("Client profile ",selectedClientProfile);
    
    setSelectedClientAccount(defaultMoneyMarketAccount);
    setOnClearFileComponent(true);
    handleClientAccountChange(" ");
    console.log("the deposit is set as default",depositTransaction);
    
  
  };

  const handleSave = async () => {
    if (selectedAccount && selectedClientProfile) {
      setLoadingSave(true);
      try {
        const saveTransaction: IDepositTransaction = {
          ...defaultDepositTransaction,
          transactionDate: Date.now(),
          valueDate: depositTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
          amount: depositTransaction.amount,
          accountNumber: depositTransaction.accountNumber,
          entityNumber: selectedClientProfile.entityId,
          sourceBank: depositTransaction.sourceBank,
          bankReference: depositTransaction.bankReference === "" ? "Deposit" : depositTransaction.bankReference,
          sourceOfFundsAttachment: depositTransaction.sourceOfFundsAttachment,
          proofOfPaymentAttachment: depositTransaction.proofOfPaymentAttachment,
          statementIdentifier: `ID-${depositTransaction.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${depositTransaction.amount}-${depositTransaction.bankReference}`,
          sourceOfFunds: depositTransaction.sourceOfFunds,
          transactionStatus: "Draft",
          transactionType: "Manual",
          allocationStatus: "Manually Allocated",
          depositTransactionProcess: depositTransaction.depositTransactionProcess,
          emailAddress: selectedClientProfile?.contactDetail.emailAddress,
          productCode: getMMAProduct(
            depositTransaction.accountNumber,
            store
          ),
          createdAtTime: {
            firstLevelQueue: Date.now(),
          },
          capturedBy: currentUser
        };
        try {
          await api.depositTransaction.create(saveTransaction);
          onCancel();
          setLoading(false);
          store.depositTransaction.clearSelected();
          setDepositTransaction({ ...defaultDepositTransaction });
        } catch (error) { }
      } catch (error) {
      }
      setLoadingSave(false);
    };
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedAccount && selectedClientProfile) {
      setLoading(true);
      try {
        const saveTransaction: IDepositTransaction = {
          ...defaultDepositTransaction,
          transactionDate: Date.now(),
          valueDate: depositTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
          amount: depositTransaction.amount,
          accountNumber: depositTransaction.accountNumber,
          entityNumber: selectedClientProfile.entityId,
          sourceBank: depositTransaction.sourceBank,
          bankReference: depositTransaction.bankReference === "" ? "Deposit" : depositTransaction.bankReference,
          sourceOfFundsAttachment: depositTransaction.sourceOfFundsAttachment,
          proofOfPaymentAttachment: depositTransaction.proofOfPaymentAttachment,
          statementIdentifier: `ID-${depositTransaction.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${depositTransaction.amount}-${depositTransaction.bankReference}`,
          sourceOfFunds: depositTransaction.sourceOfFunds,
          transactionStatus: "First Level",
          transactionType: "Manual",
          allocationStatus: "Manually Allocated",
          depositTransactionProcess: depositTransaction.depositTransactionProcess,
          emailAddress: selectedClientProfile?.contactDetail.emailAddress,
          productCode: getMMAProduct(depositTransaction.accountNumber, store),
          createdAtTime: {
            firstLevelQueue: Date.now(),
          },
          capturedBy: currentUser
        };
        const warning = DepositDuplicates(deposits.filter((t) => t.accountNumber === selectedClientAccount?.accountNumber), saveTransaction);
        if (warning) {
          swal({
            title: "Possible Duplicate?",
            text: "This transaction might be a possible duplication. would you like to continue?",
            icon: "warning",
            buttons: ["Cancel", "Record"],
            dangerMode: true,
          }).then(async (edit) => {
            if (edit) {
              swal({
                title: "Are you sure. ",
                icon: "warning",
                text: "Submit for first level approval?",
                buttons: ["Cancel", "Record"],
                dangerMode: true,
              }).then(async (edit) => {
                if (edit) {
                  try {
                    await api.depositTransaction.create(saveTransaction);
                    swal({
                      icon: "success",
                      text: "Transaction submitted for First Level Approval",
                    });
                  
                    onClear();
                    setLoading(false);
                    setDepositTransaction({ ...defaultDepositTransaction });
                  } catch (error) { }
                  // check
                }else {
                  swal({
                    icon: "error",
                    text: "Transaction cancelled!",
                  });
                }
              })
            }else {
              swal({
                icon: "error",
                text: "Transaction cancelled!",
              });
              return;
            }
          })

        }else{
          try {
            await api.depositTransaction.create(saveTransaction);
            swal({
              icon: "success",
              text: "Transaction submitted for First Level Approval",
            });
           
            onClear();
              onCancel();
            setLoading(false);
     
          } catch (error) { }
          // check
        }
      } catch (error) {
        swal(`Error ${error}`);
      }
    }
  };
  
  const handleAmountChange = (newAmount: number) => {
    setDepositTransaction({
      ...depositTransaction,
      amount: newAmount,
    });
  };

  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 2);

  useEffect(() => {
    const loadData = async () => {
      if (selectedAccount && selectedClientProfile) {
        await api.statementTransaction.getAll(selectedAccount.asJson.id);
      }
    };
    loadData();
  }, [api.statementTransaction, selectedAccount, selectedClientProfile]);


  let [onClearFileComponent, setOnClearFileComponent] = useState(false)

  // const onCancel = () => {
  //   setLoading(true);
  //   store.depositTransaction.clearSelected();
  //   setSelectedClientAccount({ ...defaultMoneyMarketAccount });
  //   setDepositTransaction({ ...defaultDepositTransaction });
  //   // setOnClearFileComponent(true);
  //   setLoading(false);
  //   hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_DEPOSIT_MODAL);
  // };
  const onCancel = () => {
    setSelectedClientProfile(null);
    setSelectedClientAccount(defaultMoneyMarketAccount);
    setDepositTransaction(defaultDepositTransaction);
    handleClientAccountChange(" ");
    store.depositTransaction.clearSelected();
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_DEPOSIT_MODAL);
    setLoading(false);
  };

  const modalTitle = () => {
    switch (depositTransaction.depositTransactionProcess) {
      case "Back-Dated":
        return "NEW BACK DATED DEPOSIT TRANSACTION"
      case "Future-Dated":
        return "NEW FUTURE DATED DEPOSIT TRANSACTION"
      case "Normal":
        return "NEW MANUAL DEPOSIT TRANSACTION"
      default:
        return "NEW MANUAL DEPOSIT TRANSACTION";
    }
  }

  const handleSetFileUrl = (url: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => {
    setDepositTransaction((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field]),
        url,
      },
    }));
  };

  const handleSetReason = (value: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => {
    setDepositTransaction((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field]),
        reasonForNotAttaching: value,
      },
    }));
  };

  return (
    <ErrorBoundary>
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
          <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
            Statement View
          </button>
        </div>

        <SingleManualDepositForm
          onCancel={onCancel}
          onClear={onClear}
          handleSubmit={handleSubmit}
          handleClientAccountChange={handleClientAccountChange}
          handleDateChange={handleDateChange}
          handleAmountChange={handleAmountChange}
          handleSave={handleSave}
          _loading={loading}
          _loadingSave={loadingSave}
          showOtherSource={showOtherSource}
          selectedClientAccount={selectedClientAccount}
          selectedClientProfile={selectedClientProfile}
          selectedTab={selectedTab}
          showStatement={false}
          clientAccountOptions={clientAccountOptions}
          depositTransaction={depositTransaction}
          defautTransaction={defaultDepositTransaction}
          setDepositTransaction={setDepositTransaction}
          onClearFileComponent={onClearFileComponent}
          setOnClearToFalse={setOnClearFileComponent}
          handleSourceChange={handleSourceChange}
          handleSetFileUrl={handleSetFileUrl}
          handleSetReason={handleSetReason}
        />
      </div>
    </ErrorBoundary>
  );
});

export default SingleManualDepositModal;