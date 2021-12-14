const functions = require('firebase-functions');
const fetch = require('node-fetch');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// The Firebase Admin SDK to access Cloud Firestore
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();


const runtimeOpts = {
    timeoutSeconds: 540,            // Maximum run time 540 seconds
    memory: '256MB'                 // Allocated Memory
};


// var db = firebase.firestore();
// let testRef = db.collection('weather/001/data');

const url_header = "https://api.openweathermap.org/data/2.5/onecall?";
const url_tail = "********";
var colour_level = ["#FFF7EC", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"];


const updateDB = async (start, end) => {
    var longitude, latitude;
    var i;
    var index;
    var dbRef = await db.collection('weather_db');

    for(i = start; i<end; i++) {

        // Get longtitude latitude about that specific position
        index = i.toString();
        var doc = await dbRef.doc(index).get();

        try {
            if(doc.exists){
                longitude = doc.data().center[0];
                latitude = doc.data().center[1];
                // console.log("Current position -> log: " + longitude + " lat: " + latitude);
    
                var url = url_header + "lat=" + latitude + "&lon=" + longitude + url_tail;
                // console.log("Current url: ", url);

                // var posWeather = 'weather_db/'+index+'/data';
                var response = await fetch(url);

                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }else{
                    var status = await response.json();
                    // console.log(status);

                    var current_status = status['current'];
                    var current_temperature = current_status['temp'];
                    var current_windspeed = current_status['wind_speed'];
                    var current_humidity = current_status['humidity'];

                    var forecast_rainfall = 0;
                    var forecast_status = status['daily'];


            
                    var forecast_temperature = forecast_status[4]['temp']['day'];
                    var forecast_windspeed = forecast_status[4]['wind_speed'];
                    var forecast_humidity = forecast_status[4]['humidity'];
                    if (typeof forecast_status[4]['rain'] === 'undefined') {
                        forecast_rainfall = 0;
                    }else{
                        forecast_rainfall = forecast_status[4]['rain'];
                    }

                    var pastData = []
                    var dayIndex;
                    const days = 11;

                    // get past data
                    // Oder: 5, 4, ... -4, -5
                    for(j=days; j>0; j--){
                        dayIndex = (j-6).toString();
                        var temp = [];
                        var data = await dbRef.doc(index).collection('data').doc(dayIndex).get();
                        temp.push(data.data().date);
                        temp.push(data.data().humidity);
                        temp.push(data.data().rainfall);
                        temp.push(data.data().temperature);
                        temp.push(data.data().windspeed);

                        pastData.push(temp);
                    }
                    // console.log("past data: ", pastData);

                    // update data
                    // Order: 4, 3, 2 ... -4, -5
                    var counter = 0;
                    if (pastData.length != 11) throw console.error("Past Data got error");
                    
                    for (k = days; k>1; k--) {
                        
                        var batch = db.batch();
                        var newDayIndex = (k-7).toString();
                        var docRef = dbRef.doc(index).collection('data').doc(newDayIndex);
                        batch.update(docRef, {
                            date: pastData[counter][0],
                            humidity: pastData[counter][1],
                            rainfall: pastData[counter][2],
                            temperature: pastData[counter][3], 
                            windspeed: pastData[counter][4]
                        });
                        batch.commit().then(() => {
                            // console.log("Update successfully");
                        });
                        counter++;
                    }
                    
                    // Update the future fifth day
                    var batch = db.batch();
                    var docRef = dbRef.doc(index).collection('data').doc('5');
                    batch.update(docRef, {
                        date: Date.now(),
                        humidity: forecast_humidity,
                        rainfall: forecast_rainfall,
                        temperature: forecast_temperature, 
                        windspeed: forecast_windspeed
                    });
                    batch.commit().then(() => {
                        // console.log("Update the fifth day successfully");
                    })

                    // Update the current day
                    var batch = db.batch();
                    var docRef = dbRef.doc(index).collection('data').doc('0');
                    batch.update(docRef, {
                        date: Date.now(),
                        humidity: current_humidity,
                        temperature: current_temperature, 
                        windspeed: current_windspeed
                    });
                    batch.commit().then(() => {
                        // console.log("Update the current day successfully");
                    })
                }

            }else {
                console.log("No such document!");
            }
            
        } catch (error) {
            console.log("Error getting document: ", error);
        }

        console.log("Position ", index, " has been updated successfully");
    }
}

