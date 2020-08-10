# mskmed
[![Build Status](https://travis-ci.org/lohs/mskmed.svg?branch=master)](https://travis-ci.org/lohs/mskmed)

Create DB Instance <br>
Enable VPC attributes DNS hostnames and DNS resolution (only resolution was enabled when created)<br>
Go to VPC default security group and add your ip as an inboud rule<br>
Connect to mysql database using cli (mysql client needs to be installed)<br>
Download SSL certificate
https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html
```
mysql -h mskmed.cseiacflig8q.us-east-1.rds.amazonaws.com --ssl-ca=rds-ca-2019-root.pem -P 3306 -u admin -p
```

Update SQL records
```
UPDATE Reminder SET TextSent=1 WHERE Reminder.FirstName="${result.FirstName}"
```


For ReminderConsent.py file, need to install pymysql<br>
On Mac:
```
pip install pymysql
```
