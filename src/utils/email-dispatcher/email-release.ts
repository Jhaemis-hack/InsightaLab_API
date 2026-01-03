import nodemailer from "nodemailer";
import welcomeTemplate from "../email-templates/welcome-template";

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "getsavey.com",
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Driveey" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Driveey!",
      html: welcomeTemplate(firstName),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`${new Date().toLocaleString()} - Email sent successfully:` + info.response);
  } catch (error: any) {
    console.log("Email error:", error.message);
    throw new Error("Couldn't send welcome Mail.");
  }
};
