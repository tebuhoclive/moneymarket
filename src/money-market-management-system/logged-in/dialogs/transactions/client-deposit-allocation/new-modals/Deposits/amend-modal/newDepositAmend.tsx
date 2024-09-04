import { observer } from "mobx-react-lite"
import { FileUploadComponent } from "../../../../../../../../shared/components/instruction-file-upload/NewFileUploadComponent";
import { IDepositTransaction } from "../../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";

import { dateFormat_YY_MM_DD } from "../../../../../../../../shared/utils/utils";
import { LoadingEllipsis } from "../../../../../../../../shared/components/loading/Loading";
import { INaturalPerson } from "../../../../../../../../shared/models/clients/NaturalPersonModel";
import { ILegalEntity } from "../../../../../../../../shared/models/clients/LegalEntityModel";
import { IMoneyMarketAccount } from "../../../../../../../../shared/models/money-market-account/MoneyMarketAccount";

import SingleSelect from "../../../../../../../../shared/components/single-select/SingleSelect";
import NumberInput from "../../../../../../shared/components/number-input/NumberInput";
import { useAppContext } from "../../../../../../../../shared/functions/Context";
import { ClientDepositAllocationAuditTrailGrid } from "../../../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";
import NormalClientStatement from "../../../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { getMMADocId } from "../../../../../../../../shared/functions/MyFunctions";

interface IProps {
    setOnClearToFalse?: ((clear: boolean) => void) | undefined;
    handleAmountChange: (amount: number) => void;
    handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleClientAccountChange: (value: string) => void;
    handleSourceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleReAllocate: (value: boolean) => void;
    setSwitchAccount: (value: string) => void;
    setDepositTransaction: React.Dispatch<React.SetStateAction<IDepositTransaction>>;
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
    onCancel: () => void;
    depositTransaction: IDepositTransaction;
    selectedTab: string;
    selectedAccount: string;
    switchAccount: string;
    _loading: boolean;
    _loadingSave: boolean;
    editAccount: boolean;
    showOtherSource: boolean;
    onClearFileComponent: boolean;
    selectedClientProfile: INaturalPerson | ILegalEntity | null | undefined;
    selectedClientAccount: IMoneyMarketAccount | undefined;
    futureDatingTransaction?: boolean;
    backDatingTransaction?: boolean;
    clientOptions: { label: string; value: string }[],
    clientAccountOptionsForAccount: { label: string; value: string }[],
    clientAccountOptions: any[],
}

