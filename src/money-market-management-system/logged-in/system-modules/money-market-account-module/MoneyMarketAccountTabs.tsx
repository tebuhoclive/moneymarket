import { ChangeEvent } from "react";
import "./MoneyMarketAccountTabs.scss";

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

const MoneyMarketAccountTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="account-main-tabs">
      <div className="tabs">
        <Tab
          id="active-accounts-tab"
          name="Active"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={0}
        />
        <Tab
          id="inactive-accounts-tab"
          name="Inactive"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="archived-accounts-tab"
          name="Archived"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default MoneyMarketAccountTabs;
