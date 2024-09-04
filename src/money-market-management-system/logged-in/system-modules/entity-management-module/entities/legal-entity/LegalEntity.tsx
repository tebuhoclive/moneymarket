import Modal from "../../../../../../shared/components/Modal";
import { useAppContext } from "../../../../../../shared/functions/Context";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import LegalBankAccountImportModal from "../../../../dialogs/entity-onboarding/import-client-legal-bank-accounts/LegalBankAccountImportModal";

import { LegalEntityGrid } from "./LegalEntityGrid";

import LegalEntityImportModal from "../../../../dialogs/legal-entity/legal-entity-import/LegalEntityImportModal";
import LegalEntityModal from "../../../../dialogs/legal-entity/legal-entity-onboarding/LegalEntityModal";
import { observer } from "mobx-react-lite";
import UpdateBankAccountModalLegal from "../../../../dialogs/natural-person/natural-person-onboarding/UpdateBankAccountModalLegal";

const LegalEntity = observer(() => {
  const { store } = useAppContext();
  
  const clients = store.client.legalEntity.all;

  const sortedClientList = clients.sort((a, b) => {
    const nameA = a.asJson.entityDisplayName;
    const nameB = b.asJson.entityDisplayName;
    return nameA.localeCompare(nameB);
  }).map((client) => {
    return client.asJson;
  });

  return (
    <>
      <div className="page-main-card">
        <LegalEntityGrid data={sortedClientList} />
      </div>

      <Modal modalId={MODAL_NAMES.ADMIN.LEGAL_ENTITY_MODAL}>
        <LegalEntityModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.UPDATE_LEGAL_BANK_MODAL}>
        <UpdateBankAccountModalLegal />
      </Modal>
      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_LEGAL_ENTITY_MODAL}>
        <LegalEntityImportModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_NATURAL_CLIENT_BANK_ACCOUNTS_MODAL}>
        <LegalBankAccountImportModal />
      </Modal>
    </>
  );
});

export default LegalEntity;
