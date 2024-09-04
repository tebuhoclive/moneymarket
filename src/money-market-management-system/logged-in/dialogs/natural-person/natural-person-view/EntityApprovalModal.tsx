import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { SupportingDocuments } from "./forms/SupportingDocuments";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { ClientBankingProfile } from "./forms/ClientBankingProfile";
import { RelatedParty } from "./forms/RelatedParty";
import { INaturalPersonAuditTrail } from "../../../../../shared/models/clients/NaturalPersonAuditTrailModel";
import swal from "sweetalert";
import { NaturalPersonAuditTrailGrid } from "../../../system-modules/entity-management-module/entities/natural-person/NaturalPersonAuditTrailGrid";

type Tab = "Client Information" | "Client Financial Profile" | "Bank Account Information" | "Authorised Person(s) Acting on Behalf of a Client" | "Supporting Documents" | "Audit Trail"

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
                <li className={activeClass("Client Information")} onClick={() => props.setTab("Client Information")}>
                    <a href="void(0)">Client Information</a>
                </li>
                <li className={activeClass("Client Financial Profile")} onClick={() => props.setTab("Client Financial Profile")}>
                    <a href="void(0)">Client Financial Profile</a>
                </li>
                <li className={activeClass("Bank Account Information")} onClick={() => props.setTab("Bank Account Information")}>
                    <a href="void(0)">Banking Information</a>
                </li>
                <li className={activeClass("Authorised Person(s) Acting on Behalf of a Client")} onClick={() => props.setTab("Authorised Person(s) Acting on Behalf of a Client")}>
                    <a href="void(0)">Authorised Person(s) Acting on Behalf of a Client</a>
                </li>
                <li className={activeClass("Supporting Documents")} onClick={() => props.setTab("Supporting Documents")}>
                    <a href="void(0)">Supporting Documents</a>
                </li>
                <li className={activeClass("Audit Trail")} onClick={() => props.setTab("Audit Trail")}>
                    <a href="void(0)">Audit Trail</a>
                </li>
            </ul>
        </div>
    );
};

