const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const dotenv = require("dotenv").config();
const mailTransport = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    // service: "gmail",
    auth: {
      user: process.env.MAILTRAN_USERNAME,
      pass: process.env.MAILTRAN_PASSWORD,
    },
  });

const generateOTP = () => {
  const OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  return OTP;
};

const verifyOTP = async (OTP) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Please activate your account</title>
    <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>
    
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
    <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
        <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                <tr>
                    <td style="padding: 40px 0px 0px;">
                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: center;">
                        <h1 style="margin: 1rem 0">Your password</h1>
                        <p style="padding-bottom: 10px">Thank you for choosing our WMS. Use the following OTP to complete your authentication procedures and verify your account on WMS. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 5px 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    
                        <p style="padding-bottom: 16px">If you didn’t ask to verify this address, you can ignore this email.</p>
                        <p style="padding-bottom: 16px">Thanks,<br>The WM8 team</p>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </td>
        </tr>
        </tbody>
    </table>
    </body>
    
    </html>
    `;
};

const UserPassword = (password) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Please activate your account</title>
    <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>
    
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
    <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
        <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                <tr>
                    <td style="padding: 40px 0px 0px;">
                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: center;">
                        <h1 style="margin: 1rem 0">Your password</h1>
                        <p style="padding-bottom: 16px">Thank you for your contribution. This is your password which be used for your sign in.</p>
                        <h2>Your password: ${password}</h2>
    
                        <p style="padding-bottom: 16px">If you didn’t ask to verify this address, you can ignore this email.</p>
                        <p style="padding-bottom: 16px">Thanks,<br>The WM8 team</p>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </td>
        </tr>
        </tbody>
    </table>
    </body>
    
    </html>
    `;
};
module.exports = { mailTransport, UserPassword };
