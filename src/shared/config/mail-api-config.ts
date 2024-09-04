export const mailApiEndpoint =
  process.env.REACT_APP_MAIL_API_ENDPOINT ||
"https://dinapama.unicomms.app/mail/mail.php?";

export const mailerConfig = {
  transport: {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "no-reply@unicomms.app", // generated ethereal user
      pass: "FOxCa1P!ge0n", // generated ethereal password
    }
  },
  defaults: {
    from: { name: 'IJG Market Market System', address: 'no-reply@ijg-mms.app' },
  },
}