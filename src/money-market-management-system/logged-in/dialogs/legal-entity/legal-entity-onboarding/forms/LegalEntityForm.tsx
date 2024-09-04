import React, { FormEvent } from "react";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { ILegalEntity } from "../../../../../../shared/models/clients/LegalEntityModel";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";

interface INaturalPersonFormProps {
    client: ILegalEntity;
    setClient: React.Dispatch<React.SetStateAction<ILegalEntity>>;
    onSubmitClientInformation: (e: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export const LegalEntityForm = (props: INaturalPersonFormProps) => {
    const { client, setClient, onSubmitClientInformation, onCancel } = props;

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitClientInformation}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"General Information"}
                    />
                    <hr className="uk-width-1-1" />
                </div>
                <div className="uk-width-1-1">
                    <label className="uk-form-label required" htmlFor="clientRegisteredName">Registered Name</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="clientRegisteredName"
                            placeholder="e.g Prescient IJG Unit Trust"
                            type="text"
                            value={client.clientRegisteredName}
                            onChange={(e) => setClient({ ...client, clientRegisteredName: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-1">
                    <label className="uk-form-label" htmlFor="clientTradingName">Trading Name</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="clientTradingName"
                            placeholder="e.g Prescient IJG"
                            type="text"
                            value={client.clientTradingName}
                            onChange={(e) => setClient({ ...client, clientTradingName: e.target.value })}
                        />
                    </div>
                </div>
                <div className="uk-width-1-1">
                    <label className="uk-form-label" htmlFor="registrationNumber">Registration Number</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="registrationNumber"
                            placeholder="e.g 2020/066"
                            type="text"
                            value={client.registrationNumber}
                            onChange={(e) => setClient({ ...client, registrationNumber: e.target.value })}
                        />
                    </div>
                </div>
                <div className="uk-width-1-1 uk-text-right">
                    <button
                        className="btn-text uk-margin-right"
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
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
};
