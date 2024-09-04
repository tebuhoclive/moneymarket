import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Toolbar from "../../../../../shared/components/toolbar/Toolbar";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import ErrorBoundary from "../../../../../../../shared/components/error-boundary/ErrorBoundary";
import { INaturalPerson } from "../../../../../../../shared/models/clients/NaturalPersonModel";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import showModalFromId from "../../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../../dialogs/ModalName";

interface IPersonalDetailsProps {
    client: INaturalPerson;
}

export const PersonalDetails = (props: IPersonalDetailsProps) => {
    const { client } = props;
    const {store} = useAppContext();

    const updateClientInformation = () => {
        store.client.naturalPerson.select(client);
        showModalFromId(MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_CLIENT_INFORMATION_MODAL);
    }

    return (
        <ErrorBoundary>
            <Toolbar
                leftControls={<h4 className="main-title-sm">Client Information</h4>}
                rightControls={
                    <button onClick={updateClientInformation} className="btn btn-primary"><FontAwesomeIcon icon={faPencil} /> Edit</button>
                }
            />
            <hr />
            <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
                <div>
                    <div className="uk-grid uk-grid-small" data-uk-grid>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Title:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.clientTitle}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Full Name(s):</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.clientName}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Surname:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.clientSurname}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Date of Birth:</p>
                        </div>
                        <div className="uk-width-2-3">
                            {
                                client.dateOfBirth &&
                                <p>{dateFormat_YY_MM_DD(client.dateOfBirth)}</p>
                            }
                        </div>
                        {
                            client.deceased &&
                            <>

                                <div className="uk-width-1-3">
                                    <p className="uk-text-bold">Date of Death:</p>
                                </div>
                                <div className="uk-width-2-3">
                                    {
                                        client.dateOfDeath && <p>{dateFormat_YY_MM_DD(client.dateOfDeath)}</p>
                                    }

                                </div>
                            </>
                        }
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Identification Type:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.idType}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">{client.idType} Number</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.idNumber}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">{client.idType} Issue Country</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.idCountry}</p>
                        </div>
                        {client.idType === "Passport" &&
                            <>
                                <div className="uk-width-1-3">
                                    <p className="uk-text-bold">Passport Expiry Date:</p>
                                </div>
                                <div className="uk-width-2-3">
                                    <p>{dateFormat_YY_MM_DD(client.idExpiry)}</p>
                                </div>
                            </>
                        }
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Gender:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.gender}</p>
                        </div>

                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Nationality:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.countryNationality}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Country of Residence:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.countryOfResidence}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">TIN:</p>
                        </div>
                        <div className="uk-width-2-3">
                            {
                                client.taxDetail.tin &&
                                <p>{client.taxDetail.tin}</p>
                            }
                        </div>

                        <div className="uk-width-1-3">
                            <p className="uk-text-bold" >TIN Country Of Issue:</p>
                        </div>
                        <div className="uk-width-2-3">
                            {
                                client.taxDetail.tinCountryOfIssue &&
                                <p>{client.taxDetail.tinCountryOfIssue}</p>
                            }
                        </div>
                        {
                            client.taxDetail.reasonForNoTIN &&
                            <>

                                <div className="uk-width-1-3">
                                    <p className="uk-text-bold">Reason for no TIN:</p>
                                </div>
                                <div className="uk-width-2-3">
                                    <p>{client.taxDetail.reasonForNoTIN}</p>
                                </div>
                            </>
                        }
                    </div>
                </div>
                <div>
                    <div className="uk-grid uk-grid-small" data-uk-grid>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Residential Address:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.contactDetail.address1}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Postal Address:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.contactDetail.postalAddress}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Email Address 1:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.contactDetail.emailAddress}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Email Address 2:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.contactDetail.emailAddressSecondary}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Cellphone Number:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.contactDetail.cellphoneNumber}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Cellphone Number (Secondary):</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.contactDetail.cellphoneNumberSecondary}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Marital Status:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.maritalStatus}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Employment Status:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.employmentStatus}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Employer:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.employer}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Client Classification:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.clientClassification}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Risk Rating:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.riskRating}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary >
    );
};
