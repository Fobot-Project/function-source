
'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {google} = require('googleapis');
const {WebhookClient} = require('dialogflow-fulfillment');
const calendarId = "nh3lprqtos761shh9d2r9thrro@group.calendar.google.com";
const serviceAccount = {
  "type": "service_account",
  "project_id": "test-bot-hldq",
  "private_key_id": "ed363d14aae0c69a45f3e22573f96b21da83959a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJdFDHr14o1B8s\nXtKyon1YhYSjJ1SQ5/KKn9vfR1gelMT5LFduuXxF/TScBJX1z+5H7QldmpAreR5A\nWZXcLnuPGysp42AmsKjZdcJtgtEQ6UFonAHQXWnApkplpiMe8dCn9ri9owrOb+YQ\nMh6d1Zx7Qj80ND4n6+AXRgFuubLBNejXpgOEjWG1M4mLNU+u/FlKK02zQ66Efw3s\nVkvUiPx7ay9+0mXt9f+Uw3Bl3dZNGoFV9wbicAIVcnrL+8KeWhUCHA4w4Z9JpT5A\nflj01FBXLRxwFjl0Ozo09/2yuFlQbskgM0iof+jMEdDRPA5WAB2gY1v4HQbifsHg\n/KEenQYdAgMBAAECggEAL6jJbZxi8dTRNS2Pujwv3E/mI7Ur0AZXvoz4NvgJdF6s\nxOhFHQhbyrEPD7QUCC3ziOeelhr5bZd/XSj0h70ldSMv0H6e4jhcEepGn6LZtB8C\n3u09jp5y5OVSZ37pAyqhOwNnDFI0vccCTiWVUbDWDuEK095iMA6hGtBwiVH8ZLHh\nK1CY9gJKCdHFoyxDmOJzxIIc2bM8uBivuOiuY0yNRA0cUnk8I2vuee34D0fcEgTH\ny60FRFotDsnOUfHPyebxfK6QkrZxhNDobqfNKL5jD0w2S41bVLGVWNLuNFoGGtAB\nPbrevvX2D/fayESmEeDFA3Y80qjP73f+Rggd6V9VoQKBgQDw1UrPDQ1GHtaijBJJ\nHpi6y37NwQiV+YSoXuQeE962KILrnY1FgHWKi81DRMnV6LRheACU0OjfGtrHJ9gz\nNkYA+eLy1mZZFnemQi7zKGUvavGFJr59q8yWAzx16ExQNWdVtqtpy5IrmXVl9kC/\nmxiD9xTKPVWFDSFmDshv90Q/bQKBgQDWJCiowR7OQTV1HFBguMIvbpXjzTYC/5MQ\nQN43Ov2IM89q7Yl5NwFFpDoUTv0+PMYwxGGjW14VKvClgNodKT2fYr7gonIn+LzI\nwBVUkXiqyhU1dfIRIRMgazhuEdRrw3WdEyAF3ZXwjJMLB6NBWONGq+t4xkCh/BGE\nov/xXMHDcQKBgFFxoCnjHREQjr9LpUdq/HV3KfvFAvVM+4rBBF4TlCaADr5Feqf9\naEKhQpo0Ihmf55hqr6+j8oy4lTHyjI/NE+FyoEhFLzmDepUUHrKGf6mIfgLsdlEj\njz1P/NtW4q/hT3/SFafiex0ZeXUw0Pa7KZA/N52pHkmvhhLwfuI2ebMFAoGAbfKY\n0bR+TaYbfWqxNkgGo/XijdkCX127s3+q2K64F+OKHruhdxQv2gLtMxovWnI3zDg4\nbXhvAO1QK5nR42EWW6yGlq2xcSZ8P5KoIQij7QTfCNjrFbJmsKF8kr8i0sXDsIdu\nTLSt1JlIskQUpWuvHc0NlLAt5T2X/QL36IQYlHECgYA7/7MKFTCtg2NwrtAGMuDE\nudThcRxKYz/fvhyYb1apsghs7jfsAJlv9Yhzuu0sJDu2dILz0BXZIx9Y7aLC2kCu\nNOCwEHi9PXvznv36ORclPC5IEioLTtt1QOWGebyoMOhW6JbbSiZ+exwmT++u4sNE\n+ZN09maiFwemoscDSKNlYg==\n-----END PRIVATE KEY-----\n",
  "client_email": "projecttest@test-bot-hldq.iam.gserviceaccount.com",
  "client_id": "107254391550314198329",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/projecttest%40test-bot-hldq.iam.gserviceaccount.com"
};

