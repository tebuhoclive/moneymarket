import { ChangeEventHandler, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import useAutoSave from "../../../../shared/hooks/useAutoSave";
import { FAILEDACTION } from "../../../../shared/models/Snackbar";
import { IBond } from "../../../../shared/models/instruments/BondModel";
import { IEquity } from "../../../../shared/models/instruments/EquityModel";
import { IFixedDeposit } from "../../../../shared/models/instruments/FixedDepositModel";
import { ITreasuryBill } from "../../../../shared/models/instruments/TreasuryBillModel";
import { IUnitTrust } from "../../../../shared/models/instruments/UnitTrustModel";
import { InstrumentStatus, dateFormat } from "../../../../shared/utils/utils";


interface IUnitProps {
    unit: IUnitTrust;
}
export const UnitTrustItem = (props: IUnitProps) => {
    const { unit } = props;
    const { api, ui } = useAppContext();


    const { autoSave } = useAutoSave({ timeout: 2000 });

    
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState(() => unit.instrumentStatus);

    const onStatusChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const selectedStatus = e.target.value as InstrumentStatus;
        setStatus(selectedStatus);
        try {
            autoSave(async () => {
                setLoading(true);
                await api.instruments.unitTrust.update({
                    ...unit,
                    instrumentStatus: selectedStatus,
                });
                setLoading(false);
            });
        } catch (error) {
            FAILEDACTION(ui);
        }
    };

    return (
        <div className={`admin-page-item uk-card uk-card-body uk-card-small ${unit.instrumentStatus}`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {unit.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">share code</span>
                        {unit.sharecode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Bloomberg Code</span>
                        {unit.bloombergCode}
                    </p>
                </div>
                <div className="uk-flex">
                    <div className="uk-margin">
                        <select className="uk-select uk-form-small uk-form-width-medium"
                            aria-label="Select"
                            value={status}
                            onChange={onStatusChange}>
                            <option value={"pending"}>pending</option>
                            <option value={"approved"}>approved</option>
                        </select>
                        {loading && (
                            <div data-uk-spinner="ratio: .5"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface IFDepositProps {
    deposit: IFixedDeposit;
}
export const FixedDepositItem = (props: IFDepositProps) => {
    const { deposit } = props;
    const { api, ui } = useAppContext();
    const { autoSave } = useAutoSave({ timeout: 2000 });
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState(() => deposit.instrumentStatus);

    const onStatusChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const selectedStatus = e.target.value as InstrumentStatus;
        setStatus(selectedStatus);
        try {
            autoSave(async () => {
                setLoading(true);
                await api.instruments.fixedDeposit.update({
                    ...deposit,
                    instrumentStatus: selectedStatus,
                });
                setLoading(false);
            });
        } catch (error) {
            FAILEDACTION(ui);
        }
    };

    return (
        <div className={`admin-page-item uk-card uk-card-body uk-card-small ${deposit.instrumentStatus}`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {deposit.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Interest Rate</span>
                        {deposit.interestRate} {" ( % )"}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Maturity Date</span>
                        {dateFormat(deposit.maturityDate)}
                    </p>
                </div>
                <div className="uk-flex">
                    <div className="uk-margin">
                        <select className="uk-select uk-form-small uk-form-width-medium"
                            aria-label="Select"
                            value={status}
                            onChange={onStatusChange}>
                            <option value={"pending"}>pending</option>
                            <option value={"approved"}>approved</option>
                        </select>
                        {loading && (
                            <div data-uk-spinner="ratio: .5"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ITBillProps {
    tbill: ITreasuryBill;
}
export const TreasuryBillItem = (props: ITBillProps) => {
    const { tbill } = props;
    const { api, ui } = useAppContext();
    const { autoSave } = useAutoSave({ timeout: 2000 });
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState(() => tbill.instrumentStatus);

    const onStatusChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const selectedStatus = e.target.value as InstrumentStatus;
        setStatus(selectedStatus);
        try {
            autoSave(async () => {
                setLoading(true);
                await api.instruments.treasuryBill.update({
                    ...tbill,
                    instrumentStatus: selectedStatus,
                });
                setLoading(false);
            });
        } catch (error) {
            FAILEDACTION(ui);
        }
    };

    return (
        <div className={`admin-page-item uk-card uk-card-body uk-card-small ${tbill.instrumentStatus}`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {tbill.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Issue Date</span>
                        {dateFormat(tbill.issueDate)}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Maturity Date</span>
                        {dateFormat(tbill.maturityDate)}
                    </p>
                </div>
                <div className="uk-flex">
                    <div className="uk-margin">
                        <select className="uk-select uk-form-small uk-form-width-medium"
                            aria-label="Select"
                            value={status}
                            onChange={onStatusChange}>
                            <option value={"pending"}>pending</option>
                            <option value={"approved"}>approved</option>
                        </select>
                        {loading && (
                            <div data-uk-spinner="ratio: .5"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface IEquityProps {
    equity: IEquity;
}
export const EquityItem = (props: IEquityProps) => {
    const { equity } = props;
    const { api, ui } = useAppContext();
    const { autoSave } = useAutoSave({ timeout: 2000 });
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState(() => equity.instrumentStatus);

    const onStatusChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const selectedStatus = e.target.value as InstrumentStatus;
        setStatus(selectedStatus);
        try {
            autoSave(async () => {
                setLoading(true);
                await api.instruments.equity.update({
                    ...equity,
                    instrumentStatus: selectedStatus,
                });
                setLoading(false);
            });
        } catch (error) {
            FAILEDACTION(ui);
        }
    };

    return (
        <div className={`admin-page-item uk-card uk-card-body uk-card-small ${equity.instrumentStatus}`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {equity.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Share Code</span>
                        {equity.sharecode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Bloomberg Code</span>
                        {equity.bloombergCode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">isin</span>
                        {equity.isin}
                    </p>
                </div>
                <div className="uk-flex">
                    <div className="uk-margin">
                        <select className="uk-select uk-form-small uk-form-width-medium"
                            aria-label="Select"
                            value={status}
                            onChange={onStatusChange}>
                            <option value={"pending"}>pending</option>
                            <option value={"approved"}>approved</option>
                        </select>
                        {loading && (
                            <div data-uk-spinner="ratio: .5"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


interface IBondProps {
    bond: IBond;
}
export const BondItem = (props: IBondProps) => {
    const { bond } = props;
    const { api, ui } = useAppContext();
    const { autoSave } = useAutoSave({ timeout: 2000 });
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState(() => bond.instrumentStatus);

    const onStatusChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const selectedStatus = e.target.value as InstrumentStatus;
        setStatus(selectedStatus);
        try {
            autoSave(async () => {
                setLoading(true);
                await api.instruments.bond.update({
                    ...bond,
                    instrumentStatus: selectedStatus,
                });
                setLoading(false);
            });
        } catch (error) {
            FAILEDACTION(ui);
        }
    };

    return (
        <div className={`admin-page-item uk-card uk-card-body uk-card-small ${bond.instrumentStatus}`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {bond.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Coupon Rate</span>
                        {bond.couponRate} {"( % )"}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Coupon Frequency</span>
                        {bond.couponFrequency}
                    </p>
                </div>
                <div className="uk-flex">
                    <div className="uk-margin">
                        <select className="uk-select uk-form-small uk-form-width-medium"
                            aria-label="Select"
                            value={status}
                            onChange={onStatusChange}>
                            <option value={"pending"}>pending</option>
                            <option value={"approved"}>approved</option>
                        </select>
                        {loading && (
                            <div data-uk-spinner="ratio: .5"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};