const EntityApprovalModal = observer(() => {

    const { api, store } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });

    const user = store.auth.meJson;

    const [tab, setTab] = useState<Tab>("Client Information");

    const auditTrail = store.client.naturalPersonAuditTrail.all;

    const clientAuditTrail = auditTrail
        .sort((a, b) => {
            const dateA = new Date(a.asJson.auditDateTime || 0);
            const dateB = new Date(b.asJson.auditDateTime || 0);

            return dateB.getTime() - dateA.getTime();
        })
        .map((c) => {
            return c.asJson;
        });


    const onSubmitPending = async () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Submit"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Submitted",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "FIA Compliance",
                    auditDateTime: Date.now(),
                    action: "Profile Approval",
                    actionDescription: `Client Profile Draft has been Submitted for First Level Approval`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Profile has been Submitted for First Level Approval`,
                    });
                    onCancel();
                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Submission cancelled!'
                })
            }

        });
    }

    const onSubmitReviewed = async () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Submit"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Reviewed",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "FIA Compliance",
                    auditDateTime: Date.now(),
                    action: "Profile Approval",
                    actionDescription: `Client Profile Draft Review has been Submitted for First Level Approval`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Profile Draft Review has been Submitted for First Level Approval`,
                    });
                    onCancel();
                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Submission cancelled!'
                })
            }
        });

    }

    const onApproveFirstLevel = async () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Approve"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Approved First Level",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "FIA Compliance",
                    auditDateTime: Date.now(),
                    action: "Profile Approval",
                    actionDescription: `Client Profile has been Approved First Level`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Profile has been Approved First Level`,
                    });
                    onCancel();
                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Approval cancelled!'
                })
            }
        });
    }

    const onApproveSecondLevel = async () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Approve"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Approved Second Level",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "FIA Compliance",
                    auditDateTime: Date.now(),
                    action: "Profile Approval",
                    actionDescription: `Client Profile has been Approved Second Level(For Third Level)`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Profile has been Approved Second Level`,
                    });
                    onCancel();

                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Approval cancelled!'
                })
            }
        });
    }

    const onApproveThirdLevel = async () => {


        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Approve"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Approved",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "FIA Compliance",
                    auditDateTime: Date.now(),
                    action: "Profile Approval",
                    actionDescription: `Client Profile has been Approved Third Level (Completed)`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Profile has been Approved Third Level`,
                    });
                    onCancel();
                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Approval cancelled!'
                })
            }
        });
    }

    const onApprove = async () => {


        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Approve"],
            dangerMode: true,
        }).then(async (edit) => {

            if (edit) {
                setLoading(true);
                const _client: INaturalPerson = {
                    ...client,
                    riskRating: client.riskRating,
                    profileStatus: "Approved",
                    lastUpdated: Date.now()
                }

                const auditTrail: INaturalPersonAuditTrail = {
                    id: "",
                    auditType: "FIA Compliance",
                    auditDateTime: Date.now(),
                    action: "Profile Approval",
                    actionDescription: `Client Profile has been Approved Second Level (Completed)`,
                    dataStateBeforeAudit: client,
                    dataStateAfterAudit: _client,
                    actionUser: user?.uid || ""
                }

                try {
                    await api.client.naturalPerson.updateAndCreateAuditTrail(_client, auditTrail);
                    swal({
                        icon: "success",
                        title: `Client Profile has been Approved`,
                    });
                    onCancel();
                } catch (error) {

                }
                setLoading(false);
            } else {
                swal({
                    icon: 'error',
                    title: 'Approval cancelled!'
                })
            }
        });
    }

    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setClient({ ...defaultNaturalPerson });
        hideModalFromId(MODAL_NAMES.ADMIN.ENTITY_APPROVAL_MODAL);
    };

    useEffect(() => {
        if (store.client.naturalPerson.selected) {
            const getAuditTrail = async (clientId: string) => {
                await api.client.naturalPersonAuditTrail.getAll(
                    clientId
                );
            }
            setClient(store.client.naturalPerson.selected);
            getAuditTrail(store.client.naturalPerson.selected.id);

        }
    }, [api.client.naturalPersonAuditTrail, client.id, store.client.naturalPerson.selected]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <div className="form-title">
                <h3 style={{ marginRight: "1rem" }}>
                    Entity Approvals
                </h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                    {client.profileStatus}
                </h3>
            </div>
            <hr />
            <div className="dialog-content uk-position-relative">
                <Tabs tab={tab} setTab={setTab} />
                {tab === "Client Information" &&
                    <>
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
                    </>
                }

                {tab === "Client Financial Profile" &&
                    <>
                        <Toolbar
                            leftControls={<h4 className="main-title-sm">Client Financial Profile</h4>}
                        />
                        <hr />
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

                {tab === "Audit Trail" && (
                    <NaturalPersonAuditTrailGrid data={clientAuditTrail} />
                )}
            </div>
            <hr />
            <div className="uk-width-1-1 uk-margin-top">
                {
                    client.profileStatus === "Draft Pending Submission" &&
                    <button onClick={onSubmitPending} className="btn btn-primary" disabled={loading}>
                        Submit: First Level Approval
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }
                {
                    client.profileStatus === "Draft Pending Review" &&
                    <button onClick={onSubmitReviewed} className="btn btn-primary" disabled={loading}>
                        Submit: First Level Approval
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }
                {
                    client.profileStatus === "Submitted" &&
                    <button onClick={onApproveFirstLevel} className="btn btn-primary" disabled={loading}>
                        Submit: Second Level Approval
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }
                {
                    client.profileStatus === "Reviewed" &&
                    <button onClick={onApproveFirstLevel} className="btn btn-primary" disabled={loading}>
                        Submit: Second Level Approval
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }

                {
                    (client.riskRating === "Low" || client.riskRating === "Medium") && client.profileStatus === "Approved First Level" &&
                    <button onClick={onApprove} className="btn btn-primary" disabled={loading}>
                        Complete On boarding
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }
                {
                    client.riskRating === "High" && client.profileStatus === "Approved First Level" &&
                    <button onClick={onApproveSecondLevel} className="btn btn-primary" disabled={loading}>
                        Submit: Third Level Approval
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }

                {
                    client.profileStatus === "Approved Second Level" &&
                    <button onClick={onApproveThirdLevel} className="btn btn-primary" disabled={loading}>
                        Complete On-boarding
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                }
                <button onClick={onCancel} className="btn btn-danger">Cancel</button>
            </div>
        </div>
    );
});

export default EntityApprovalModal;