const serviceAccountAuth = new google.auth.JWT({
 email: serviceAccount.client_email,
 key: serviceAccount.private_key,
 scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
admin.initializeApp();
const db = admin.firestore();

const timeZone = 'America/Los_Angeles';
const timeZoneOffset = '+07:00';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  const sessionID = request.body.session.split('/').reverse()[0];
 function makeAppointment (agent) {
   // Calculate appointment start and end datetimes (end = +1hr from start)
   const dateTimeStart = new Date(Date.parse(agent.parameters.date.split('T')[0] + 'T' + agent.parameters.time.split('T')[1].split('-')[0] + timeZoneOffset));
   const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
   const appointmentTimeString = dateTimeStart.toLocaleString(
     'en-US',
     { month: 'long', day: 'numeric', hour: 'numeric', timeZone: timeZone }
   );
 }
  
     function saveordertodb(neworder){
     const docID = db.collection('orders').doc(sessionID);
     
     return db.runTransaction( t=>{
       return t.get(docID)
       	.then(doc =>{
           t.update(docID, {
           		orders: admin.firestore.FieldValue.arrayUnion(neworder)
           },{merge : true}); 
     });
 }).catch(err =>{
     console.log('Error occurs.');
     });
     } 
  
  function handleorder(agent){
    const text = agent.parameters.text;
    agent.add(text+ 'is added to the cart');
    
    saveordertodb({
    	"food": text,
      	"total": 20
    });  
  }
  
//  function getMenu(agent){
    
//	return db.collection('menus').doc('o2YNJYVqaITKCl73Dukq').get().then(function(document){
//      const menuinfo = document.data().menu1[0];
//      console.log(menuinfo);
//     return agent.add('Here is the menu: '+ JSON.stringify(menuinfo));
//      });
//  }
  
  function getEntr(agent){
	return db.collection('User').doc('baoWAOSj1kSObBVDcyD2').collection('menu').doc('Menu1').get().then(function(document){
      const menuinfo = document.data();
      console.log(menuinfo["Entrée"]);
     return agent.add('Here is the menu: '+ JSON.stringify(menuinfo["Entrée"]));
      });
  }
    function getMain(agent){
	return db.collection('User').doc('baoWAOSj1kSObBVDcyD2').collection('menu').doc('Menu1').get().then(function(document){
      const menuinfo = document.data();
      console.log(menuinfo["Mains"]);
     return agent.add('Here is the menu: '+ JSON.stringify(menuinfo["Mains"]));
      });
  }
  
      function getDess(agent){
	return db.collection('User').doc('baoWAOSj1kSObBVDcyD2').collection('menu').doc('Menu1').get().then(function(document){
      const menuinfo = document.data();
      console.log(menuinfo["Desserts"]);
     return agent.add('Here is the menu: '+ JSON.stringify(menuinfo["Desserts"]));
      });
  }
  
   function getBar(agent){
	return db.collection('User').doc('baoWAOSj1kSObBVDcyD2').collection('menu').doc('Menu1').get().then(function(document){
      const menuinfo = document.data();
      console.log(menuinfo["Bar Snacks"]);
     return agent.add('Here is the menu: '+ JSON.stringify(menuinfo["Bar Snacks"]));
      });
  }
  
  let intentMap = new Map();

  intentMap.set('order_meat', handleorder);
  intentMap.set('cate_entree', getEntr);
  intentMap.set('cate_mains', getMain);
  intentMap.set('cate_dess', getDess);
  intentMap.set('cate_bar', getBar);
  intentMap.set('Schedule_Appointment', makeAppointment);
  agent.handleRequest(intentMap);
});

function createCalendarEvent (dateTimeStart, dateTimeEnd) {
 return new Promise((resolve, reject) => {
   calendar.events.list({
     auth: serviceAccountAuth, // List events for time period
     calendarId: calendarId,
     timeMin: dateTimeStart.toISOString(),
     timeMax: dateTimeEnd.toISOString()
   }, (err, calendarResponse) => {
     // Check if there is a event already on the Calendar
     if (err || calendarResponse.data.items.length > 0) {
       reject(err || new Error('Requested time conflicts with another appointment'));
     }
		else{
       // Create event for the requested time period
       calendar.events.insert({ auth: serviceAccountAuth,
         calendarId: calendarId,
         resource: {summary: ' Appointment',
           start: {dateTime: dateTimeStart},
           end: {dateTime: dateTimeEnd}}
       }, (err, event) => {
         err ? reject(err) : resolve(event);
       }
       );
     }
   });
 });
}
