import { ChangeEvent } from "react";
import ErrorBoundary from "../../../../../../../shared/components/error-boundary/ErrorBoundary";

interface IProps {
    index: number;
    bankName: string;
    branch: string;
    branchNumber: string;
    accountHolder: string;
    accountType: string;
    accountNumber: string;
    onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onItemRemove: (index: number) => void;
}

export const BankingDetailsItem = (props: IProps) => {

    const {
        index,
        bankName,
        branch,
        branchNumber,
        accountHolder,
        accountType,
        accountNumber,
        onItemChange,
        onItemRemove,
        // onNumberChange,
    } = props;

    return (
        <ErrorBoundary>
            <div className="uk-grid uk-grid-small" data-uk-grid>
                <h4 className="uk-width-1-1 title-md">{index=== 0 ? `Primary Account` : index === 1 ? `Secondary Account`:`Secondary Account (${index})`}</h4>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="bankName">Bank Name</label>
                    <div className="uk-form-controls">
                        <input
                            id="bankName"
                            className="uk-input uk-form-small"
                            type="text"
                            value={bankName}
                            name={"bankName"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="Branch">Branch</label>
                    <div className="uk-form-controls">
                        <input
                            id="branch"
                            className="uk-input uk-form-small"
                            type="text"
                            value={branch}
                            name={"branch"}
                            onChange={onItemChange(index)}
                            required
                        />
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
                            name={"branchNumber"}
                            onChange={onItemChange(index)}
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
                    <label className="uk-form-label required" htmlFor="AccountType">Account Type</label>
                    <div className="uk-form-controls">
                        <input
                            id="accountType"
                            className="uk-input uk-form-small"
                            type="text"
                            value={accountType}
                            name={"accountType"}
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
                <div className="uk-width-expand">
                    <div className="uk-flex uk-flex-middle uk-flex-inline">
                        <div className="uk-margin">
                            <div className="icon">
                                <span data-uk-tooltip="Remove bank account details"
                                    onClick={() => onItemRemove(index)}
                                    data-uk-icon="icon: trash;"
                                ></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};