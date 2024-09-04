import { useState } from "react";
import { observer } from "mobx-react-lite";

import Toolbar from "../../shared/components/toolbar/Toolbar";
import SettingsTabs from "./SettingsTabs";
import IssuerList from "./IssuerList";

import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import CounterPartyList from "./CounterPartyList";

import { UsersGrid } from "./UsersGrid";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import GridFeatureUnderdevelopment from "../../../../shared/components/under-development/GridFeatureUnderdevelopment";
import { Box } from "@mui/material";
import TransactionSettings from "./TransactionSettings";

const AdminSettings = observer(() => {
  const [selectedTab, setSelectedTab] = useState("users-tab");

  const { store } = useAppContext();

  const users = store.user.all.map((user) => { return user.asJson });
  const usersList = users.map((user) => user);

  const onAddNewUser = () => {
    store.user.clearSelected();
    showModalFromId(MODAL_NAMES.ADMIN.USER_MODAL);
  }

  const selectedTabName = () => {
    switch (selectedTab) {
      case "users-tab":
        return "Users";
      case "issuers-tab":
        return "Issuers";
      case "counter-parties-tab":
        return "Counter Parties";
      case "products-tab":
        return "Products";
      case "transactions-tab":
        return "Transactions";
      case "portal-users-tab":
        return "Portal Users";
      case "early-distro-account-tab":
        return "Early Distribution Accounts";
      default:
        break;
    }
  }


  return (
    <ErrorBoundary>
      <div className="uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <Toolbar
              leftControls={
                <div className="uk-grid uk-grid-small uk-child-width-1-1" data-uk-grid>
                  <h4 className="main-title-lg uk-margin-remove">Settings</h4>
                  <h4 className="main-title-sm uk-margin-remove">{selectedTabName()}</h4>
                </div>
              }
            />
          </div>
          <hr />
          <ErrorBoundary>
            <div>
              <SettingsTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
              {selectedTab === "users-tab" &&
                <UsersGrid data={usersList} />
              }
              {selectedTab === "portal-users-tab" &&
                <GridFeatureUnderdevelopment />
              }
              {selectedTab === "issuers-tab" &&
                // <IssuerList />
                <GridFeatureUnderdevelopment />
              }
              {selectedTab === "transactions-tab" &&
                <TransactionSettings />
              }
              {selectedTab === "products-tab" &&
                <>

                </>
              }
              {selectedTab === "counter-parties-tab" &&
                // <CounterPartyList />
                <GridFeatureUnderdevelopment />
              }
              {selectedTab === "early-distro-account-tab" &&
                <GridFeatureUnderdevelopment />
              }
            </div>
          </ErrorBoundary>
        </div >
      </div >
    </ErrorBoundary >
  );
});

export default AdminSettings;
