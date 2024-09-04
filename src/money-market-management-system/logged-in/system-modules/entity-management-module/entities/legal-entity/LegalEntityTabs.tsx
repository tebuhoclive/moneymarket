import "../entities/ClientTabs.scss";

interface TabProps {
  id: string;
  name: string;
  selectedTab: string;
  handleTabChange: (id: string) => void;
}

const Tab: React.FC<TabProps> = ({
  id,
  name,
  selectedTab,
  handleTabChange,
}) => {
  const handleClick = () => {
    handleTabChange(id);
  };

  return (
    <>
      <label className="tab" htmlFor={id} onClick={handleClick}>
        {name}
      </label>
      <input
        type="radio"
        id={id}
        name="tabs"
        checked={selectedTab === id}
        onChange={() => {}}
      />
    </>
  );
};

interface IProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const ClientTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (id: string): void => {
    setSelectedTab(id);
  };

  const tabItems = [
    { id: "natural-person-tab", name: "Natural Person" },
    { id: "legal-entity-tab", name: "Legal Entity" },
    { id: "counter-party-tab", name: "Counter Party" },
    { id: "agent-tab", name: "Agent" },
  ];

  const activeTabIndex = tabItems.findIndex((tab) => tab.id === selectedTab);

  return (
    <div className="client-tabs">
      <div className="tabs">
        {tabItems.map((tab, index) => (
          <Tab
            key={tab.id}
            id={tab.id}
            name={tab.name}
            selectedTab={selectedTab}
            handleTabChange={handleTabChange}
          />
        ))}
        {/* Slider indicator */}
        <span
          className="glider"
          // style={{ left: `calc(${activeTabIndex * 25}% + ${activeTabIndex * 2}px)` }}
        ></span>
      </div>
    </div>
  );
};

export default ClientTabs;
