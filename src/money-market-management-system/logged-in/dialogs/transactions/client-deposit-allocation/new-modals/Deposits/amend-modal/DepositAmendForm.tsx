import { useState } from "react";
import { observer } from "mobx-react-lite";
import SingleSelect from "../../../../../../../../shared/components/single-select/SingleSelect";
import { LoadingEllipsis } from "../../../../../../../../shared/components/loading/Loading";
import { IDepositTransaction } from "../../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { INaturalPerson } from "../../../../../../../../shared/models/clients/NaturalPersonModel";
import { ILegalEntity } from "../../../../../../../../shared/models/clients/LegalEntityModel";
import { IMoneyMarketAccount } from "../../../../../../../../shared/models/money-market-account/MoneyMarketAccount";

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
    const {
        setDepositTransaction,
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
    } = props;

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!depositTransaction.accountNumber) {
            newErrors.accountNumber = "Client Account is required.";
        }
        if (!depositTransaction.sourceBank) {
            newErrors.sourceBank = "IJG Bank Account is required.";
        }
        if (!depositTransaction.sourceOfFunds && !showOtherSource) {
            newErrors.sourceOfFunds = "Source of Funds is required.";
        }
        if (futureDatingTransaction && !depositTransaction.reasonForFutureDating) {
            newErrors.reasonForFutureDating = "Reason for Future Dating is required.";
        }
        if (backDatingTransaction && !depositTransaction.reasonForBackDating) {
            newErrors.reasonForBackDating = "Reason for Back Dating is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (validateForm()) {
            handleSubmit(event);
        }
    };

    return (
        <>
            {_loading || _loadingSave ? <LoadingEllipsis /> :
                <form className="ijg-form" onSubmit={handleFormSubmit}>
                    <div className="dialog-content uk-position-relative">
                        {selectedTab === "Form" &&
                            <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
                                <div>
                                    <div className="uk-margin-small-top uk-width-1-1">
                                        <label className="uk-form-label" htmlFor="clientAccount">
                                            {!selectedAccount ? 'Selected' : ''} Client Account:
                                        </label>
                                        <SingleSelect
                                            value={depositTransaction.accountNumber}
                                            options={clientAccountOptionsForAccount}
                                            onChange={handleClientAccountChange}
                                            isClearable={true}
                                        />
                                        {errors.accountNumber && <span className="uk-text-danger">{errors.accountNumber}</span>}
                                    </div>

                                    <div className="uk-margin-small-top">
                                        <label className="uk-form-label required" htmlFor="bankAccount">
                                            Select IJG Bank Account:
                                        </label>
                                        <select
                                            className="uk-select"
                                            id="bankAccount"
                                            name="bankAccount"
                                            value={depositTransaction.sourceBank}
                                            onChange={(e) =>
                                                setDepositTransaction({
                                                    ...depositTransaction,
                                                    sourceBank: e.target.value,
                                                })
                                            }
                                            required
                                            disabled
                                        >
                                            <option value="">Select the IJG Bank Account used for deposit</option>
                                            <option value="SBN">SBN</option>
                                            <option value="NBN">NBN</option>
                                        </select>
                                        {errors.sourceBank && <span className="uk-text-danger">{errors.sourceBank}</span>}
                                    </div>

                                    <div className="uk-margin-small-top">
                                        <label className="uk-form-label required" htmlFor="sourceOfFunds">
                                            Source Of Funds:
                                        </label>
                                        <select
                                            className="uk-select"
                                            value={depositTransaction.sourceOfFunds}
                                            id="sourceOfFunds"
                                            onChange={handleSourceChange}
                                            required={!showOtherSource}
                                            disabled
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
                                        {errors.sourceOfFunds && <span className="uk-text-danger">{errors.sourceOfFunds}</span>}
                                        {showOtherSource && (
                                            <input
                                                type="text"
                                                className="uk-margin-small-top uk-input"
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
                                            <label className="uk-form-label required" htmlFor="reasonForFutureDating">
                                                Reason for Future Dating:
                                            </label>
                                            <input
                                                className="uk-input"
                                                type="text"
                                                name="reasonForFutureDating"
                                                id="reasonForFutureDating"
                                                required
                                            />
                                            {errors.reasonForFutureDating && <span className="uk-text-danger">{errors.reasonForFutureDating}</span>}
                                        </div>
                                    )}

                                    {backDatingTransaction && (
                                        <div className="uk-margin-small-top">
                                            <label className="uk-form-label required" htmlFor="reasonForBackDating">
                                                Reason for Back Dating:
                                            </label>
                                            <input
                                                className="uk-input"
                                                type="text"
                                                name="reasonForBackDating"
                                                id="reasonForBackDating"
                                                required
                                                disabled
                                            />
                                            {errors.reasonForBackDating && <span className="uk-text-danger">{errors.reasonForBackDating}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Other form sections */}
                            </div>
                        }

                        {/* Other Tabs (Audit Trail, Statement) */}
                    </div>

                    <div className="uk-width-1-1 uk-text-right">
                        <button type="button" disabled={_loading || _loadingSave} className="btn btn-danger" onClick={onCancel}>Cancel</button>
                        <button disabled={_loading || _loadingSave} className="btn btn-primary" onClick={handleSave}>Save</button>
                        <button disabled={_loading || _loadingSave} className="btn btn-primary" type="submit">Submit</button>
                    </div>
                </form>
            }
        </>
    )
});
