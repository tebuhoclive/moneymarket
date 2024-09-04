import { ChangeEvent } from "react";
import "./RecurringWithdrawalsTabs.scss";

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

const RecurringWithdrawalTabs = (props: IProps) => {

  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="recurring-withdrawal-tabs">
      <div className="tabs">
        <Tab
          id="pending-tab"
          name="Pending"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="verified-tab"
          name="Verified"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default RecurringWithdrawalTabs;
