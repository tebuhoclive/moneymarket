import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../ModalName";
import { ILegalEntity, defaultLegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";

import { generateNextValue } from "../../../../../shared/utils/utils";
import { SUCCESSACTION } from "../../../../../shared/models/Snackbar";
import { IEntityId } from "../../../../../shared/models/clients/EntityIdModel";
import { LegalEntityForm } from "./forms/LegalEntityForm";

interface ITabsProps {
    tab: "Personal" | "Contact" | "Banking" | "Tax" | "Related";
    setTab: React.Dispatch<React.SetStateAction<"Personal" | "Contact" | "Banking" | "Tax" | "Related">>;
}
const Tabs = (props: ITabsProps) => {
    const activeClass = (tab: "Personal" | "Contact" | "Banking" | "Tax" | "Related") => {
        if (props.tab === tab) return "uk-active";
        return "";
    };

    return (
        <div className="uk-margin-small-bottom">
            <ul className="kit-tabs" data-uk-tab>
                <li
                    className={activeClass("Personal")}
                    onClick={() => props.setTab("Personal")}
                >
                    <a href="void(0)">Entity Details</a>
                </li>
                <li
                    className={activeClass("Contact")}
                    onClick={() => props.setTab("Contact")}
                >
                    <a href="void(0)">Contact Detail</a>
                </li>
                <li
                    className={activeClass("Banking")}
                    onClick={() => props.setTab("Banking")}
                >
                    <a href="void(0)">Banking Detail</a>
                </li>
                {/* <li
                    className={activeClass("Tax")}
                    onClick={() => props.setTab("Tax")}
                >
                    <a href="void(0)">Tax Detail</a>
                </li> */}
                {/* <li
                    className={activeClass("Related")}
                    onClick={() => props.setTab("Related")}
                >
                    <a href="void(0)">Related Parties</a>
                </li> */}
            </ul>
        </div>
    );
};

const LegalEntityModal = observer(() => {

    const { api, store, ui } = useAppContext();
    const [tab, setTab] = useState<"Personal" | "Contact" | "Banking" | "Tax" | "Related">("Personal");
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<ILegalEntity>({ ...defaultLegalEntity });

    const [entityId, setEntityId] = useState("");
    const [currentId, setCurrentId] = useState("");
    const selected = store.client.naturalPerson.selected;

    const onSubmitBankAccountInformation = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const createItem: ILegalEntity = {
            ...client,
            entityDisplayName: client.clientRegisteredName,
            entityId: currentId,
        };

        const saveId: IEntityId = {
            id: "TURwHEkCzkSRVcbjdtTk",
            entityId: currentId,
            createdOn: Date.now()
        }

        if (selected) await update(client);
        else await create(createItem, saveId);

        setLoading(false);
        onCancel();
    };

    const update = async (item: ILegalEntity) => {
        try {
            await api.client.legalEntity.update(item)
            SUCCESSACTION(ui);
        } catch (error) {
        }
    };

    const create = async (item: ILegalEntity, saveId: IEntityId) => {
        try {
            await api.client.legalEntity.create(item);
            await api.client.entityId.update(saveId);
            SUCCESSACTION(ui);
        } catch (error) {

        }
    };

    const onCancel = () => {
        store.client.legalEntity.clearSelected();
        setTab("Personal");
        setClient({ ...defaultLegalEntity });
        hideModalFromId(MODAL_NAMES.ADMIN.LEGAL_ENTITY_MODAL);
    };

    const onSubmitClientInformation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Contact");
    };

    const onBackToClientInformation = () => {
        setTab("Personal");
    };


    const onSubmitClientFinancialProfile = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Banking");
    };

    const onBackToClientFinancialProfile = () => {
        setTab("Contact");
    };

    useEffect(() => {
        if (store.client.legalEntity.selected) {
            setClient(store.client.legalEntity.selected);
        }
    }, [store.client.legalEntity.selected]);

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
    }, [api.client.entityId, entityId, store.entityId.id]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-1-2 uk-padding">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h4 className="main-title-sm">NEW ENTITY (Legal Entity) - OFFLINE ONBOARDING</h4>
            <h3 className="uk-modal-title uk-margin-remove">New Entity ID: {selected ? client.entityId : currentId}</h3>
            <div className="dialog-content uk-position-relative">
                <Tabs tab={tab} setTab={setTab} />
                {tab === "Personal" && (
                    <LegalEntityForm
                        client={client}
                        setClient={setClient}
                        onSubmitClientInformation={onSubmitClientInformation}
                        onCancel={onCancel}
                    />
                )}

                {/* {tab === "Contact" && (
                    <ClientAddressContactDetail
                        client={client}
                        setClient={setClient}
                        onSubmitClientFinancialProfile={onSubmitClientFinancialProfile}
                        onBackToClientInformation={onBackToClientInformation} />
                )}
                {tab === "Banking" && (
                    <BankAccountDetails
                        client={client}
                        setClient={setClient}
                        onSubmitBankAccountInformation={onSubmitBankAccountInformation}
                        onBackToClientFinancialProfile={onBackToClientFinancialProfile}
                    />
                )} */}
            </div>
        </div>
    );
});

export default LegalEntityModal;