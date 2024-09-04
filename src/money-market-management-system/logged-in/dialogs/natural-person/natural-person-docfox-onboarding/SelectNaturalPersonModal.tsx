import { observer } from "mobx-react-lite";
import MODAL_NAMES from "../../ModalName";
import { useEffect, useState } from "react";

import NaturalPersonDocFoxModal from "./NaturalPersonDocFoxModal";

import swal from "sweetalert";
import Modal from "../../../../../shared/components/Modal";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId, { hideModalFromId } from "../../../../../shared/functions/ModalShow";

const SelectNaturalPersonModal = observer(() => {

    const { api, store } = useAppContext();

    const [loading, setLoading] = useState(false);

    const [docFoxClient, setDocFoxClient] = useState("");

    const docFoxApplication = store.docFoxProfile.all.filter(status => status.asJson.systemOnBoardingStatus !== "on-boarded");

    // const docFoxApplication = store.docFoxProfile.all;

    const docFoxApplicationsOptions = docFoxApplication.map(docFoxApplication => ({
        label: (`${docFoxApplication.asJson.firstName} ${docFoxApplication.asJson.lastName}`),
        value: (docFoxApplication.asJson.id)
    }));

    const onHandleSync = async () => {
        try {
            setLoading(true);
            await api.docfox.kycApplications.getKYCApplicationsFromDocFox();
            const applications = store.docFoxApplication.all;
            applications.forEach(async application => {
                await api.docfox.kycApplications.createOrUpdateKYCApplication(application.asJson);
                console.log("created", application.asJson);
            });
            setLoading(false);
        } catch {
            console.log("Learn");
        }
    }

    const onHandleStartOnBoarding = () => {
        if (docFoxClient !== "") {

            const profile = store.docFoxProfile.getItemById(docFoxClient);
            const contacts = store.docFoxProfileContacts.getItemById(docFoxClient);
            const numbers = store.docFoxProfileNumbers.getItemById(docFoxClient);
            const addresses = store.docFoxProfileAddresses.getItemById(docFoxClient);
            const additionalDetails = store.docFoxProfileAdditionalDetails.getItemById(docFoxClient);

            console.log("profile", profile);


            if (profile && contacts && numbers && addresses && additionalDetails) {
                try {
                    store.docFoxProfile.select(profile.asJson);
                    store.docFoxProfileContacts.select(contacts.asJson);
                    store.docFoxProfileAddresses.select(addresses.asJson);
                    store.docFoxProfileNumbers.select(numbers.asJson);
                    store.docFoxProfileAdditionalDetails.select(additionalDetails?.asJson);

                    showModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_NATURAL_PERSON_MODAL);
                } catch (error) {
                    console.log(error);
                    swal({
                        icon: "error",
                        text: `${error}`
                    })
                }
            } else {
                swal({
                    icon: "error",
                    text: "Cannot Onboard this client, please verify that the selected client's information on DocFox has been loaded correctly!"
                });
                // showModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_NATURAL_PERSON_MODAL);
            }

        } else {
            swal({
                icon: "error",
                text: "Please select a client"
            })
        }
    }

    const onCancel = () => {
        setDocFoxClient("");
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_ENTITY_TYPE_MODAL);
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                await api.docfox.kycProfiles.getKYCProfilesFromDatabase();
                if (docFoxClient) {
                    await api.docfox.kycProfiles.getKYCProfileContacts(docFoxClient);
                    await api.docfox.kycProfiles.getKYCProfileContacts(docFoxClient);
                    await api.docfox.kycProfiles.getKYCProfileNumbers(docFoxClient);
                    await api.docfox.kycProfiles.getKYCProfileAddresses(docFoxClient);
                    await api.docfox.kycProfiles.getKYCProfileAdditionalDetails(docFoxClient);
                }
                setLoading(false);
            } catch (error) {
            }
        };

        loadAll();
    }, [api.docfox, docFoxClient]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-1-4">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h3 className="main-title-sm uk-text-center">DocFox Onboarding: Select Client (Natural Person)</h3>
            {
                loading && <LoadingEllipsis />
            }
            {
                !loading &&
                <div className="dialog-content uk-position-relative">
                    <div className="uk-width-1-1 uk-margin-bottom-small">
                        <label className="uk-form-label required" htmlFor="idClient">Client Name</label>
                        <div className="uk-form-controls">
                            <SingleSelect
                                options={docFoxApplicationsOptions}
                                name="idClient"
                                value={docFoxClient}
                                onChange={(value) => setDocFoxClient(value)}
                                placeholder="Select client from DocFox"
                                required
                            />
                        </div>
                    </div>
                    <button className="btn btn-primary uk-text-center uk-width-1-1 uk-margin-small" onClick={onHandleSync}>
                        Re-Sync Data {loading && <LoadingEllipsis />}
                    </button>
                    <button className="btn btn-primary uk-text-center uk-width-1-1 uk-margin-small" onClick={onHandleStartOnBoarding}>
                        Start On-boarding
                    </button>
                </div>
            }
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.DOC_FOX_NATURAL_PERSON_MODAL}>
                <NaturalPersonDocFoxModal />
            </Modal>
        </div>
    );
});

export default SelectNaturalPersonModal;