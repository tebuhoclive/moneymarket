import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { getBase64ImageFromURL } from "../../../../../shared/functions/MyFunctions";
import {  dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import {getTimeFromTimestamp } from "../../../../../shared/functions/DateToTimestamp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { IRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
import { generateRecurringTableSection } from "./GenerateRecurringWithdrawalTableSection";

interface IProps {
  title: string;
  transactions: IRecurringWithdrawalInstruction[];
}

export const ExportRecurringGridData = ({ transactions, title }: IProps) => {
  const now = Date.now();

  const totals = transactions.reduce((sum, deposit) => sum + deposit.amount, 0);

  const generatePDF = async (tableData: IRecurringWithdrawalInstruction[]) => {
    try {
      const logo = await getBase64ImageFromURL(
        `${process.env.PUBLIC_URL}/ijg-header.jpg`
      );

      const documentDefinition: TDocumentDefinitions = {
        content: [
          // Header Section
          {
            image: `${logo}`,
            width: 600,
            margin: [0, -50, 0, 0],
            alignment: "center",
          },

          {
            text: "_______________________________________________________________________________________________",
          },
          {
            text: `\n ${title} Transactions`,
            fontSize: 8,
            bold: true,
          },
          // Table Section
          generateRecurringTableSection(tableData),

          // Summary Section
          {
            text: "_______________________________________________________________________________________________",
          },
          {
            text: `Total ${title} Transactions: ${tableData.length}`,
            fontSize: 9,
            bold: false,
            margin: [0, 10, 0, 10],
          },
          {
            text: `Total Amount: N$${(totals)}`,
            fontSize: 9,
            bold: false,
            margin: [0, 10, 0, 10],
          },
          {
            text: `Date/Time Exported: ${dateFormat_YY_MM_DD(now)} ${getTimeFromTimestamp(now)}`,
            fontSize: 9,
            bold: false,
            margin: [0, 10, 0, 10],
          },
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 9,
            color: "black",
          },
        },
      };

      pdfMake.createPdf(documentDefinition).download(`${title} Transaction Report ${dateFormat_YY_MM_DD(now)}.pdf`);
    } catch (error) {
      console.log("errorPdf: ", error);
    }
  };

  return (
    <div className="uk-container uk-container-expand">
      <div className="uk-margin">
        <div className="uk-flex">
          <button className="btn btn-primary" onClick={() => generatePDF(transactions)} type="button"          >
            Export PDF <FontAwesomeIcon icon={faFilePdf}/>
          </button>
        </div>
      </div>
    </div>
  );
};
