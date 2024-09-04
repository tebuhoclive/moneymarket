import { observer } from "mobx-react-lite";
import Modal from "../../../../../../shared/components/Modal";
import { useAppContext } from "../../../../../../shared/functions/Context";

import MODAL_NAMES from "../../../../dialogs/ModalName";


import { NaturalPersonGrid } from "./NaturalPersonGrid";
import NaturalBankAccountImportModal from "../../../../dialogs/entity-onboarding/import-client-bank-accounts/NaturalBankAccountImportModal";

import UpdateBankAccountModal from "../../../../dialogs/natural-person/natural-person-onboarding/UpdateBankAccountModal";

const NaturalPerson = observer(() => {
  const { store } = useAppContext();
  const clients = store.client.naturalPerson.all;

  const clientList = clients
    .sort((a, b) => {
      const nameA = a.asJson.entityDisplayName;
      const nameB = b.asJson.entityDisplayName;

      return nameA.localeCompare(nameB);
    })
    .map((cli) => {
      return cli.asJson;
    });

  return (
    <>
      <div className="page-main-card">
        <NaturalPersonGrid data={clientList} />
      </div>
      <Modal modalId={MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_BANK_MODAL}>
        <UpdateBankAccountModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_NATURAL_CLIENT_BANK_ACCOUNTS_MODAL}>
        <NaturalBankAccountImportModal />
      </Modal>
    </>
  );
});

export default NaturalPerson;
