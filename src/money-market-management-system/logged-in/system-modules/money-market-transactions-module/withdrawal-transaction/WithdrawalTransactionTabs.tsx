import { ChangeEvent } from "react";
import "./WithdrawalTransactionTabs.scss";

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

const WithdrawalTransactionTabs = (props: IProps) => {

  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="withdrawal-tabs">
      <div className="tabs">
        <Tab
          id="transaction-queue-tab"
          name="Transaction Queue"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        {/* <Tab
          id="back-dated-transaction-tab"
          name="Back Dated Transactions"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        /> */}
        <Tab
          id="first-level-approval-tab"
          name="1st Level Approval"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <Tab
          id="second-level-approval-tab"
          name="2nd Level Approval"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={3}
        />
        <Tab
          id="payment-queue-tab"
          name="Payment Queue"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={4}
        />
        <Tab
          id="batch-tab"
          name="Batch Files"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={5}
        />
        <Tab
          id="processed-tab"
          name="Processed Payments"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={6}
        />
        <Tab
          id="deleted-tab"
          name="Delete Transactions"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={7}
        />


        <span className="glider"></span>
      </div>
    </div>
  );
};

export default WithdrawalTransactionTabs;
