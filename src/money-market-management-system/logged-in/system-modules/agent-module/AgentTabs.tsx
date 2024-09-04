import { ChangeEvent } from "react";
import "./AgentTabs.scss";

interface TabProps {
  index:number;
  id: string;
  name: string;
  selectedTab: string;
  handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Tab: React.FC<TabProps> = ({
  index,
  id,
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

const AgentTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="agent-tabs">
      <div className="tabs">
        <Tab
          id="pending-tab"
          name="Pending Agents"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="verified-tab"
          name="Verified Agents"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        {/* Slider indicator */}
        <span
          className="glider"
        ></span>
      </div>
    </div>
  );
};

export default AgentTabs;
