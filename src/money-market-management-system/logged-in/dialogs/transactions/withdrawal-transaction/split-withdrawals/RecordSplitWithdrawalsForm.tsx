import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { runInAction } from "mobx";
import { getAccount, getEntity } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import { getProductCode } from "../../../../system-modules/reports-module/transactions/GetProductCode";
import { currencyFormat, numberFormat } from "../../../../../../shared/functions/Directives";
import NumberInput from "../../../../shared/components/number-input/NumberInput";
import NormalClientStatementSplit from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { SplitWithdrawalAllocationSheet } from "./SplitWithdrawalAllocationSheet";
import { NoData } from "../../../../../../shared/components/nodata/NoData";
import swal from "sweetalert";
interface FormProps {
  handleSubmit: () => void;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSourceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSave: () => void;
  onClear: () => void;
  selectedTab: string;
  showOtherSource: boolean;
  loading?: boolean;
  loadingSave?: boolean;
  onClearFileComponent: boolean;
  onCancel: () => void;
  setWithdrawalTransaction: React.Dispatch<React.SetStateAction<IWithdrawalTransaction>>;
  setSplitTransactions: React.Dispatch<React.SetStateAction<IWithdrawalTransaction[]>>;
  setOnClearToFalse?: ((clear: boolean) => void) | undefined;
  withdrawalTransaction: IWithdrawalTransaction;
  splitTransactions: IWithdrawalTransaction[];
}

const RecordSplitWithdrawalForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    handleSave,
    handleSubmit,
    handleDateChange,
    handleSourceChange,
    onClear,
    loading,
    selectedTab,
    withdrawalTransaction,
    splitTransactions,
    loadingSave,
    setWithdrawalTransaction,
    setSplitTransactions,
  }) => {
    const { store } = useAppContext();
    const [selectedClientAccounts, setSelectedClientAccounts] = useState<IMoneyMarketAccount[]>([]);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formattedFirstDay = dateFormat_YY_MM_DD(firstDayOfMonth.getTime());
    const formattedLastDay = dateFormat_YY_MM_DD(lastDayOfMonth.getTime());
    const [clientBankingDetailsAccounts, setClientBankingDetailsAccounts] = useState<any[]>([]); const agents = store.agent.all;
    const agentsAccount = agents.map((acc) => ({
      value: `${acc.asJson.bankName} | ${acc.asJson.agentName} | ${acc.asJson.accountNumber} | ${acc.asJson.branchCode}`,
      label: ` ${acc.asJson.agentName} - ${acc.asJson.bankName} (${acc.asJson.accountNumber}) `,
    }));
    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );
    const [isUploadSOF, setIsUploadSOF] = useState<boolean>(false);
    const [fileSOF, setFileSOF] = useState<File | null>(null);
    const [fileUploadProgressSOF, setFileUploadProgressSOF] = useState(0);
    const fileInputRefSOF = useRef<HTMLInputElement>(null);
    const [loadingSOF, setLoadingSOF] = useState(false);
    const [fileUrlSOF, setFileUrlStateSOF] = useState<string | null>(null);
    const handleClearAndAdditionalAction = () => {
      onClear();
      handleSetFileUrl("", "sourceOfFundsAttachment")
      handleSetReason("", "sourceOfFundsAttachment")
      handleSetFileUrl("", "proofOfPaymentAttachment")
      handleSetReason("", "proofOfPaymentAttachment")
      setSelectedClientAccounts([])
      setSelectedValues([])
    };
    const handleCancelAndAdditionalAction = () => {
      onCancel();
      handleSetFileUrl("", "sourceOfFundsAttachment")
      handleSetReason("", "sourceOfFundsAttachment")
      handleSetFileUrl("", "proofOfPaymentAttachment")
      handleSetReason("", "proofOfPaymentAttachment")
      setSelectedClientAccounts([])
      setSelectedValues([])
    };
    const handleSetFileUrl = (url: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => {
      // setWithdrawalTransaction((prev) => ({
      //   ...prev,
      //   [field]: {
      //     ...(prev[field]),
      //     url,
      //   },
      // }));
    };
    const handleSetReason = (value: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => {
      // setWithdrawalTransaction((prev) => ({
      //   ...prev,
      //   [field]: {
      //     ...(prev[field]),
      //     url,
      //   },
      // }));
    };
    const onAddItem = () => {
      const newItem: IWithdrawalTransaction = {
        ...defaultWithdrawalTransaction,
      };
      const data = [...splitTransactions];
      data.push(newItem);
      setSplitTransactions(data);
    };
    const onItemChange = (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      runInAction(() => {
        const data = [...splitTransactions];
        const name = e.target.name;
        const value = e.target.value;
        data[index] = { ...data[index], [name]: value };
        setSplitTransactions(data);
      });
    };
    const onItemRemove = (index: number) => {
      const data = [...splitTransactions];
      const accounts = [...selectedClientAccounts];
      accounts.splice(index, 1);
      data.splice(index, 1);
      setSplitTransactions(data);
      setSelectedClientAccounts(accounts);
    };
    const onAmountChange = (
      value: number,
      index: number,
    ) => {
      runInAction(() => {
        const data = [...splitTransactions];
        data[index] = {
          ...data[index],
          amount: value,
        };
        setSplitTransactions(data);
        console.log("split", splitTransactions);
      });
    };
    const onClientChange = (value: string, index: number) => {
      runInAction(() => {
        const accountDetails = getAccount(value, store);
        const entity = getEntity(accountDetails?.parentEntity || "", store);
        let newClientBankingDetailsAccounts: any[] = [];
        if (accountDetails && entity) {
          if (Array.isArray(entity.bankingDetail)) {
            newClientBankingDetailsAccounts = entity.bankingDetail.map((clientBankingDetailsDetail: any) => ({
              label: `${clientBankingDetailsDetail.bankName} | ${clientBankingDetailsDetail.accountNumber} | ${clientBankingDetailsDetail.accountHolder} | ${clientBankingDetailsDetail.branchNumber}`,
              value: `${clientBankingDetailsDetail.bankName} | ${clientBankingDetailsDetail.accountNumber} | ${clientBankingDetailsDetail.accountHolder} | ${clientBankingDetailsDetail.branchNumber}`,
            }));
          } else if (typeof entity.bankingDetail === "object" && entity.bankingDetail !== null) {
            const { bankName, accountHolder, accountNumber, branchNumber } = entity.bankingDetail;
            const label = `${bankName} | ${accountNumber} | ${accountHolder} | ${branchNumber}`;
            const value = `${bankName} | ${accountNumber} | ${accountHolder} | ${branchNumber}`;
            newClientBankingDetailsAccounts.push({ label, value });
          } else {
            console.log("Banking Detail is of an unknown type or does not exist");
          }
          setClientBankingDetailsAccounts(newClientBankingDetailsAccounts);
        } else {
          //! Account That did not have entity/account details found : A03520 -Hite Renald John
          swal({
            icon: "error",
            text: "No Entity / Account Details Found!",
          });
        }
        const accounts = [...selectedClientAccounts];
        const data = [...splitTransactions];
        data[index] = {
          ...data[index],
          accountNumber: value,
          accountName: accountDetails?.accountName ?? "",
          productCode: getProductCode(store, value),
          entityNumber: entity?.entityId || "",
          emailAddress: entity?.contactDetail.emailAddress,
          bankingDetails: newClientBankingDetailsAccounts
        };
        accounts[index] = {
          ...accounts[index],
          accountNumber: accountDetails?.accountNumber || "",
          accountName: accountDetails?.accountName || "",
        };

        setSplitTransactions(data);
        setSelectedClientAccounts(accounts);
        const formattedValue = accountDetails?.accountNumber ??"";
        setSelectedValues(prevValues => {
          const updatedValues = [...prevValues]; // Create a copy of the previous values
          updatedValues[index] = formattedValue; // Update the value at the specific index
          return updatedValues; // Return the updated array
        });
      });
    };
    const handleUseAgentChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      runInAction(() => {
        const data = [...splitTransactions];
        data[index] = {
          ...data[index],
          useAgent: event.target.checked
        };
        setSplitTransactions(data);
      });
    };
    const handleBankAccountChange = (selectedBank: string, index: number) => {
      console.log("Selected Bank " + selectedBank);
      runInAction(() => {
        const data = [...splitTransactions];
        data[index] = {
          ...data[index],
          clientBankingDetails: selectedBank
        };
        setSplitTransactions(data);
      });
    }
    const handleClientBankDetailsChange = (clientBankingDetail: string, index: number) => {
      runInAction(() => {
        const data = [...splitTransactions];
        data[index] = {
          ...data[index],
          clientBankingDetails: clientBankingDetail
        };
        setSplitTransactions(data);
      });
    }
    const canAddAllocation = () => {
      if (splitTransactions.length > 0) {
        const previousAllocation = splitTransactions[splitTransactions.length - 1];

        if ((previousAllocation && previousAllocation.accountNumber === "") || totalAllocatedSplitValue === withdrawalTransaction.amount) {
          return true
        } else {
          return false
        }
      }
    }
    const canSaveAsDraft = () => {
      const isLoading = loading || loadingSave;
      const isMinimalRequirementMet = withdrawalTransaction.amount > 0
      const isAmountLessThanAllocation = totalAllocatedSplitValue > withdrawalTransaction.amount;
      if (!isLoading && isMinimalRequirementMet && !isAmountLessThanAllocation) {
        return false
      } else {
        return true;
      }

    }
    const canSubmitForFirstLevel = () => {
      const isLoading = loading || loadingSave;
      const isMinimalRequirementMet = withdrawalTransaction.amount > 0
      const isAmountEqualToAllocation = withdrawalTransaction.amount === totalAllocatedSplitValue
      if (!isLoading && isAmountEqualToAllocation && isMinimalRequirementMet) {
        return false
      } else {
        return true;
      }

    }
    const handleFileUploadSOF = async (file: File) => {
      const storage = getStorage();
      const storageRef = ref(storage, `uploads/withdrawals/${dateFormat_DD_MM_YY(Date.now())}/${withdrawalTransaction.accountNumber}/$Client Instruction`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgressSOF(progress);
      });
      try {
        setLoadingSOF(true);
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        setWithdrawalTransaction({
          ...withdrawalTransaction,
          clientInstruction: {
            url: downloadURL,
            reasonForNotAttaching: ""
          }
        })
        setFileUrlStateSOF(downloadURL);
        setFileSOF(null);
        setFileUploadProgressSOF(0);
        setLoadingSOF(false);
      } catch (error) {
        console.error("File upload failed:", error);
        setLoadingSOF(false);
      }
    };
    const handleReasonChangeSOF = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        clientInstruction: {
          url: "",
          reasonForNotAttaching: value
        }
      })
    };
    const handleCheckboxChangeSOF = (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setIsUploadSOF(checked);
      if (checked) {
        setFileSOF(null);
        setFileUrlStateSOF(null);
      } else {
        setFileUrlStateSOF(null);
        setFileSOF(null);
      }
    };
    const handleFileSelectSOF = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files ? event.target.files[0] : null;
      if (selectedFile) {
        setFileSOF(selectedFile);
        await handleFileUploadSOF(selectedFile);
      }
    };
    useEffect(() => {
      console.log("Updated clientBankingDetailsAccounts:", clientBankingDetailsAccounts);
      console.log("Updated selectedValues:", selectedValues);

      // You can perform any other operations needed when clientBankingDetailsAccounts changes
    }, [clientBankingDetailsAccounts,selectedValues]);
    return (
      <form className="ijg-form">
        <div className="dialog-content uk-position-relative">
          {
            selectedTab === "Form" &&
            <div className="uk-grid uk-grid-small uk-width-4-5 uk-child-width-1-2" data-uk-grid>
              <div className="uk-width-1-3">
                <label className="uk-form-label main-title-sm">
                  TOTAL AMOUNT TO SPLIT:
                </label>
              </div>
              <div className="uk-width-2-3">
                <label className="uk-form-label main-title-sm">
                  N$ {numberFormat(withdrawalTransaction.amount)}
                </label>
              </div>
              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Total Value:
                </label>
              </div>
              <div className="uk-width-2-3">
                <NumberInput value={withdrawalTransaction.amount} onChange={(value) => setWithdrawalTransaction({ ...withdrawalTransaction, amount: Number(value) })}
                />
                {
                  withdrawalTransaction.amount < totalAllocatedSplitValue &&
                  <small className="uk-text-danger">Allocated amounts cannot exceed the total withdrawal value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - withdrawalTransaction.amount)}</b></small>
                }
                {
                  withdrawalTransaction.amount > totalAllocatedSplitValue &&
                  <small className="uk-text-danger">A total of <b>{currencyFormat(withdrawalTransaction.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
                }
              </div>
              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Value Date:
                </label>
              </div>
              <div className="uk-width-2-3">
                <input
                  id="valueDate"
                  type="date"
                  value={dateFormat_YY_MM_DD(withdrawalTransaction.valueDate || Date.now())}
                  name="valueDate"
                  onChange={handleDateChange}
                  min={formattedFirstDay}
                  max={formattedLastDay}
                  required
                />
              </div>
              {withdrawalTransaction.withdrawalTransactionProcess === "Back-Dated"
                &&
                <>
                  <label className={"uk-width-1-3"} >
                    Attach Reason For Back Dating
                  </label>
                  <div className="uk-width-2-3">
                    <textarea value={withdrawalTransaction.withdrawalTransactionProcess}
                      onChange={(e) => setWithdrawalTransaction({
                        ...withdrawalTransaction,
                        withdrawalTransactionProcess: e.target.value,
                      })} required cols={40} rows={2} />
                  </div>
                </>
              }
              {withdrawalTransaction.withdrawalTransactionProcess === "Future-Dated"
                &&
                <>
                  <label className={"uk-width-1-3"} >
                    Attach Reason For Future Dating
                  </label>
                  <div className="uk-width-2-3">
                    <textarea value={withdrawalTransaction.withdrawalTransactionProcess}
                      onChange={(e) => setWithdrawalTransaction({
                        ...withdrawalTransaction,
                        withdrawalTransactionProcess: e.target.value,
                      })} required cols={40} rows={2} />
                  </div>
                </>
              }
              <label className="uk-form-label" >
                Attach Client Instruction
                <input className='uk-checkbox' type="checkbox"
                  checked={isUploadSOF}
                  onChange={handleCheckboxChangeSOF}
                />
              </label>
              {isUploadSOF ? //CHANGE
                <div>
                  <div data-uk-form-custom="target: true">
                    <input
                      type="file"
                      aria-label="Custom controls"
                      accept=".pdf, .jpg, .jpeg, .png, .eml"
                      onChange={handleFileSelectSOF} //
                      id="fileToAttach"
                      ref={fileInputRefSOF} //CHAN
                    />
                    <input
                      className="uk-form-small"
                      type="text"
                      placeholder={fileUrlSOF ? "Replace file" : "Select file"} //
                      aria-label="Custom controls"
                      disabled
                      value={fileUrlSOF === "" ? '' : fileSOF?.name || ''}  //
                    />
                  </div>
                  {fileUrlSOF && ( //
                    <div>
                      <a
                        href={fileUrlSOF} //
                        target="_blank" rel="noopener noreferrer">View file</a>
                    </div>
                  )}
                  {loadingSOF && //
                    <progress
                      className="uk-progress uk-progress-success"
                      value={fileUploadProgressSOF} //
                      max="100"
                    />
                  }

                </div>

                :
                <div>
                  <textarea
                    className="uk-form-small"
                    cols={5}
                    value={withdrawalTransaction.clientInstruction.reasonForNotAttaching}
                    onChange={handleReasonChangeSOF}//
                    required
                  />
                </div>
              }
            </div>
          }
          {selectedTab === "Statement" &&
            <>
              <div className="uk-width-1-1 uk-grid uk-grid-small" data-uk-grid>
                <div className="uk-width-expand">
                  <label className="uk-form-label main-title-sm uk-margin-large-right">
                    TOTAL AMOUNT TO SPLIT:
                  </label>
                  <label className="uk-form-label main-title-sm">
                    {currencyFormat(withdrawalTransaction.amount)}
                  </label>
                  <br />
                  {
                    withdrawalTransaction.amount < totalAllocatedSplitValue &&
                    <small className="uk-text-danger">Allocated amounts cannot exceed the total withdrawal value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - withdrawalTransaction.amount)}</b></small>
                  }
                  {
                    withdrawalTransaction.amount > totalAllocatedSplitValue &&
                    <small className="uk-text-danger">A total of <b>{currencyFormat(withdrawalTransaction.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
                  }
                </div>

              </div>
              <NormalClientStatementSplit accountsToSplit={selectedClientAccounts} />
            </>
          }
          {
            selectedTab === "Allocation" &&
            <>
              <div className="uk-margin-small-bottom" data-uk-grid>
                <div className="uk-width-expand">
                  <label className="uk-form-label main-title-sm uk-margin-large-right">
                    TOTAL AMOUNT TO SPLIT:
                  </label>
                  <label className="uk-form-label main-title-sm">
                    {currencyFormat(withdrawalTransaction.amount)}
                  </label>
                  <br />
                  {
                    withdrawalTransaction.amount < totalAllocatedSplitValue &&
                    <small className="uk-text-danger">Allocated amounts cannot exceed the total withdrawal value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - withdrawalTransaction.amount)}</b></small>
                  }
                  {
                    withdrawalTransaction.amount > totalAllocatedSplitValue &&
                    <small className="uk-text-danger">A total of <b>{currencyFormat(withdrawalTransaction.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
                  }
                </div>
                <div className="icon uk-text-right uk-margin-small-bottom">
                  <button className="btn btn-primary" disabled={canAddAllocation()} onClick={onAddItem} data-uk-tooltip={canAddAllocation() ? `Cannot allocate` : ``} data-uk-icon="icon: plus-circle;">
                  </button>
                </div>
              </div>
              <table className="split-kit-table-borderless">
                <thead>
                  <tr>
                    <th className="uk-table-expand">Account/Client Name</th>
                    <th className="uk-table-expand">Payment Account</th>
                    <th className="uk-table-expand">Bank Account</th>
                    <th className="required">Amount N$</th>
                    <th>Email Address</th>
                    <th>Statement Reference</th>
                    <th>Product</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {splitTransactions.map((split, index) => (
                    <Fragment key={index}>
                      <SplitWithdrawalAllocationSheet
                        index={index}
                        accountNumber={split.accountNumber}
                        product={split.productCode}
                        onItemChange={onItemChange}
                        onItemRemove={onItemRemove}
                        onClientChange={onClientChange}
                        clientBankingDetails={split.clientBankingDetails}
                        email={split.emailAddress || ""}
                        statementReference={split.bankReference}
                        amount={split.amount}
                        onAmountChange={onAmountChange}
                        handleUseAgentChange={handleUseAgentChange}
                        splitTransactions={splitTransactions}
                        useAgent={false}
                        split={split}
                        handleBankAccountChange={handleBankAccountChange}
                        clientBankingDetailsAccounts={clientBankingDetailsAccounts}
                        agentsAccount={agentsAccount}
                        handleClientBankDetailsChange={handleClientBankDetailsChange}
                        selectedValue={selectedValues[index]}
                        />
                    </Fragment>
                  ))}
                  {
                    splitTransactions.length === 0 &&
                    <tr className="uk-text-center">
                      <td colSpan={6}>
                        <NoData />
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot className="uk-margin-top" >
                  <tr>
                    <th className="main-title-sm">Total</th>
                    <th className="main-title-sm" >{totalAllocatedSplitValue}</th>
                    <th colSpan={6}></th>
                  </tr>
                </tfoot>
              </table>
            </>
          }
        </div>
        <div className="uk-text-right">
          <button disabled={loadingSave || loading} type="button" className="btn btn-danger" onClick={handleCancelAndAdditionalAction}>
            Cancel
          </button>
          <button disabled={loadingSave || loading} type="button" className="btn btn-primary" onClick={handleClearAndAdditionalAction}>
            Clear Form
          </button>
          <button type="button" className="btn btn-primary" disabled={canSaveAsDraft()} onClick={handleSave}>
            {loadingSave ? <span data-uk-spinner={"ratio:.5"}></span> : "Save Draft"}
          </button>
          <button type="submit" className="btn btn-primary" disabled={canSubmitForFirstLevel()} onClick={handleSubmit}
          >
            {(loadingSave || loading) && <span data-uk-spinner={"ratio:.5"}></span>}Submit For Approval
          </button>
        </div>
      </form>
    );
  }
);

export default RecordSplitWithdrawalForm;