

function fetchCgmData(lastReadTime, lastBG) {

    var response;
    var req = new XMLHttpRequest();
    req.open('GET', "https://xxxxxxxx/pebble", true);

    req.onload = function(e) {
        console.log(req.readyState);
        if (req.readyState == 4) {
            console.log(req.status);
            if(req.status == 200) {
                console.log("text: " + req.responseText);
                response = JSON.parse(req.responseText);
                
                console.log("bg: " + response[0].sgv);
                console.log("rt: " + response[0].datetime);
                console.log("trend: " + response[0].trend);


                var bg;
                var readtime;
                var readTime2 = new Date(response[0].datetime);
                
                var minutes = readTime2.getMinutes();
                var hours = readTime2.getHours();
              
                //comment out for 24hr time
                if (hours > 12)
                  hours = hours-12;
                
                if (minutes < 10)
                    readtime = hours + ":0" + readTime2.getMinutes();
                else
                    readtime = hours + ":" + readTime2.getMinutes();
                
                var nowTime;
                var nowTime2 = new Date();
                
                minutes = nowTime2.getMinutes();
                hours = nowTime2.getHours();
              
                //comment out for 24hr time
                if (hours > 12)
                  hours = hours-12;
                
                if (minutes < 10)
                    nowTime = hours + ":0" + nowTime2.getMinutes();
                else
                    nowTime = hours + ":" + nowTime2.getMinutes();
                
				nowTime =  response[0].battery + "% ~ " + (nowTime2.getMonth() + 1) + "/" + (nowTime2.getDate());
                //nowTime = nowTime2.toLocaleTimeString();
                
                //console.log(readtime);
                //console.log("parse: " + readTime2.toLocaleTimeString());
                bg = response[0].sgv;
                
                var alertValue;
                
                console.log("payload time: " + lastReadTime);
                console.log("payload bg: " + lastBG);
                console.log("time: " + readtime);
                console.log("bg: " + bg);
                
                var lossValue = parseFloat(response[0].avgloss);
                lossValue = (lossValue * 100).toFixed(3);
                var delta = response[0].bgdelta + " mg/dL\n" + response[0].noise;
				
				var sinceread = parseInt(response[0].timesinceread);
				var sinceupload = parseInt(response[0].timesinceupload);
				
				//if (sinceread == "0")
					//sinceread = "now";
				
				//if (sinceupload == "0")
					//sinceupload = "now";
				
                //var lastdata = "rx: " + sinceread +  "  up: " + sinceupload ;
				//var lastdata = "";
                if((lastReadTime == readtime) && (lastBG == bg))
                {
                    alertValue = 0;
                } else
                {
        
                        alertValue = 1;
                    
                    
                    if (lossValue >= 2.5)
                    {
                        console.log("excess loss: " + lossValue);
                        alertValue = 5;
                        
                    }
                    
                    if (lossValue >= 5)
                    {
                        console.log("excess loss: " + lossValue);
                        alertValue = 4;
                        
                    }
                }
                
                if (parseInt(response[0].alert,10) == 500) {
                  alertValue = 6;
                  //lastdata = "Out of range!";
                }
                if (parseInt(response[0].alert,10) == 501) {
                  alertValue = 7;
                  //lastdata =  "Not uploading!";
                }
                
                var bgArray = [];
                for (var i = 0; i < 12; i++) {
                  bgArray[i] = parseInt(163 - (2/3)*(parseInt(response[i].sgv,10) - 39));
                }
              

              
              
                //console.log(lastsix + ", " + lastfive + ", " + lastfour + ", " + lastthree + ", " + lasttwo + ", " + lastone);
                console.log("alertValue: " + alertValue);
                console.log("delta: " + delta);
                Pebble.sendAppMessage({
                                      "icon":response[0].trend,
                                      "bg":bg,
                                      "readtime":readtime,
                                      "alert":alertValue,
                                      "time": nowTime,
                                      "delta":delta,           
                                      "bgone": bgArray[0],
                                      "bgtwo": bgArray[1],
                                      "bgthree": bgArray[2],
                                      "bgfour": bgArray[3],
                                      "bgfive": bgArray[4],
                                      "bgsix": bgArray[5],
                                      "bgseven": bgArray[6],
                                      "bgeight": bgArray[7],
                                      "bgnine": bgArray[8],
                                      "bgten": bgArray[9],
                                      "bgeleven": bgArray[10],
                                      "bgtwelve": bgArray[11],
					"lastread": response[0].timesinceread,
					"lastupload": response[0].timesinceupload
                                      });
            } else {
                console.log("first if");
                console.log(req.status);
            }
        } else
        {
            console.log("second if");
        }
    }
    req.send(null);
}

Pebble.addEventListener("ready",
                        function(e) {
                        console.log("connect: " + e.ready);
                        //fetchCgmData(0, 0);
                        //console.log("connect!" + e.payload);
                        });

Pebble.addEventListener("appmessage",
                        function(e) {
                        console.log("Received message: " + JSON.stringify(e.payload));
                        fetchCgmData(e.payload.readtime, e.payload.bg);
                        });




