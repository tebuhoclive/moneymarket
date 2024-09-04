import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { SupportingDocuments } from "./forms/SupportingDocuments";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { ClientBankingProfile } from "./forms/ClientBankingProfile";
import { RelatedParty } from "./forms/RelatedParty";
import { INaturalPersonAuditTrail } from "../../../../../shared/models/clients/NaturalPersonAuditTrailModel";
import swal from "sweetalert";

type Tab = "Risk Rating" | "Client Information" | "Client Financial Profile" | "Bank Account Information" | "Authorised Person(s) Acting on Behalf of a Client" | "Supporting Documents"

interface ITabsProps {
    tab: Tab;
    setTab: React.Dispatch<React.SetStateAction<Tab>>;
}
const Tabs = (props: ITabsProps) => {
    const activeClass = (tab: Tab) => {
        if (props.tab === tab) return "uk-active";
        return "";
    };

    return (
        <div className="uk-margin-small-bottom">
            <ul className="kit-tabs" data-uk-tab>
                <li
                    className={activeClass("Risk Rating")}
                    onClick={() => props.setTab("Risk Rating")}
                >
                    <a href="void(0)">Risk Rating</a>
                </li>
                <li
                    className={activeClass("Client Information")}
                    onClick={() => props.setTab("Client Information")}
                >
                    <a href="void(0)">Client Information</a>
                </li>
                <li
                    className={activeClass("Client Financial Profile")}
                    onClick={() => props.setTab("Client Financial Profile")}
                >
                    <a href="void(0)">Client Financial Profile</a>
                </li>
                <li
                    className={activeClass("Bank Account Information")}
                    onClick={() => props.setTab("Bank Account Information")}
                >
                    <a href="void(0)">Banking Information</a>
                </li>
                <li
                    className={activeClass("Authorised Person(s) Acting on Behalf of a Client")}
                    onClick={() => props.setTab("Authorised Person(s) Acting on Behalf of a Client")}
                >
                    <a href="void(0)">Authorised Person(s) Acting on Behalf of a Client</a>
                </li>
                <li
                    className={activeClass("Supporting Documents")}
                    onClick={() => props.setTab("Supporting Documents")}
                >
                    <a href="void(0)">Supporting Documents</a>
                </li>
            </ul>
        </div>
    );
};

const RiskRatingModal = observer(() => {

    const { api, store } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });

    const user = store.auth.meJson;

    const [tab, setTab] = useState<Tab>("Client Information");

    const onRiskRate = async () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Update Risk Rating"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Draft Pending Review",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "Risk Rating",
                    auditDateTime: Date.now(),
                    action: "Updated risk rating",
                    actionDescription: `updated risk rating from ${client.riskRating === "" ? 'Not Risk Rated' : client.riskRating} to ${_client.clientRiskRating}`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Risk Rating has been update to ${_client.riskRating}`,
                    });
                    onCancel();
                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Risk rating update cancelled!'
                })
            }
        });

    }


    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setClient({ ...defaultNaturalPerson });
        hideModalFromId(MODAL_NAMES.ADMIN.RISK_RATE_NATURAL_PERSON_MODAL);
    };

    useEffect(() => {
        if (store.client.naturalPerson.selected) {
            setClient(store.client.naturalPerson.selected);
        }
    }, [store.client.naturalPerson.selected]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <div className="form-title">
                <h3 style={{ marginRight: "1rem" }}>
                    Entity Approvals
                </h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                    Risk Rating
                </h3>
            </div>
            <hr className="uk-margin-small" />
            <>
                <Tabs tab={tab} setTab={setTab} />
                <div className="dialog-content uk-position-relative">
                    {
                        tab === "Risk Rating" &&
                        <>
                            <div className="uk-width-1-2">
                                <label className="uk-form-label form required" htmlFor="riskRating">Risk Rating</label>
                                <div className="uk-form-controls">
                                    <select value={client.riskRating} id="riskRating"
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
                            <div className="uk-width-1-1 uk-margin-top">
                                <button onClick={onRiskRate} className="btn btn-warning" disabled={client.riskRating === "" || loading}>
                                    Update Risk Rating
                                    {loading && <span data-uk-spinner="ratio: .5"></span>}
                                </button>
                                <button onClick={onCancel} className="btn btn-danger">Cancel</button>
                            </div>
                        </>
                    }
                    {tab === "Client Information" &&
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
                                        {client.dateOfBirth && <p>{dateFormat_YY_MM_DD(client.dateOfBirth)}</p>}
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
                    }

                    {tab === "Client Financial Profile" &&
                        <>
                            <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
                                <div>
                                    <div className="uk-grid uk-grid-small" data-uk-grid>
                                        <div className="uk-width-1-3">
                                            <p className="uk-text-bold">Date Of Last FIA:</p>
                                        </div>
                                        <div className="uk-width-2-3">
                                            <p>{client.dateOfLastFIA}</p>
                                        </div>
                                        <div className="uk-width-1-3">
                                            <p className="uk-text-bold">Date Of Next FIA:</p>
                                        </div>
                                        <div className="uk-width-2-3">
                                            <p>{client.dateOfNextFIA}</p>
                                        </div>
                                        <div className="uk-width-1-3">
                                            <p className="uk-text-bold">Source of Wealth:</p>
                                        </div>
                                        <div className="uk-width-2-3">
                                            <p>{client.sourceOfWealth}</p>
                                        </div>
                                        <div className="uk-width-1-3">
                                            <p className="uk-text-bold">Annual Income:</p>
                                        </div>
                                        <div className="uk-width-2-3">
                                            <p>{client.annualIncome}</p>
                                        </div>
                                        <div className="uk-width-1-3">
                                            <p className="uk-text-bold">Annual Investment Limit:</p>
                                        </div>
                                        <div className="uk-width-2-3">
                                            <p>{client.annualInvestmentLimit}</p>
                                        </div>
                                        <div className="uk-width-1-3">
                                            <p className="uk-text-bold">Single Transaction Limit</p>
                                        </div>
                                        <div className="uk-width-2-3">
                                            <p>{client.singleTransactionLimit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }

                    {tab === "Bank Account Information" &&
                        <ClientBankingProfile
                            client={client}
                        />
                    }
                    {tab === "Authorised Person(s) Acting on Behalf of a Client" &&
                        <RelatedParty
                            client={client}
                        />
                    }

                    {tab === "Supporting Documents" && (
                        <SupportingDocuments
                            client={client}
                            setClient={setClient}
                            onCancel={onCancel}
                        />
                    )}
                </div>
            </>
        </div>
    );
});

export default RiskRatingModal;