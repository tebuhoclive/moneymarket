import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";
import { UpdateBankAccountDetailsForm } from "./forms/UpdateBankAccountDetailsForm";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { UpdateBankAccountDetailsFormLegal } from "./forms/UpdateBankAccountDetailsFormLegal";
import { ILegalEntity, defaultLegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";

const UpdateBankAccountModalLegal = observer(() => {

    const { api, store } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<ILegalEntity>({ ...defaultLegalEntity });

    const update = async (item: ILegalEntity) => {
        try {
            await api.client.legalEntity.update(item);
            swal({
                icon: "Success",
                text: "Legal details updated!"
            })
            onCancel();
        } catch (error) {
        }
    };

    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setClient({ ...defaultLegalEntity });
        hideModalFromId(MODAL_NAMES.ADMIN.LEGAL_ENTITY_MODAL);
    };

    const onSubmitAccountDetail = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        await update(client);
        setLoading(false);
        onCancel();
    };

    useEffect(() => {
        if (store.client.legalEntity.selected) {
            setClient(store.client.legalEntity.selected);
        }
    }, [store.client.legalEntity.selected]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-padding-large uk-margin-auto-vertical uk-width-1-2">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h4 className="main-title-sm">Client Name: {client.clientRegisteredName} </h4>
            <h3 className="uk-modal-title uk-margin-remove">Entity ID: {client.entityId}</h3>
            <div className="dialog-content uk-position-relative">
                <UpdateBankAccountDetailsFormLegal
                    client={client}
                    setClient={setClient}
                    loading={loading}
                    onSubmitAccountDetail={onSubmitAccountDetail}
                />
            </div>
        </div>
    );
});

export default UpdateBankAccountModalLegal;