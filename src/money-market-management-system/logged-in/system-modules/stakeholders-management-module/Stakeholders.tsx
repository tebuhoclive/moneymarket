import { useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";

import MODAL_NAMES from "../../dialogs/ModalName";

import Toolbar from "../../shared/components/toolbar/Toolbar"

import { observer } from "mobx-react-lite";
import { RelatedPartyGrid } from "./RelatedPartyGrid";
import StakeholderTabs from "./StakeholderTabs";
import GridFeatureUnderdevelopment from "../../../../shared/components/under-development/GridFeatureUnderdevelopment";
import { AllStakeholdersGrid } from "./AllStakeholdersGrid";
import RelatedPartyModal from "../../dialogs/stakeholders/related-party/RelatedPartyModal";
import Modal from "../../../../shared/components/Modal";

const Stakeholders = observer(() => {
  const { store } = useAppContext();

  const [selectedTab, setSelectedTab] = useState("related-party-tab");

  const relatedParties = store.stakeholder.relatedParty.all;

  const sortedAllStakeholderList = relatedParties
    .sort((a, b) => {
      const nameA = a.asJson.stakeholderDisplayName;
      const nameB = b.asJson.stakeholderDisplayName;
      return nameA.localeCompare(nameB);
    })
    .map((relatedParty) => {
      return relatedParty.asJson;
    });

  const sortedRelatedPartyList = relatedParties
    .sort((a, b) => {
      const nameA = a.asJson.stakeholderDisplayName;
      const nameB = b.asJson.stakeholderDisplayName;
      return nameA.localeCompare(nameB);
    })
    .map((relatedParty) => {
      return relatedParty.asJson;
    });


  return (
    <>
      <div className="page-main-card">
        <Toolbar
          leftControls={
            <StakeholderTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          }
        />

        <>
          {
            selectedTab === "all-stakeholders-tab" &&
            <AllStakeholdersGrid data={sortedAllStakeholderList} />
          }
          {
            selectedTab === "related-party-tab" &&
            <RelatedPartyGrid data={sortedRelatedPartyList} />
          }
          {
            selectedTab === "related-signatory-tab" &&
            <GridFeatureUnderdevelopment />
          }
          {
            selectedTab === "beneficial-owner-tab" &&
            <GridFeatureUnderdevelopment />

          }
          {
            selectedTab === "ubo-tab" &&
            <GridFeatureUnderdevelopment />
          }
        </>
      </div>

      <Modal modalId={MODAL_NAMES.ADMIN.RELATED_PARTY_MODAL}>
        <RelatedPartyModal />
      </Modal>
    </>
  );
});

export default Stakeholders;
