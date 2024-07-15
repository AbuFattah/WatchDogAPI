// This will handle sending notifications as SMS.
import https from "https";
import AWS from "aws-sdk";

export interface ISMS {
  SendSMS: (
    phone: string,
    msg: string,
    callback: (err: string | boolean) => void
  ) => void;
  validateMsgBody: () => boolean;
}

const SMSNet: ISMS = {
  SendSMS(phone, msg, callback) {
    const payloadString = new URLSearchParams({
      api_key: "co7KSLPaO7f74Md8ESiYtXx9X8GAY9ifQ1rp2iXi",
      msg: `${msg}`,
      to: `${phone}`,
    }).toString();

    const options: https.RequestOptions = {
      hostname: "api.sms.net.bd",
      path: "/sendsms",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const req = https.request(options, (res) => {
      const status = res.statusCode as number;
      if (status > 201) {
        callback("The response returned status code: " + status);
      } else {
        callback(false);
      }
    });

    req.on("error", (e) => {
      callback(e.message);
    });

    req.write(payloadString);

    req.end();
  },
  validateMsgBody: function (): boolean {
    throw new Error("Function not implemented.");
  },
};

const AwsSMS: ISMS = {
  SendSMS: function (phone: string, msg: string, callback): void {
    AWS.config.update({
      region: "ap-south-2",
    });
    const sns = new AWS.SNS();

    const params = {
      Message: msg,
      PhoneNumber: phone,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    };

    sns.publish(params, (err, data) => {
      if (err) {
        console.error(`Error sending SMS to ${phone}:`, err);
        callback(err.message);
      } else {
        console.log(`SMS sent to ${phone}:`, data);
        callback(false);
      }
    });
  },
  validateMsgBody: function (): boolean {
    throw new Error("Function not implemented.");
  },
};

export { SMSNet, AwsSMS };
