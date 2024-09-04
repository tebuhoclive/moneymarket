import { ChangeEvent, Fragment, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { defaultDepositTransaction, IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import "./../RecordNewForm.scss";
import { useAppContext } from "../../../../../../../shared/functions/Context";

import { runInAction } from "mobx";
import { SplitDepositAllocationSheet } from "./SplitDepositAllocationSheet";

import NormalClientStatementSplit from "../../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { getProductCode } from "../../../../../system-modules/reports-module/transactions/GetProductCode";
import { NoData } from "../../../../../../../shared/components/nodata/NoData";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { getAccount, getEntity } from "../../../../../../../shared/functions/transactions/BankStatementUpload";
import { currencyFormat, numberFormat } from "../../../../../../../shared/functions/Directives";
import NumberInput from "../../../../../shared/components/number-input/NumberInput";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

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
  setDeposit: React.Dispatch<React.SetStateAction<IDepositTransaction>>;
  setSplitTransactions: React.Dispatch<React.SetStateAction<IDepositTransaction[]>>;
  setOnClearToFalse?: ((clear: boolean) => void) | undefined;

  deposit: IDepositTransaction;
  splitTransactions: IDepositTransaction[];
}

const RecordSplitDepositForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    handleSave,
    handleSubmit,
    handleDateChange,
    handleSourceChange,
    onClear,
    loading,
    selectedTab,
    deposit,
    splitTransactions,
    loadingSave,
    showOtherSource,
    setDeposit,
    setSplitTransactions,
    setOnClearToFalse,
    onClearFileComponent = false,

  }) => {

    const { store } = useAppContext();
    const [selectedClientAccounts, setSelectedClientAccounts] = useState<IMoneyMarketAccount[]>([]);
    const today = new Date();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formattedFirstDay = dateFormat_YY_MM_DD(firstDayOfMonth.getTime());
    const formattedLastDay = dateFormat_YY_MM_DD(lastDayOfMonth.getTime());
    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );

    const handleClearAndAdditionalAction = () => {
      onClear();
      handleSetFileUrl("", "sourceOfFundsAttachment")
      handleSetReason("", "sourceOfFundsAttachment")
      handleSetFileUrl("", "proofOfPaymentAttachment")
      handleSetReason("", "proofOfPaymentAttachment")
      setSelectedClientAccounts([])
    };

    const handleSetFileUrl = (url: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => {
      setDeposit((prev) => ({
        ...prev,
        [field]: {
          ...(prev[field]),
          url,
        },
      }));
    };

    const handleSetReason = (value: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => {
      setDeposit((prev) => ({
        ...prev,
        [field]: {
          ...(prev[field]),
          reasonForNotAttaching: value,
        },
      }));
    };

    const onAddItem = () => {
      const newItem: IDepositTransaction = {
        ...defaultDepositTransaction,
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
        const accounts = [...selectedClientAccounts];
        const data = [...splitTransactions];
        data[index] = {
          ...data[index],
          accountNumber: value,
          productCode: getProductCode(store, value),
          entityNumber: entity?.entityId || "",
          emailAddress: entity?.contactDetail.emailAddress
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

    const canAddAllocation = () => {
      if (splitTransactions.length > 0) {
        const previousAllocation = splitTransactions[splitTransactions.length - 1];

        if ((previousAllocation && previousAllocation.accountNumber === "") || totalAllocatedSplitValue === deposit.amount) {
          return true
        } else {
          return false
        }
      }
    }

    const canSaveAsDraft = () => {
      const isLoading = loading || loadingSave;
      const isMinimalRequirementMet = deposit.amount > 0
      const isAmountLessThanAllocation = totalAllocatedSplitValue > deposit.amount;


      if (!isLoading && isMinimalRequirementMet && !isAmountLessThanAllocation) {
        return false
      } else {
        return true;
      }

    }

    const canSubmitForFirstLevel = () => {
      const isLoading = loading || loadingSave;
      const isMinimalRequirementMet = deposit.amount > 0
      const isAmountEqualToAllocation = deposit.amount === totalAllocatedSplitValue

      if (!isLoading && isAmountEqualToAllocation && isMinimalRequirementMet) {
        return false
      } else {
        return true;
      }

    }


    // -------------  temp solution source of funds ------------------

    const [isUploadSOF, setIsUploadSOF] = useState<boolean>(false);
    const [fileSOF, setFileSOF] = useState<File | null>(null);
    const [fileUploadProgressSOF, setFileUploadProgressSOF] = useState(0);
    const fileInputRefSOF = useRef<HTMLInputElement>(null);
    const [loadingSOF, setLoadingSOF] = useState(false);
    const [fileUrlSOF, setFileUrlStateSOF] = useState<string | null>(null);

    const handleFileUploadSOF = async (file: File) => {

      const storage = getStorage();


      const storageRef = ref(storage, `uploads/deposits/${dateFormat_DD_MM_YY(Date.now())}/${deposit.accountNumber}/$Source of funds`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgressSOF(progress);
      });

      try {
        setLoadingSOF(true);
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        setDeposit({
          ...deposit,
          sourceOfFundsAttachment: {
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
      setDeposit({
        ...deposit,
        sourceOfFundsAttachment: {
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

    // -------------  temp solution proof of payment ------------------

    const [isUploadPOP, setIsUploadPOP] = useState<boolean>(false);
    const [filePOP, setFilePOP] = useState<File | null>(null);
    const [fileUploadProgressPOP, setFileUploadProgressPOP] = useState(0);
    const fileInputRefPOP = useRef<HTMLInputElement>(null);
    const [loadingPOP, setLoadingPOP] = useState(false);
    const [fileUrlPOP, setFileUrlStatePOP] = useState<string | null>(null);

    const handleFileUploadPOP = async (file: File) => {

      const storage = getStorage();


      const storageRef = ref(storage, `uploads/deposits/${dateFormat_DD_MM_YY(Date.now())}/${deposit.accountNumber}/Proof of Payment`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgressPOP(progress);
      });

      try {
        setLoadingPOP(true);
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        setDeposit({
          ...deposit,
          proofOfPaymentAttachment: {
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
      setDeposit({
        ...deposit,
        proofOfPaymentAttachment: {
          url: "",
          reasonForNotAttaching: value
        }
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

    // -------------  temp solution proof of payment ------------------


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
                  N$ {numberFormat(deposit.amount)}
                </label>
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Total Value:
                </label>
              </div>
              <div className="uk-width-2-3">
                <NumberInput value={deposit.amount} onChange={(value) => setDeposit({ ...deposit, amount: Number(value) })}
                />
                {
                  deposit.amount < totalAllocatedSplitValue &&
                  <small className="uk-text-danger">Allocated amounts cannot exceed the total deposit value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - deposit.amount)}</b></small>
                }
                {
                  deposit.amount > totalAllocatedSplitValue &&
                  <small className="uk-text-danger">A total of <b>{currencyFormat(deposit.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
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
                  value={dateFormat_YY_MM_DD(deposit.valueDate || Date.now())}
                  name="valueDate"
                  onChange={handleDateChange}
                  min={formattedFirstDay}
                  max={formattedLastDay}
                  required
                />
              </div>
              {deposit.depositTransactionProcess === "Back-Dated"
                &&
                <>
                  <label className={"uk-width-1-3"} >
                    Attach Reason For Back Dating
                  </label>
                  <div className="uk-width-2-3">
                    <textarea value={deposit.reasonForBackDating}
                      onChange={(e) => setDeposit({
                        ...deposit,
                        reasonForBackDating: e.target.value,
                      })} required cols={40} rows={2} />
                  </div>
                </>
              }
              {deposit.depositTransactionProcess === "Future-Dated"
                &&
                <>
                  <label className={"uk-width-1-3"} >
                    Attach Reason For Future Dating ccccc
                  </label>
                  <div className="uk-width-2-3">
                    <textarea value={deposit.reasonForFutureDating}
                      onChange={(e) => setDeposit({
                        ...deposit,
                        reasonForFutureDating: e.target.value,
                      })} required cols={40} rows={2} />
                  </div>
                </>

              }
              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Select IJG Bank Account:
                </label>
              </div>

              <div className="uk-width-2-3">
                <select value={deposit.sourceBank} onChange={(e) => setDeposit({ ...deposit, sourceBank: e.target.value })}>
                  <option value=""></option>
                  <option value="SBN">Standard Bank</option>
                  <option value="NBN">Ned Bank</option>
                </select>
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Source of Funds:
                </label>
              </div>

              <div className="uk-width-2-3">
                <select
                  value={deposit.sourceOfFunds}
                  id="sourceOfFunds"
                  onChange={handleSourceChange}
                  required={!showOtherSource}
                >
                  <option value=""></option>
                  <option value="No Source of Funds">No Source of Funds</option>
                  <option value="Salary">Salary</option>
                  <option value="Investments">Investments</option>
                  <option value="Business Profits">Business Profits</option>
                  <option value="Inheritance">Inheritance</option>
                  <option value="Gift">Gift</option>
                  <option value="Other">Other</option>
                </select>
                {showOtherSource && (
                  <input
                    type="text"
                    className="uk-margin-small-top"
                    id="sourceOfFundsOther"
                    value={deposit.sourceOfFunds}
                    onChange={(e) =>
                      setDeposit({
                        ...deposit,
                        sourceOfFunds: e.target.value,
                      })
                    }
                    required
                  />
                )}
              </div>

              {/* <FileUploadComponent
                setFileUrl={(url) => handleSetFileUrl(url, 'sourceOfFundsAttachment')}
                reason={(value) => handleSetReason(value, 'sourceOfFundsAttachment')}
                label={"Source of Funds"}
                onClearFileComponent={onClearFileComponent}
                setOnClearFalse={
                  setOnClearToFalse
                }
                selectedAccount={deposit.accountNumber}
              />
              <FileUploadComponent
                setFileUrl={(url) => handleSetFileUrl(url, 'proofOfPaymentAttachment')}
                reason={(value) => handleSetReason(value, 'proofOfPaymentAttachment')}
                label={"Proof of Payment"}
                onClearFileComponent={onClearFileComponent}
                setOnClearFalse={setOnClearToFalse}
                selectedAccount={deposit.accountNumber}
              /> */}

              <label className="uk-form-label" >
                Attach Source of Funds
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
                    value={deposit.sourceOfFundsAttachment.reasonForNotAttaching}
                    onChange={handleReasonChangeSOF}//
                    required
                  />
                </div>
              }

              <label className="uk-form-label" >
                Attach proof of payment
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
                    value={deposit.proofOfPaymentAttachment.reasonForNotAttaching}
                    onChange={handleReasonChangePOP}//
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
                    {currencyFormat(deposit.amount)}
                  </label>
                  <br />
                  {
                    deposit.amount < totalAllocatedSplitValue &&
                    <small className="uk-text-danger">Allocated amounts cannot exceed the total deposit value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - deposit.amount)}</b></small>
                  }
                  {
                    deposit.amount > totalAllocatedSplitValue &&
                    <small className="uk-text-danger">A total of <b>{currencyFormat(deposit.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
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
                    {currencyFormat(deposit.amount)}
                  </label>
                  <br />
                  {
                    deposit.amount < totalAllocatedSplitValue &&
                    <small className="uk-text-danger">Allocated amounts cannot exceed the total deposit value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - deposit.amount)}</b></small>
                  }
                  {
                    deposit.amount > totalAllocatedSplitValue &&
                    <small className="uk-text-danger">A total of <b>{currencyFormat(deposit.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
                  }
                </div>

                <div className="icon uk-text-right uk-margin-small-bottom">
                  <button className="btn btn-primary" disabled={canAddAllocation()} onClick={onAddItem} data-uk-tooltip={canAddAllocation() ? `Cannot allocate` : ``} data-uk-icon="icon: plus-circle;">
                  </button>
                </div>
              </div>
              <table className="kit-table-borderless">
                <thead>
                  <tr>
                    <th className="uk-table-expand">Account/Client Name</th>
                    <th className="required">Amount N$</th>
                    <th>Email Address</th>
                    <th>Statement Reference</th>
                 
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {splitTransactions.map((split, index) => (
                    <Fragment key={index}>
                      <SplitDepositAllocationSheet
                        index={index}
                        accountNumber={split.accountNumber}
                        product={split.productCode}
                        onItemChange={onItemChange}
                        onItemRemove={onItemRemove}
                        onClientChange={onClientChange}
                        email={split.emailAddress || ""}
                        statementReference={split.bankReference}
                        amount={split.amount}
                        onAmountChange={onAmountChange}
                        splitTransactions={splitTransactions}
                        selectedValue={selectedValues[index]}/>

                    
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
                    <th colSpan={4}></th>
                  </tr>
                </tfoot>
              </table>
            </>
          }
        </div>
        <div className="uk-text-right">
          <button disabled={loadingSave || loading} type="button" className="btn btn-danger" onClick={onCancel}>
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

export default RecordSplitDepositForm;