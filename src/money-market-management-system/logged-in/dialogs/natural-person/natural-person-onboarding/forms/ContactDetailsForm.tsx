import { observer } from "mobx-react-lite";

import { FormEvent, useState } from "react";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { NamibiaRegionList, CountryList } from "../../../../../../shared/functions/FormHelpers";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";

interface IContactDetailsFormProps {
    client: INaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onSubmitClientFinancialProfile: (e: FormEvent<HTMLFormElement>) => void;
    onBackToClientInformation: () => void;
}

export const ContactDetailsForm = observer((props: IContactDetailsFormProps) => {
    const { client, setClient, onSubmitClientFinancialProfile, onBackToClientInformation } = props;

    const onChange = (name: | "address1" | "postalAddress" | "emailAddress", value: string) => {
        const contact = { ...client.contactDetail };

        if (name === "address1") {
            contact.address1 = value;
        }

        if (name === "postalAddress") {
            contact.postalAddress = value;
        }
        if (name === "emailAddress") {
            contact.emailAddress = value;
        }
        setClient({ ...client, contactDetail: contact });
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitClientFinancialProfile}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Contact Details"}
                    />
                    <hr className="uk-width-1-1" />
                </div>
                <div className="uk-width-1-1">
                    <label className="uk-form-label required" htmlFor="address1">Address Line 1</label>
                    <div className="uk-form-controls">
                        <input
                            id="address1"
                            className="uk-input uk-form-small"
                            type="text"
                            value={client.contactDetail.address1}
                            name={"address1"}
                            onChange={(e) => onChange("address1", e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-1">
                    <label className="uk-form-label required" htmlFor="address1">Postal Address</label>
                    <div className="uk-form-controls">
                        <input
                            id="postalAddress"
                            className="uk-input uk-form-small"
                            type="text"
                            value={client.contactDetail.postalAddress}
                            name={"postalAddress"}
                            onChange={(e) => onChange("postalAddress", e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-1">
                    <label className="uk-form-label required" htmlFor="emailAddress">Email Address</label>
                    <div className="uk-form-controls">
                        <input
                            id="emailAddress"
                            className="uk-input uk-form-small"
                            type="email"
                            value={client.contactDetail.emailAddress}
                            name={"emailAddress"}
                            onChange={(e) => onChange("emailAddress", e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-1 uk-text-right">
                    <button
                        className="btn btn-warning"
                        type="button"
                        onClick={onBackToClientInformation}
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