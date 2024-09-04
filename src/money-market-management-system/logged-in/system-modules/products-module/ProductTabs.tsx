import { ChangeEvent } from "react";
import "./ProductTabs.scss";

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

const ProductTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="product-tabs">
      <div className="tabs">
        <Tab
          id="active-products-tab"
          name="Active"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={0}
        />
        <Tab
          id="new-product-tab"
          name="New"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default ProductTabs;
