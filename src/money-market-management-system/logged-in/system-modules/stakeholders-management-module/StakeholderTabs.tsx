import { ChangeEvent } from "react";
import "./StakeholderTabs.scss";

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

const StakeholderTabs = (props: IProps) => {
    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="tab-container-settings">
            <div className="tabs">
                <Tab
                    id="all-stakeholders-tab"
                    name="All Stakeholders"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={1}
                />
                <Tab
                    id="related-party-tab"
                    name="Related Party"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={1}
                />
                <Tab
                    id="related-signatory-tab"
                    name="Related Party/Signatory"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={2}
                />
                <Tab
                    id="beneficial-owner-tab"
                    name="Beneficial Owner"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={3}
                />
                <Tab
                    id="ubo-tab"
                    name="UBO"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={4}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default StakeholderTabs;
