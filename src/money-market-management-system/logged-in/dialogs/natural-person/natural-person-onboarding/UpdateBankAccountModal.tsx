import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";
import { UpdateBankAccountDetailsForm } from "./forms/UpdateBankAccountDetailsForm";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";

const UpdateBankAccountModal = observer(() => {

    const { api, store } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });

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

    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setClient({ ...defaultNaturalPerson });
        hideModalFromId(MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_BANK_MODAL);
    };

    const onSubmitBankAccountInformation = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        await update(client);
        setLoading(false);
        onCancel();
    };

    useEffect(() => {
        if (store.client.naturalPerson.selected) {
            setClient(store.client.naturalPerson.selected);
        }
    }, [store.client.naturalPerson.selected]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-padding-large uk-margin-auto-vertical uk-width-1-2">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h4 className="main-title-sm">Client Name: {client.clientName} {client.clientSurname}</h4>
            <h3 className="uk-modal-title uk-margin-remove">Entity ID: {client.entityId}</h3>
            <div className="dialog-content uk-position-relative">
                <UpdateBankAccountDetailsForm
                    client={client}
                    setClient={setClient}
                    loading={loading}
                    onSubmitBankAccountInformation={onSubmitBankAccountInformation}
                />
            </div>
        </div>
    );
});

export default UpdateBankAccountModal;