import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { dateFormat_YY_MM_DD, dateFormat_DD_MM_YY } from "../../../../../shared/utils/utils";
import DetailView, { IDataDisplay } from "../../../shared/components/detail-view/DetailView";
import NormalClientStatement from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import NumberInput from "../../../shared/components/number-input/NumberInput";
import { ClientWithdrawalAuditTrailView } from "../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import SingleSelect, { IOption } from '../../../../../shared/components/single-select/SearchableSelect';
import { defaultWithdrawalSettings, IWithdrawalSetting } from "../../../../../shared/models/WithdrawalSettings";
interface IProps {
  onCancel: () => void;
  onDelete: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClientAccountChange: (value: string) => void;
  handleAmountChange: (amount: number) => void;
  handleSourceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSave: () => void;
  handleUseAgentChange: () => void;
  onClear: () => void;
  loading: boolean;
  selectedAccountNumber: string;
  loadingSave: boolean;
  loadingSubmission: boolean;
  loadingDraft: boolean;
  verifyBackDating: boolean;
  showOtherSource: boolean;
  selectedTab: string;
  selectedValue: string;
  selectedClientAccount: IMoneyMarketAccount | undefined;
  selectedClientProfile: INaturalPerson | ILegalEntity | null | undefined;
  clientAccountOptions: IOption[],
  agentsAccount: IOption[],
  withdrawalTransaction: IWithdrawalTransaction;
  setOnClearToFalse?: ((clear: boolean) => void) | undefined;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
  setWithdrawalTransaction: React.Dispatch<React.SetStateAction<IWithdrawalTransaction>>;
  onClearFileComponent: boolean;
}
const AmendWithdrawalForm = observer((props: IProps) => {
  const {
    onDelete,
    onCancel,
    onClear,
    handleSubmit,
    handleClientAccountChange,
    handleDateChange,
    handleAmountChange,
    handleSave,
    handleUseAgentChange,
    loadingSubmission,
    loadingDraft,
    loading,
    selectedTab,
    selectedValue,
    verifyBackDating,
    clientAccountOptions,
    selectedClientProfile,
    selectedClientAccount,
    agentsAccount,
    withdrawalTransaction,
    setSelectedValue,
    setWithdrawalTransaction
  } = props;
  const { api, store } = useAppContext();
  const today = new Date();
  let clientBankingDetailsAccounts: any[] = [];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formattedFirstDay = dateFormat_YY_MM_DD(firstDayOfMonth.getTime());
  const formattedLastDay = dateFormat_YY_MM_DD(lastDayOfMonth.getTime());
  const [isUploadPOP, setIsUploadPOP] = useState<boolean>(false);
  const [filePOP, setFilePOP] = useState<File | null>(null);
  const [fileUploadProgressPOP, setFileUploadProgressPOP] = useState(0);
  const fileInputRefPOP = useRef<HTMLInputElement>(null);
  const [loadingPOP, setLoadingPOP] = useState(false);
  const [fileUrlPOP, setFileUrlStatePOP] = useState<string | null>(null);

  const [withdrawalSettings, setWithdrawalSettings] = useState<IWithdrawalSetting>({ ...defaultWithdrawalSettings });

  const balance = selectedClientAccount?.balance || 0;
  const cession = selectedClientAccount?.cession || 0;


  const pendingWithdrawals = store.withdrawalTransaction.all.filter(({ asJson }) => (asJson.transactionStatus !== "Completed" && asJson.transactionStatus !== "Deleted" && asJson.transactionStatus !== "Corrected" && asJson.transactionStatus !== "Archived"))

  const getPendingClientWithdrawals = (accountNumber: string) => {
    if (accountNumber) {
      const totalPendingValue = pendingWithdrawals.filter(clientWithdrawals => clientWithdrawals.asJson.accountNumber === accountNumber && clientWithdrawals.asJson.id !== withdrawalTransaction.id).reduce((sum, { asJson }) => sum + asJson.amount, 0);

      return totalPendingValue

    } else {
      return 0;
    }
  }

  const totalPendingWithdrawals = getPendingClientWithdrawals(selectedClientAccount?.accountNumber || "")
  const availableBalance = balance - cession - totalPendingWithdrawals;

  const thresholdAmount = withdrawalSettings.withdrawalThreshold.enabled ? Number(withdrawalSettings.withdrawalThreshold.value) : 0;

  const targetWithdrawalsCount = withdrawalSettings.monthlyClientWithdrawalCountLimit.enabled ? Number(withdrawalSettings.monthlyClientWithdrawalCountLimit.value) : 99999999;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const withdrawalCountInCurrentMonth = store.withdrawalTransaction.all.filter(
    withdrawalTransaction =>
      withdrawalTransaction.asJson.accountNumber === selectedClientAccount?.accountNumber &&
      withdrawalTransaction.asJson.transactionStatus === "Completed" &&
      new Date(withdrawalTransaction.asJson.valueDate).getMonth() === currentMonth &&
      new Date(withdrawalTransaction.asJson.valueDate).getFullYear() === currentYear
  ).length;

  const containsCession = (accountName: string): boolean => {
    const regex = /cession/i;
    return regex.test(accountName);
  }

  const hasReachedMonthlyWithdrawalLimit = withdrawalCountInCurrentMonth >= targetWithdrawalsCount
  const isAmountBelowMinimum = withdrawalTransaction.amount > 0 && withdrawalTransaction.amount < thresholdAmount;
  const hasCession = selectedClientAccount && cession > 0;
  const hasPendingWithdrawals = selectedClientAccount && totalPendingWithdrawals > 0;
  const exceedsAvailableBalance = withdrawalTransaction.amount > 0 && withdrawalTransaction.amount > availableBalance;

  const transactionErrors = () => {
    return (
      <>
        {isAmountBelowMinimum && (
          <small className="uk-text-danger uk-display-block">
            Please note that the Amount to be Withdrawn is less than {currencyFormat(thresholdAmount)}threshold
          </small>
        )}

        {exceedsAvailableBalance && (
          <small className="uk-text-danger uk-display-block">
            Please note that the Amount to be Withdrawn exceeds available balance {currencyFormat(availableBalance)}
          </small>
        )}

        {hasCession && (
          <small className="uk-text-danger uk-display-block">
            There is a cession loaded on this account for {currencyFormat(cession)}
          </small>
        )}

        {hasPendingWithdrawals && (
          <small className="uk-text-danger uk-display-block">
            This client has pending withdrawal request(s) of {currencyFormat(totalPendingWithdrawals)}
          </small>
        )}
      </>
    )
  }

  const allocationDetails: IDataDisplay[] = [
    { label: 'Product Code', value: selectedClientAccount?.accountType || "-" },
    { label: 'Account Balance', value: currencyFormat(balance) || 0 },
    { label: 'Remaining Balance', value: currencyFormat(availableBalance) || 0 }
  ];
  const transactionDetails: IDataDisplay[] = [
    { label: 'Bank Acc Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[2] || "-" },
    { label: 'Bank Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[0] || "-" },
    { label: 'Bank Acc Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[1] || "-" },
    { label: 'Bank Branch Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[3] || "-" },
  ];

  if (selectedClientProfile && selectedClientProfile.bankingDetail) {
    if (Array.isArray(selectedClientProfile.bankingDetail)) {
      // Test environment: clientBankingDetailsDetails is an array of maps
      clientBankingDetailsAccounts = selectedClientProfile.bankingDetail.map((clientBankingDetailsDetail: any) => ({
        label: `${clientBankingDetailsDetail.bankName} | ${clientBankingDetailsDetail.accountNumber} | ${clientBankingDetailsDetail.accountHolder} | ${clientBankingDetailsDetail.branchNumber}`,
        value: `${clientBankingDetailsDetail.bankName} | ${clientBankingDetailsDetail.accountNumber} | ${clientBankingDetailsDetail.accountHolder} | ${clientBankingDetailsDetail.branchNumber}`,
      }));
    } else if (typeof selectedClientProfile.bankingDetail === "object") {
      // Live environment: clientBankingDetailsDetails is a map
      const { bankName, accountHolder, accountNumber, branchNumber } =
        selectedClientProfile.bankingDetail;

      // Construct the label and value strings
      const label = `${bankName} | ${accountNumber} | ${accountHolder} | ${branchNumber}`;
      const value = `${bankName} | ${accountNumber} | ${accountHolder} | ${branchNumber}`;

      // Add the label and value to the clientBankingDetailsAccounts array
      clientBankingDetailsAccounts.push({ label, value });
    }
  }
  const auditTrail = store.withdrawalTransactionAudit.all;

  const withdrawalTransactionAudit = auditTrail.sort((a, b) => {
    const dateA = new Date(a.asJson.auditDateTime || 0);
    const dateB = new Date(b.asJson.auditDateTime || 0);
    return dateB.getTime() - dateA.getTime();
  }).map((c) => { return c.asJson });


  const handleFileUploadPOP = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/withdrawals/${dateFormat_DD_MM_YY(Date.now())}/${withdrawalTransaction.accountNumber}/Client Instruction`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileUploadProgressPOP(progress);
    });
    try {
      setLoadingPOP(true);
      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      setWithdrawalTransaction({
        ...withdrawalTransaction,
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
      setLoadingPOP(false);
    }
  };

  const handleReasonChangePOP = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setWithdrawalTransaction({
      ...withdrawalTransaction,
      clientInstruction: {
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

  const handleBankAccountChange = (selectedBank: string) => {
    if (selectedBank) {
      setWithdrawalTransaction({ ...withdrawalTransaction, clientBankingDetails: selectedBank })
    }
  }

  const isClientAccountAndProfileSelected = () => {
    return !!(selectedClientProfile && selectedClientAccount);
  };

  const isClientRestricted = () => {
    return !!((selectedClientProfile && selectedClientProfile.restricted) || (selectedClientAccount && containsCession(selectedClientAccount?.accountName)));
  };

  const canSaveAsDraft = () => {
    return isClientAccountAndProfileSelected() && !loadingSubmission && !loadingDraft;
  };

  const isAmountSufficientAndValid = withdrawalTransaction.amount >= thresholdAmount && availableBalance >= 0

  const canSubmitForApproval = () => {
    return isClientAccountAndProfileSelected() && !isClientRestricted() && isAmountSufficientAndValid && withdrawalTransaction.clientBankingDetails !== "" && !loadingSubmission && !loadingDraft && hasReachedMonthlyWithdrawalLimit;
  };


  const handleClearForm = () => {
    setSelectedValue("");
    setWithdrawalTransaction({ ...defaultWithdrawalTransaction });
  };

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await api.withdrawalSettings.getAll();
      if (settings) {
        const withdrawalSettings = store.withdrawalSettings.getItemById("WithdrawalSettings");
        if (withdrawalSettings) {
          setWithdrawalSettings(withdrawalSettings.asJson);
        }
      }
    }
    loadSettings();
  }, [api.withdrawalSettings, store.withdrawalSettings]);

  return (
    <ErrorBoundary>
      {selectedTab === "Withdrawal" && (
        <form className="ijg-form" onSubmit={handleSubmit}>
          <div className="dialog-content uk-position-relative">
            <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
              {/** left controls */}
              <div>
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label
                    className="uk-form-label required"
                    htmlFor="clientSelect">
                    Select Account:
                  </label>
                  {
                    containsCession(selectedClientAccount?.accountName || "") &&
                    <small className="uk-text-danger uk-display-block">Withdrawal cannot be processed on a Tasman Cession Account</small>
                  }
                  {selectedClientProfile?.restricted && (
                    <small className="uk-text-danger uk-display-block">
                      There is a restriction on this client
                    </small>
                  )}
                  {
                    hasReachedMonthlyWithdrawalLimit &&
                    <small className="uk-text-danger uk-display-block">
                      Client has reached the monthly withdrawal transaction limit ({targetWithdrawalsCount} transactions per client): {withdrawalCountInCurrentMonth} made
                    </small>
                  }
                  <SingleSelect
                    value={withdrawalTransaction?.accountNumber}
                    options={clientAccountOptions}
                    onChange={handleClientAccountChange}
                  />

                </div>
                {/* Add margin-bottom to create spacing */}
                {!withdrawalTransaction.useAgent && (
                  <div className="uk-width-1-1 uk-margin-small-bottom">
                    <label className={`uk-form-label uk-display-block`}>
                      {withdrawalTransaction.useAgent ? 'Uncheck the box to make the payment to the Client' : 'Check the box to make the payment to an Agent'}?
                      <input
                        className="uk-checkbox"
                        type="checkbox"
                        checked={withdrawalTransaction?.useAgent}
                        onChange={handleUseAgentChange}
                        style={{ marginLeft: "10px" }}
                      />
                    </label>
                    <select
                      value={withdrawalTransaction?.clientBankingDetails || ''}
                      onChange={(e) => handleBankAccountChange(e.target.value)}
                    >
                      <option value="">Select banking details...</option>
                      {clientBankingDetailsAccounts.map((account) => (
                        <option key={account.value} value={account.value}>
                          {account.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Add margin-bottom to create spacing */}
                {withdrawalTransaction.useAgent && (
                  <div className="uk-width-1-1 uk-margin-small-bottom">
                    <label className={`uk-form-label uk-display-block`}>
                      {withdrawalTransaction.useAgent ? 'Uncheck the box to make the payment to the Client' : 'Check the box to make the payment to an Agent'}?
                      <input
                        className="uk-checkbox"
                        type="checkbox"
                        checked={withdrawalTransaction?.useAgent}
                        onChange={handleUseAgentChange}
                        style={{ marginLeft: "10px" }}
                      />
                    </label>
                    <select
                      value={withdrawalTransaction?.agentBankingDetails}
                      id="agent-banking-details-account"
                      name={"agent-banking-details-account"}
                      onChange={(e) =>
                        setWithdrawalTransaction({
                          ...withdrawalTransaction,
                          agentBankingDetails: e.target.value,
                        })
                      }
                    >
                      <option value="" selected>
                        Select agent...
                      </option>
                      {agentsAccount &&
                        agentsAccount.map((acc) => (
                          <option key={acc.value} value={acc.value}>
                            {acc.label}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label className="uk-form-label required" htmlFor="valueDate">Value Date</label>
                  <input id="valueDate" type="date" name="valueDate"
                    // min={startOfMonthBackDating.toISOString().split('T')[0]}
                    value={
                      withdrawalTransaction.valueDate
                        ? dateFormat_YY_MM_DD(withdrawalTransaction.valueDate)
                        : dateFormat_YY_MM_DD(Date.now())
                    }
                    onChange={handleDateChange}
                    required
                    min={formattedFirstDay}
                    max={formattedLastDay}
                  />
                </div>
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label className="uk-form-label required">Client Email Address:</label>
                  <input type="text" name="clientEmail" id="clientEmail"
                    value={withdrawalTransaction.emailAddress}
                    onChange={(e) => setWithdrawalTransaction({
                      ...withdrawalTransaction,
                      emailAddress: e.target.value,
                    })}
                    required
                  />
                </div>

                {/* Add margin-bottom to create spacing */}
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label className="uk-form-label required" htmlFor="amount">Amount (min N$ 1 000.00)</label>
                  {transactionErrors()}
                  <NumberInput value={Number(withdrawalTransaction?.amount)} onChange={(value) =>
                    handleAmountChange(Number(value))}
                    required

                  />
                </div>
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label
                    className="uk-form-label required"
                    htmlFor="bopCode">
                    BOP Code
                  </label>
                  <select required onChange={(e) =>
                    setWithdrawalTransaction({
                      ...withdrawalTransaction,
                      balanceOfPaymentCodes: e.target.value
                    })}
                    value={withdrawalTransaction.balanceOfPaymentCodes || ""}
                  >
                    <option value="">
                      Select Balance of Payment Code...
                    </option>
                    <option value="51101">Disinvestment of Capital by a resident individual - Shares</option>
                    <option value="51102">Disinvestment of Capital by a resident individual - Bonds</option>
                    <option value="51103">Disinvestment of Capital by a resident individual - Money Markets instruments</option>
                    <option value="51104">Disinvestment of Capital by a resident individual - Mutual funds/collective investments schemes</option>
                    <option value="51105">Disinvestment of Capital by a resident individual - Property</option>
                    <option value="51106">Disinvestment of Capital by a resident individual - Other</option>
                  </select>
                </div>
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label className="uk-form-label required" htmlFor="amount">
                    Bank Reference (max char. 30)
                  </label>
                  <input
                    required
                    defaultValue={"IJG Payments"}
                    type="text"
                    maxLength={30}
                    onChange={(e) =>
                      setWithdrawalTransaction({
                        ...withdrawalTransaction,
                        bankReference: e.target.value,
                      })}
                  />
                </div>
                {
                  withdrawalTransaction.withdrawalTransactionProcess === "Back-Dated" && verifyBackDating &&
                  <small className="uk-display-block uk-text-danger uk-margin-top-small">Cannot back date this withdrawal to the selected date as the balance on that date is insufficient</small>
                }
                <div className="uk-width-1-1 uk-margin-small-bottom">
                  <label className="uk-form-label" >Attach Client Instruction: {" "}
                    <input className='uk-checkbox' type="checkbox" checked={isUploadPOP} onChange={handleCheckboxChangePOP} //
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
                          required
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
                        value={withdrawalTransaction.clientInstruction.reasonForNotAttaching}
                        onChange={handleReasonChangePOP}//
                        required
                      />
                    </div>
                  }
                </div>
                {/* Add margin-bottom to create spacing */}
              </div>
              {/** right controls */}
              <div>
                <div className="uk-margin-small-top">
                  <DetailView dataToDisplay={allocationDetails} />
                  <DetailView dataToDisplay={transactionDetails} />
                  {
                    withdrawalTransaction.note &&
                    <div>
                      <label className="uk-form-label">Return Note:</label>
                      <textarea value={withdrawalTransaction.note} cols={5} required disabled />
                    </div >
                  }
                  {withdrawalTransaction.withdrawalTransactionProcess === "Future-Dated" && (
                    <div className="uk-width-1-1 uk-margin-small-bottom">
                      <label className="uk-form-label required" htmlFor="">Reason for Future Dating</label>
                      <textarea
                        name="reasonForFutureDating"
                        id="reasonForFutureDating"
                        cols={20}
                        rows={2}
                        onChange={(e) =>
                          setWithdrawalTransaction({
                            ...withdrawalTransaction,
                            note: e.target.value,
                          })
                        }
                        required></textarea>
                    </div>
                  )}

                  {withdrawalTransaction.withdrawalTransactionProcess === "Back-Dated" && (
                    <div className="uk-width-1-1 uk-margin-small-bottom">
                      <label className="uk-form-label required" htmlFor="">
                        Reason for Back Dating
                      </label>
                      <textarea
                        name="reasonForBackDating"
                        id="reasonForBackDating"
                        cols={20}
                        rows={2}
                        onChange={(e) => setWithdrawalTransaction({ ...withdrawalTransaction, note: e.target.value })}
                        required></textarea>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!withdrawalTransaction.clientBankingDetails && <div className="uk-width-1-2"></div>}
          </div>
          <div className="uk-width-1-1 uk-text-right">
            <button type="button" className="btn btn-danger uk-margin-small-top" disabled={loadingSubmission || loadingDraft} onClick={onDelete}>
              Delete
            </button>

            {availableBalance < 0 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={loadingSubmission || loadingDraft || availableBalance > 0}
              // onClick={generateWithdrawalThresholdNotificationHTML}
              >
                Notify Client
              </button>
            )}

            <button disabled={!canSaveAsDraft()} type="button" className="btn btn-primary" onClick={handleSave}>
              {loadingDraft ? <span data-uk-spinner={"ratio:.5"}></span> : "Update Draft"}
            </button>

            <button type="submit" className="btn btn-primary" disabled={!canSubmitForApproval()}>
              Submit for Approval{" "}{loadingSubmission && <div data-uk-spinner={"ratio:.5"}></div>}
            </button>

            <button disabled={loadingPOP} type="button" className="btn btn-primary-in-active uk-margin-small-top" onClick={handleClearForm}>
              Clear Form
            </button>
          </div>
        </form>
      )}
    </ErrorBoundary>
  );
});

export default AmendWithdrawalForm;
