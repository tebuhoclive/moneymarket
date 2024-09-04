import { ChangeEvent } from "react";
import "./NaturalPersonViewTabs.scss";

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

const NaturalPersonViewTabs = (props: IProps) => {

  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="natural-person-view-tabs">
      <div className="tabs">
        <Tab
          id="general-information-tab"
          name="General Information"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="contact-details-tab"
          name="Contact Details"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <Tab
          id="banking-details-tab"
          name="Banking Details"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={3}
        />
        <Tab
          id="related-parties-tab"
          name="Related Parties"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={4}
        />
        <Tab
          id="money-market-account-tab"
          name="Money Market Accounts"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={5}
        />
        <Tab
          id="transaction-instruction-tab"
          name="Transaction Instructions"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={6}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default NaturalPersonViewTabs;
