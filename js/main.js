let timingsUrl = "http://api.aladhan.com/v1/timingsByCity?city=Giza&country=Egypt&method=5";
let currentTimeUrl = "http://api.aladhan.com/v1/currentTime?zone=Africa/Cairo";

var fajr = null;
var sunrise = null;
var dhuhr = null;
var asr = null;
var maghrib = null;
var isha = null;
var data = null;
var time_left_node = null;
var audio_player = null;
var current_prayer = null;

var currentTime = null;
var time_left = null;
var nextPrayer = null;

document.addEventListener('DOMContentLoaded', function() {
  fajr = document.getElementsByClassName('Fajr')[0];
  sunrise = document.getElementsByClassName('Sunrise')[0];
  dhuhr = document.getElementsByClassName('Dhuhr')[0];
  asr = document.getElementsByClassName('Asr')[0];
  maghrib = document.getElementsByClassName('Maghrib')[0];
  isha = document.getElementsByClassName('Isha')[0];
  time_left_node = document.getElementsByClassName('time-left')[0];
  current_prayer = document.getElementsByClassName('current-prayer')[0];
  audio_player = document.getElementById('audioId');

  updateTimings();

  setInterval(updateTimings, 24 * 60 * 60 * 1000);
}, false);

function formatTime(time){
  if(!time.includes(":"))
    return time;

  var arr = time.split(':')
  if(arr[0] > 12){
    arr[0] = (arr[0] - 12);
    arr[1] = arr[1] + " pm";
    if(arr[0] < 10) 
      arr[0] = "0" + arr[0];
  } else {
    arr[1] = arr[1] + " am";
  }
  return arr.join(':')
}

function updateTimings(){
  fetch(timingsUrl).then(response => {
    response.json().then(json => {
      data = json.data;
      console.log(data);
      fajr.textContent = formatTime(data.timings.Fajr);
      sunrise.textContent = formatTime(data.timings.Sunrise);
      dhuhr.textContent = formatTime(data.timings.Dhuhr);
      asr.textContent = formatTime(data.timings.Asr);
      maghrib.textContent = formatTime(data.timings.Maghrib);
      isha.textContent = formatTime(data.timings.Isha);

      GetNextPrayer();
    });
  });
}

var badItems = ["Midnight", "Sunset", "Imsak"]
var interval = null;
var namings = {
  Isha: "رفع أذان العشاء",
  Fajr: "رفع أذان الفجر",
  Dhuhr: "رفع أذان الظهر",
  Asr: "رفع أذان العصر",
  Maghrib: "رفع أذان المغرب",
  Sunrise: "الشروق"
}

function GetNextPrayer(){
  fetch(currentTimeUrl).then(response => {
    response.json().then(json => {
      currentTime = json.data;

      var currTimeStamp = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      var availableHours = Object.entries(data.timings).filter(item => !badItems.includes(item[0]));
      console.log(availableHours);
      var next = null;
      availableHours.forEach(item => {
        if(next == null) {
          var currPrayerTimeStamp = parseInt(item[1].split(':')[0]) * 60 + parseInt(item[1].split(':')[1]);
          if(parseInt(currPrayerTimeStamp) > parseInt(currTimeStamp))
            next = item;
        }
      });
    
      if(next == null)
        next = availableHours[0];
      
      nextPrayer = next;

      document.querySelector("." + next[0]).classList.toggle('red');
      current_prayer.textContent = namings[next[0]];

      time_left = Math.abs(currTimeStamp - parseInt(parseInt(next[1].split(':')[0]) * 60 + parseInt(next[1].split(':')[1]))) * 60 | 0
      interval = setInterval(updateTimer, 1000);
    })
  })
}

function updateTimer(){
  if(time_left == 0) {
    clearInterval(interval);
    GetNextPrayer();
    audio_player.play();
  }

  var hours = time_left / 60 / 60 | 0;
  var minutes = (time_left / 60) % 60 | 0;
  var seconds = time_left % 60 | 0;

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  time_left_node.textContent = `${hours}:${minutes}:${seconds}`;
  time_left--;
}