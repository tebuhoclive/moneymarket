import { FormEvent, useState } from "react";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";

import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import { toTitleCase } from "../../../../../../shared/functions/Directives";
import { CountryList, NationalityList } from "../../../../../../shared/functions/FormHelpers";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { useAppContext } from "../../../../../../shared/functions/Context";

interface IClientInformationFormProps {
    client: INaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onSubmitClientInformation: (e: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    loading: boolean;
}

export const ClientInformationForm = (props: IClientInformationFormProps) => {
    const { client, setClient, onSubmitClientInformation, onCancel, loading } = props;

    const {store } = useAppContext();

    const [isValidCellphoneNumber, setIsValidCellphoneNumber] = useState(false);
    const [isValidCellphoneNumberSecondary, setIsValidCellphoneNumberSecondary] = useState(false);

    const countries = CountryList;

    const countryOptions = countries.map(country => ({
        label: toTitleCase(country),
        value: toTitleCase(country)
    }));

    const nationalities = NationalityList;

    const nationalityOptions = nationalities.map(nationality => ({
        label: toTitleCase(nationality),
        value: toTitleCase(nationality)
    }));

    const [noTin, setNoTin] = useState(false);

    const onChangeTax = (name: | "tin" | "tinCountryOfIssue" | "reasonForNoTIN", value: string) => {
        const taxDetail = { ...client.taxDetail };
        if (name === "tin") {
            taxDetail.tin = value;
            taxDetail.reasonForNoTIN = "";
        }
        if (name === "tinCountryOfIssue") {
            taxDetail.tinCountryOfIssue = value;
            taxDetail.reasonForNoTIN = "";
        }
        if (name === "reasonForNoTIN") {
            taxDetail.reasonForNoTIN = value;
            taxDetail.tin = "";
            taxDetail.tinCountryOfIssue = "";
        }
        setClient({ ...client, taxDetail: taxDetail });
    };

    const onChangeContact = (name: | "address1" | "postalAddress" | "emailAddress" | "emailAddressSecondary" | "cellphoneNumber" | "cellphoneNumberSecondary", value: string) => {
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


        if (name === "cellphoneNumber") {
            const inputValue = value;
            const regexPattern = /^\+264\d{9}$/;
            setIsValidCellphoneNumber(regexPattern.test(inputValue));
            contact.cellphoneNumber = value;
        }

        if (name === "cellphoneNumberSecondary") {
            const inputValue = value;
            const regexPattern = /^\+264\d{9}$/;
            setIsValidCellphoneNumberSecondary(regexPattern.test(inputValue));
            contact.cellphoneNumberSecondary = value;
        }
        setClient({ ...client, contactDetail: contact });
    };

    const [provideOtherEmploymentStatus, setOtherProvideEmploymentStatus] = useState(false);

    const handleOtherEmploymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        // Clear the input field value when the user switches from 'Other' to another option
        if (value === "Other") {
            setClient({
                ...client,
                employmentStatus: '',
            });
            setOtherProvideEmploymentStatus(true);
        } else {
            setClient({
                ...client,
                employmentStatus: value,
            });
            setOtherProvideEmploymentStatus(false);
        }
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid uk-grid-small uk-padding" onSubmit={onSubmitClientInformation} data-uk-grid>
                <div className="uk-width-1-1">
                    <Toolbar leftControls={
                        <h4 className="main-title-sm">Client Information</h4>
                    }
                    />
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="clientTitle">Title</label>
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" value={client.clientTitle} id="clientTitle"
                            onChange={(e) => setClient({ ...client, clientTitle: e.target.value })}
                            required
                        >
                            <option value={""} disabled>Select...</option>
                            <option value="Mr.">Mr</option>
                            <option value="Ms.">Ms</option>
                            <option value="Mrs.">Mrs</option>
                            <option value="Dr.">Dr</option>
                        </select>
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="client-name">Full Name(s)</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="client-name"
                            placeholder="Client Name"
                            type="text"
                            value={client.clientName}
                            onChange={(e) => setClient({ ...client, clientName: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="dateOfBirth">Date Of Birth</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="dateOfBirth"
                            type="date"
                            value={client.dateOfBirth}
                            onChange={(e) => setClient({ ...client, dateOfBirth: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="client-surname">Surname</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="client-surname"
                            placeholder="Client Surname"
                            type="text"
                            value={client.clientSurname}
                            onChange={(e) => setClient({ ...client, clientSurname: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className={`${client.idType === "ID" ? "uk-width-1-3" : "uk-width-1-4"}`}>
                    <label className="uk-form-label required" htmlFor="idType">Identification Type</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={client.idType}
                            id="idType"
                            onChange={(e) => setClient({ ...client, idType: e.target.value })}
                            required
                        >
                            <option value="">Select Identification Type</option>
                            <option selected value="ID">ID</option>
                            <option selected value="Birth Certificate">Birth Certificate</option>
                            <option value="Passport">Passport</option>
                        </select>
                    </div>
                </div>
                {
                    client.idType !== "" &&
                    <>
                        <div className={`${client.idType === "ID" ? "uk-width-1-3" : "uk-width-1-4"}`}>
                            <label className="uk-form-label required" htmlFor="idNumber">{client.idType !== "" ? `${client.idType} number` : 'Please select Identification Type'}</label>
                            <div className="uk-form-controls">
                                {
                                    client.idType === "ID" &&
                                    <input
                                        className="uk-input uk-form-small"
                                        id="idNumber"
                                        placeholder="ID number"
                                        type="text"
                                        value={client.idNumber}
                                        pattern="^\d+$"
                                        min={11}
                                        max={11}
                                        onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                        required
                                    />
                                }
                                {
                                    client.idType === "Birth Certificate" &&
                                    <input
                                        className="uk-input uk-form-small"
                                        id="birthCertificate"
                                        placeholder="Birth Certificate"
                                        type="text"
                                        value={client.idNumber}
                                        onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                        required
                                    />
                                }
                                {
                                    client.idType === "Passport" &&
                                    <input
                                        className="uk-input uk-form-small"
                                        id="passport"
                                        placeholder="Passport"
                                        type="text"
                                        value={client.idNumber}
                                        onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                        required
                                    />
                                }
                            </div>
                        </div>
                        <div className={`${client.idType === "ID" ? "uk-width-1-3" : "uk-width-1-4"}`}>
                            <label className="uk-form-label required" htmlFor="idCountry">{client.idType} Issue Country</label>
                            <div className="uk-form-controls">
                                <SingleSelect
                                    options={countryOptions}
                                    name="idCountry"
                                    value={client.idCountry}
                                    onChange={(value) => setClient({ ...client, idCountry: value })}
                                    placeholder="Namibia"
                                    required
                                />
                            </div>
                        </div>
                        {client.idType === "Passport" &&
                            <div className="uk-width-1-4">
                                <label className="uk-form-label required" htmlFor="passportExpiry">Passport Expiry Date</label>
                                <div className="uk-form-controls">
                                    <input
                                        className="uk-input uk-form-small"
                                        id="passportExpiry"
                                        type="date"
                                        value={client.idExpiry}
                                        onChange={(e) => setClient({ ...client, idExpiry: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        }
                    </>
                }
                {
                    client.idType === "" &&
                    <div className="uk-width-2-3"></div>
                }

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="isMinor">Is the Client a Minor?</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={client.isMinor}
                            id="isMinor"
                            onChange={(e) => setClient({ ...client, isMinor: e.target.value })}
                            required
                        >
                            <option>Is the client a minor?</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="gender">Gender</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={client.gender}
                            id="gender"
                            onChange={(e) => setClient({ ...client, gender: e.target.value })}
                            required
                        >
                            <option>Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="Nationality">Nationality</label>
                    <div className="uk-form-controls">
                        <SingleSelect
                            options={nationalityOptions}
                            name="nationality"
                            value={client.countryNationality}
                            onChange={(value) => setClient({ ...client, countryNationality: value })}
                            placeholder="Namibian"
                            required
                        />
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="Nationality">Country of Residence</label>
                    <div className="uk-form-controls">
                        <SingleSelect
                            options={countryOptions}
                            name="nationality"
                            value={client.countryNationality}
                            onChange={(value) => setClient({ ...client, countryNationality: value })}
                            placeholder="Namibian"
                            required
                        />
                    </div>
                </div>

                <div className="uk-width-1-1">
                    <div className="uk-form-controls">
                        <label className="uk-form-label" htmlFor="noTin">
                            <input
                                className="uk-checkbox"
                                id="noTin"
                                type="checkbox"
                                checked={noTin}
                                onChange={(e) => setNoTin(e.target.checked)}
                            />  This client has no Tax Identification Number
                        </label>
                    </div>
                    {
                        noTin &&
                        <>
                            <label className="uk-form-label required" htmlFor="reasonForNoTIN">Reason For No TIN</label>
                            <div className="uk-form-controls">
                                <input
                                    id="reasonForNoTIN"
                                    className="uk-input uk-form-small"
                                    type="text"
                                    value={client.taxDetail.reasonForNoTIN}
                                    name={"reasonForNoTIN"}
                                    onChange={(e) => onChangeTax("reasonForNoTIN", e.target.value)}
                                />
                            </div>
                        </>
                    }
                </div>
                {
                    !noTin &&
                    <>
                        <div className="uk-width-1-2">
                            <label className="uk-form-label required" htmlFor="tin">TIN</label>
                            <div className="uk-form-controls">
                                <input
                                    id="tin"
                                    className="uk-input uk-form-small"
                                    type="text"
                                    value={client.taxDetail.tin}
                                    name={"tin"}
                                    onChange={(e) => onChangeTax("tin", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="uk-width-1-2">
                            <label className="uk-form-label required" htmlFor="tinCountryOfIssue">TIN Country Of Issue</label>
                            <div className="uk-form-controls">
                                <input
                                    id="tinCountryOfIssue"
                                    className="uk-input uk-form-small"
                                    type="text"
                                    value={client.taxDetail.tinCountryOfIssue}
                                    name={"tinCountryOfIssue"}
                                    onChange={(e) => onChangeTax("tinCountryOfIssue", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </>
                }
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="address1">Residential</label>
                    <div className="uk-form-controls">
                        <input
                            id="address1"
                            className="uk-input uk-form-small"
                            type="text"
                            value={client.contactDetail.address1}
                            name={"address1"}
                            onChange={(e) => onChangeContact("address1", e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="address1">Postal Address</label>
                    <div className="uk-form-controls">
                        <input
                            id="postalAddress"
                            className="uk-input uk-form-small"
                            type="text"
                            value={client.contactDetail.postalAddress}
                            name={"postalAddress"}
                            onChange={(e) => onChangeContact("postalAddress", e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="emailAddress">Email Address 1</label>
                    <div className="uk-form-controls">
                        <input
                            id="emailAddress"
                            className="uk-input uk-form-small"
                            type="email"
                            value={client.contactDetail.emailAddress}
                            name={"emailAddress"}
                            onChange={(e) => onChangeContact("emailAddress", e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="emailAddressSecondary">Email Address 2</label>
                    <div className="uk-form-controls">
                        <input
                            id="emailAddressSecondary"
                            className="uk-input uk-form-small"
                            type="email"
                            value={client.contactDetail.emailAddressSecondary}
                            name={"emailAddressSecondary"}
                            onChange={(e) => onChangeContact("emailAddressSecondary", e.target.value)}
                        />
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="cellphoneNumber">Cellphone Number</label>
                    <input
                        id="cellphoneNumber"
                        className="uk-input uk-form-small"
                        type="text"
                        placeholder="+264815534382"
                        value={client.contactDetail.cellphoneNumber}
                        name={"cellphoneNumber"}
                        onChange={(e) => onChangeContact("cellphoneNumber", e.target.value)}
                        required

                        minLength={13}
                        maxLength={13}
                    />
                    {
                        isValidCellphoneNumber &&
                        <p className="valid uk-text-success">Valid cellphone number format</p>
                    }
                    {
                        !isValidCellphoneNumber && client.contactDetail.cellphoneNumber.length > 10 &&
                        <p className="invalid uk-text-danger">Cellphone number format is not valid, the number should start with +264 and should be 12 characters long excluding (+)</p>
                    }
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="cellphoneNumber">Cellphone Number (secondary)</label>
                    <input
                        id="cellphoneNumberSecondary"
                        className={`uk-input uk-form-small`}
                        type="text"
                        placeholder="+264815534382"
                        value={client.contactDetail.cellphoneNumberSecondary}
                        name={"cellphoneNumberSecondary"}
                        onChange={(e) => onChangeContact("cellphoneNumberSecondary", e.target.value)}
                        minLength={13}
                        maxLength={13}
                    />
                    {
                        isValidCellphoneNumberSecondary &&
                        <p className="valid uk-text-success">Valid cellphone number format</p>
                    }
                    {
                        !isValidCellphoneNumberSecondary && client.contactDetail.cellphoneNumberSecondary.length > 10 &&
                        <p className="invalid uk-text-danger">Cellphone number format is not valid, the number should start with +264 and should be 12 characters long excluding (+)</p>
                    }
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="maritalStatus">Marital Status</label>
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" value={client.maritalStatus} id="maritalStatus"
                            onChange={(e) => setClient({ ...client, maritalStatus: e.target.value })}
                            required
                        >
                            <option value={""} disabled>Select...</option>
                            <option value="Single">Single</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                            <option value="ANC with Accrual">ANC with AccrualANC with Accrual</option>
                            <option value="In Community">In Community</option>
                            <option value="Out of Community">Out of Community</option>
                        </select>
                    </div>
                </div>


                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="employmentStatus">Employment Status</label>
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" value={client.employmentStatus}
                            id="employmentStatus"
                            onChange={handleOtherEmploymentStatusChange}
                            required={!provideOtherEmploymentStatus}
                        >
                            <option value="">Select Employment Status</option>
                            <option value="Employed">Employed</option>
                            <option value="Self Employed">Self Employed</option>
                            <option value="Unemployed">Unemployed</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {provideOtherEmploymentStatus && (
                        <div className="uk-form-controls">
                            <input type="text" className="uk-input uk-form-small uk-margin-small-top" placeholder="Employment Status" value={client.employmentStatus}
                                onChange={(e) => setClient({
                                    ...client,
                                    employmentStatus: e.target.value,
                                })
                                }
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required uk-width-expand" htmlFor="employer">Employer</label>
                    <input
                        id="employer"
                        className="uk-input uk-form-small"
                        type="text"
                        placeholder="Employer"
                        value={client.employer}
                        onChange={(e) => setClient({ ...client, employer: e.target.value })}
                    />
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="clientClassification">Client Classification</label>
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" name="clientClassification" id="clientClassification"
                            value={client.clientClassification}
                            onChange={(e) => setClient({ ...client, clientClassification: e.target.value })}
                            required
                        >
                            <option>Select client classification</option>
                            <option value="Politically Exposed Person (PEP)"> Politically Exposed Person (PEP)</option>
                            <option value="Not Exposed (NE)">Not Exposed (NE)</option>
                            <option value="Domestic/ Political Influential Person">Domestic/ Political Influential Person</option>
                        </select>
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="riskRating">Risk Rating</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={client.riskRating}
                            id="riskRating"
                            onChange={(e) => setClient({ ...client, riskRating: e.target.value })}
                            required
                        >
                            <option>Select Client Risk Rating</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div className="uk-width-1-1 uk-text-right">
                    <button
                        className="btn btn-danger"
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        Update {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
};
