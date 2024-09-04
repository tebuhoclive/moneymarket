import { ChangeEvent } from "react";
import "./DeletedDepositsTabs.scss";

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
      <label className="deleted-tab" htmlFor={id}>
        {name}
      </label>
      <input
        type="radio"
        id={id}
        name="deleted-tabs"
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

const DeletedDepositsTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="deleted-deposits-tabs">
      <div className="deleted-tabs">
        <Tab
          id="non-deposits-deleted-view-tab"
          name="Deleted Non Deposits"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="deleted-from-statement-view-tab"
          name="Deleted Corrections"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
     
        <span className="deleted-glider"></span>
      </div>
    </div>
  );
};

export default DeletedDepositsTabs;
