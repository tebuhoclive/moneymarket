// playground requires you to assign document definition to a variable called dd
export interface IProps {
    fromUnitTrust: string;
    valueOfUnits: number
}

const pdfMake = require('pdfmake');

export const generatePDF = (data:any) =>{
    const docDefinition = {
        content: data.content,
        styles: data.styles,
        defaultStyle: data.defaultStyle,
    };

    const pdf = pdfMake.createPdf(docDefinition);
    return pdf;
}

export const file = {
    content: [
        { text: 'Prescient IJG Unit Trust Management Company', style: 'header' },
        { text: 'P O Box 186', style: 'header' },
        { text: 'Windhoek', style: 'header' },
        { text: 'Namibia', style: 'header' },
        { text: 'Attention: Brent Petersen', style: 'text' }, 'Fax: +264 61 304 671',
        { text: '5 September 2023', style: 'subheader' },
        'Dear Brent, ',
        { text: 'REDEMPTION REQUEST', style: 'subheader' },
        'Good day, ', { text: 'Kindly action the following redemption request:', style: 'text' },
        {
            style: 'tableExample',
            table: {
                body: [
                    [{ text: 'Client Number', bold: true }, '3568'],
                    [{ text: 'Entity Name', bold: true }, 'IJG Securities Money Market Trust'],
                    [{ text: 'Registered Number', bold: true }, 'T366/07'],
                    [{ text: 'From Unit Trust Fund', bold: true }, 'IJG Securities Money Market Trust'],
                    [{ text: 'Value of Units', bold: true }, 'IJG Securities Money Market Trust'],
                ]
            }
        }, 'Our banking details are as follows:',
        {
            style: 'tableExample',
            table: {
                body: [
                    [{ text: 'Name of Account Holder', bold: true }, 'IJG Securities Money Market Trust'],
                    [{ text: 'Bank', bold: true }, 'Standard Bank Namibia'],
                    [{ text: 'Branch Code', bold: true }, '082772'],
                    [{ text: 'Account Number', bold: true }, '042739330'],
                    [{ text: 'Account Type', bold: true }, 'Current'],
                ]
            }
        }, 'Yours sincerely',
    ],
    styles: {
        content: {
            fontStyle: ''
        },
        header: {
            fontSize: 16,
            bold: true,
            margin: [0, 0, 0, 0]
        },
        text: {
            margin: [0, 5, 0, 0]
        },
        subheader: {
            fontSize: 13,
            bold: true,
            margin: [0, 10, 0, 5]
        },
        tableExample: {
            margin: [0, 5, 0, 15]
        },
        tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
        }
    },
    defaultStyle: {
        // alignment: 'justify'
    }

}

const pdf = generatePDF(file);
pdf.download('redemption-request.pdf'); // You can also use pdf.open() to open it in a new window