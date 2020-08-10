import pymysql
import config

#function to connect to database
def create_connection(endpoint,user,password,db_name):
    connection = pymysql.connect(endpoint,user,password,db_name)
    return connection

#Changes Patient Consent to true if Patient enrolls
def enroll_consent(cursor,database):
    sql = """UPDATE Patient SET Consent=%s WHERE 
    CellPhone IN (SELECT OriginationNumber FROM Messages WHERE Messages.MessageBody='ENROLL')"""
    vals=[1]
    cursor.execute(sql,vals)
    database.commit()


def update_reminder(cursor,database):
    #selects patients that consented to receiving texts
    consent="SELECT * FROM Patient WHERE Patient.Consent!='%s'"
    val = [0]
    cursor.execute(consent,val)
    consented = cursor.fetchall()

    #adds pateints who consented and are not in Reminder into Reminder
    for row in consented:
        sql = """INSERT INTO Reminder(MRN,PrescriptionID,CellPhone,TimeToSend,FirstName,LastName,TextSent) 
        SELECT p.MRN,m.PrescriptionID,p.CellPhone,m.StartDate,p.FirstName,p.LastName,%s 
        FROM Medication m LEFT JOIN Patient p ON p.MRN=m.MRN
        WHERE NOT EXISTS(SELECT MRN FROM Reminder r WHERE r.MRN=p.MRN AND r.PrescriptionID=m.PrescriptionID)
        group by p.Consent HAVING SUM(Consent) > '%s'"""
        vals = [0,0]
        cursor.execute(sql,vals)

    #deletes patients from Reminder who removed consent
    sqlDelete = """DELETE FROM Reminder WHERE Reminder.MRN in
    (SELECT MRN FROM Patient p WHERE p.Consent='%s')"""
    val = [0]
    cursor.execute(sqlDelete,val)
    
    database.commit()

#deletes rows that were already sent
def delete_sent(cursor,database):
    sql = "DELETE FROM Reminder WHERE Reminder.TextSent='%s'"
    val = [1]
    cursor.execute(sql,val)
    database.commit()

# def add_times(cursor,database):

#     # dateAdd = """SELECT DATE_ADD(SELECT TimeToSend From Reminder WHERE Reminder.MRN='%s',
#     # INTERVAL %s)"""
#     # dateAdd = "SELECT TimeToSend From Reminder WHERE Reminder.MRN='%s'"
#     # val = [11111111]
    

db = create_connection(config.endpoint, config.user, config.password, config.db_name)
cursor = db.cursor()

while True:
    enroll_consent(cursor,db)
    update_reminder(cursor,db)


db.close()
