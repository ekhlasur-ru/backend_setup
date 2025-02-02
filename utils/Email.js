// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 2525,
//   secure: false, // true for port 465, false for other ports
//   auth: {
//     user: "miekhlas@gmail.com",
//     pass: "mjeq zlcs yayw xwwd",
//   },
// });

// export const sendMail = async () => {
//     try {
//         await transporter.sendMail({
//             from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
//             to: "ekhlasurrahman42@gmail.com",
//             subject: "Hello ✔", // Subject line
//             text: "Hello world?", // plain text body
//             html: "<b>Hello world?</b>", // html body
//         });
//         console.log("Email sent successfully");
//     } catch (error) {
//         console.error("Error sending email:", error);
//     }
// };

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "6ecdbbd6c9fcd8",
    pass: "8cc8526b14261e",
  },
});

export const sendMail = async (subject, body) => {
  await transporter.sendMail({
    from: "miekhlas@gmail.com",
    to: "ekhlasurrahman42@gmail.com",
    subject: subject,
    html: body,
  });
};
