import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";
import { useAppContext } from "../../../../../shared/functions/Context";
import { generateNextValue } from "../../../../../shared/utils/utils";
import { RelatedPartyInformationForm } from "./forms/RelatedPartyInformationForm";
import { IRelatedParty, defaultRelatedParty } from "../../../../../shared/models/stakeholders/RelatedPartyModel";
import { IStakeholderId } from "../../../../../shared/models/stakeholders/StakeholderIdModel";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";


const RelatedPartyModal = observer(() => {

    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [relatedParty, setRelatedParty] = useState<IRelatedParty>({ ...defaultRelatedParty });
    const [stakeholderId, setEntityId] = useState("");
    const [currentId, setCurrentId] = useState("");

    const selected = store.stakeholder.relatedParty.selected;

    const create = async (item: IRelatedParty, saveId: IStakeholderId) => {
        item.stakeholderDisplayName = `${item.firstName} ${item.surname}`
        try {
            await api.stakeholder.relatedParty.create(item);
            await api.stakeholder.stakeholderId.update(saveId);
            swal({
                icon: "success",
                text: "Successful Related Party on-boarding!"
            })
        } catch (error) {
        }
    };

    const update = async (item: IRelatedParty) => {
        try {
            await api.stakeholder.relatedParty.update(item);
            swal({
                icon: "Success",
                text: "Related Party details updated!"
            })
        } catch (error) {
        }
    };


    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const createItem: IRelatedParty = {
            ...relatedParty,
            stakeholderDisplayName: `${relatedParty.surname} ${relatedParty.firstName}`,
            stakeholderId: currentId,
            dateCreated: Date.now()
        };

        const saveId: IStakeholderId = {
            id: "TURwHEkCzkSRVcbjdtTk",
            stakeholderId: currentId,
            createdOn: Date.now(),
        }

        if (selected) {
            try {
                await update(relatedParty);
            } catch (error) {
            }
        }
        else {
            try {
                await create(createItem, saveId);
            } catch (error) {
            }
        }
        setLoading(false);
        onCancel();
    };

    const onCancel = () => {
        store.stakeholder.relatedParty.clearSelected();
        setRelatedParty({ ...defaultRelatedParty });
        hideModalFromId(MODAL_NAMES.ADMIN.RELATED_PARTY_MODAL);
    };

    useEffect(() => {
        if (store.stakeholder.relatedParty.selected) {
            setRelatedParty(store.stakeholder.relatedParty.selected);
        }
    }, [store.stakeholder.relatedParty.selected]);

    useEffect(() => {
        const loadAll = async () => {
            try {
                await api.stakeholder.stakeholderId.getId();
                setEntityId(store.stakeholderId.id)
                const nextEntityId = generateNextValue(stakeholderId);
                setCurrentId(nextEntityId)
            } catch (error) { }
        };
        loadAll();
    }, [api.stakeholder.stakeholderId, stakeholderId, store.stakeholderId.id]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-2-3">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h4 className="main-title-lg">Related Party Onboarding</h4>
            <h3 className="main-title-md uk-margin-remove">New Stakeholder ID: {currentId}</h3>
            <div className="dialog-content uk-position-relative">
                <hr />

                <RelatedPartyInformationForm
                    relatedParty={relatedParty}
                    setRelatedParty={setRelatedParty}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    loading={loading}
                />

            </div>
        </div>
    );
});

export default RelatedPartyModal;