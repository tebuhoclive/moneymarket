import { ChangeEvent } from "react";
import "./ClientAccountStatementTabs.scss";

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

const ClientAccountStatementTabs = (props: IProps) => {

  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="client-statement-tabs">
      <div className="tabs">
        <Tab
          id="client-view-tab"
          name="Client View"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="correction-view-tab"
          name="Correction View"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <Tab
          id="fee-view-tab"
          name="IJG Fee View"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={3}
        />
        <Tab
          id="month-end-view-tab"
          name="Month End View"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={4}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default ClientAccountStatementTabs;
