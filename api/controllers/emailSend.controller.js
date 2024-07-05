import nodemailer from 'nodemailer';

export const sendEmail = async (req, res) => {
    const { email, subject, text, attachments } = req.body;

    let transporter = nodemailer.createTransport({

        host: "smtp.gmail.com",
        port: 587,
        service: 'Gmail', // You can use other service providers
        auth: {
            user: 'paritlakhani01@gmail.com', // Your email address
            pass: 'dgag vbwt pixu sbqq'   // Your email password
        }
    });

    let mailOptions = {
        from: 'Parit Lakhani <paritlakhani01@gmail.com>',
        to: email,
        subject: subject,
        text: text,
        attachments: attachments
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Email sent', info });
    } catch (error) {
        res.status(500).send({ message: 'Error sending email', error });
    }
};