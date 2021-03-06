import * as SparkPost from "sparkpost";
const client = new SparkPost();
export const sendEmail = async (recipients: string, url: string) => {
  await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm Email!",
      html: `
                <html>
                <body>
                <p>Testing SparkPost - the world\'s most awesomest email service!</p>
                <a href="${url}">confirm email</a>
                </body>
                </html>
            `
    },
    recipients: [{ address: `${recipients}.sink.sparkpostmail.com` }]
  });
};