const updateJSON_specific_day = async (day, start, end) => {
    var day_index = day.toString();
    var dbRef = await db.collection('weather_db');
    for(i=start; i<end; i++){
        index = i.toString();
        var doc = await dbRef.doc(index).get();
        
        try {
            if (doc.exists) {
                // fetch temperature
                var data = await dbRef.doc(index).collection('data').doc(day_index).get();
                var temperature = parseInt(data.data().temperature);

                } else {
                    console.log("No such document!");
                }
        } catch (error) {
            console.log("Error getting document: ", error);
        }

        
        var new_color = colour_level[0];                // default colour
        var new_height = 0;                             // default height
        // Depend on temperature - set up colour 
        if (temperature <= 10) {
            new_color = colour_level[0];
        }
        else if (temperature <= 15){
            new_color = colour_level[1];
        }
        else if (temperature <= 20) {
            new_color = colour_level[2];
        }
        else if (temperature <= 25){
            new_color = colour_level[3];
        }
        else if (temperature <= 30) {
            new_color = colour_level[4];
        }
        else if (temperature <= 35){
            new_color = colour_level[5];
        }
        else if (temperature <= 40) {
            new_color = colour_level[6];
        }
        else if (temperature <= 45){
            new_color = colour_level[7];
        }
        else if (temperature <= 50) {
            new_color = colour_level[8];
        }
        // Set Maximum height - 800000 with Max temperature 50 celsius degree
        new_height = 800000*(temperature/50);

        var updates = {};
        updates['/data/features/' + index + '/properties/height'] = new_height;
        updates['/data/features/' + index + '/properties/color'] = new_color;

        admin.database().ref(day).update(updates);
    }
    console.log(day," day: ", start, "-", end, " has been updated");
}

const loop_update_JSON = async () => {
    // console.time("Start");

    for(var i=-5; i<5; i++){

        var lastDay_data = await firebase.database().ref('/'+ (i+1).toString() +'/data/features').once('value').then(function(snapshot) {
            return snapshot.val();
        });

        console.log(lastDay_data);

        var updates = {};
    
        updates['/data/features'] = lastDay_data;
        admin.database().ref(i).update(updates);

    }
    console.log("All temperature JSON data has been updated successfully ");

    // console.timeEnd("Start");
}

exports.update_all_temperature = functions
    .pubsub
    .schedule('7 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
        await loop_update_JSON();
        return null;
    })



exports.updateJSON_5th_day_0_108 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(5, 0, 108);
            return null;
    })

exports.updateJSON_5th_day_108_216 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(5, 108, 216);
            return null;
    })

exports.updateJSON_5th_day_216_324 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(5, 216, 324);
            return null;
    })

exports.updateJSON_5th_day_324_432 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(5, 324, 432);
            return null;
    })

exports.updateJSON_5th_day_432_543 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(5, 432, 543);
            return null;
    })

exports.updateJSON_current_day_0_108 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(0, 0, 108);
            return null;
    })


exports.updateJSON_current_day_108_216 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(0, 108, 216);
            return null;
    })

exports.updateJSON_current_day_216_324 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(0, 216, 324);
            return null;
    })

exports.updateJSON_current_day_324_432 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(0, 324, 432);
            return null;
    })

exports.updateJSON_current_day_432_543 = functions
    .pubsub
    .schedule('10 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateJSON_specific_day(0, 432, 543);
            return null;
    })





/***************************************************************************************/
/*                               Position from 0 - 80                                  */
/***************************************************************************************/
exports.scheduleFunction_0_8 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(0, 8);
            return null;
    })

exports.scheduleFunction_8_16 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(8, 16);
            return null;
    })


exports.scheduleFunction_16_24 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(16, 24);
            return null;
    })

exports.scheduleFunction_24_32 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(24, 32);
            return null;
    })

exports.scheduleFunction_32_40 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(32, 40);
            return null;
    })

exports.scheduleFunction_40_48 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(40, 48);
            return null;
    })

exports.scheduleFunction_48_56 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(48, 56);
            return null;
    })

exports.scheduleFunction_56_64 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(56, 64);
            return null;
    })

exports.scheduleFunction_64_72 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(64, 72);
            return null;
    })

exports.scheduleFunction_72_80 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(72, 80);
            return null;
    })


/***************************************************************************************/
/*                               Position from 80 - 160                                */
/***************************************************************************************/
exports.scheduleFunction_80_88 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(80, 88);
            return null;
    })

exports.scheduleFunction_88_96 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(88, 96);
            return null;
    })


exports.scheduleFunction_96_104 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(96, 104);
            return null;
    })

exports.scheduleFunction_104_112 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(104, 112);
            return null;
    })

exports.scheduleFunction_112_120 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(112, 120);
            return null;
    })

exports.scheduleFunction_120_128 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(120, 128);
            return null;
    })

