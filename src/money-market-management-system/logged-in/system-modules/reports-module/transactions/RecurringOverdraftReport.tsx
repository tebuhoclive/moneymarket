// import { useEffect, useState } from "react";
// import Toolbar from "../../../shared/components/toolbar/Toolbar";
// import { observer } from "mobx-react-lite";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { getBase64ImageFromURL, getClientName } from "../../../../../shared/functions/MyFunctions";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import pdfMake from "pdfmake/build/pdfmake";
// import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";

// const RecurringWithdrawalOverDraftReport = observer(() => {
//     const { api, store } = useAppContext();
//     const [loading, setLoading] = useState(false);
//     const [_loading, _setLoading] = useState(false);
//     const todaysDate = Date.now();
//     const [reportDate, setReportDate] = useState(todaysDate);
//     const [logo, setLogo] = useState<any>(null);
//     const  recuralOverdrafts = store.recuralWithdrawalBalanceReport.all.sort((a, b) => {
//       if (a.asJson.clientId && b.asJson.clientId) {
//         return a.asJson.clientId.localeCompare(b.asJson.clientId);
//       } else {
//         const accountNumberA = parseInt(a.asJson.clientId.slice(1), 10);
//         const accountNumberB = parseInt(b.asJson.clientId.slice(1), 10);
  
//         return accountNumberA - accountNumberB;
//       }
//     });
//     const totalOverdrafts = recuralOverdrafts.reduce(
//       (acc, recurral) => acc + recurral.asJson.recurringAmount,
//       0
//     );
  
//     const content: any = {
//       content: [
//         {
//           image: `${logo}`,
//           width: 600,
//           margin: [0, -50, 0, 0],
//           alignment: "center",
//         },
  
//         {
//           text: "_______________________________________________________________________________________________",
//         },
//         {
//           text: `\n Recurring OverDraft Report`,
//           fontSize: 16,
//           bold: true,
//           margin: [0, 10, 0, 10],
//         },
//         {
//           table: {
//             headerRows: 1,
//             widths: ["auto", "auto", "auto", "auto", "auto", "auto","auto"],
//             body: [
//               [
//                 { text: "Transaction Date", style: "tableHeader", alignment: "left" },
//                 {
//                   text: "Client Name",
//                   style: "tableHeader",
//                   alignment: "left",
//                 },
//                 { text: "Client Account", style: "tableHeader", alignment: "left" },
//                 {
//                   text: "Recurring Amount",
//                   style: "tableHeader",
//                   alignment: "left",
//                 },
//                 {
//                     text: "Client Balance",
//                     style: "tableHeader",
//                     alignment: "left",
//                   },                
//             ],
  
//               ...recuralOverdrafts.map((recurral) => [
//                 // { text: closeOut.asJson.clientName, style: 'tableRow' },
//                 {
//                   text: recurral.asJson.date,
//                   style: "tableRow",
//                   alignment: "right",
//                 },
//                 { text: "", style: "tableRow", alignment: "right" },
//                 {
//                   text: getClientName(recurral.asJson,store),
//                   style: "tableRow",
//                   alignment: "right",
//                 },
//                 {
//                   text: recurral.asJson.clientId,
//                   style: "tableRow",
//                   alignment: "right",
//                 },
//                 {
//                   text: recurral.asJson.clientBalance,
//                   style: "tableRow",
//                   alignment: "right",
//                 },
//               ]),
//               [
//                 { text: "Totals", style: "tableHeader", alignment: "right" },
//                 { text: "-", style: "tableHeader", alignment: "right" },
//                 {
//                   text: `${(totalOverdrafts)}`,
//                   style: "tableHeader",
//                   alignment: "right",
//                 },
//                 { text: ``, style: "tableHeader", alignment: "right" },
//               ],
//             ],
//             layout: {
//               fillColor: "#fff", // Background color for the table cells
//               hLineWidth: 0.01, // Adjust the thickness of horizontal lines
//               vLineWidth: () => 0.01, // Adjust the thickness of vertical lines
//             },
  
