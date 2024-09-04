import { ChangeEvent, Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { defaultDepositTransaction, IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import "./../RecordNewForm.scss";
import { FileUploadComponent } from "../../../../../../../shared/components/instruction-file-upload/NewFileUploadComponent";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { runInAction } from "mobx";
import { SplitDepositAllocationSheet } from "./SplitDepositAllocationSheet";
import NormalClientStatementSplit from "../../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { getProductCode } from "../../../../../system-modules/reports-module/transactions/GetProductCode";
import { NoData } from "../../../../../../../shared/components/nodata/NoData";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { getAccount, getEntity } from "../../../../../../../shared/functions/transactions/BankStatementUpload";
import NumberInput from "../../../../../shared/components/number-input/NumberInput";
import { currencyFormat } from "../../../../../../../shared/functions/Directives";
import { ClientDepositAllocationAuditTrailGrid } from "../../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";

interface FormProps {
  onCancel: () => void;
  handleUpdateAndSubmit: () => void;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSourceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleUpdateAndSave: () => void;
  onClear: () => void;
  selectedTab: string;
  showOtherSource: boolean;
  loading?: boolean;
  loadingSave?: boolean;
  setDeposit: React.Dispatch<React.SetStateAction<IDepositTransaction>>;
  setSplitTransactions: React.Dispatch<React.SetStateAction<IDepositTransaction[]>>;
  setToDelete: React.Dispatch<React.SetStateAction<IDepositTransaction[]>>;
  onClearFileComponent: boolean;
  setOnClearToFalse?: ((clear: boolean) => void) | undefined;
  deposit: IDepositTransaction;
  splitTransactions: IDepositTransaction[];
  toDelete: IDepositTransaction[];
}

const SplitDepositForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    handleUpdateAndSave,
    handleUpdateAndSubmit,
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
    setToDelete,
    setOnClearToFalse,
    onClearFileComponent = false,
  }) => {

    const { store } = useAppContext();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [selectedClientAccounts, setSelectedClientAccounts] = useState<IMoneyMarketAccount[]>([]);
    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );
    const auditTrail = store.depositTransactionAudit.all;
    const depositAudit = auditTrail.sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);

      return dateB.getTime() - dateA.getTime();
    }).map((c) => {
      return c.asJson;
    });
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
      const removedTransaction = data[index];;

      accounts.splice(index, 1);
      data.splice(index, 1);
      setSplitTransactions(data);
      setSelectedClientAccounts(accounts);

      setToDelete(prevToDelete => [...prevToDelete, removedTransaction]);
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
        const formattedValue = accountDetails?.accountNumber ? `${accountDetails.accountNumber}-${accountDetails.accountName}` : "";
        setSelectedValues(prevValues => {
          const updatedValues = [...prevValues]; // Create a copy of the previous values
          updatedValues[index] = formattedValue; // Update the value at the specific index
          return updatedValues; // Return the updated array
        });
        setSplitTransactions(data);
        setSelectedClientAccounts(accounts);
      });
    };
    const canAddAllocation = () => {
      if (splitTransactions.length > 0) {
        const previousAllocation = splitTransactions[splitTransactions.length - 1];

        if (previousAllocation && previousAllocation.accountNumber === "") {
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
    return (
      <form className="ijg-form">
        <div className="dialog-content-amend uk-position-relative" >
          {
            selectedTab === "Form" &&
            <div className="uk-grid uk-grid-small uk-width-4-5 uk-child-width-1-2" data-uk-grid>

              <div className="uk-width-1-3">
                <label className="uk-form-label main-title-sm">
                  TOTAL AMOUNT TO SPLIT: N$
                </label>
              </div>

              <div className="uk-width-2-3">
                <label className="uk-form-label main-title-sm">
                  {deposit.amount}
                </label>
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Total Value:
                </label>
              </div>
              <div className="uk-width-2-3">
                <NumberInput
                  value={deposit.amount}
                  onChange={(value) => setDeposit({ ...deposit, amount: Number(value) })}
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
                  required
                />
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Select IJG Bank Account:
                </label>
              </div>

              <div className="uk-width-2-3">
                <select
                  id="bankAccount"
                  name={"bankAccount"}
                  value={deposit.sourceBank}
                  onChange={(e) => setDeposit({ ...deposit, sourceBank: e.target.value })}>
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

              <FileUploadComponent
                setFileUrl={(url) => handleSetFileUrl(url, 'sourceOfFundsAttachment')}
                reason={(value) => handleSetReason(value, 'sourceOfFundsAttachment')}
                label={"Source of Funds"}
                onClearFileComponent={onClearFileComponent}
                setOnClearFalse={
                  setOnClearToFalse
                }
                depositTransaction={deposit}
                selectedAccount={deposit.accountNumber}
              />
              <FileUploadComponent
                setFileUrl={(url) => handleSetFileUrl(url, 'proofOfPaymentAttachment')}
                reason={(value) => handleSetReason(value, 'proofOfPaymentAttachment')}
                label={"Proof of Payment"}
                onClearFileComponent={onClearFileComponent}
                setOnClearFalse={setOnClearToFalse}
                depositTransaction={deposit}
                selectedAccount={deposit.accountNumber}
              />
              {
                deposit.note &&
                <div>
                  <label className="uk-form-label">Return Note:</label>
                  <textarea
                    value={deposit.note}
                    cols={5}
                    required
                    disabled
                  />
                </div >
              }

            </div>
          }
          {selectedTab === "Statement" &&
            <NormalClientStatementSplit accountsToSplit={selectedClientAccounts} />
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
                  <button className="btn btn-primary" disabled={canAddAllocation()} onClick={onAddItem} data-uk-tooltip={canAddAllocation() ? `Please complete the current allocation first` : ``} data-uk-icon="icon: plus-circle;">
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
                    <th>Product</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {splitTransactions.map((split, index) => (
                    <Fragment key={index}>
                      {/* <SplitDepositAllocationSheet
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
                      /> */}
                      <SplitDepositAllocationSheet
                        index={index}
                        accountNumber={split.accountNumber}
                        product={split.productCode}
                        onItemChange={onItemChange}
                        onItemRemove={onItemRemove}
                        onClientChange={onClientChange}
                        // clientBankingDetails={split.clientBankingDetails}
                        email={split.emailAddress || ""}
                        statementReference={split.bankReference}
                        amount={split.amount}
                        onAmountChange={onAmountChange}
                        // handleUseAgentChange={handleUseAgentChange}
                        splitTransactions={splitTransactions}
                        // useAgent={false}
                        // split={split}
                        // handleBankAccountChange={handleBankAccountChange}
                        // clientBankingDetailsAccounts={clientBankingDetailsAccounts}
                        // agentsAccount={agentsAccount}
                        // handleClientBankDetailsChange={handleClientBankDetailsChange}
                        selectedValue={selectedValues[0]} />
                    </Fragment>
                  ))}
                  {
                    splitTransactions.length === 0 &&
                    <div className="uk-height-medium">
                      <NoData />
                    </div>
                  }
                </tbody>
                <tfoot >
                  <tr>
                    <th className="main-title-sm">Total</th>
                    <th colSpan={5}></th>
                  </tr>
                </tfoot>
              </table>
            </>
          }
          {
            selectedTab === "Audit-Trail" &&
            <ClientDepositAllocationAuditTrailGrid
              data={depositAudit}
            />
          }
        </div>
        <div className="uk-text-right">
          <button disabled={loadingSave || loading} type="button" className="btn btn-danger" onClick={onCancel}>
            Cancel
          </button>
          {/* <button disabled={loadingSave || loading} type="button" className="btn btn-primary" onClick={handleClearAndAdditionalAction}>
            Clear Form
          </button> */}
          <button type="button" className="btn btn-primary" disabled={canSaveAsDraft()} onClick={handleUpdateAndSave}>
            {loadingSave ? <span data-uk-spinner={"ratio:.5"}></span> : "Save Draft"}
          </button>
          <button type="submit" className="btn btn-primary" disabled={canSubmitForFirstLevel()} onClick={handleUpdateAndSubmit}
          >
            {(loadingSave || loading) && <span data-uk-spinner={"ratio:.5"}></span>}Submit For Approval
          </button>
        </div>
      </form >
    );
  }
);

export default SplitDepositForm;