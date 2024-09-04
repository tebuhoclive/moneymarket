import { ChangeEvent } from "react";
import "./TransactionMoneyMarketAccountTabs.scss";

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

const TransactionMoneyMarketAccountTabs = (props: IProps) => {
    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="account-module-tabs">
            <div className="tabs">
                <Tab
                    id="deposit-tab"
                    name="Deposit"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="withdrawal-tab"
                    name="Withdrawal"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="close-outs-tab"
                    name="Close Outs"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="switch-tab"
                    name="Switch"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="recurring-withdrawal-tab"
                    name="Recurring Withdrawal"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="debit-order-tab"
                    name="Debit Order"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="rate-change-tab"
                    name="Rate Change"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default TransactionMoneyMarketAccountTabs;
