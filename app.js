
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var mysql      = require('mysql');
var db = mysql.createPool({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  database : process.env.RDS_DB_NAME
});

let AWS = require("aws-sdk");
let aws_region = "us-east-1";

// Pinpoint Application ID
const applicationId = process.env.APPLICATION_ID;
const originationNumber = process.env.ORIGNATION_NUMBER; 

// TRANSACTIONAL/PROMOTIONAL
const messageType = "TRANSACTIONAL";
const registeredKeyword = "myKeyword";
const senderId = "MySenderID";


function pollDatabase() {
  db.getConnection(function (err, conn) {
    if (err) throw err;

    //Query records that have not been sent yet
    conn.query('SELECT * FROM Reminder JOIN Medication ON Reminder.PrescriptionID=Medication.PrescriptionID AND Reminder.TextSent=0', function (err, results) {
      if (err) {
        conn.release();
        throw error;
      }

      //print timestamp
      let date = new Date();
      let seconds = date.getSeconds();
      console.log(seconds);


      Object.keys(results).forEach( (key) => {
        var result = results[key];

        // AWS Pinpoint Number
        
        let destinationNumber = result.Cellphone;
        let message = 'Hi ' + result.FirstName + ' '+ result.LastName + '! This is your medication reminder service. Please remember to take ' + result.DrugName + ' ' + result.Instructions;

        // Specify that you're using a shared credentials file, and optionally specify
        // the profile that you want to use.
        var credentials = new AWS.SharedIniFileCredentials({ filename: './aws/credentials' });
        AWS.config.credentials = credentials;

        // Specify the region.
        AWS.config.update({ region: aws_region });

        //Create a new Pinpoint object.
        var pinpoint = new AWS.Pinpoint();
        
        // Specify the parameters to pass to the API.
        const params = {
          ApplicationId: applicationId,
          MessageRequest: {
            Addresses: {
              [destinationNumber]: {
                ChannelType: "SMS",
              },
            },
            MessageConfiguration: {
              SMSMessage: {
                Body: message,
                Keyword: registeredKeyword,
                MessageType: messageType,
                OriginationNumber: originationNumber,
                SenderId: senderId,
              },
            },
          },
        };
        
        // test messages
        // console.log("Message to send: " + message);
        // console.log('Destination Number: ' + destinationNumber);
        // console.log(params.MessageRequest);

      
        //update records that were sent
        let queryString = `UPDATE Reminder SET TextSent=1 WHERE Reminder.FirstName="${result.FirstName}"`;
        conn.query(queryString, (error, results, fields) => {
          if (error) throw error;
        });

        //Try to send the message.
        pinpoint.sendMessages(params, function (err, data) {
          // If something goes wrong, print an error message.
          if (err) {
            console.log(err.message);
            // Otherwise, show the unique ID for the message.
          } else {
            console.log(
              "Message sent! " +
                data["MessageResponse"]["Result"][destinationNumber]["StatusMessage"]
            );
          }
        });

      })
    });
    conn.release();
  })
}

setInterval(pollDatabase, 5000);