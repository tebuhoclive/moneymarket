import { ChangeEvent } from "react";
import "./ClientBankAccountReportTabs.scss";

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

const ClientBankAccountReportTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="client-account-bank-report">
      <div className="tabs">
        <Tab
          id="natural-person-tab"
          name="Natural Person"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
           <Tab
          id="legal-entity-tab"
          name="Legal Entity"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default ClientBankAccountReportTabs;
