import { observer } from "mobx-react-lite";

import { FormEvent, useState } from "react";
import React from "react";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import axios from "axios";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { NamibiaRegionList, CountryList } from "../../../../../../shared/functions/FormHelpers";
import { IDocFoxNaturalPerson } from "../../../../../../shared/models/clients/DocFoxNaturalPersonModel";

interface IContactDetailsFormProps {
    client: IDocFoxNaturalPerson;
    clientDocfoxData: IDocFoxNaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<IDocFoxNaturalPerson>>;
    onSubmitClientFinancialProfile: (e: FormEvent<HTMLFormElement>) => void;
    onBackToClientInformation: () => void;
}

export const ContactDetailsForm = observer((props: IContactDetailsFormProps) => {
    const { client, clientDocfoxData, setClient, onSubmitClientFinancialProfile, onBackToClientInformation } = props;

    const [userInput, setUserInput] = useState('');
    const [isValid, setIsValid] = useState(false);

    const [userInputSecondary, setUserInputSecondary] = useState('');
    const [isValidSecondary, setIsValidSecondary] = useState(false);

    const [country, setCountry] = useState<string>('');


    const namibiaRegions = NamibiaRegionList;

    const regionOptions = namibiaRegions.map(region => ({
        label: region,
        value: region
    }));

    const countryList = CountryList;

    const countryOptions = countryList.map(country => ({
        label: country,
        value: country
    }));

    const fetchCountryByCode = async (code: string) => {
        try {
            const response = await axios.get(
                `https://restcountries.com/v3.1/alpha/${code}`
            );
            const country = response.data[0]?.name.common || 'Not found';
            setCountry(country);

        } catch (error) {
            console.error('Error fetching country:', error);
            setCountry('');
        }
    };

    // Only fetch if countryCode is not empty
    if (clientDocfoxData.idCountry.trim() !== '') {
        fetchCountryByCode(clientDocfoxData.contactDetail.country);
    } else {
        // Reset country if countryCode is empty
        setCountry('');
    }


    const onChange = (name: | "address1" | "address2" | "suburb" | "city" | "region" |
        "country" | "phoneNumber" | "cellphoneNumber" | "cellphoneNumberSecondary" | "emailAddressSecondary" | "fax" | "emailAddress", value: string) => {
        const contact = { ...client.contactDetail };

        if (name === "address1") {
            contact.address1 = value ? client.contactDetail.address1 : "";
        }

        if (name === "address2") {
            contact.address2 = value ? client.contactDetail.address1 : "";
        }

        if (name === "suburb") {
            contact.suburb = value ? client.contactDetail.suburb : "";
        }

        if (name === "city") {
            contact.city = value ? client.contactDetail.city : "";
        }

        if (name === "region") {
            contact.state = value ? client.contactDetail.state : "";
        }

        if (name === "country") {
            contact.country = value ? client.contactDetail.country : "";
        }

        if (name === "phoneNumber") {
            contact.phoneNumber = value ? client.contactDetail.phoneNumber : "";
        }

        if (name === "cellphoneNumber") {
            const inputValue = value;
            setUserInput(inputValue);
            // Define the regex pattern
            const regexPattern = /^\+264\d{9}$/;
            // Test if the input matches the pattern
            setIsValid(regexPattern.test(inputValue));
            contact.cellphoneNumber = value;
        }

        if (name === "cellphoneNumberSecondary") {
            const inputValue = value;
            setUserInputSecondary(inputValue);
            // Define the regex pattern
            const regexPattern = /^\+264\d{9}$/;
            // Test if the input matches the pattern
            setIsValidSecondary(regexPattern.test(inputValue));


            contact.cellphoneNumberSecondary = value;

        }

        if (name === "fax") {
            contact.fax = value ? client.contactDetail.fax : "";
        }

        if (name === "emailAddress") {
            contact.emailAddress = value ? client.contactDetail.emailAddress : "";
        }

        if (name === "emailAddressSecondary") {
            contact.emailAddressSecondary = value ? client.contactDetail.emailAddressSecondary : "";
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

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="address1">Address Line 1</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.address1 && <input
                            id="address1"
                            className="uk-input uk-form-small"
                            type="text"
                            value={clientDocfoxData.contactDetail.address1}
                            name={"address1"}
                            onChange={(e) => onChange("address1", e.target.value)}
                            required

                        />}
                        {!clientDocfoxData.contactDetail.address1 && <input
                            id="address1"
                            className="uk-input uk-form-small"
                            type="text"
                            name={"address1"}
                            onChange={(e) => onChange("address1", e.target.value)}
                            required
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="address2">Address Line 2</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.address2 && <input
                            id="address2"
                            className="uk-input uk-form-small"
                            type="text"
                            value={clientDocfoxData.contactDetail.address2}
                            name={"address2"}
                            onChange={(e) => onChange("address2", e.target.value)}

                        />}
                        {!clientDocfoxData.contactDetail.address2 && <input
                            id="address2"
                            className="uk-input uk-form-small"
                            type="text"
                            name={"address2"}
                            onChange={(e) => onChange("address2", e.target.value)}
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="suburb">Suburb</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.suburb && <input
                            id="suburb"
                            className="uk-input uk-form-small"
                            type="text"
                            value={clientDocfoxData.contactDetail.suburb}
                            name={"suburb"}
                            onChange={(e) => onChange("suburb", e.target.value)}
                            required

                        />}
                        {!clientDocfoxData.contactDetail.suburb && <input
                            id="suburb"
                            className="uk-input uk-form-small"
                            type="text"
                            name={"suburb"}
                            onChange={(e) => onChange("suburb", e.target.value)}
                            required
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="city">City</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.city && <input
                            id="city"
                            className="uk-input uk-form-small"
                            type="text"
                            value={clientDocfoxData.contactDetail.city}
                            name={"city"}
                            onChange={(e) => onChange("city", e.target.value)}
                            required

                        />}
                        {!clientDocfoxData.contactDetail.city && <input
                            id="city"
                            className="uk-input uk-form-small"
                            type="text"
                            name={"city"}
                            onChange={(e) => onChange("city", e.target.value)}
                            required
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="region">Region</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.state && <input
                            id="region"
                            className="uk-input uk-form-small"
                            type="text"
                            value={clientDocfoxData.contactDetail.state}
                            name={"region"}
                            onChange={(e) => onChange("region", e.target.value)}
                            required

                        />}
                        {!clientDocfoxData.contactDetail.state && <SingleSelect
                            options={regionOptions}
                            name="region"
                            value={client.contactDetail.state}
                            onChange={(value) => onChange("region", value)}
                            placeholder="Khomas"
                            required
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="country">Country</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.state && <input
                            id="country"
                            className="uk-input uk-form-small"
                            type="text"
                            value={country}
                            name={"country"}
                            onChange={(e) => onChange("country", e.target.value)}
                            required
                        />}
                        {!clientDocfoxData.contactDetail.country && <SingleSelect
                            options={countryOptions}
                            name="country"
                            onChange={(value) => onChange("country", value)}
                            placeholder="Country"
                            required 
                            value={country}                        />}
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="cellphoneNumber">Cellphone Number</label>
                    {clientDocfoxData.contactDetail.cellphoneNumber &&
                        <input
                            id="cellphoneNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            placeholder="+264815534382"
                            value={`+${clientDocfoxData.contactDetail.cellphoneNumber}`}
                            name={"cellphoneNumber"}
                            onChange={(e) => onChange("cellphoneNumber", e.target.value)}
                            required

                            minLength={13}
                            maxLength={13}
                        />
                    }
                    {!clientDocfoxData.contactDetail.cellphoneNumber &&
                        <input
                            id="cellphoneNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            placeholder="+264815534382"
                            value={client.contactDetail.cellphoneNumber}
                            name={"cellphoneNumber"}
                            onChange={(e) => onChange("cellphoneNumber", e.target.value)}
                            required
                            // pattern="/^\+264\d{9}$/"
                            minLength={13}
                            maxLength={13}
                        />
                    }
                    {
                        isValid &&
                        <p className="valid uk-text-success">Valid cellphone number format</p>
                    }
                    {
                        !isValid && client.contactDetail.cellphoneNumber.length > 10 &&
                        <p className="invalid uk-text-danger">Cellphone number format is not valid, the number should start with +264 and should be 12 characters long excluding (+)</p>
                    }

                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="cellphoneNumberSecondary">Cellphone Number (secondary)</label>
                    {clientDocfoxData.contactDetail.cellphoneNumberSecondary &&
                        <input
                            id="cellphoneNumberSecondary"
                            className="uk-input uk-form-small"
                            type="text"
                            placeholder="+264815534382"
                            value={clientDocfoxData.contactDetail.cellphoneNumberSecondary}
                            name={"cellphoneNumberSecondary"}
                            onChange={(e) => onChange("cellphoneNumberSecondary", e.target.value)}
                            minLength={13}
                            maxLength={13}
                        />
                    }
                    {!clientDocfoxData.contactDetail.cellphoneNumberSecondary &&
                        <input
                            id="cellphoneNumberSecondary"
                            className="uk-input uk-form-small"
                            type="text"
                            placeholder="+264815534382"
                            value={`${client.contactDetail.cellphoneNumberSecondary}`}
                            name={"cellphoneNumberSecondary"}
                            onChange={(e) => onChange("cellphoneNumberSecondary", e.target.value)}
                            minLength={13}
                            maxLength={13}
                        />
                    }
                    {
                        isValidSecondary &&
                        <p className="valid uk-text-success">Valid cellphone number format</p>
                    }
                    {
                        !isValidSecondary && client.contactDetail.cellphoneNumberSecondary.length > 10 &&
                        <p className="invalid uk-text-danger">Cellphone number format is not valid, the number should start with +264 and should be 12 characters long excluding (+)</p>
                    }
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="emailAddress">Email Address</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.emailAddress && <input
                            id="emailAddress"
                            className="uk-input uk-form-small"
                            type="email"
                            value={clientDocfoxData.contactDetail.emailAddress}
                            name={"emailAddress"}
                            onChange={(e) => onChange("emailAddress", e.target.value)}
                            required

                        />}
                        {!clientDocfoxData.contactDetail.emailAddress && <input
                            id="emailAddress"
                            className="uk-input uk-form-small"
                            type="email"
                            name={"emailAddress"}
                            onChange={(e) => onChange("emailAddress", e.target.value)}
                            required
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="emailAddressSecondary">Email Address (secondary)</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.emailAddressSecondary && <input
                            id="emailAddressSecondary"
                            className="uk-input uk-form-small"
                            type="email"
                            value={client.contactDetail.emailAddressSecondary}
                            name={"emailAddressSecondary"}
                            onChange={(e) => onChange("emailAddressSecondary", e.target.value)}

                        />}
                        {!clientDocfoxData.contactDetail.emailAddressSecondary && <input
                            id="emailAddressSecondary"
                            className="uk-input uk-form-small"
                            type="email"
                            name={"emailAddressSecondary"}
                            onChange={(e) => onChange("emailAddressSecondary", e.target.value)}
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="phoneNumber">Work Phone Number</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.phoneNumber && <input
                            id="phoneNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            value={client.contactDetail.phoneNumber}
                            name={"phoneNumber"}
                            onChange={(e) => onChange("phoneNumber", e.target.value)}

                        />}
                        {!clientDocfoxData.contactDetail.phoneNumber && <input
                            id="phoneNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            name={"phoneNumber"}
                            onChange={(e) => onChange("phoneNumber", e.target.value)}
                        />}
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="fax">Fax</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.contactDetail.fax && <input
                            id="fax"
                            className="uk-input uk-form-small"
                            type="text"
                            value={client.contactDetail.fax}
                            name={"fax"}
                            onChange={(e) => onChange("fax", e.target.value)}

                        />}
                        {!clientDocfoxData.contactDetail.fax && <input
                            id="fax"
                            className="uk-input uk-form-small"
                            type="text"
                            name={"fax"}
                            onChange={(e) => onChange("fax", e.target.value)}
                        />}
                    </div>
                </div>
                <div className="uk-width-1-1 uk-text-right">
                    <button
                        className="btn-text uk-margin-right"
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