import { ChangeEvent } from "react";
import "./SettingsTabs.scss";

interface TabProps {
  index: number;
  id: string;
  name: string;
  selectedTab: string;
  handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Tab: React.FC<TabProps> = ({
  id,
  index,
  name,
  selectedTab,
  handleTabChange,
}) => {
  return (
    <>
      <label className="tab" htmlFor={id}>
        {name}
      </label>
      <input
        type="radio"
        id={id}
        name="tabs"
        checked={selectedTab === id}
        onChange={handleTabChange}
      />
    </>
  );
};

interface IProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="tab-settings">
      <div className="tabs">
        <Tab
          id="users-tab"
          name="Users"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="portal-users-tab"
          name="Portal Profiles"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <Tab
          id="transactions-tab"
          name="Transactions"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={3}
        />
        <Tab
          id="products-tab"
          name="Products"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={4}
        />
        <Tab
          id="issuers-tab"
          name="Issuers"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={5}
        />
        <Tab
          id="counter-parties-tab"
          name="Counter Parties"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={6}
        />
        <Tab
          id="early-distro-account-tab"
          name="Early Distribution Accounts"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={6}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default SettingsTabs;
