import { FormEvent, useEffect, useRef, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import React from "react";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { ISwitchTransaction, defaultSwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
import swal from "sweetalert";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD, sortAlphabetically } from "../../../../../shared/utils/utils";
import DetailView, { IDataDisplay } from "../../../shared/components/detail-view/DetailView";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import NumberInput from "../../../shared/components/number-input/NumberInput";
import NormalClientStatementSplit from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonthBackDating = new Date(currentYear, currentMonth, 2);
interface ObjectType {
  label: string;
  value: string
}
const defaultObjectType: ObjectType = {
  label: "",
  value: ""
}
interface IProps {
  setVisible: (show: boolean) => void;
}
const RecordEntitySwitchModal = observer(({ setVisible }: IProps) => {
  const { api, store } = useAppContext();
  const [selectedClientAccountNumber, setSelectedClientAccountNumber] = useState<ObjectType>({ ...defaultObjectType });
  const [selectedClientAccountNumberTo, setSelectedClientAccountNumberTo] = useState<ObjectType>({ ...defaultObjectType });
  const [selectedClient, setSelectedClient] = useState<
    INaturalPerson | ILegalEntity | null
  >();
  const [selectedClientTo, setSelectedClientTo] = useState<
    INaturalPerson | ILegalEntity | null
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];
  const [switchTransaction, setSwitchTransaction] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });
  const [switchTransactionTo, setSwitchTransactionTo] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });
  const moneyMarketAccounts = store.mma.all;
  const [backDatingTransaction, setBackDatingTransaction] = useState(false);
  const [verifyBackDating, setVerifyBackDating] = useState(false);
  const [futureDatingTransaction, setFutureDatingTransaction] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Withdrawal");
  const [saving, setSaving] = useState(false);
  const [isUploadPOP, setIsUploadPOP] = useState<boolean>(false);
  const [filePOP, setFilePOP] = useState<File | null>(null);
  const [fileUploadProgressPOP, setFileUploadProgressPOP] = useState(0);
  const fileInputRefPOP = useRef<HTMLInputElement>(null);
  const [loadingPOP, setLoadingPOP] = useState(false);
  const [selectedClientAccounts, setSelectedClientAccounts] = useState<IMoneyMarketAccount[]>([]);
  const [fileUrlPOP, setFileUrlStatePOP] = useState<string | null>(null);
  let fromAccount = moneyMarketAccounts.find((account) => account.asJson.accountNumber === switchTransaction?.fromAccount);
  console.log("🚀 ~ RecordEntitySwitchModal ~ fromAccount:", fromAccount)
  let toAccount = moneyMarketAccounts.find((account) => account.asJson.accountNumber === switchTransactionTo.toAccount);
  const fromAccountDetails: IDataDisplay[] = [
    {
      label: "Account Name",
      value: fromAccount ? fromAccount.asJson.accountName : ""
    },
    {
      label: "Account Number",
      value: fromAccount ? fromAccount.asJson.accountNumber : ""
    },
    {
      label: "Account Type",
      value: fromAccount ? fromAccount.asJson.accountType : ""
    },
    {
      label: "Client Rate",
      value: fromAccount ? fromAccount.asJson.clientRate ? fromAccount.asJson.clientRate : "-" : 0
    },
    {
      label: "Balance",
      value: fromAccount ? currencyFormat(fromAccount.asJson.balance) : ""
    },
  ]
  const toAccountDetails: IDataDisplay[] = [
    {
      label: "Account Name",
      value: toAccount ? toAccount.asJson.accountName : ""
    },
    {
      label: "Account Number",
      value: toAccount ? toAccount.asJson.accountNumber : ""
    },
    {
      label: "Account Type",
      value: toAccount ? toAccount.asJson.accountType : ""
    },
    {
      label: "Client Rate",
      value: toAccount ? toAccount.asJson.clientRate ? toAccount.asJson.clientRate : "-" : 0
    },
    {
      label: "Balance",
      value: toAccount ? currencyFormat(toAccount.asJson.balance) : ""
    },
  ]
  const _clientAccountOptions = moneyMarketAccounts.filter((mma) => mma.asJson.status === "Active").sort((a, b) => sortAlphabetically(a.asJson.accountName, b.asJson.accountName)).map((d) => {
    return {
      label: `${d.asJson.accountNumber} - ${d.asJson.accountName}`,
      value: d.asJson.accountNumber
    }
  })
  const accountToExclude = selectedClientAccountNumber.value;
  const _clientAccountOptionsTo = moneyMarketAccounts
    .filter((mma) =>
      mma.asJson.accountNumber !== accountToExclude && mma.asJson.status === "Active"
    )
    .sort((a, b) => sortAlphabetically(a.asJson.accountName, b.asJson.accountName))
    .map((d) => ({
      label: `${d.asJson.accountNumber} - ${d.asJson.accountName}`,
      value: d.asJson.accountNumber
    }));
  const handleClientAccountChange = (accountNumber: string) => {
    setSelectedClientAccountNumber({ label: selectedClientAccountNumber.label, value: accountNumber });
    store.statementTransaction.removeAll();
    const selectedAccount = store.mma.all.find(
      (mma) => mma.asJson.accountNumber === accountNumber
    );
    if (selectedAccount) {
      store.mma.select(selectedAccount.asJson);
      const account = store.mma.selected;
      if (account) {
        const client = clients.find(
          (client) => client.asJson.entityId === account.parentEntity
        );
        if (client) {
          setSelectedClient(client.asJson);
          setSwitchTransaction({
            ...switchTransaction,
            fromAccount: account.accountNumber,
            toEntityNumber: client.asJson.entityId
          })
        }
        return "";
      }
    }
  };
  const handleClientAccountChangeTo = (accountNumber: string) => {
    setSelectedClientAccountNumberTo({ label: selectedClientAccountNumberTo.label, value: accountNumber });
    store.statementTransaction.removeAll();
    const selectedAccount = store.mma.all.find(
      (mma) => mma.asJson.accountNumber === accountNumber
    );
    if (selectedAccount) {
      store.mma.select(selectedAccount.asJson);
      const account = store.mma.selected;
      if (account) {
        const client = clients.find(
          (client) => client.asJson.entityId === account.parentEntity
        );
        if (client) {
          setSelectedClientTo(client.asJson);
          setSwitchTransactionTo({
            ...switchTransaction,
            toAccount: account.accountNumber,
            fromEntityNumber: client.asJson.entityId
          })
        }
        return "";
      }
    }
  };
  const clientBalance = () => {
    const account = moneyMarketAccounts.find(
      (mma) => mma.asJson.accountNumber === fromAccount?.asJson.accountNumber
    );
    return account ? account.asJson.balance - account.asJson.cession : 0;
  };
  const availableBalance = clientBalance() - switchTransaction.amount;
  const isButtonDisabled = () => {
    if (!fromAccount || !toAccount) {
      return true; 
    } 
    if (
      (!switchTransaction.clientInstruction.reasonForNotAttaching && !switchTransaction.clientInstruction.url) || // Ensure at least one is provided
      !switchTransactionTo.fromAccount || 
      !switchTransactionTo.toAccount || 
      switchTransaction.amount === null || 
      switchTransaction.amount === undefined || 
      switchTransaction.amount === 0 || 
      loading || 
      switchTransaction.amount > fromAccount?.asJson.balance 
    ) {
      return true; 
    }
    return false;
  };
  const isDraftDisabled = () => {
    if (!fromAccount || !toAccount) {
      return true; 
    } 
    if (
      !switchTransaction.fromAccount && 
      !switchTransaction.toAccount 
    ) {
      return true; 
    }
    return false;
  };
  const displayMessage = ()=>{
    if(isDraftDisabled()){
      return <p>To Draft select both the "From Account" and "To Account".</p>
    }else{
      return null;
    }
  }
  const handleSwitchBetweenAccounts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit For Approval"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        if (fromAccount && toAccount) {
          if (futureDatingTransaction) {
            const _switchTransaction: ISwitchTransaction = {
              id: "",
              transactionDate: Date.now(),
              valueDate: switchTransaction.valueDate || Date.now(),
              toEntityNumber: switchTransaction.fromEntityNumber??"",
              fromAccount: switchTransaction.fromAccount??"",
              fromEntityNumber: switchTransactionTo.toEntityNumber??"",
              createdAt: Date.now(),
              toAccount: switchTransactionTo.toAccount,
              switchTransactionProcess: "Future-Dated",
              description: switchTransaction.description,
              amount: switchTransaction.amount,
              switchStatus: "First Level",
              switchAction: "Submitted for 1st Approval",
              clientInstruction: {
                url: switchTransaction.clientInstruction.url,
                reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
              },
              createdAtTime: {
                firstLevelQueue: Date.now()
              },
              reference: switchTransaction.reference || `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`,
              switchedBy: store.auth.meUID || "",
              transactionType: "Manual Switch",
              fromProductCode: fromAccount.asJson.accountType,
              toProductCode: toAccount.asJson.accountType
            };
            try {
              await api.switch.create(_switchTransaction);
            } catch (error) {
            }
          } else if (backDatingTransaction) {
            const _switchTransaction: ISwitchTransaction = {
              id: "",
              transactionDate: Date.now(),
              valueDate: switchTransaction.valueDate || Date.now(),
              toEntityNumber: switchTransaction.fromEntityNumber,
              fromAccount: switchTransaction.fromAccount,
              fromEntityNumber: switchTransactionTo.toEntityNumber,
              createdAt: Date.now(),
              toAccount: switchTransactionTo.toAccount,
              switchTransactionProcess: "Back-Dated",
              description: switchTransaction.description,
              amount: switchTransaction.amount,
              switchStatus: "First Level",
              switchAction: "Submitted for 1st Approval",
              clientInstruction: {
                url: switchTransaction.clientInstruction.url,
                reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
              },
              createdAtTime: {
                firstLevelQueue: Date.now()
              },
              reference: switchTransaction.reference || `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`,
              switchedBy: store.auth.meUID || "",
              transactionType: "Manual Switch",
              fromProductCode: fromAccount.asJson.accountType,
              toProductCode: toAccount.asJson.accountType
            };

            try {
              await api.switch.create(_switchTransaction);
            } catch (error) {

            }
          } else {
            const _switchTransaction: ISwitchTransaction = {
              id: "",
              transactionDate: Date.now(),
              valueDate: switchTransaction.valueDate || Date.now(),
              toEntityNumber: switchTransaction.toEntityNumber,
              fromAccount: switchTransaction.fromAccount,
              fromEntityNumber: switchTransactionTo.fromEntityNumber,
              createdAt: Date.now(),
              toAccount: switchTransactionTo.toAccount,
              switchTransactionProcess: "Normal",
              description: switchTransaction.description,
              amount: switchTransaction.amount,
              switchStatus: "First Level",
              switchAction: "Submitted for 1st Approval",
              clientInstruction: {
                url: switchTransaction.clientInstruction.url,
                reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
              },
              createdAtTime: {
                firstLevelQueue: Date.now()
              },
              reference: switchTransaction.reference || `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`,
              switchedBy: store.auth.meUID || "",
              transactionType: "Manual Switch",
              fromProductCode: fromAccount.asJson.accountType,
              toProductCode: toAccount.asJson.accountType
            };
            try {
              await api.switch.create(_switchTransaction);
            } catch (error) {
            }
          }
        }

        swal({
          icon: "success",
          text: "Switch recorded",
        });
        onCancel();
      }
    });
    setLoading(false);
  };
  const handleSwitchBetweenAccountsDraft = async () => {
    setSaving(true);
      swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: ["Cancel", "Save Draft"],
        dangerMode: true,
      }).then(async (edit) => {
        if (edit) {
          if (fromAccount && toAccount) {
            if (futureDatingTransaction) {
              const _switchTransaction: ISwitchTransaction = {
                id: "",
                transactionDate: Date.now(),
                valueDate: switchTransaction.valueDate || Date.now(),
                toEntityNumber: switchTransaction.fromEntityNumber,
                fromAccount: switchTransaction.fromAccount,
                fromEntityNumber: switchTransactionTo.toEntityNumber,
                createdAt: Date.now(),
                toAccount: switchTransactionTo.toAccount,
                switchTransactionProcess: "Future-Dated",
                description: switchTransaction.description,
                amount: switchTransaction.amount,
                switchStatus: "Draft",
                switchAction: "Saved",
                clientInstruction: {
                  url: switchTransaction.clientInstruction.url,
                  reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
                },
                createdAtTime: {
                  transactionQueue: Date.now()
                },
                reference: switchTransaction.reference || `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`,
                switchedBy: store.auth.meUID || "",
                transactionType: "Manual Switch",
                fromProductCode: fromAccount.asJson.accountType,
                toProductCode: toAccount.asJson.accountType
              };
              try {
                await api.switch.create(_switchTransaction);
                swal({
                  icon: "success",
                  text: "Switch recorded",
                });
              } catch (error) {
                console.log("Error "+error)
                swal({
                  icon: "warning",
                  text: "Error Processing Future Dating",
                });
              }
            } else if (backDatingTransaction) {
              const _switchTransaction: ISwitchTransaction = {
                id: "",
                transactionDate: Date.now(),
                valueDate: switchTransaction.valueDate || Date.now(),
                toEntityNumber: switchTransaction.fromEntityNumber,
                fromAccount: switchTransaction.fromAccount,
                fromEntityNumber: switchTransactionTo.toEntityNumber,
                createdAt: Date.now(),
                toAccount: switchTransactionTo.toAccount,
                switchTransactionProcess: "Back-Dated",
                description: switchTransaction.description,
                amount: switchTransaction.amount,
                switchStatus: "Draft",
                switchAction: "Saved",
                clientInstruction: {
                  url: switchTransaction.clientInstruction.url,
                  reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
                },
                createdAtTime: {
                  transactionQueue: Date.now()
                },
                reference: switchTransaction.reference || `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`,
                switchedBy: store.auth.meUID || "",
                transactionType: "Manual Switch",
                fromProductCode: fromAccount.asJson.accountType,
                toProductCode: toAccount.asJson.accountType
              };
              try {
                await api.switch.create(_switchTransaction);
                swal({
                  icon: "success",
                  text: "Switch recorded",
                });
              } catch (error) {
                console.log("Error "+error)
                swal({
                  icon: "warning",
                  text: "Error Processing Back Dating",
                });
              }
            } else {
              const _switchTransaction: ISwitchTransaction = {
                id: "",
                transactionDate: Date.now(),
                valueDate: switchTransaction.valueDate || Date.now(),
                toEntityNumber: switchTransaction.toEntityNumber,
                fromAccount: switchTransaction.fromAccount,
                fromEntityNumber: switchTransactionTo.fromEntityNumber,
                createdAt: Date.now(),
                toAccount: switchTransactionTo.toAccount,
                switchTransactionProcess: "Normal",
                description: switchTransaction.description,
                amount: switchTransaction.amount,
                switchStatus: "Draft",
                switchAction: "Saved",
                clientInstruction: {
                  url: switchTransaction.clientInstruction.url,
                  reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
                },
                createdAtTime: {
                  transactionQueue: Date.now()
                },
                reference: switchTransaction.reference || `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`,
                switchedBy: store.auth.meUID || "",
                transactionType: "Manual Switch",
                fromProductCode: fromAccount.asJson.accountType,
                toProductCode: toAccount.asJson.accountType
              };
              try {
                await api.switch.create(_switchTransaction);
                swal({
                  icon: "success",
                  text: "Switch Saved",
                });
              } catch (error) {
                console.log("Error "+error)
                swal({
                  icon: "warning",
                  text: "Error Processing",
                });
              }
            }
          }else{
            swal({
              icon: "warning",
              text: "No Accounts Selected",
            });
          }
        }
      });
    setSaving(false);
    onCancel();
  }
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const selectedDate = e.target.valueAsNumber;
    if (dateFormat_YY_MM_DD(selectedDate) > dateFormat_YY_MM_DD(Date.now())) {
      swal({
        title: "Transaction Future Dating",
        text: `Do you want to record a Switch that will be future dated to ${dateFormat_YY_MM_DD(
          selectedDate
        )}`,
        icon: "warning",
        buttons: ["Cancel", "Future Date"],
        dangerMode: true,
      }).then(async (edit) => {
        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now recording a Switch that will be future dated to ${dateFormat_YY_MM_DD(
              selectedDate
            )}`,
          });
          setSwitchTransaction({
            ...switchTransaction,
            valueDate: selectedDate,
            description: "Future Dated Transaction",
          });
          setBackDatingTransaction(false);
          setFutureDatingTransaction(true);
        }
        setLoading(false);
      });
    } else if (
      dateFormat_YY_MM_DD(selectedDate) < dateFormat_YY_MM_DD(Date.now())
    ) {
      swal({
        title: "Transaction Back Dating",
        text: `Do you want to record a Switch that will be back dated to ${dateFormat_YY_MM_DD(
          selectedDate
        )}`,
        icon: "warning",
        buttons: ["Cancel", "Back Date"],
        dangerMode: true,
      }).then(async (edit) => {
        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now recording a Switch that will be back dated to ${dateFormat_YY_MM_DD(
              selectedDate
            )}`,
          });
          setSwitchTransaction({
            ...switchTransaction,
            valueDate: selectedDate,
            description: "Back Dated Transaction",
          });
          setFutureDatingTransaction(false);
          setBackDatingTransaction(true);
        }
        setLoading(false);
      });
    } else {
      setSwitchTransaction({
        ...switchTransaction,
        valueDate: selectedDate,
      });
      setBackDatingTransaction(false);
      setFutureDatingTransaction(false);
    }
  };
  const onClear = () => {
    setSwitchTransaction({ ...defaultSwitchTransaction });
    setSwitchTransactionTo({ ...defaultSwitchTransaction });
    setSelectedClient(null);
    setSelectedClientTo(null);
    setSelectedClientAccountNumberTo({ label: "", value: "" })
    setSelectedClientAccountNumber({ label: "", value: "" })
  };
  const onCancel = () => {
    setSwitchTransaction({ ...defaultSwitchTransaction });
    setSwitchTransactionTo({ ...defaultSwitchTransaction });
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_MODAL);
    setSelectedClient(null);
    setSelectedClientTo(null);
    setSelectedClientAccountNumberTo({ label: "", value: "" })
    setSelectedClientAccountNumber({ label: "", value: "" })
    setLoading(false);
    setVisible(false);
  };
  const handleAmountChange = (newAmount: number) => {
    setSwitchTransaction({
      ...switchTransaction,
      amount: newAmount,
    })
  };
  const handleCheckboxChangePOP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsUploadPOP(checked);
    if (checked) {
      setFilePOP(null);
      setFileUrlStatePOP(null);
    } else {
      setFileUrlStatePOP(null);
      setFilePOP(null);
    }
  };
  const handleFileSelectPOP = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFilePOP(selectedFile);
      await handleFileUploadPOP(selectedFile);
    }
  };
  const handleFileUploadPOP = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/switches/${dateFormat_DD_MM_YY(Date.now())}/${switchTransaction.fromAccount}/Client Instruction`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileUploadProgressPOP(progress);
    });
    try {
      setLoadingPOP(true);
      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      setSwitchTransaction({
        ...switchTransaction,
        clientInstruction: {
          url: downloadURL,
          reasonForNotAttaching: ""
        }
      })
      setFileUrlStatePOP(downloadURL);
      setFilePOP(null);
      setFileUploadProgressPOP(0);
      setLoadingPOP(false);
    } catch (error) {
      console.error("File upload failed:", error);
      setLoadingPOP(false);
    }
  };
  const handleReasonChangePOP = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setSwitchTransaction({
      ...switchTransaction,
      clientInstruction: {
        url: "",
        reasonForNotAttaching: value
      }
    })
  };
  useEffect(() => {
    const loadStatement = async () => {
      if (fromAccount && fromAccount.asJson.id) {
        try {
          await Promise.all([
            api.statementTransaction.getAll(fromAccount.asJson.id || ""),
          ]);
        } catch (error) { }
      } else {
      }
    };

    loadStatement();
  }, [api.statementTransaction, fromAccount, selectedClientAccountNumber, selectedClientAccountNumberTo]);
  useEffect(() => {
    if(fromAccount && toAccount){
      setSelectedClientAccounts([
        fromAccount.asJson,
        toAccount.asJson
      ]);
    }
  }, [fromAccount, toAccount]);
  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
        <button className="uk-modal-close-default"
          onClick={onCancel} type="button" data-uk-close></button>
        <div className="form-title">
          <h3 style={{ marginRight: "1rem" }}>
            Switch
          </h3>
          <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
          <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
            Manual Switch Transaction
          </h3>
        </div>
        <hr />
        <div className="uk-margin-bottom uk-text-right">
          <button className={`btn ${selectedTab === "Withdrawal" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Withdrawal")}>
            Switch View
          </button>
          <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
            Statement View
          </button>
        </div>
        <div className="dialog-content uk-position-relative">
          <div className="uk-grid uk-grid-small uk-child-width-1-1 uk-width-1-1" data-uk-grid>
            {selectedTab === "Withdrawal" &&
              <div className="uk-child-width-1-3@m uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-width-1-1">
                {displayMessage()}
                  <form className="uk-grid uk-grid-small" data-uk-grid>
                    <div className="uk-width-1-2">
                      <label>Switch From:</label>
                      <SingleSelect
                        value={selectedClientAccountNumber?.value}
                        options={_clientAccountOptions}
                        onChange={handleClientAccountChange} />
                    </div>
                    <div className="uk-width-1-2">
                      <label>Switch To:</label>
                      <SingleSelect
                        value={selectedClientAccountNumberTo?.value}
                        options={_clientAccountOptionsTo}
                        onChange={handleClientAccountChangeTo} />
                    </div>
                    <div className="uk-width-1-2">
                      {fromAccount && (
                        <div >
                          <h4 className="main-title-sm">Switch-From Account Information</h4>
                          <DetailView dataToDisplay={fromAccountDetails} />
                        </div>
                      )}
                    </div>
                    <div className="uk-width-1-2">
                      {toAccount && (
                        <div >
                          <h4 className="main-title-sm">Switch-To Account Information</h4>
                          <DetailView dataToDisplay={toAccountDetails} />
                        </div>
                      )}
                    </div>
                    <div className="uk-width-1-2">
                      <label className="uk-form-label required" htmlFor="valueDate">
                        Value Date:
                      </label>
                      <input className="uk-input uk-form-small" id="ijgValueDate" type="date" name="ijgValueDate"
                        min={startOfMonthBackDating.toISOString().split('T')[0]}
                        value={
                          switchTransaction.valueDate
                            ? dateFormat_YY_MM_DD(switchTransaction.valueDate)
                            : dateFormat_YY_MM_DD(Date.now())
                        }
                        onChange={handleDateChange}
                        required
                      />
                    </div>
                    <div className="uk-width-1-2">
                      {selectedClient && fromAccount && availableBalance < 0 && (
                        <span className="uk-text-danger uk-display-block">
                        Switch Amount exceeds available balance
                        </span>
                      )}
                      <label className="uk-form-label required" htmlFor="">
                        Amount:
                      </label>
                      <NumberInput value={switchTransaction.amount}  onChange={(value)=>handleAmountChange(Number(value))}/>
                      {
                        verifyBackDating &&
                        <span className="uk-display-block uk-text-danger uk-margin-top-small">Cannot back date this switch to the selected date as the balance on that date is insufficient</span>
                      }
                    </div>
                    <div className="uk-width-1-2">
                      <label className="uk-form-label required" htmlFor="">
                       Statement Reference:
                      </label>
                      <input
                        placeholder={switchTransaction?.reference ? '': `Switch from ${fromAccount?.asJson.accountNumber} to ${toAccount?.asJson.accountNumber}`}
                        value={switchTransaction?.reference}
                        onChange={(e) => setSwitchTransaction({
                          ...switchTransaction,
                          reference: e.target.value,
                        })
                        }
                      />
                    </div>
                    <div className="uk-width-1-2">
                      <label className="uk-form-label" >
                        Attach Client Instruction: {" "}
                        <input className='uk-checkbox' type="checkbox"
                          checked={isUploadPOP}
                          onChange={handleCheckboxChangePOP} //
                        />
                      </label>
                      {isUploadPOP ? //CHANGE
                        <div>
                          <div data-uk-form-custom="target: true">
                            <input
                              type="file"
                              aria-label="Custom controls"
                              accept=".pdf, .jpg, .jpeg, .png, .eml"
                              onChange={handleFileSelectPOP} //
                              id="fileToAttach"
                              ref={fileInputRefPOP} //CHAN
                            />
                            <input
                              className="uk-form-small"
                              type="text"
                              placeholder={fileUrlPOP ? "Replace file" : "Select file"} //
                              aria-label="Custom controls"
                              disabled
                              value={fileUrlPOP === "" ? '' : filePOP?.name || ''}  //
                            />
                          </div>
                          {fileUrlPOP && ( //
                            <div>
                              <a
                                href={fileUrlPOP} //
                                target="_blank" rel="noopener noreferrer">View file</a>
                            </div>
                          )}
                          {loadingPOP && //
                            <progress
                              className="uk-progress uk-progress-success"
                              value={fileUploadProgressPOP} //
                              max="100"
                            />
                          }
                        </div>
                        :
                        <div>
                          <textarea
                            className="uk-form-small"
                            cols={5}
                            value={switchTransaction.clientInstruction.reasonForNotAttaching}
                            onChange={handleReasonChangePOP}//
                            required
                          />
                        </div>
                      }
                    </div>
                    {futureDatingTransaction && (
                      <div className="uk-width-1-2 uk-margin-bottom">
                        <label className="uk-form-label required" htmlFor="">
                          Reason for Future Dating:
                        </label>
                        <textarea className="uk-form-small uk-textarea" name="reasonForFutureDating" id="reasonForFutureDating" cols={20} rows={5}
                          onChange={(e) => setSwitchTransaction({
                            ...switchTransaction,
                            transactionNotes: e.target.value,
                          })
                          }
                          required>
                        </textarea>
                      </div>
                    )}
                    {backDatingTransaction && (
                      <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="">Reason for Back Dating:</label>
                        <textarea className="uk-form-small uk-textarea" name="reasonForBackDating" id="reasonForBackDating"
                          cols={20}
                          rows={5}
                          onChange={(e) => setSwitchTransaction({
                            ...switchTransaction,
                            transactionNotes: e.target.value,
                          })
                          }
                          required>

                        </textarea>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            }
            {selectedTab === "Statement" &&
              <div className="uk-width-1-1">
              <NormalClientStatementSplit accountsToSplit={selectedClientAccounts} />
              </div>
            }
          </div>
        </div>
        <div className="uk-margin-padding-top uk-text-right">
          <button type="button" className="btn btn-danger" onClick={onCancel} disabled={loading || saving}>
            Cancel
          </button>
          <button disabled={loadingPOP} type="button" className="btn btn-primary-in-active uk-margin-small-top" onClick={onClear}>
            Clear Form
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSwitchBetweenAccountsDraft} disabled={loading || saving||isDraftDisabled()}>
            {saving ? <span data-uk-spinner={"ratio:.5"}></span> : "Save"}
          </button>
          <button type="button" className="btn btn-primary"
            onClick={(e) => handleSwitchBetweenAccounts(e as unknown as React.FormEvent<HTMLFormElement>)}
            disabled={loading || saving ||isButtonDisabled()}
          >
            {loading ? (<div data-uk-spinner={"ratio:.5"}></div>
            ) : "Submit For Approval"}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default RecordEntitySwitchModal;


