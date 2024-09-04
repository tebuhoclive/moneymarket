import { ChangeEvent } from "react";
import "./AutoAllocatedTab.scss";

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

export type BankUploadTabNames = 'deposit-transaction-queue-tab' | 'back-dated-transaction-queue-tab' | 'non-deposits-tab' | 'unallocated-tab' | 'allocated-tab' | 'first-level-approval-tab' | 'second-level-approval-tab' | 'request-source-of-funds-tab' | 'completed-tab' | 'deleted-tab'

const AutoAllocatedTab = (props: IProps) => {
    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="auto-tab">
            <div className="tabs">
                <Tab
                    id="deposit-transaction-queue-tab"
                    name="Transaction Queue"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={1}
                />
                <Tab
                    id="non-deposits-tab"
                    name="Non Deposits"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={2}
                />
                <Tab
                    id="completed-tab"
                    name="Completed"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={5}
                />
                <Tab
                    id="deleted-tab"
                    name="Deleted"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={6}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default AutoAllocatedTab;
