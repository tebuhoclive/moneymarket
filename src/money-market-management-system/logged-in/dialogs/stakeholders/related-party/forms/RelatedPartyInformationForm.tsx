import { observer } from "mobx-react-lite";
import { FormEvent } from "react";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { IRelatedParty } from "../../../../../../shared/models/stakeholders/RelatedPartyModel";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { CountryList } from "../../../../../../shared/functions/FormHelpers";
import { toTitleCase } from "../../../../../../shared/functions/Directives";

interface IRelatedPartyProps {
    relatedParty: IRelatedParty;
    setRelatedParty: React.Dispatch<React.SetStateAction<IRelatedParty>>;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    loading: boolean;
    onCancel: () => void;
}

export const RelatedPartyInformationForm = observer((props: IRelatedPartyProps) => {
    const { relatedParty, setRelatedParty, onSubmit, loading } = props;

    const countries = CountryList;

    const countryOptions = countries.map(country => ({
        label: toTitleCase(country),
        value: toTitleCase(country)
    }));

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmit}>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="firstName">First Name</label>
                    <div className="uk-form-controls">
                        <input
                            id="firstName"
                            className="uk-input uk-form-small"
                            type="text"
                            value={relatedParty.firstName}
                            name={"firstName"}
                            onChange={(e) => setRelatedParty({
                                ...relatedParty, firstName: e.target.value
                            })}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="surname">Surname</label>
                    <div className="uk-form-controls">
                        <input
                            id="surname"
                            className="uk-input uk-form-small"
                            type="text"
                            value={relatedParty.surname}
                            name={"surname"}
                            onChange={(e) => setRelatedParty({
                                ...relatedParty, surname: e.target.value
                            })}
                            required
                        />
                    </div>
                </div>
                <div className={`${relatedParty.idType === "ID" ? "uk-width-1-3" : "uk-width-1-4"}`}>
                    <label className="uk-form-label required" htmlFor="idType">Identification Type</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={relatedParty.idType}
                            id="idType"
                            onChange={(e) => setRelatedParty({ ...relatedParty, idType: e.target.value })}
                            required
                        >
                            <option value="">Select Identification Type</option>
                            <option selected value="ID">ID</option>
                            <option value="Passport">Passport</option>
                        </select>
                    </div>
                </div>
                {
                    relatedParty.idType !== "" &&
                    <>
                        <div className={`${relatedParty.idType === "ID" ? "uk-width-1-3" : "uk-width-1-4"}`}>
                            <label className="uk-form-label required" htmlFor="idNumber">{relatedParty.idType !== "" ? `${relatedParty.idType} number` : 'Please select Identification Type'}</label>
                            <div className="uk-form-controls">
                                {
                                    relatedParty.idType === "ID" &&
                                    <input
                                        className="uk-input uk-form-small"
                                        id="idNumber"
                                        placeholder="ID number"
                                        type="text"
                                        value={relatedParty.idNumber}
                                        pattern="^\d+$"
                                        min={11}
                                        max={11}
                                        onChange={(e) => setRelatedParty({ ...relatedParty, idNumber: e.target.value })}
                                        required
                                    />
                                }
                                {
                                    relatedParty.idType === "Passport" &&
                                    <input
                                        className="uk-input uk-form-small"
                                        id="passport"
                                        placeholder="Passport"
                                        type="text"
                                        value={relatedParty.idNumber}
                                        onChange={(e) => setRelatedParty({ ...relatedParty, idNumber: e.target.value })}
                                        required
                                    />
                                }
                            </div>
                        </div>
                        <div className={`${relatedParty.idType === "ID" ? "uk-width-1-3" : "uk-width-1-4"}`}>
                            <label className="uk-form-label required" htmlFor="idCountry">{relatedParty.idType} Issue Country</label>
                            <div className="uk-form-controls">
                                <SingleSelect
                                    options={countryOptions}
                                    name="idCountry"
                                    value={relatedParty.idCountry}
                                    onChange={(value) => setRelatedParty({ ...relatedParty, idCountry: value })}
                                    placeholder="Namibia"
                                    required
                                />
                            </div>
                        </div>
                        {relatedParty.idType === "Passport" &&
                            <div className="uk-width-1-4">
                                <label className="uk-form-label required" htmlFor="passportExpiry">Passport Expiry Date</label>
                                <div className="uk-form-controls">
                                    <input
                                        className="uk-input uk-form-small"
                                        id="passportExpiry"
                                        type="date"
                                        value={relatedParty.idExpiryDate}
                                        onChange={(e) => setRelatedParty({ ...relatedParty, idExpiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        }
                    </>
                }
                {
                    relatedParty.idType === "" &&
                    <div className="uk-width-2-3"></div>
                }
                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="emailAddress">Email Address</label>
                    <div className="uk-form-controls">
                        <input
                            id="emailAddress"
                            className="uk-input uk-form-small"
                            type="text"
                            value={relatedParty.emailAddress}
                            name={"emailAddress"}
                            onChange={(e) => setRelatedParty({
                                ...relatedParty, emailAddress: e.target.value
                            })}

                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="relationship">Relationship</label>
                    <div className="uk-form-controls">
                        <input
                            id="relationship"
                            className="uk-input uk-form-small"
                            type="text"
                            value={relatedParty.relationship}
                            name={"relationship"}
                            onChange={(e) => setRelatedParty({
                                ...relatedParty, relationship: e.target.value
                            })}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="riskRating">Risk Rating</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            id="riskRating"
                            value={relatedParty.riskRating}
                            name={"riskRating"}
                            onChange={(e) => setRelatedParty({
                                ...relatedParty, riskRating: e.target.value
                            })}
                            required
                        >
                            <option>Select</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
                <div className="uk-width-1-1 uk-text-right">
                    <button className="btn btn-danger" type="button">
                        Cancel
                    </button>
                    <button className="btn btn-primary" type="submit" >
                        Create
                    </button>

                </div>
            </form>
        </ErrorBoundary >
    );
});