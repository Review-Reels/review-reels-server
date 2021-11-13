const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const mailgunAuth = {
  auth: {
    api_key: process.env.MAIL_GUN_API_KEY,
    domain: process.env.MAIL_GUN_DOMAIN,
  },
};

function sendEmail(templateName, mailOptions, templateValues) {
  const emailTemplateSource = fs.readFileSync(
    path.join(__dirname, templateName),
    "utf8"
  );

  const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template(templateValues);

  return smtpTransport.sendMail({ ...mailOptions, html: htmlToSend });
}

module.exports = { sendEmail };
