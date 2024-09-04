import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";
import { BankAccountDetailsForm } from "./forms/BankAccountDetailsForm";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId, { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IEntityId } from "../../../../../shared/models/clients/EntityIdModel";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { generateNextValue } from "../../../../../shared/utils/utils";
import { ComplianceForm } from "./forms/ComplianceForm";
import { RelatedPartyDetailsForm } from "./forms/RelatedPartyDetailsForm";
import { ClientInformationForm } from "./forms/ClientInformationForm";
import { SupportingDocuments } from "./forms/SupportingDocuments";

type Tab = "Client Information" | "Client Financial Profile" | "Bank Account Information" | "Authorised Person(s) Acting on Behalf of a Client" | "Supporting Documents"

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
                    <a href="void(0)">Bank Account Information</a>
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

const NaturalPersonOfflineModal = observer(() => {

    const { api, store } = useAppContext();

    const [tab, setTab] = useState<Tab>("Client Information");
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });
    const [entityId, setEntityId] = useState("");
    const [currentId, setCurrentId] = useState("");

    const selected = store.client.naturalPerson.selected;

    const create = async (item: INaturalPerson, saveId: IEntityId) => {
        item.entityDisplayName = `${item.clientSurname} ${item.clientName}`
        try {
            await api.client.naturalPerson.create(item);
            await api.client.entityId.update(saveId);
            swal({
                icon: "success",
                text: "Successful entity on-boarding!"
            })
        } catch (error) {
        }
    };

    const update = async (item: INaturalPerson) => {
        try {
            await api.client.naturalPerson.update(item);
            swal({
                icon: "Success",
                text: "Entity details updated!"
            })
        } catch (error) {
        }
    };

    const onSubmitClientInformation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Client Financial Profile");
    };

    const onBackToClientInformation = () => {
        setTab("Client Information");
    };

    const onSubmitClientFinancialProfile = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Bank Account Information");
    };

    const onBackToClientFinancialProfile = () => {
        setTab("Client Financial Profile");
    };

    const onSubmitBankAccountInformation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Authorised Person(s) Acting on Behalf of a Client");
    };

    const onBackToBankAccountInformation = () => {
        setTab("Bank Account Information");
    };

    const onSubmitRelatedParty = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Supporting Documents");
    };

    const onBackToRelatedParty = () => {
        setTab("Authorised Person(s) Acting on Behalf of a Client");
    };

    const onSubmitSupportingDocuments = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const createItem: INaturalPerson = {
            ...client,
            entityDisplayName: `${client.clientSurname} ${client.clientName}`,
            entityId: currentId,
        };

        const saveId: IEntityId = {
            id: "TURwHEkCzkSRVcbjdtTk",
            entityId: currentId,
            createdOn: Date.now()
        }

        if (selected) {
            try {
                await update(client);
            } catch (error) {
            } finally {
                store.client.naturalPerson.select(createItem);
                showModalFromId(MODAL_NAMES.ADMIN.NATURAL_PERSON_MODAL);
            }
        }
        else {
            try {
                await create(createItem, saveId);
            } catch (error) {
            } finally {
                store.client.naturalPerson.select(createItem);
                showModalFromId(MODAL_NAMES.ADMIN.NATURAL_PERSON_MODAL);
            }
        }
        setLoading(false);
        onCancel();
    };

    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setTab("Client Information")
        setClient({ ...defaultNaturalPerson });
        hideModalFromId(MODAL_NAMES.ADMIN.NATURAL_PERSON_MODAL);
    };

    useEffect(() => {
        if (store.client.naturalPerson.selected) {
            setClient(store.client.naturalPerson.selected);
        }
    }, [store.client.naturalPerson.selected]);

    useEffect(() => {
        const loadAll = async () => {
            try {
                await api.client.entityId.getId();
                setEntityId(store.entityId.id)
                const nextEntityId = generateNextValue(entityId);
                setCurrentId(nextEntityId)
            } catch (error) { }
        };
        loadAll();
    }, [api.client.entityId, api.docfox, entityId, store.entityId.id]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-4-5">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />

            <h4 className="main-title-lg">{selected ? 'Update Entity Details' : 'New Entity (Natural Person) - Offline Onboarding'}</h4>
            <hr />
            <h3 className="main-title-md uk-margin-remove">New Entity ID: {currentId}</h3>
            
            <div className="dialog-content uk-position-relative">
                <Tabs tab={tab} setTab={setTab} />

                {tab === "Client Information" &&
                    <ClientInformationForm
                        client={client}
                        setClient={setClient}
                        onSubmitClientInformation={onSubmitClientInformation}
                        onCancel={onCancel}
                    />
                }

                {tab === "Client Financial Profile" &&
                    <ComplianceForm
                        client={client}
                        setClient={setClient}
                        onSubmitComplianceDetails={onSubmitClientFinancialProfile}
                        onBackToClientInformation={onBackToClientInformation}
                    />
                }

                {tab === "Bank Account Information" &&
                    <BankAccountDetailsForm
                        client={client}
                        setClient={setClient}
                        onSubmitBankAccountInformation={onSubmitBankAccountInformation}
                        onBackToClientFinancialProfile={onBackToClientFinancialProfile}
                    />
                }
                {tab === "Authorised Person(s) Acting on Behalf of a Client" && (
                    <RelatedPartyDetailsForm
                        client={client}
                        setClient={setClient}
                        loading={loading}
                        onSubmitRelatedParty={onSubmitRelatedParty}
                        onBackToBankAccountInformation={onBackToBankAccountInformation}
                    />
                )}

                {tab === "Supporting Documents" &&
                    <SupportingDocuments
                        client={client}
                        setClient={setClient}
                        loading={loading}
                        onSubmitSupportingDocuments={onSubmitSupportingDocuments}
                        onBackToRelatedParty={onBackToRelatedParty}
                    />
                }
            </div>
        </div>
    );
});

export default NaturalPersonOfflineModal;