exports.scheduleFunction_128_136 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(128, 136);
            return null;
    })

exports.scheduleFunction_136_144 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(136, 144);
            return null;
    })

exports.scheduleFunction_144_152 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(144, 152);
            return null;
    })

exports.scheduleFunction_152_160 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(152, 160);
            return null;
    })


/***************************************************************************************/
/*                               Position from 160 - 240                               */
/***************************************************************************************/
exports.scheduleFunction_160_168 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(160, 168);
            return null;
    })

exports.scheduleFunction_168_176 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(168, 176);
            return null;
    })


exports.scheduleFunction_176_184 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(176, 184);
            return null;
    })

exports.scheduleFunction_184_192 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(184, 192);
            return null;
    })

exports.scheduleFunction_192_200 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(192, 200);
            return null;
    })

exports.scheduleFunction_200_208 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(200, 208);
            return null;
    })

exports.scheduleFunction_208_216 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(208, 216);
            return null;
    })

exports.scheduleFunction_216_224 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(216, 224);
            return null;
    })

exports.scheduleFunction_224_232 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(224, 232);
            return null;
    })

exports.scheduleFunction_232_240 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(232, 240);
            return null;
    })


/***************************************************************************************/
/*                               Position from 240 - 320                               */
/***************************************************************************************/
exports.scheduleFunction_240_248 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(240, 248);
            return null;
    })

exports.scheduleFunction_248_256 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(248, 256);
            return null;
    })


exports.scheduleFunction_256_264 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(256, 264);
            return null;
    })

exports.scheduleFunction_264_272 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(264, 272);
            return null;
    })

exports.scheduleFunction_272_280 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(272, 280);
            return null;
    })

exports.scheduleFunction_280_288 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(280, 288);
            return null;
    })

exports.scheduleFunction_288_296 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(288, 296);
            return null;
    })

exports.scheduleFunction_296_304 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(296, 304);
            return null;
    })

exports.scheduleFunction_304_312 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(304, 312);
            return null;
    })

exports.scheduleFunction_312_320 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(312, 320);
            return null;
    })


/***************************************************************************************/
/*                               Position from 320 - 400                               */
/***************************************************************************************/
exports.scheduleFunction_320_328 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(320, 328);
            return null;
    })

exports.scheduleFunction_328_336 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(328, 336);
            return null;
    })


exports.scheduleFunction_336_344 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(336, 344);
            return null;
    })

exports.scheduleFunction_344_352 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(344, 352);
            return null;
    })

exports.scheduleFunction_352_360 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(352, 360);
            return null;
    })

exports.scheduleFunction_360_368 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(360, 368);
            return null;
    })

exports.scheduleFunction_368_376 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(368, 376);
            return null;
    })

exports.scheduleFunction_376_384 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(376, 384);
            return null;
    })

exports.scheduleFunction_384_392 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(384, 392);
            return null;
    })

exports.scheduleFunction_392_400 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(392, 400);
            return null;
    })


/***************************************************************************************/
/*                               Position from 400 - 480                               */
/***************************************************************************************/
exports.scheduleFunction_400_408 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(400, 408);
            return null;
    })

exports.scheduleFunction_408_416 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(408, 416);
            return null;
    })


exports.scheduleFunction_416_424 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(416, 424);
            return null;
    })

exports.scheduleFunction_424_432 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(424, 432);
            return null;
    })

exports.scheduleFunction_432_440 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(432, 440);
            return null;
    })

exports.scheduleFunction_440_448 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(440, 448);
            return null;
    })

exports.scheduleFunction_448_456 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(448, 456);
            return null;
    })

exports.scheduleFunction_456_464 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(456, 464);
            return null;
    })

exports.scheduleFunction_464_472 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(464, 472);
            return null;
    })

exports.scheduleFunction_472_480 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(472, 480);
            return null;
    })


/***************************************************************************************/
/*                               Position from 480 - 560                                */
/***************************************************************************************/
exports.scheduleFunction_480_488 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(480, 488);
            return null;
    })

exports.scheduleFunction_488_496 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(488, 496);
            return null;
    })


exports.scheduleFunction_496_504 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(496, 504);
            return null;
    })

exports.scheduleFunction_504_512 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(504, 512);
            return null;
    })

exports.scheduleFunction_512_520 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(512, 520);
            return null;
    })

exports.scheduleFunction_520_528 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(520, 528);
            return null;
    })

exports.scheduleFunction_528_536 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(528, 536);
            return null;
    })

exports.scheduleFunction_536_543 = functions
    .pubsub
    .schedule('5 2 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async (context) => {
            await updateDB(536, 543);
            return null;
    })
