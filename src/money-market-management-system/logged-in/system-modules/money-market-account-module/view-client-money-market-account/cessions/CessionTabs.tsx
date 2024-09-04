import { ChangeEvent } from "react";
import "./CessionTabs.scss";

interface TabProps {
    id: string;
    name: string;
    selectedTab: string;
    handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Tab: React.FC<TabProps> = ({
    id, name, selectedTab, handleTabChange }) => {
    return (
        <>
            <label className="tab" htmlFor={id}>
                <div className="uk-width-1-2 uk-text-center">
                    {name}
                </div>

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

const CessionTabs = (props: IProps) => {
    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="cession-tabs">
            <div className="tabs">
                <Tab
                    id="pending-cessions-tab"
                    name="Pending"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="first-level-cessions-tab"
                    name="1st Level"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="second-level-cessions-tab"
                    name="2nd Level"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="approved-cessions-tab"
                    name="Approved"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="uplifted-cessions-tab"
                    name="Uplifted"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default CessionTabs;
