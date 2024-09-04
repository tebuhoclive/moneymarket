import { useState } from "react";
import { observer } from "mobx-react-lite";
import MODAL_NAMES from "../../../dialogs/ModalName";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";

import Modal from "../../../../../shared/components/Modal";
import BackButton from "../../../../../shared/components/back-button/BackButton";
import { useAppContext } from '../../../../../shared/functions/Context';
import { EntityFirstLevelApprovalGrid } from "../approvals/entity-approval-grids/EntityFirstLevelApprovalGrid";
import { EntitySecondLevelApprovalGrid } from "../approvals/entity-approval-grids/EntitySecondLevelApprovalGrid";
import { EntityThirdLevelApprovalGrid } from "../approvals/entity-approval-grids/EntityThirdLevelApprovalGrid";
import { EntityApprovedGrid } from "../approvals/entity-approval-grids/EntityApprovedGrid";
import NaturalPersonOfflineModal from "../../../dialogs/natural-person/natural-person-onboarding/NaturalPersonOfflineModal";
import { RiskRatingGrid } from "../approvals/entity-approval-grids/RiskRatingGrid";
import RiskRatingModal from "../../../dialogs/natural-person/natural-person-view/RiskRatingModal";
import { EntityDraftsPendingReviewGrid } from "../approvals/entity-approval-grids/EntityDraftsPendingReviewGrid";
import { EntityDraftsPendingSubmissionGrid } from "../approvals/entity-approval-grids/EntityDraftsPendingSubmissionGrid";
import EntityApprovalModal from "../../../dialogs/natural-person/natural-person-view/EntityApprovalModal";
import DraftApprovalTabs from "./DraftApprovalTabs";

type Tab = "Risk Rating" | "Drafts" | "First Level Approval" | "Second Level Approval" | "Third Level Approval (High Risk)" | "Approved"

interface ITabsProps {
  tab: Tab;
  setTab: React.Dispatch<React.SetStateAction<Tab>>;
}

const Tabs = (props: ITabsProps) => {
  const activeClass = (tab: Tab) => {
    if (props.tab === tab) return "uk-active";
    return "";
  };

  return (
    <div className="uk-margin-small-bottom">
      <ul className="kit-tabs" data-uk-tab>

        <li
          className={activeClass("Risk Rating")}
          onClick={() => props.setTab("Risk Rating")}
        >
          <a href="void(0)">Risk Rating</a>
        </li>

        <li
          className={activeClass("Drafts")}
          onClick={() => props.setTab("Drafts")}
        >
          <a href="void(0)">Drafts</a>
        </li>

        <li
          className={activeClass("First Level Approval")}
          onClick={() => props.setTab("First Level Approval")}
        >
          <a href="void(0)">First Level Approval</a>
        </li>

        <li
          className={activeClass("Second Level Approval")}
          onClick={() => props.setTab("Second Level Approval")}
        >
          <a href="void(0)">Second Level Approval</a>
        </li>

        <li
          className={activeClass("Third Level Approval (High Risk)")}
          onClick={() => props.setTab("Third Level Approval (High Risk)")}
        >
          <a href="void(0)">Third Level Approval (High Risk)</a>
        </li>

        <li
          className={activeClass("Approved")}
          onClick={() => props.setTab("Approved")}
        >
          <a href="void(0)">Approved (Profiles)</a>
        </li>

      </ul>
    </div>
  );
};

const EntityApprovals = observer(() => {
  const [tab, setTab] = useState<Tab>("Drafts");
  const [selectedTab, setSelectedTab] = useState("pending-submission-tab");

  const { store } = useAppContext();

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const riskRating = clients.filter(draft => draft.asJson.riskRating === "").map((clients) => {
    return clients.asJson;
  });

  const draftsPendingSubmission = clients.filter(draft => draft.asJson.profileStatus === "Draft Pending Submission").map((clients) => {
    return clients.asJson;
  });

  const draftsPendingReview = clients.filter(draft => draft.asJson.profileStatus === "Draft Pending Review").map((clients) => {
    return clients.asJson;
  });

  const firstLevelApproval = clients.filter(draft => draft.asJson.profileStatus === "Reviewed" || draft.asJson.profileStatus === "Submitted").map((clients) => {
    return clients.asJson;
  });

  const secondLevelApproval = clients.filter(draft => draft.asJson.profileStatus === "Approved First Level").map((clients) => {
    return clients.asJson;
  });

  const thirdLevelApproval = clients.filter(draft => draft.asJson.profileStatus === "Approved Second Level").map((clients) => {
    return clients.asJson;
  });

  const approved = clients.filter(draft => draft.asJson.profileStatus === "Approved").map((clients) => {
    return clients.asJson;
  });

  return (
    <ErrorBoundary>
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <Toolbar
              title="Entity Approvals"
              rightControls={
                <BackButton />
              }
            />
            <hr className="uk-margin-small" />
            <Tabs tab={tab} setTab={setTab} />
          </div>
          <div className="page-main-card">
            {
              tab === "Risk Rating" &&
              <RiskRatingGrid data={riskRating} />
            }
            {
              tab === "Drafts" &&
              <>
                <h4 className="main-title-md">Drafts</h4>
                <DraftApprovalTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                <hr />
                {selectedTab === "pending-submission-tab" && <EntityDraftsPendingSubmissionGrid data={draftsPendingSubmission} />}
                {selectedTab === "pending-review-tab" && <EntityDraftsPendingReviewGrid data={draftsPendingReview} />}
              </>
            }
            {
              tab === "First Level Approval" &&
              <EntityFirstLevelApprovalGrid data={firstLevelApproval} />
            }

            {
              tab === "Second Level Approval" &&
              <EntitySecondLevelApprovalGrid data={secondLevelApproval} />
            }

            {
              tab === "Third Level Approval (High Risk)" &&
              <EntityThirdLevelApprovalGrid data={thirdLevelApproval} />
            }

            {
              tab === "Approved" &&
              <EntityApprovedGrid data={approved} />
            }
          </div>

        </div>
      </div>
      <Modal modalId={MODAL_NAMES.ADMIN.NATURAL_PERSON_MODAL}>
        <NaturalPersonOfflineModal />
      </Modal>

      <Modal modalId={MODAL_NAMES.ADMIN.RISK_RATE_NATURAL_PERSON_MODAL}>
        <RiskRatingModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.ENTITY_APPROVAL_MODAL}>
        <EntityApprovalModal />
      </Modal>
    </ErrorBoundary>

  );
});

export default EntityApprovals;

