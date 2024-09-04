import { ChangeEvent } from "react";
import "./MonthEndTabs.scss";

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

const MonthEndTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="month-end-tabs">
      <div className="tabs">
        {/* <Tab
          id="instructions"
          name="Road Map"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={0}
        /> */}
        <Tab
          id="in-progress-tab"
          name="In Progress"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={0}
        />
        <Tab
          id="completed-tab"
          name="Completed"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default MonthEndTabs;
