import { observer } from "mobx-react-lite";
import { FormEvent, useState } from "react";

import NumberInput from "../../../../shared/components/number-input/NumberInput";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";

interface IProps {
    client: INaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onSubmitClientInformation: (e: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export const ComplianceForm = observer((props: IProps) => {
    const { client, setClient, onSubmitClientInformation, onCancel } = props;

    const [provideOtherSourceOfWealth, setProvideOtherSourceOfWealth] = useState(false);

    const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        // Clear the input field value when the user switches from 'Other' to another option
        if (value === "Other") {
            setClient({
                ...client,
                sourceOfWealth: '',
            });
            setProvideOtherSourceOfWealth(true);
        } else {
            setClient({
                ...client,
                sourceOfWealth: value,
            });
            setProvideOtherSourceOfWealth(false);
        }
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitClientInformation}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Compliance Details"}
                    />
                    <hr className="uk-width-1-1" />
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="dateOfLastFIA">Date Of Last FIA</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="dateOfLastFIA"
                            type="date"
                            value={dateFormat_YY_MM_DD(client.dateOfLastFIA)}
                            // onChange={(e) => setClient({ ...client, dateOfLastFIA: e.target.valueAsNumber })}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value); // Parse the input value as a Date object
                                setClient({ ...client, dateOfLastFIA: newDate.getTime() }); // Set the date in milliseconds
                            }}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="dateOfNextFIA">Date Of Next FIA</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="dateOfNextFIA"
                            type="date"
                            value={dateFormat_YY_MM_DD(client.dateOfNextFIA)}
                            onChange={(e) => setClient({ ...client, dateOfNextFIA: e.target.valueAsNumber })}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="sourceOfWealth">Source of Wealth</label>
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" value={client.sourceOfWealth}
                            id="sourceOfWealth"
                            onChange={handleSourceChange}
                            required={!provideOtherSourceOfWealth}
                        >
                            <option value="">Select Source of Wealth</option>
                            <option value="No Source of Wealth">No Source of Wealth</option>
                            <option value="Salary">Salary</option>
                            <option value="Investments">Investments</option>
                            <option value="Business Profits">Business Profits</option>
                            <option value="Inheritance">Inheritance</option>
                            <option value="Gift">Gift</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {provideOtherSourceOfWealth && (
                        <div className="uk-form-controls">
                            <input type="text" className="uk-input uk-form-small uk-margin-small-top" placeholder="Source of Wealth" value={client.sourceOfWealth}
                                onChange={(e) => setClient({
                                    ...client,
                                    sourceOfWealth: e.target.value,
                                })
                                }
                                required
                            />
                        </div>
                    )}
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="annualIncome">Annual Income</label>
                    <div className="uk-form-controls">
                        <NumberInput
                            id="annualIncome"
                            className="auto-save uk-input uk-form-small"
                            placeholder="-"
                            value={client.annualIncome}
                            onChange={(value) =>
                                setClient({ ...client, annualIncome: Number(value) })
                            }
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="annualInvestmentLimit">Annual Investment Limit</label>
                    <div className="uk-form-controls">
                        <NumberInput
                            id="annualInvestmentLimit"
                            className="auto-save uk-input uk-form-small"
                            placeholder="-"
                            value={client.annualInvestmentLimit}
                            onChange={(value) =>
                                setClient({ ...client, annualInvestmentLimit: Number(value) })
                            }
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="singleTransactionLimit">Single Transaction Limit</label>
                    <div className="uk-form-controls">
                        <NumberInput
                            id="singleTransactionLimit"
                            className="auto-save uk-input uk-form-small"
                            placeholder="-"
                            value={client.singleTransactionLimit}
                            onChange={(value) =>
                                setClient({ ...client, singleTransactionLimit: Number(value) })
                            }
                        />
                    </div>
                </div>

                <div className="uk-width-1-1 uk-text-right">
                    <button className="btn btn-danger" type="button" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" type="submit">
                        Update
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
});