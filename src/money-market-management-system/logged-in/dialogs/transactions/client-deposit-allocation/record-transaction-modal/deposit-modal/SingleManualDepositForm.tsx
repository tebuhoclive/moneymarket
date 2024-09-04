import { observer } from "mobx-react-lite";
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import DepositTransaction, { IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import "../../record-transaction-modal/RecordNewForm.scss";
import { ILegalEntity } from "../../../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../../../shared/models/clients/NaturalPersonModel";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";
import SingleSelect from "../../../../../../../shared/components/single-select/SingleSelect";
import NormalClientStatement from "../../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { getMMADocId } from "../../../../../../../shared/functions/MyFunctions";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import NumberInput from "../../../../../shared/components/number-input/NumberInput";
import { useRef, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

interface FormProps {
  onCancel: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClientAccountChange: (value: string) => void;
  handleAmountChange: (amount: number) => void;
  handleSourceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSave: () => void;
  onClear: () => void;
  _loading: boolean;
  _loadingSave: boolean;
  showOtherSource: boolean;
  selectedTab: string;
  selectedClientAccount: IMoneyMarketAccount | undefined;
  selectedClientProfile: INaturalPerson | ILegalEntity | null | undefined;
  showStatement: boolean;
  clientAccountOptions: { label: string; value: string }[],
  depositTransaction: IDepositTransaction;
  defautTransaction: IDepositTransaction;
  setDepositTransaction: React.Dispatch<
    React.SetStateAction<IDepositTransaction>
  >;
  onClearFileComponent: boolean;
  setOnClearToFalse?: ((clear: boolean) => void) | undefined;
  handleSetFileUrl: (url: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => void;
  handleSetReason: (value: string, field: 'sourceOfFundsAttachment' | 'proofOfPaymentAttachment') => void;

}

const SingleManualDepositForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    onClear,
    handleSubmit,
    handleClientAccountChange,
    handleDateChange,
    handleAmountChange,
    handleSourceChange,
    handleSave,
    _loading,
    _loadingSave,
    showOtherSource,
    selectedTab,
    clientAccountOptions,
    selectedClientProfile,
    depositTransaction,
    defautTransaction,
    setDepositTransaction,
    onClearFileComponent = false,
    setOnClearToFalse,
    handleSetFileUrl,
    handleSetReason
  }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formattedFirstDay = dateFormat_YY_MM_DD(firstDayOfMonth.getTime());
    const formattedLastDay = dateFormat_YY_MM_DD(lastDayOfMonth.getTime());
    const { store } = useAppContext();

    const [isUploadPOP, setIsUploadPOP] = useState<boolean>(false);
    const [filePOP, setFilePOP] = useState<File | null>(null);
    const [fileUploadProgressPOP, setFileUploadProgressPOP] = useState(0);
    const fileInputRefPOP = useRef<HTMLInputElement>(null);
    const [loadingPOP, setLoadingPOP] = useState(false);
    const [fileUrlPOP, setFileUrlStatePOP] = useState<string | null>(null);

    // const canSubmitForApproval = () =>{
      
    // }
console.log("log my default transaction in here ",defautTransaction);

    const handleClearAndAdditionalAction = () => {
      handleClearForm();
      onClear();
      // setSelectedClientProfile(null);
      // setSelectedClientAccount(defaultMoneyMarketAccount);
      setDepositTransaction(defautTransaction);
      handleClientAccountChange(" ");
   
    };
    const handleCancelAndAdditionalAction = () => {
      handleClearForm();
      onClear();
      onCancel();
    };


    const [isClearable, setIsClearable] = useState(true);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
  
    const handleClearForm = () => {
      setSelectedValue(null); // Clear the selected value
      setIsClearable(true);   // Ensure the select is clearable
    };
    // -------------  temp solution source of funds ------------------
const handleSelectChange = (value: string | null) => {
    setSelectedValue(value);
    if (value) {
      handleClientAccountChange(value);
      // setDepositTransaction({ ...depositTransaction, clientBankingDetails: "" });
      setDepositTransaction({ ...depositTransaction, accountNumber: value });
    }
  };
    const [isUploadSOF, setIsUploadSOF] = useState<boolean>(false);
    const [fileSOF, setFileSOF] = useState<File | null>(null);
    const [fileUploadProgressSOF, setFileUploadProgressSOF] = useState(0);
    const fileInputRefSOF = useRef<HTMLInputElement>(null);
    const [loadingSOF, setLoadingSOF] = useState(false);
    const [fileUrlSOF, setFileUrlStateSOF] = useState<string | null>(null);

    const handleFileUploadSOF = async (file: File) => {

      const storage = getStorage();


      const storageRef = ref(storage, `uploads/deposits/${dateFormat_DD_MM_YY(Date.now())}/${depositTransaction.accountNumber}/$Source of funds`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgressSOF(progress);
      });

      try {
        setLoadingSOF(true);
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        setDepositTransaction({
          ...depositTransaction,
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
      setDepositTransaction({
        ...depositTransaction,
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

 

   
    const handleFileUploadPOP = async (file: File) => {

      const storage = getStorage();


      const storageRef = ref(storage, `uploads/deposits/${dateFormat_DD_MM_YY(Date.now())}/${depositTransaction.accountNumber}/Proof of Payment`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgressPOP(progress);
      });

      try {
        setLoadingPOP(true);
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        setDepositTransaction({
          ...depositTransaction,
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
      setDepositTransaction({
        ...depositTransaction,
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
      <>
        {_loading || _loadingSave ? <LoadingEllipsis /> :
          <form className="ijg-form" onSubmit={handleSubmit}>
            <div className="dialog-content uk-position-relative">
              {selectedTab === "Statement" &&
                <div>
                  <NormalClientStatement
                    moneyMarketAccountId={getMMADocId(depositTransaction.accountNumber, store) || ""}
                    noDates={true}
                    noButtons={true}
                  />
                </div>
              }
              {selectedTab === "Form" &&
                <div className="uk-grid uk-grid-small" data-uk-grid>
                  {/* Left Column */}
                  <div className="uk-width-1-2">
                    <div className="uk-width-1-1 deposit-select-bank">
                      <label className="uk-form-label">Select Account:</label>
                      <SingleSelect
                       
                        value={selectedValue}
                        options={clientAccountOptions}
                        onChange={handleSelectChange}
                        isClearable={isClearable}
                      />
                    </div>
                    <div className="uk-margin-small uk-width-1-1">
                      <label className="uk-form-label">Select IJG Bank Account:</label>
                      <select

                        id="bankAccount"
                        name="bankAccount"
                        value={depositTransaction.sourceBank}
                        onChange={(e) => setDepositTransaction({ ...depositTransaction, sourceBank: e.target.value })}
                        required
                      >
                        <option value=""></option>
                        <option value="SBN">SBN</option>
                        <option value="NBN">NBN</option>
                      </select>

                    </div>

                    <div className="uk-margin-small">
                      <label className="uk-form-label">Value Date:</label>
                      <input
                        id="valueDate"
                        type="date"
                        name="valueDate"
                        value={depositTransaction.valueDate ? dateFormat_YY_MM_DD(depositTransaction.valueDate) : dateFormat_YY_MM_DD(Date.now())}
                        onChange={handleDateChange}
                        required
                        min={formattedFirstDay}
                        max={formattedLastDay}
                      />
                    </div>
                    {depositTransaction.depositTransactionProcess === "Back-Dated"
                      && <div className="">
                        <label className={"uk-form-label"} >
                          Reason For Back Dating
                        </label>
                        <textarea value={depositTransaction.reasonForBackDating}
                          onChange={(e) => setDepositTransaction({
                            ...depositTransaction,
                            reasonForBackDating: e.target.value,
                          })} required cols={40} rows={2} />
                      </div>
                    }
                    {depositTransaction.depositTransactionProcess === "Future-Dated"
                      &&
                      <div className="">
                        <label className={"uk-form-label"} >
                          Reason For Future Dating
                        </label>
                        <textarea value={depositTransaction.reasonForFutureDating}
                          onChange={(e) => setDepositTransaction({
                            ...depositTransaction,
                            reasonForFutureDating: e.target.value,
                          })} required cols={40} rows={2} />
                      </div>
                    }
                    <div className="uk-margin-small">
                      <label className="uk-form-label">Amount:</label>
                      <NumberInput value={depositTransaction?.amount} onChange={(value) => setDepositTransaction({ ...depositTransaction, amount: Number(value) })} />
                    </div>
                    <div className="uk-margin-small">
                      <label className="uk-form-label" >
                        Attach Source of Funds {"  "}
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
                            value={depositTransaction.sourceOfFundsAttachment.reasonForNotAttaching}
                            onChange={handleReasonChangeSOF}//
                            required
                          />
                        </div>
                      }
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="uk-width-1-2 uk-child-width-1-1">
                    <div className="uk-margin-small">
                      <label className="uk-form-label">Source of Funds:</label>
                      <select
                        value={depositTransaction?.sourceOfFunds}
                        id="clientStatus"
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
                          value={depositTransaction.sourceOfFunds}
                          onChange={(e) =>
                            setDepositTransaction({
                              ...depositTransaction,
                              sourceOfFunds: e.target.value,
                            })
                          }
                          required
                        />
                      )}
                    </div>
                    <div className="uk-margin-small">
                      <label className="uk-form-label">Client Email:</label>
                      <input
                        type="text"
                        name="clientEmail"
                        id="clientEmail"
                        value={selectedClientProfile?.contactDetail.emailAddress}
                        onChange={(e) => setDepositTransaction({ ...depositTransaction, emailAddress: e.target.value })}
                        readOnly
                      />
                    </div>

                    <div className="uk-margin-small uk-margin-small-bottom-32 statement-reference-margin">
                      <label className="uk-form-label">Statement Reference:</label>
                      <input
                        type="text"
                        name="bankReference"
                        id="bankReference"
                        value={depositTransaction.bankReference}
                        onChange={(e) => setDepositTransaction({ ...depositTransaction, bankReference: e.target.value })}
                        maxLength={30}
                      />
                    </div>
                    <div className="uk-margin-small">
                      <label className="uk-form-label" >
                        Attach proof of payment  {"    "}
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
                            value={depositTransaction.proofOfPaymentAttachment.reasonForNotAttaching}
                            onChange={handleReasonChangePOP}//
                            required
                          />
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }


            </div>
            <div className="uk-text-right">
              <div className="uk-flex uk-flex-right">
                <button disabled={_loadingSave || _loading || loadingPOP} type="button" className="btn btn-danger" onClick={handleCancelAndAdditionalAction}>
                  Cancel
                </button>
                <button disabled={_loadingSave || _loading || loadingPOP} type="button" className="btn btn-primary-in-active" onClick={handleClearAndAdditionalAction}>
                  Clear Form
                </button>
                <button disabled={_loadingSave || _loading || loadingPOP || !depositTransaction.accountNumber} type="button" className="btn btn-primary" onClick={handleSave}>
                  {_loadingSave ? <span data-uk-spinner={"ratio:.5"}></span> : "Save Draft"}
                </button>
                <button disabled={
                  _loadingSave
                  ||
                  _loading
                  ||
                  loadingPOP
                  ||
                  (depositTransaction.amount === 0 && !depositTransaction.accountNumber && !depositTransaction.sourceBank && !depositTransaction.sourceOfFunds)
                  ||
                  (!depositTransaction.proofOfPaymentAttachment.url && depositTransaction.proofOfPaymentAttachment.reasonForNotAttaching.length === 0)
                  ||
                  (!depositTransaction.sourceOfFundsAttachment.url && depositTransaction.sourceOfFundsAttachment.reasonForNotAttaching.length === 0)
                }
                  className="btn btn-primary"
                >
                  {(_loadingSave || _loading) && <span data-uk-spinner={"ratio:.5"}></span>}Submit For Approval
                </button>
              </div>
            </div>
          </form>
        }
      </>
    );
  }
);

export default SingleManualDepositForm;
