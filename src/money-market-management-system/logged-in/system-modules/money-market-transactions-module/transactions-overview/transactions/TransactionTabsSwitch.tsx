import { ChangeEvent } from "react";
import "./TransactionTabsSwitch.scss";

interface TabProps {
    index: number;
    id: string;
    name: string;
    selectedTab: string;
    handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
// 
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

const TransactionTabsSwitch = (props: IProps) => {

    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="transaction-tabs">
            <div className="tabs">
                <Tab
                    id="transaction-queue-tab"
                    name="Transaction Queue"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={1}
                />
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
                    id="processed-tab"
                    name="Completed"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={6}
                />
                {/* <Tab
          id="non-transactions-tab"
          name="Non Transactions"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={7}
        />
        <Tab
          id="unallocated-tab"
          name="Unallocated"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={8}
        /> */}
                <Tab
                    id="deleted-tab"
                    name="Deleted"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={7}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default TransactionTabsSwitch;
