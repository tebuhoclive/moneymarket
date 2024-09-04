import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";

import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";

import NormalClientStatement from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import FormattedNumberInput from "../../../../../../shared/functions/FormattedNumberInput";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { ILegalEntity } from "../../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import DetailView, { IDataDisplay } from "../../../../shared/components/detail-view/DetailView";
import { getMMADocId } from "../../../../../../shared/functions/MyFunctions";

import { useRef, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { splitAndTrimString } from '../../../../../../shared/functions/StringFunctions';
import NumberInput from "../../../../shared/components/number-input/NumberInput";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { numberCurrencyFormat } from "../../../../../../shared/functions/Directives";

interface IProps {
  onCancel: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClientAccountChange: (value: string) => void;
  handleAmountChange: (amount: number) => void;
  handleSourceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSave: () => void;
  handleUseAgentChange: () => void;
  onClear: () => void;
  loading: boolean;
  loadingSave: boolean;
  loadingSubmission: boolean;
  loadingDraft: boolean;
  verifyBackDating: boolean;
  showOtherSource: boolean;
  selectedTab: string;
  selectedClientAccount: IMoneyMarketAccount | undefined;
  selectedClientProfile: INaturalPerson | ILegalEntity | null | undefined;
  clientAccountOptions: { label: string; value: string }[],
  agentsAccount: {
    value: string;
    label: string;
  }[]
  withdrawalTransaction: IWithdrawalTransaction;
  setWithdrawalTransaction: React.Dispatch<React.SetStateAction<IWithdrawalTransaction>>;
  onClearFileComponent: boolean;
  setOnClearToFalse?: ((clear: boolean) => void) | undefined;
  closeOutDays: number,
  closeOutInterest: number,
  calculatingInterest: boolean
}

const RecordCloseOutWithdrawalForm = observer((props: IProps) => {

  const {
    onCancel,
    onClear,
    handleSubmit,
    handleClientAccountChange,
    handleDateChange,
    handleAmountChange,
    handleSourceChange,
    handleSave,
    loadingSubmission,
    loadingDraft,
    loadingSave,
    handleUseAgentChange,
    loading,
    showOtherSource,
    selectedTab,
    verifyBackDating,
    clientAccountOptions,
    selectedClientProfile,
    selectedClientAccount,
    agentsAccount,
    withdrawalTransaction,
    setWithdrawalTransaction,
    closeOutDays,
    closeOutInterest,
    calculatingInterest
  } = props;

  const { store } = useAppContext();
  const today = new Date();
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


  let clientBankingDetailsAccounts: any[] = [];

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

  const balance = selectedClientAccount?.balance || 0;

  const allocationDetails: IDataDisplay[] = [
    { label: 'Product Code', value: selectedClientAccount?.accountType || "-" },
    { label: 'Account Balance', value: numberCurrencyFormat(balance || 0) },
    { label: 'Interest Earned', value: numberCurrencyFormat(closeOutInterest) },
    { label: 'Capitalised Amount', value: numberCurrencyFormat(balance + closeOutInterest) },
    { label: 'Days', value: closeOutDays }
  ];
  const transactionDetails: IDataDisplay[] = [
    { label: 'Bank Acc Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[2] || "-" },
    { label: 'Bank Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[0] || "-" },
    { label: 'Bank Acc Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[1] || "-" },
    { label: 'Bank Branch Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[3] || "-" },
  ];

  const handleClearAndAdditionalAction = () => {
    onClear();
  };

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
      console.error("File upload failed:", error);
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
    setWithdrawalTransaction({ ...withdrawalTransaction, clientBankingDetails: selectedBank })
  }



  const isClientAccountAndProfileSelected = () => {
    if (selectedClientProfile && selectedClientAccount) {
      return true
    } else {
      return false
    }
  }

  const isClientRestricted = () => {
    if (selectedClientProfile && selectedClientProfile.restricted) {
      return true;
    } else {
      return false;
    }
  }

  const canSaveAsDraft = () => {
    if (!isClientRestricted || !withdrawalTransaction.accountNumber || loadingSubmission || loadingDraft) {
      return true;
    } else {
      return false;
    }
  }

  const canSubmitForApproval = () => {
    if (!isClientAccountAndProfileSelected || !isClientRestricted || closeOutDays !== 0 || withdrawalTransaction.amount < 1000 || loadingSubmission || loadingDraft || withdrawalTransaction.amount > balance) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <ErrorBoundary>
      {loadingSubmission ? <LoadingEllipsis /> :
        <>
          {selectedTab === "Withdrawal" && (
            <form className="ijg-form" onSubmit={handleSubmit}>
              <div className="dialog-content uk-position-relative">
                <div className="uk-grid uk-grid-small" data-uk-grid>
                  {/** left controls */}
                  <div className="uk-width-2-3 uk-grid uk-grid-small" data-uk-grid>
                    <div className="uk-width-1-2">
                      <label
                        className="uk-form-label required"
                        htmlFor="clientSelect">
                        Select Account:
                      </label>
                      <SingleSelect
                        value={withdrawalTransaction?.accountNumber}
                        options={clientAccountOptions}
                        onChange={handleClientAccountChange}
                      />
                    </div>
                    {/* Add margin-bottom to create spacing */}
                    {!withdrawalTransaction.useAgent && (
                      <div className="uk-width-1-2">
                        <label className={`uk-form-label uk-display-block`}>
                          {withdrawalTransaction.useAgent ? 'Uncheck the box to make the payment to the Client' : 'Check the box to make the payment to an Agent'}?
                          <input
                            className="uk-checkbox"
                            type="checkbox"
                            checked={withdrawalTransaction.useAgent}
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
                      <div className="uk-width-1-2">
                        <label className={`uk-form-label uk-display-block`}>
                          {withdrawalTransaction.useAgent ? 'Uncheck the box to make the payment to the Client' : 'Check the box to make the payment to an Agent'}?
                          <input
                            className="uk-checkbox"
                            type="checkbox"
                            checked={withdrawalTransaction.useAgent}
                            onChange={handleUseAgentChange}
                            style={{ marginLeft: "10px" }}
                          />
                        </label>
                        <select
                          value={withdrawalTransaction.clientBankingDetails}
                          id="client-clientBankingDetails-account"
                          name={"client-clientBankingDetails-account"}
                          onChange={(e) =>
                            setWithdrawalTransaction({
                              ...withdrawalTransaction,
                              clientBankingDetails: e.target.value,
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
                    <div className="uk-width-1-2">
                      <label className="uk-form-label" htmlFor="valueDate">Value Date</label>
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
                    <div className="uk-width-1-2">
                      <label className="uk-form-label">Client Email Address:</label>
                      <input
                        type="text"
                        name="clientEmail"
                        id="clientEmail"
                        value={selectedClientProfile?.contactDetail.emailAddress}
                        onChange={(e) => setWithdrawalTransaction({
                          ...withdrawalTransaction,
                          emailAddress: e.target.value,
                        })}
                        readOnly
                      />
                    </div>
                    <div className="uk-width-1-2">
                      <label
                        className="uk-form-label required"
                        htmlFor="amount">
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
                      verifyBackDating &&
                      <span className="uk-display-block uk-text-danger uk-margin-top-small">Cannot back date this withdrawal to the selected date as the balance on that date is insufficient</span>
                    }
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
                            value={withdrawalTransaction.clientInstruction.reasonForNotAttaching}
                            onChange={handleReasonChangePOP}//
                            required
                          />
                        </div>
                      }
                    </div>
                    {/* Add margin-bottom to create spacing */}
                    {withdrawalTransaction.withdrawalTransactionProcess === "Future-Dated" && (
                      <div className="uk-width-1-2">
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
                      <div className="uk-width-1-2">
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
                  {/** right controls */}
                  <div className="uk-width-expand">
                    {calculatingInterest ?
                      <LoadingEllipsis /> :
                      <div className="uk-margin-medium-left">
                        <DetailView dataToDisplay={allocationDetails} />
                        <DetailView dataToDisplay={transactionDetails} />
                      </div>
                    }
                  </div>
                </div>
                {!withdrawalTransaction.clientBankingDetails && <div className="uk-width-1-2"></div>}
              </div>
              <div className="uk-width-1-1 uk-text-right">
                <button
                  type="button"
                  className="btn btn-danger uk-margin-small-top"
                  disabled={loadingSubmission || loadingDraft}
                  onClick={onCancel}>
                  Cancel
                </button>


                {selectedClientProfile?.restricted && (
                  <span className="uk-text-danger uk-display-block">
                    Client has been restricted:{" "}
                    {selectedClientProfile.reasonForRestriction}
                  </span>
                )}
                {!selectedClientAccount && (
                  <button
                    type="submit"
                    className="btn btn-primary uk-margin-small-top"
                    disabled={loadingSubmission || loadingDraft}>
                    Submit for Approval{" "}
                    {loadingSubmission && (
                      <div data-uk-spinner={"ratio:.5"}></div>
                    )}
                  </button>
                )}
                {selectedClientAccount && selectedClientProfile && !selectedClientProfile.restricted && (
                  <>
                    {/* {availableBalance < 0 && (
                     <button
                       type="button"
                       className="btn btn-primary"
                       disabled={loadingSubmission || loadingDraft}
                       onClick={generateWithdrawalThresholdNotificationHTML}>
                       Notify Client
                     </button>
                   )} */}
                    {/* {availableBalance >= 0 && ( */}
                    <>
                      {/* <button
                       type="submit"
                       className="btn btn-primary"
                       disabled={
                         withdrawalTransaction.amount === 0 || loadingSubmission || verifyBackDating || loadingDraft
                       }>
                       Submit for Approval{" "}
                       {loadingSubmission && (
                         <div data-uk-spinner={"ratio:.5"}></div>
                       )}
                     </button> */}
                    </>
                    <button type="submit" className="btn btn-primary" disabled={closeOutInterest === 0}>
                      Submit for Approval{" "}{loadingSubmission && <div data-uk-spinner={"ratio:.5"}></div>}
                    </button>
                  </>
                )}
                <button disabled={canSaveAsDraft()} type="button" className="btn btn-primary" onClick={handleSave}>
                  {loadingDraft ? <span data-uk-spinner={"ratio:.5"}></span> : "Save Draft"}
                </button>
                <button disabled={loadingPOP} type="button" className="btn btn-primary-in-active uk-margin-small-top" onClick={handleClearAndAdditionalAction}>
                  Clear Form
                </button>
              </div>
            </form>
          )}
          {selectedTab === "Statement" &&
            <>
              {
                !loading && selectedClientAccount &&
                <NormalClientStatement moneyMarketAccountId={selectedClientAccount.id} noButtons={true} />
              }
            </>
          }
        </>
      }

    </ErrorBoundary>
  );
});

export default RecordCloseOutWithdrawalForm;
