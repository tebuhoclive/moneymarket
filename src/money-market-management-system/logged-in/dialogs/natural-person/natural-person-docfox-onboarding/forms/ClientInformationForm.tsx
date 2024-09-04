import React, { FormEvent, useEffect, useState } from "react";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import axios from "axios";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { toTitleCase } from "../../../../../../shared/functions/Directives";
import { NationalityList, CountryList } from "../../../../../../shared/functions/FormHelpers";
import { IDocFoxNaturalPerson } from "../../../../../../shared/models/clients/DocFoxNaturalPersonModel";

interface IClientInformationFormProps {
    client: IDocFoxNaturalPerson;
    clientDocfoxData: IDocFoxNaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<IDocFoxNaturalPerson>>;
    onSubmitClientInformation: (e: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export const ClientInformationForm = (props: IClientInformationFormProps) => {
    const { client, setClient, clientDocfoxData, onSubmitClientInformation, onCancel } = props;

    const [nationality, setNationality] = useState<string>('');
    const [country, setCountry] = useState<string>('');

    const nationalities = NationalityList;
    const countries = CountryList;

    const nationalityOptions = nationalities.map(nationality => ({
        label: toTitleCase(nationality),
        value: toTitleCase(nationality)
    }));

    const countryOptions = countries.map(country => ({
        label: toTitleCase(country),
        value: toTitleCase(country)
    }));

    useEffect(() => {
        const fetchNationalityByCode = async (code: string) => {
            try {
                const response = await axios.get(
                    `https://restcountries.com/v3.1/alpha/${code}?fields=demonyms`
                );
                const nationality = response.data.demonyms.eng.f || 'Not found';
                setNationality(nationality);
                //console.log(response.data.demonyms.eng.f);

            } catch (error) {
                console.error('Error fetching nationality:', error);
                setNationality('');
            }
        };

        // Only fetch if countryCode is not empty
        if (clientDocfoxData.countryNationality.trim() !== '') {
            fetchNationalityByCode(clientDocfoxData.countryNationality);
        } else {
            // Reset nationality if countryCode is empty
            setNationality('');
        }

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
            fetchCountryByCode(clientDocfoxData.idCountry);
        } else {
            // Reset country if countryCode is empty
            setCountry('');
        }

    }, [clientDocfoxData.countryNationality, clientDocfoxData.idCountry]);

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid onSubmit={onSubmitClientInformation}>
                {/** Client Type*/}
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Personal Details"}
                    />
                    <hr className="uk-width-1-1" />
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="entityType">Client Type</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.entityType &&
                            < input
                                className="uk-input uk-form-small"
                                id="entityType"
                                placeholder="Entity Type"
                                type="text"
                                value={clientDocfoxData.entityType}
                                onChange={(e) => setClient({ ...client, entityType: e.target.value })}
                                required
                            />
                        }
                        {
                            !clientDocfoxData.entityType &&
                            <select
                                className="uk-select uk-form-small"
                                value={client.entityType}
                                id="entityType"
                                onChange={(e) => setClient({ ...client, entityType: e.target.value })}
                                required
                            >
                                <option value={""} >Select...</option>
                                <option value="Investor">Investor</option>
                                <option value="Related-Party">Related Party</option>
                            </select>
                        }
                    </div>
                </div>

                {/** Client Title */}
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="clientTitle">Client Title</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={client.clientTitle}
                            id="clientTitle"
                            onChange={(e) => setClient({ ...client, clientTitle: e.target.value })}
                            required
                        >
                            <option value={""} >Select...</option>
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Dr">Dr</option>
                        </select>
                    </div>
                </div>

