import React, { useState } from 'react';
import Papa from 'papaparse';

type CSVRow = Array<string | undefined>;

const CSVFileParser: React.FC = () => {
    const [csvData, setCSVData] = useState<CSVRow[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            Papa.parse(file, {
                complete: (result) => {
                    const parsedData: CSVRow[] = result.data as CSVRow[];
                    setCSVData(parsedData);
                },
                header: false, // Set this to true if the first row contains headers
            });
        }
    };

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            <table>
                <thead>
                    <tr>
                        {csvData.length > 0 &&
                            csvData[0].map((header, index) => <th key={index}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {csvData.slice(14, 55).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {
                csvData.length !==0 &&
                <button className="btn btn-primary">Auto Allocate</button>
            }
        </div>
    );
};

export default CSVFileParser;

// import React, { useState } from 'react';
// import Papa from 'papaparse';

// type CSVRow = Array<string | undefined>;

// const CSVFileParser: React.FC = () => {
//   const [csvData, setCSVData] = useState<CSVRow[]>([]);

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];

//     if (file) {
//       Papa.parse(file, {
//         complete: (result) => {
//           const parsedData: CSVRow[] = result.data as CSVRow[];

//           // Find the index of the "Closing Balance" row
//           const closingBalanceIndex = parsedData.findIndex(row =>
//             row.includes('Closing Balance')
//           );

//           // Use the index to split the data into transactions and closing balance
//           const transactions = parsedData.slice(1, closingBalanceIndex);
//           const closingBalance = parsedData.slice(closingBalanceIndex)[0];

//           setCSVData(transactions);

//           // You can also do something with the closingBalance data if needed
//           console.log('Closing Balance:', closingBalance);
//         },
//         header: true,
//       });
//     }
//   };

//   return (
//     <div>
//       <input type="file" accept=".csv" onChange={handleFileUpload} />
//       <table>
//         <thead>
//           {csvData.length > 0 &&
//             csvData[0].map((header, index) => <th key={index}>{header}</th>)}
//         </thead>
//         <tbody>
//           {csvData.map((row, rowIndex) => (
//             <tr key={rowIndex}>
//               {row.map((cell, cellIndex) => (
//                 <td key={cellIndex}>{cell}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CSVFileParser;


