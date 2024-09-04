import { ChangeEvent } from "react";
import "./DraftApprovalTabs.scss";

export type DraftApprovalTabNames = 'pending-submission-tab' | 'pending-review-tab'
interface TabProps {
  index: number;
  id: DraftApprovalTabNames;
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
        checked={selectedTab === id ? true :false}
        onChange={handleTabChange}
      />
    </>
  );
};

interface IProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const DraftApprovalTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="draft-approval-tabs">
      <div className="tabs">
        <Tab
          id="pending-submission-tab"
          name="Pending Submission"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="pending-review-tab"
          name="Pending Review"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default DraftApprovalTabs;
