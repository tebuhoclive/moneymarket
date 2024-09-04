import MoneyMarketAccountApi from "../../../../../../../../shared/apis/money-market-account/MoneyMarketAccountApi";
import { IStatementTransaction } from "../../../../../../../../shared/models/StatementTransactionModel";
import { IMoneyMarketAccount } from "../../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { ACTIVE_ENV } from "../../../../../../CloudEnv";

var today: Date = new Date();
var currentHour: number = today.getHours();
var greeting: string = "";

if (currentHour < 12) {
  greeting = "Good Morning";
} else if (currentHour < 18) {
  greeting = "Good Afternoon";
} else {
  greeting = "Good Evening";
}


interface IStatementRunData {
  id: string,
  entityNumber?: string;
  clientName?: string,
  accountNumber?: string;
  product?: string;
  instrumentName?: string;
  emailAddress?: string;
  rate?: number;
  postalAddress?: string;
}

//not successful service providers
//send
export async function sendStatements(
  account: IStatementRunData,
  // filteredStatementTransactions: IStatementTransaction[],
  // totalDays: number,
  // totalDistribution: Number,
  startDate: Date,
  endDate: Date,
) {

  const monthName = startDate.toLocaleString('default', { month: 'long' });


  // to: ["ict@lotsinsights.com", "ndapanda@lotsinsights.com", "andri@ijg.net", "narib98jerry@gmail.com", "abisai@lotsinsights.com", "maunda@ijg.net"],

  try {
    const emailInfo = {
      from: "stanzanarib@gmail.com",
      to: ["stanzanarib@gmail.com"],
      htmlContent: ` 
         <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IJG Money Market System - Statement</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .container {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        width: 100%;
      }
    
      .header h4 {
        color: #666666;
        font-size: 18px;
        margin-bottom: 10px;
      }
      .content {
        color: #666666;
        font-size: 14px;
        line-height: 1.6;
        margin-top: 20px;
      }
      .signature {
        font-style: italic;
        color: #999999;
        font-size: 14px;
        margin-top: 20px;
      }
   .footer img {
        margin-top: 20px;
        width: 100%;
        max-width: 500px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h4>Dear ${account.clientName},</h4>
      </div>
      <div class="content">
        <p>Attached is your statement for ${monthName}.</p>
        <p>
          If you have any questions, please reply to this email or call us at
          +264 (81) 958 3500.
        </p>
      </div>
      <div class="signature">
        <p>Kind regards,<br />IJG Money Market System</p>
      </div>
      <div class="footer">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/ijgmms-testing.appspot.com/o/footerFirebase.png?alt=media&token=943b2826-ef06-4557-9138-c2f33e8ed370"
          alt="IJG Money Market System Logo"
        />
      </div>
    </div>
  </body>
</html>
            
            `,
      account: account,
      // transactions: filteredStatementTransactions,
      // totalDays: totalDays,
      // totalDistribution: totalDistribution,
      startDate: startDate,
      endDate: endDate

    };

    const url = `${ACTIVE_ENV.url}sendClientStatementEmailV2`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailInfo),
    });

    if (response.ok) {
      console.log('Email sent successfully');
    } else {
      console.error('Error sending email:', response.statusText);

    }
  } catch (error) {
    console.error('Error sending email:', error);
    // alert(error);
  }

};

