import { useState } from "react";
import { observer } from "mobx-react-lite";
import MODAL_NAMES from "../../dialogs/ModalName";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import DocFoxEntityModal from "../../dialogs/doc-fox-onboarding/DocFoxEntityModal";
import EntityImportModal from "../../dialogs/natural-person/natural-person-import/NaturalPersonEntityImportModal";
import NaturalPersonOfflineModal from "../../dialogs/natural-person/natural-person-onboarding/NaturalPersonOfflineModal";

import Modal from "../../../../shared/components/Modal";
import LegalEntity from "./entities/legal-entity/LegalEntity";
import Stakeholders from "../stakeholders-management-module/Stakeholders";
import NaturalPerson from "./entities/natural-person/NaturalPerson";
import useTitle from "../../../../shared/hooks/useTitle";
import AllEntities from "./AllEntities";

type Tab = "All Entities" | "Natural Person" | "Legal Entity" | "Stakeholders"

interface ITabsProps {
  tab: Tab;
  setTab: React.Dispatch<React.SetStateAction<Tab>>;
}

const Tabs = (props: ITabsProps) => {
  const activeClass = (tab: Tab) => {
    if (props.tab === tab) return "uk-active";
    return "";
  };

  useTitle("Entity Management");

  return (
    <div className="uk-margin-small-bottom">
      <ul className="kit-tabs" data-uk-tab>
        <li
          className={activeClass("All Entities")}
          onClick={() => props.setTab("All Entities")}
        >
          <a href="void(0)">All Entities</a>
        </li>
        <li
          className={activeClass("Natural Person")}
          onClick={() => props.setTab("Natural Person")}
        >
          <a href="void(0)">Natural Persons</a>
        </li>
        <li
          className={activeClass("Legal Entity")}
          onClick={() => props.setTab("Legal Entity")}
        >
          <a href="void(0)">Legal Entities</a>
        </li>

        {/* <li
          className={activeClass("Stakeholders")}
          onClick={() => props.setTab("Stakeholders")}
        >
          <a href="void(0)">Stakeholders</a>
        </li> */}

      </ul>
    </div>
  );
};

const Entities = observer(() => {
  const [tab, setTab] = useState<Tab>("Natural Person");

  return (
    <ErrorBoundary>
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <Toolbar
              title={tab}
              rightControls={
                <Tabs tab={tab} setTab={setTab} />
              }
            />
            <hr />
          </div>
          {
            tab === "All Entities" &&
            <AllEntities />
          }
          {
            tab === "Natural Person" &&
            <NaturalPerson />
          }
          {
            tab === "Legal Entity" &&
            <LegalEntity />
          }

          {/* {
            tab === "Stakeholders" &&
            <Stakeholders />
          } */}

        </div>
      </div>

      {/** CRUD */}
      <Modal modalId={MODAL_NAMES.ADMIN.NATURAL_PERSON_MODAL}>
        <NaturalPersonOfflineModal />
      </Modal>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.DOC_FOX_ENTITY_TYPE_MODAL}>
        <DocFoxEntityModal />
      </Modal>

      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ENTITY_MODAL}>
        <EntityImportModal />
      </Modal>
    </ErrorBoundary>
  );
});
export default Entities;


