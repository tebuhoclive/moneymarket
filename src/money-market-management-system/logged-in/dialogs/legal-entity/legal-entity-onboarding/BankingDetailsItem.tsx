import React, { ChangeEvent } from "react";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { allBanks } from "../../../../../shared/functions/Banks";
import { observer } from "mobx-react-lite";
//pr
interface IProps {
    index: number;
    bankName: string;
    branch: string;
    branchNumber: string;
    accountHolder: string;
    accountType: string;
    accountNumber: string;
    onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onItemChangeBranchNumberAndBankName: (index: number, valueOne: string, valueTwo: string) => void;
    onItemRemove: (index: number) => void;
}

export const BankingDetailsItem = observer((props: IProps) => {
    const {
        index,
        bankName,
        accountHolder,
        accountNumber,
        branchNumber,
        onItemChange,
        onItemRemove,
        onItemChangeBranchNumberAndBankName
    } = props;


    const handleBankChange = (bankName: string) => {
        const selectedBankName = bankName;
        const bank = allBanks.find(b => b.name === bankName);

        if (bank) {
            onItemChangeBranchNumberAndBankName(index, bank.code, bank.name);
        }
    };

    return (
        <ErrorBoundary>
            <div className="uk-grid uk-grid-small" data-uk-grid>
                <h4 className="uk-width-1-1 title-md uk-modal-title">{index === 0 ? `Primary Account` : index === 1 ? `Secondary Account` : `Secondary Account (${index})`}</h4>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="bankName">Bank Name</label>
                    <div className="uk-form-controls">
                        <select value={bankName} className="uk-select" id="bankSelect" onChange={(e) => handleBankChange(e.target.value)}>
                            <option value="">-- Select Bank --</option>
                            {allBanks.map(bank => (
                                <option key={bank.name} value={bank.name}>{bank.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="BranchNumber">Branch Number</label>
                    <div className="uk-form-controls">
                        <input
                            id="branchNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            value={branchNumber}
                            name="branchNumber"
                            readOnly
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="AccountHolder">Account Holder</label>
                    <div className="uk-form-controls">
                        <input
                            id="accountHolder"
                            className="uk-input uk-form-small"
                            type="text"
                            value={accountHolder}
                            name={"accountHolder"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="AccountNumber">Account Number</label>
                    <div className="uk-form-controls">
                        <input
                            id="accountNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            value={accountNumber}
                            name={"accountNumber"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                {
                    index !== 0 &&
                    <div className="uk-width-expand">
                        <div className="uk-flex uk-flex-middle uk-flex-inline">
                            <div className="uk-margin">
                                <div className="icon">
                                    <span data-uk-tooltip="Remove bank account details"
                                        onClick={() => onItemRemove(index)}
                                        data-uk-icon="icon: trash;"
                                        className="uk-text-danger"
                                    ></span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </ErrorBoundary>
    );
});
