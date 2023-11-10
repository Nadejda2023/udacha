import nodemailer from "nodemailer";


export const emailAdapter = {
    async sendEmail(email: string, subject: string, code: string) {
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
    });
    let info = await transport.sendMail({
        from: 'Nadych <fsklever@gmail.com>',
        to: email,
        subject: subject,
        html: `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>`
       ,

    });
    return info
},

async sendEmailWithRecoveryCode(email: string, recoveryCode: string) {
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
    });
    let info = await transport.sendMail({
        from: 'Nadych <fsklever@gmail.com>',
        to: email,
        html: `<h1>Password Recovery Instructions</h1>
        <p>To recover your password, use the following recovery code: ${recoveryCode}n</a>
        </p>`
       ,
    });
    return info
    
}
}