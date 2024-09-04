import { ChangeEvent } from "react";
import "./ActiveAccountTabs.scss";

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

const ActiveAccountTabs = (props: IProps) => {
    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="active-account-tabs">
            <div className="tabs">
                <Tab
                    id="all-accounts-tab"
                    name="All Accounts"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={0}
                />
                <Tab
                    id="zero-balance-accounts-tab"
                    name="Zero Balance Accounts"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={0}
                />
                <Tab
                    id="closed-accounts-tab"
                    name="Closed Accounts"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={1}
                />
                <Tab
                    id="dormant-accounts-tab"
                    name="Dormant Accounts"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={2}
                />
                <Tab
                    id="fia-compliance-tab"
                    name="FIA Compliance"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={3}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default ActiveAccountTabs;
