import Mailgen from "mailgen"; // to genrate
import nodemailer from "nodemailer"; // to send

// send email
const sendEmail = async (options) => {

    const mailGenrator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Managaer",
            link: "https://taskmanagerlink.com"
        }
    });

    const emailTextual = mailGenrator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenrator.generate(options.mailgenContent);

    // for creating connection to mail server(mailtrap)
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    // to define the actual mail
    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    };
    // send the mail
    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Email service failed");
        console.error("Error: ", error);
    }
};

const emailVerficationMailGenContent = (username, verficationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome",
            action: {
                instructions: "To verify button",
                button: {
                    color: "#22BC66",
                    text: "Verify",
                    link: verficationUrl,
                },
            },
            outro: "need help"
        },
    };
};

const forogtPasswordMailGenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "Request",
            action: {
                instructions: "To reset button",
                button: {
                    color: "#159a4f",
                    text: "Reset",
                    link: passwordResetUrl,
                },
            },
            outro: "need help"
        },
    };
};

export {
    emailVerficationMailGenContent,
    forogtPasswordMailGenContent,
    sendEmail
};