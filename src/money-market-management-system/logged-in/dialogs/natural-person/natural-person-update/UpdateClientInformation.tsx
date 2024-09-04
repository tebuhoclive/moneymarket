import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";

import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { ClientInformationForm } from "./forms/ClientInformationForm";

const UpdateClientInformationModal = observer(() => {

    const { api, store } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });

    const selected = store.client.naturalPerson.selected;

    const onSubmitClientInformation = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (selected) {
            setLoading(true);
            try {
                await api.client.naturalPerson.update(client);
                //audit trail
                swal({
                    icon: "Success",
                    title: `${client.entityDisplayName}'s Client Information has been updated successfully!`
                })
            } catch (error) {
            }
            setLoading(false);
        }
        setLoading(false);
        onCancel();
    };

    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setClient({ ...defaultNaturalPerson });
        hideModalFromId(MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_CLIENT_INFORMATION_MODAL);
    };

    useEffect(() => {
        if (store.client.naturalPerson.selected) {
            setClient(store.client.naturalPerson.selected);
        }
    }, [store.client.naturalPerson.selected]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-2-3">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h4 className="main-title-lg">Update Client Information</h4>
            <hr />
            <div className="dialog-content uk-position-relative">
                <ClientInformationForm
                    client={client}
                    setClient={setClient}
                    onSubmitClientInformation={onSubmitClientInformation}
                    onCancel={onCancel}
                    loading={loading}
                />
            </div>
        </div>
    );
});

export default UpdateClientInformationModal;