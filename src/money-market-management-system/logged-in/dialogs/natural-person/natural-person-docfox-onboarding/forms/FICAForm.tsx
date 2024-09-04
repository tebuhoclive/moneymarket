import { observer } from "mobx-react-lite";
import { FormEvent } from "react";
import NumberInput from "../../../../shared/components/number-input/NumberInput";
import React from "react";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { IDocFoxNaturalPerson } from "../../../../../../shared/models/clients/DocFoxNaturalPersonModel";
import { dateFormat_YY_MM_DD } from '../../../../../../shared/utils/utils';

interface IProps {
    client: IDocFoxNaturalPerson;
    clientDocfoxData: IDocFoxNaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<IDocFoxNaturalPerson>>;
    onSubmitFICA: (e: FormEvent<HTMLFormElement>) => void;
    onBackToBankDetail: () => void;
}

export const FICA = observer((props: IProps) => {
    const { client, clientDocfoxData, setClient, onSubmitFICA, onBackToBankDetail } = props;

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitFICA}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"FICA Details"}
                    />
                    <hr className="uk-width-1-1" />
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="clientClassification">Client Classification</label>
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" name="clientClassification" id="clientClassification"
                            value={client.clientClassification}
                            onChange={(e) => setClient({ ...client, clientClassification: e.target.value })}
                            required
                        >
                            <option value="Politically Exposed Person (PEP)"> Politically Exposed Person (PEP)</option>
                            <option value="Not Exposed (NE)">Not Exposed (NE)</option>
                            <option value="Domestic/ Political Influential Person">Domestic/ Political Influential Person</option>
                        </select>
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="riskRating">Risk Rating</label>
                    <div className="uk-form-controls">
                        {/* <select
                            className="uk-select uk-form-small"
                            value={client.riskRating}
                            id="riskRating"
                            onChange={(e) => setClient({ ...client, riskRating: e.target.value })}
                            required
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select> */}

                        {clientDocfoxData.riskRating &&
                            < input
                                className="uk-input uk-form-small"
                                id="entityType"
                                placeholder="Entity Type"
                                type="text"
                                value={clientDocfoxData.riskRating}
                                onChange={(e) => setClient({ ...client, riskRating: e.target.value })}
                                required
                            />
                        }
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="dateOfLastFIA">Date Of Last FIA</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="dateOfLastFIA"
                            type="date"
                            value={dateFormat_YY_MM_DD(client.dateOfLastFIA)}
                            onChange={(e) => setClient({ ...client, dateOfLastFIA: e.target.valueAsNumber })}
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

                <div className="uk-width-1-1">
                    <label className="uk-form-label" htmlFor="restricted">Restricted</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-checkbox"
                            id="restricted"
                            type="checkbox"
                            checked={client.restricted}
                            onChange={(e) => setClient({ ...client, restricted: e.target.checked })}
                        />
                    </div>
                    {client.restricted && (
                        <div className="uk-width-1-2">
                            <label className="uk-form-label required" htmlFor="reasonForRestriction">Reason For Restriction</label>
                            <div className="uk-form-controls">
                                <textarea
                                    className="uk-textarea uk-form-small"
                                    id="reasonForRestriction"
                                    rows={6}
                                    value={client.reasonForRestriction}
                                    onChange={(e) => setClient({ ...client, reasonForRestriction: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>


                <div className="uk-width-1-1 uk-text-right">
                    <button
                        className="btn-text uk-margin-right"
                        type="button"
                        onClick={onBackToBankDetail}
                    >
                        Back
                    </button>
                    <button
                        className="btn btn-primary"
                        type="submit"
                    >
                        Next
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
});