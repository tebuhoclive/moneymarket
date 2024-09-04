import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import {
  getBase64ImageFromURL,
  getNaturalPersonsName,
} from "../../../../../shared/functions/MyFunctions";
import { generateDepositTableSection } from "./GenerateDepositTableSection";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { getTimeFromTimestamp } from "../../../../../shared/functions/DateToTimestamp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../../../shared/functions/Context";

interface IProps {
  title: string;
  transactions: any[]; // Updated the type to any[]
}

export const ExportDepositGridData = ({ transactions, title }: IProps) => {
  const now = Date.now();
  const { store } = useAppContext();
  const totals = transactions.reduce((sum, deposit) => sum + deposit.amount, 0);

  const generatePDF = async (tableData: any[]) => {
    try {
      const logo = await getBase64ImageFromURL(
        `${process.env.PUBLIC_URL}/ijg-header.jpg`
      );

      // Add clientName to each transaction
      const transactionsWithClientName = tableData.map((transaction) => {
        const clientName = getNaturalPersonsName(transaction.entity, store);
        return {
          ...transaction,
          clientName: clientName,
        };
      });

      

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
            text: `\n\ ${title} Transactions`,
            fontSize: 8,
            bold: true,
          },
          // Table Section
          generateDepositTableSection(transactionsWithClientName),

          // Summary Section
          {
            text: "_______________________________________________________________________________________________",
          },
          {
            text: `Total ${title} Transactions: ${transactionsWithClientName.length}`,
            fontSize: 9,
            bold: false,
            margin: [0, 10, 0, 10],
          },
          {
            text: `Total Amount: ${(totals)}`,
            fontSize: 9,
            bold: false,
            margin: [0, 10, 0, 10],
          },
          {
            text: `Date/Time Exported: ${dateFormat_YY_MM_DD(
              now
            )} ${getTimeFromTimestamp(now)}`,
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

      pdfMake
        .createPdf(documentDefinition)
        .download(
          `${title} Transaction Report ${dateFormat_YY_MM_DD(now)}.pdf`
        );
    } catch (error) {
      console.log("errorPdf: ", error);
    }
  };

  return (
    <div className="uk-container uk-container-expand">
      <div className="uk-margin">
        <div className="uk-flex">
          <button
            className="btn btn-primary"
            onClick={() => generatePDF(transactions)}
            type="button">
            Export PDF <FontAwesomeIcon icon={faFilePdf} />
          </button>
        </div>
      </div>
    </div>
  );
};
