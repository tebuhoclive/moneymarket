import "../MonthEndGrid.scss"
import { observer } from "mobx-react-lite";
import { MonthEndReportGridComponent } from "./MonthEndReportGridComponent";

interface MonthEndReportInterface {
    id: string;
    accountNumber: string;
    accountName: string;
    clientName: string;
    entityNumber: string;
    interest: number;
    days: number;
    lastRate: number;
    lastBalance: number;
}



interface IProps {
    data: MonthEndReportInterface[];
    year: string;
    month: string;
}


export const MonthEndReportGrid = observer(({ data, year, month }: IProps) => {
    return (
        <div>
            <MonthEndReportGridComponent data={data} year={year} month={month} />
        </div>
    )
})