//             margin: [0, 20, 0, 10],
//             fontSize: 7,
//             style: "table",
//           },
//         },
//         {
//           text: `\n Exported Date: ${dateFormat_YY_MM_DD(Date.now())}`,
//           fontSize: 8,
//           bold: false,
//         },
//       ],
//       styles: {
//         tableHeader: {
//           bold: true,
//           fontSize: 9,
//           color: "black",
//         },
//         tableRow: {
//           bold: false,
//           fontSize: 8,
//           color: "black",
//         },
//       },
//     };
  
//     const handleExport = () => {
//       pdfMake
//         .createPdf(content)
//         .download(`Recurring Instruction Report ${dateFormat_YY_MM_DD(Date.now())} .pdf`);
//     };
  
//     // const onInitiate = async (
//     //   accountNumber: string,
//     //   productCode: string,
//     //   amount: number,
//     //   cid: string
//     // ) => {
//     //   try {
//     //     setLoading(true);
//     //     await initiateInActiveAccount(
//     //       api,
//     //       store,
//     //       accountNumber,
//     //       productCode,
//     //       amount,
//     //       cid
//     //     );
//     //   } catch (error) {
//     //   } finally {
//     //     setLoading(false);
//     //   }
//     // };
  
//     useEffect(() => {
//       const loadAll = async () => {
//         const logo = await getBase64ImageFromURL(
//           `${process.env.PUBLIC_URL}/ijg-header.jpg`
//         );
//         if (logo) {
//           setLogo(logo);
//         }
//         await api.recurringWithdrawalInstruction.getAll();
//         // try {
//         //     setLoading(true)
//         //     if (store.closeOutStore.isEmpty) {
//         //         await api.closeOutApi.getAll();
//         //     }
//         //     setLoading(false)
//         // } catch (error) { }
//       };
//       loadAll();
//     }, [api.recurringWithdrawalInstruction]);
  
//     return (
//       <div className="page uk-section uk-section-small">
//         <div className="uk-container uk-container-expand">
//           <div className="sticky-top">
//             <Toolbar
//               title="Recurring Overdraft Report"
//               rightControls={
//                 <form>
//                   <div className="uk-form-controls uk-flex">
//                     <label className="uk-form-label uk-text-white" htmlFor="">
//                       Report Date
//                     </label>
//                     <input
//                       id="date"
//                       value={dateFormat_YY_MM_DD(reportDate)}
//                       className="uk-input uk-form-small"
//                       type="date"
//                       onChange={(e) => setReportDate(e.target.valueAsNumber)}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setReportDate(Date.now())}
//                       className="btn btn-danger"
//                     >
//                       Clear
//                     </button>
//                   </div>
//                 </form>
//               }
//             />
//             <Toolbar
//               rightControls={
//                 <div className="uk-form-controls uk-flex">
//                   {!loading && (
//                     <button className="btn btn-primary" onClick={handleExport}>
//                       Export (PDF)
//                     </button>
//                   )}
//                 </div>
//               }
//             />
//             <hr />
//           </div>
//           {!loading && (
//             <div className="page-main-card uk-card uk-card-default uk-card-body">
//               <table className="uk-table">
//                 <thead>
//                   <tr>
//                     {/* <th>Client Name</th> */}
//                     <th>Transaction Date</th>
//                     <th>Client Name</th>
//                     <th>Client Account</th>
//                     <th>Recurring Amount</th>
//                     <th>Client Balance</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recuralOverdrafts.map((recurral) => (
//                     <tr key={recurral.asJson.id}>
//                       {/* <td>{closeOut.asJson.clientName}</td> */}
//                       <td>{recurral.asJson.date}</td>
//                       <td>
//                        {getClientName(recurral.asJson,store)}
//                       </td>
//                       <td>{recurral.asJson.clientName}</td>
//                       <td>{recurral.asJson.clientId}</td>
//                       <td>{recurral.asJson.recurringAmount}</td>
//                       <td>{recurral.asJson.clientBalance}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//           {loading && <LoadingEllipsis />}
//         </div>
//       </div>
//     );
//   });
  
// export default RecurringWithdrawalOverDraftReport;

import React from 'react'

const RecurringOverdraftReport = () => {
  return (
    <div>
      
    </div>
  )
}

export default RecurringOverdraftReport