                {/** Client First Name */}
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="client-name">Client Name</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.clientName &&
                            <input
                                className="uk-input uk-form-small"
                                id="client-name"
                                placeholder="Client Name"
                                type="text"
                                value={clientDocfoxData.clientName}
                                onChange={(e) => setClient({ ...client, clientName: e.target.value })}
                                required
                            />
                        }
                        {/* {!clientDocfoxData.clientName &&
                            <input
                                className="uk-input uk-form-small"
                                id="client-name"
                                placeholder="Client Name"
                                type="text"
                                value={client.clientName}
                                onChange={(e) => setClient({ ...client, clientName: e.target.value })}
                                required
                            />
                        } */}
                    </div>
                </div>

                {/** Client Surname */}
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="client-surname">Client Surname</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.clientSurname && <input
                            className="uk-input uk-form-small"
                            id="client-surname"
                            placeholder="Client Surname"
                            type="text"
                            value={clientDocfoxData.clientSurname}
                            onChange={(e) => setClient({ ...client, clientSurname: e.target.value })}
                            required

                        />}
                        {/* {!clientDocfoxData.clientSurname && <input
                            className="uk-input uk-form-small"
                            id="client-surname"
                            placeholder="Client Surname"
                            type="text"
                            value={client.clientSurname}
                            onChange={(e) => setClient({ ...client, clientSurname: e.target.value })}
                            required
                        />} */}
                    </div>
                </div>

                {/** Client DOB */}
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="dateOfBirth">Date Of Birth</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.dateOfBirth && <input
                            className="uk-input uk-form-small"
                            id="dateOfBirth"
                            type="date"
                            value={clientDocfoxData.dateOfBirth}
                            onChange={(e) => setClient({ ...client, dateOfBirth: e.target.value })}
                            required

                        />}
                        {/* {!clientDocfoxData.dateOfBirth && <input
                            className="uk-input uk-form-small"
                            id="dateOfBirth"
                            type="date"
                            value={client.dateOfBirth}
                            onChange={(e) => setClient({ ...client, dateOfBirth: e.target.value })}
                            required
                        />} */}
                    </div>
                </div>

                {/** Nationality  */}
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="Nationality">Nationality</label>
                    <div className="uk-form-controls">
                        {clientDocfoxData.countryNationality && <input
                            className="uk-input uk-form-small"
                            id="nationality"
                            type="text"
                            value={nationality}
                            onChange={(e) => setClient({ ...client, countryNationality: e.target.value })}
                            required

                        />}
                        {!clientDocfoxData.countryNationality && <SingleSelect
                            options={nationalityOptions}
                            name="nationality"
                            value={client.countryNationality}
                            onChange={(value) => setClient({ ...client, countryNationality: value })}
                            placeholder="Namibian"
                            required
                        />}
                    </div>
                </div>

                {/**ID Type */}
                {
                    clientDocfoxData.idType &&
                    <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="idType">ID Type</label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="idType"
                                placeholder={clientDocfoxData.idType === "national_id_number" ? "ID" : "Passport No"}
                                type="text"
                                value={clientDocfoxData.idType === "national_id_number" ? "ID" : "Passsport"}

                                onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                required

                            />
                        </div>
                    </div>
                }

                {
                    !clientDocfoxData.idType &&
                    <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="idType">ID Type</label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="idType"
                                placeholder={client.idType === "national_id_number" ? "ID" : "Passport No"}
                                type="text"
                                value={client.idType === "national_id_number" ? "ID" : "Passsport"}
                                onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                }

                {
                    clientDocfoxData.idNumber &&
                    <div className="uk-width-1-2" >
                        <label className="uk-form-label required" htmlFor="idNumber">{clientDocfoxData.idType === "national_id_number" ? "ID Number" : "Passport Number"}</label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="idNumber"
                                placeholder={clientDocfoxData.idType === "national_id_number" ? "ID" : "Passport No"}
                                type="text"
                                value={clientDocfoxData.idNumber}
                                onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                required

                            />
                        </div>
                    </div>
                }

                {
                    !clientDocfoxData.idNumber &&
                    <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="idNumber">{client.idType === "national_id_number" ? "ID Number" : "Passport Number"}</label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="idNumber"
                                placeholder={client.idType === "national_id_number" ? "ID" : "Passport No"}
                                type="text"
                                value={client.idNumber}
                                onChange={(e) => setClient({ ...client, idNumber: e.target.value })}
                                required

                            />
                        </div>
                    </div>
                }

                {
                    clientDocfoxData.idCountry &&
                    <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="idCountry">ID Country</label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="idCountry"
                                type="text"
                                value={country}
                                onChange={(e) => setClient({ ...client, idCountry: e.target.value })}
                                required

                            />
                        </div>
                    </div>
                }

                {
                    !clientDocfoxData.idCountry &&
                    <div className={`${clientDocfoxData.idType === "ID" ? "uk-width-1-2" : "uk-width-1-4"}`}>
                        <label className="uk-form-label required" htmlFor="idCountry">ID Country</label>
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
                }

                {clientDocfoxData.idType !== "national_id_number" &&
                    <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="passportExpiry">Passport Expiry Date</label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="passportExpiry"
                                type="date"
                                value={clientDocfoxData.idExpiry}
                                onChange={(e) => setClient({ ...client, idExpiry: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                }

                {!clientDocfoxData.idType && client.idType !== "national_id_number" &&
                    <div className="uk-width-1-2">
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

                {/* <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="dateCreated">Date Created</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="dateCreated"
                            type="date"
                            onChange={(e) => setClient({ ...client, dateCreated: e.target.value })}
                            required
                        />
                    </div>
                </div> */}

                {/* <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="dateDeactivated">Date Deactivated</label>
                    <div className="uk-form-controls">
                        <input
                            className="uk-input uk-form-small"
                            id="dateDeactivated"
                            type="date"
                            value={client.dateDeactivated}
                            onChange={(e) => setClient({ ...client, dateDeactivated: e.target.value })}
                        />
                    </div>
                </div> */}

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="clientStatus">Client Status</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            value={client.clientStatus}
                            id="clientStatus"
                            onChange={(e) => setClient({ ...client, clientStatus: e.target.value })}
                            required
                        >
                            <option value="Pending">Pending</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label" htmlFor="deceased">Deceased</label>
                    <div className="uk-form-controls">

                        <input
                            className="uk-checkbox"
                            id="deceased"
                            type="checkbox"
                            checked={client.deceased}
                            onChange={(e) => setClient({ ...client, deceased: e.target.checked })}
                        />
                    </div>
                    {client.deceased && (
                        <div className="uk-form-controls">
                            <label className="uk-form-label required" htmlFor="deceased">Date of Death</label>
                            <input
                                className="uk-input uk-form-small"
                                id="dateOfDeath"
                                type="date"
                                value={client.dateOfDeath} // Ensure it's either a valid date string or an empty string
                                onChange={(e) => setClient({ ...client, dateOfDeath: e.target.value })}
                                required
                            />
                        </div>
                    )}
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
