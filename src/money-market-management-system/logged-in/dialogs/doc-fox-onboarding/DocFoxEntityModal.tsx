import { observer } from "mobx-react-lite";

import MODAL_NAMES from "../ModalName";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale, faUser } from "@fortawesome/free-solid-svg-icons";

import showModalFromId, { hideModalFromId } from "../../../../shared/functions/ModalShow";
import SelectNaturalPersonModal from "../natural-person/natural-person-docfox-onboarding/SelectNaturalPersonModal";
import Modal from "../../../../shared/components/Modal";

const EntityModal = observer(() => {

    const naturalPersonEntity = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_ENTITY_TYPE_MODAL);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_SELECT_NATURAL_PERSON_MODAL);
    }

    const legalEntity = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_ENTITY_TYPE_MODAL);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_LEGAL_ENTITY_MODAL);
    }

    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_ENTITY_TYPE_MODAL);
    };

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-1-3">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
            <h3 className="main-title-lg uk-text-center">Select Entity Type</h3>
            <div className="dialog-content uk-position-relative uk-align-center uk-text-center">
                <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
                    <div>
                        <button className="btn btn-primary uk-text-center uk-width-1-1" onClick={naturalPersonEntity}>
                            <FontAwesomeIcon className="uk-margin icon-lg" icon={faUser} />
                            <br />
                            Natural Person
                        </button>
                    </div>
                    <div>
                        <button className="btn btn-primary uk-text-center uk-width-1-1" onClick={legalEntity}>
                            <FontAwesomeIcon className="uk-margin icon-lg" icon={faBalanceScale} />
                            <br />
                            Legal Entity
                        </button>
                    </div>
                </div>
            </div>
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.DOC_FOX_SELECT_NATURAL_PERSON_MODAL}>
                <SelectNaturalPersonModal />
            </Modal>
        </div>
    );
});

export default EntityModal;