export const DepositAmendForm = observer((props: IProps) => {
    const { setDepositTransaction,
        onClearFileComponent,
        depositTransaction,
        onCancel,
        _loading,
        _loadingSave,
        selectedClientProfile,
        selectedAccount,
        selectedTab,
        clientAccountOptionsForAccount,
        futureDatingTransaction,
        backDatingTransaction,
        showOtherSource,
        setOnClearToFalse,
        handleClientAccountChange,
        handleAmountChange,
        handleDateChange,
        handleSave,
        handleSubmit,
        handleSourceChange
    } = props

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formattedFirstDay = dateFormat_YY_MM_DD(firstDayOfMonth.getTime());
    const formattedLastDay = dateFormat_YY_MM_DD(lastDayOfMonth.getTime());
    const { store } = useAppContext();
    const auditTrail = store.depositTransactionAudit.all;
    const depositTransactionAudit = auditTrail.sort((a, b) => {
        const dateA = new Date(a.asJson.auditDateTime || 0);
        const dateB = new Date(b.asJson.auditDateTime || 0);
        return dateB.getTime() - dateA.getTime();
    }).map((c) => { return c.asJson });
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
        <>
            {_loading || _loadingSave ? <LoadingEllipsis /> :
                <form className="ijg-form" onSubmit={handleSubmit}>
                    <div className="dialog-content uk-position-relative">
                        {selectedTab === "Form" &&
                            <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
                                <div>
                                    <div className="uk-margin-small-top uk-width-1-1">
                                        <label className="uk-form-label" htmlFor="">
                                            {!selectedAccount ? 'Selected' : ''} Client Account:
                                        </label>
                                        <SingleSelect value={depositTransaction.accountNumber} options={clientAccountOptionsForAccount} onChange={handleClientAccountChange} isClearable={true} />
                                    </div>
                                    <div className="uk-margin-medium-top">
                                        <label className="uk-form-label">Value Date:</label>
                                        <input className="" id="valueDate" type="date" name="valueDate"
                                            value={
                                                depositTransaction.valueDate
                                                    ? dateFormat_YY_MM_DD(
                                                        depositTransaction.valueDate
                                                    )
                                                    : dateFormat_YY_MM_DD(Date.now())
                                            }
                                            onChange={handleDateChange}
                                            readOnly
                                            required
                                            min={formattedFirstDay}
                                            max={formattedLastDay}
                                        />
                                    </div>

                                    <div className="uk-margin-small-top uk-width-1-1">
                                        <label className="uk-form-label">Transaction Amount:</label>
                                        <NumberInput disabled value={Number(depositTransaction?.amount)} onChange={(value) =>
                                            handleAmountChange(Number(value))} 
                                            />
                                    </div>

                                    <div className="uk-margin-small-top">
                                        <label className="uk-form-label required" htmlFor="clientAccount">
                                            Select IJG Bank Account:
                                        </label>
                                        <select
                                            className=""
                                            id="bankAccount"
                                            name={"bankAccount"}
                                            value={depositTransaction.sourceBank}
                                            onChange={(e) =>
                                                setDepositTransaction({
                                                    ...depositTransaction,
                                                    sourceBank: e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            <option value="" selected>
                                                Select the IJG Bank Account used for deposit
                                            </option>
                                            <option value="SBN" selected>
                                                SBN
                                            </option>
                                            <option value="NBN" selected>
                                                NBN
                                            </option>
                                        </select>
                                    </div>
                                    <div className="uk-margin-small-top">
                                        <label className="uk-form-label required" htmlFor="clientStatus">
                                            Source Of Funds:
                                        </label>
                                        <select
                                            className=""
                                            value={depositTransaction.sourceOfFunds}
                                            id="clientStatus"
                                            onChange={handleSourceChange}
                                            required={!showOtherSource}
                                        >
                                            <option value="">Select Source of Funds</option>
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
                                                className=" uk-margin-small-top"
                                                placeholder="Enter other source of funds"
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
                                    {futureDatingTransaction && (
                                        <div className="uk-margin-small-top">
                                            <label className="uk-form-label required" htmlFor="">
                                                Reason for Future Dating:
                                            </label>
                                            <input
                                                className=" uk-input"
                                                type="text"
                                                name="reasonForFutureDating"
                                                id="reasonForFutureDating"
                                                required
                                            />
                                        </div>
                                    )}
                                    {backDatingTransaction && (
                                        <>
                                            <div className="uk-margin-small-top">
                                                <label
                                                    className="uk-form-label required"
                                                    htmlFor=""
                                                >
                                                    Reason for Back Dating:
                                                </label>
                                                <input
                                                    className=" uk-input"
                                                    type="text"
                                                    name="reasonForBackDating"
                                                    id="reasonForBackDating"
                                                    required
                                                />
                                            </div>
                                            <div className="uk-form-controls uk-width-1-2"></div>
                                        </>
                                    )}
                                </div>
                                <div className="uk-child-width-1-1">
                                    <div className="uk-margin-small-top">
                                        <label className="uk-form-label" htmlFor="">
                                            Client Email:
                                        </label>
                                        <input
                                            type="text"
                                            name="clientEmail"
                                            id="clientEmail"
                                            value={selectedClientProfile?.contactDetail.emailAddress}
                                            onChange={(e) => setDepositTransaction({ ...depositTransaction, emailAddress: e.target.value })}
                                            readOnly
                                        />
                                    </div>
                                    <div className="uk-margin-top">
                                        <label className="uk-form-label" htmlFor="">
                                            Statement Reference:
                                        </label>
                                        <input
                                            className=""
                                            type="text"
                                            name="bankReference"
                                            id="bankReference"
                                            disabled value={depositTransaction.bankReference}
                                            onChange={(e) =>
                                                setDepositTransaction({
                                                    ...depositTransaction,
                                                    bankReference: e.target.value,
                                                })
                                            }
                                        ></input>
                                    </div>
                                    <div className="uk-margin-small-top">
                                        <FileUploadComponent
                                            setFileUrl={(url) => handleSetFileUrl(url, 'proofOfPaymentAttachment')}
                                            reason={(value) => handleSetReason(value, 'proofOfPaymentAttachment')}
                                            label={"Proof of Payment"}
                                            onClearFileComponent={onClearFileComponent}
                                            setOnClearFalse={setOnClearToFalse}
                                            depositTransaction={depositTransaction}
                                            selectedAccount={depositTransaction.accountNumber}
                                        />
                                    </div>

                                    <div className="uk-margin-small-top">
                                        <FileUploadComponent
                                            setFileUrl={(url) => handleSetFileUrl(url, 'sourceOfFundsAttachment')}
                                            reason={(value) => handleSetReason(value, 'sourceOfFundsAttachment')}
                                            label={"Source of Funds"}
                                            onClearFileComponent={onClearFileComponent}
                                            setOnClearFalse={setOnClearToFalse}
                                            depositTransaction={depositTransaction}
                                            selectedAccount={depositTransaction.accountNumber}
                                        />
                                    </div>
                                    {
                                        depositTransaction.note &&
                                        <div>
                                            <label className="uk-form-label">Return Note:</label>
                                            <textarea
                                                value={depositTransaction.note}
                                                cols={5}
                                                required
                                                disabled
                                            />
                                        </div >
                                    }
                                </div>
                            </div>
                        }

                        {selectedTab === "Audit Trail" &&
                            <ClientDepositAllocationAuditTrailGrid
                                data={depositTransactionAudit}
                            />
                        }
                        {selectedTab === "Statement" &&
                            <NormalClientStatement
                                moneyMarketAccountId={getMMADocId(depositTransaction.accountNumber, store) || ""}
                                noDates={true}
                                noButtons={true}
                            />
                        }
                    </div>
                    <div className="uk-width-1-1 uk-text-right">
                        <button type="button" disabled={_loading || _loadingSave} className="btn btn-danger" onClick={onCancel}>Cancel</button>
                        <button disabled={_loading || _loadingSave} className="btn btn-primary" onClick={handleSave} >Save</button>
                        <button disabled={_loading || _loadingSave} className="btn btn-primary" type="submit">Submit</button>
                    </div>
                </form>
            }
        </>
    )
})