import { ILegalEntity } from "../../models/clients/LegalEntityModel";
import { INaturalPerson } from "../../models/clients/NaturalPersonModel";

export const thresholdEmailContent = (clientProfile: ILegalEntity | INaturalPerson, imageUrl: string, emailAddress:string) => {

    const body = `<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
    <div style="max-width: 1200px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; text-align: left;">
      <h2 style="color: #333333; margin-bottom: 10px;">Dear ${clientProfile.entityDisplayName},</h2>
  
      <!-- Add your simple text content here -->
      <p style="color: #666666; font-size: 14px; margin-top: 10px;">
        <br />
      
        <br />
        We regret to inform you that we are unable to process your withdrawal instruction. The amount requested for withdrawal is below our transaction threshold of N$1,000.00.
        <br />
        To proceed with your withdrawal, please send us a new instruction for an amount equal to or exceeding our minimum withdrawal threshold.
        <br />
        Should you have any questions or require further assistance regarding your account, please do not hesitate to reach out to our dedicated support team at instructions.wealth@ijg.net.
        <br />
        Kind regards,
        <br />
        The IJG Wealth Team
      </p>
      <p className="uk-text-bold">Please contact us if you have any queries or require further information.</p>
      <p style="color: #666666; font-size: 14px;">Thank you for your business.</p>
      <div style="margin-top: 10px; font-style: italic; color: #999999;">
        <p style="font-size: 12px;">Kind regards,<br />IJG</p>
      </div>
      <div style="margin-top: 10px; height: 50px;">
        <img src="${imageUrl}" alt="Footer Image" style="max-width: 100%;">
      </div>
    </div>
  </body>
  `;

    const to = "tebuhoclive14@gmail.com";
    const from = "tebuhoclive14@gmail.com";

    // const to = emailAddress;

    const subject = "Important Notice: Withdrawal Instruction Below Transaction Threshold";
    
    const email = {
        to: to,
        subject: subject,
        from: from,
        body: body
    }
    return email
};