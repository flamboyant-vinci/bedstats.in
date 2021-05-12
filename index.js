// variables
let pages = ["language", "locationConsent", "city", "bedstats"]
let pageNumber = 0;
var pageName = pages[pageNumber];
var language;
var ipLocationConsent;//contains ip location permission
var geoLocation;//stores location
var pageContent;//contains layout of all the pages
var functionRunner; //enables global vars be defined from functions
let languages = ["hindi", "english", "marathi", "bengali", "telugu", "urdu"];//available languages
var buttons = document.querySelectorAll(".button");
var body = document.getElementsByTagName('body')[0];
var captionHeader = document.getElementById('caption');
var loadingPage = document.getElementById('loadingPage');

// functions


//object model for page rendering
class Body {
  constructor() {}
  updater(){
    this.btnUpdate();
    this.captUpdate();
  }
  btnUpdate(){
    btnClear();
    btnMake();
  }
  captUpdate(){
    captionHeader.textContent = pageContent[pageName].caption;
    if (pageName == "city") {
      captionHeader.textContent += ` Delhi?`;
    }
  }
}
function setLangColors(){
  let langColors = ["#ff1616", "black", "#ff5757", "rgb(31, 79, 166)", "#008037", "#c4882d"];
  langColors = ["#ff1616", "black", "gray", "gray", "gray", "gray"];
  if (pageName == "language") {
    for (var i = 0; i < buttons.length; i++){
      buttons[i].style.background = langColors[i];
    }
  }
}
// called by buttons on clicking
function triggerNext(id){
  var serial = id.slice(-1) - 1;
  var x = serial;
  // loadingpage
  loadToggle();
  clickHandler(x);
  pageNumber++;
  pageName = pages[pageNumber];
  buttons = document.querySelectorAll(".button");//updates button selector
}
// toggles loading screen
function loadToggle() {
  body.style.opacity = "0";
  loadingPage.style.display = "flex";
  // var x = await nextToggle();
  loadingPage.style.display = "none";
  body.style.opacity = "1";
}
// handles functions on click events
function clickHandler(x){
  if(pageName == "language"){
    language = languages[x];
    document.querySelector('header').style.opacity = "0";
    loadPageContent();
  } else if (pageName = "locationConsent") {
    var consentStatus = ["yes", "no"];
    ipLocationConsent = consentStatus[x];
    if (ipLocationConsent =="yes") {
      // fetch location
      getLocation();
      loadPageContent();
    } else if (ipLocationConsent =="no") {
      // open iframe modal for selection get a value for location
    }
  } else if (pageName == "city") {
    geoLocation.push("delhi");
    geoLocation.push("https://coronabeds.jantasamvad.org/covid-info.js");
    geoLocation.push("https://coronabeds.jantasamvad.org/covid-facilities.js");
    mainCaller();
  } else if (pageName == "bedstats") {
    var hospitalInfo = document.getElementById('bedstats-1');
    hospitalInfo.textContent = `${rankedObjects[1][0]}\n${rankedObjects[1][3]}`
    }
}
//removes all buttons from page
function btnClear(){
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].parentNode.removeChild(buttons[i])
  }
}
//creates buttons for a page
function btnMake(){
  var text = pageContent[pageName].button;
  var color = pageContent[pageName].buttonColor;
  var shape = pageContent[pageName].buttonShape;
  for (var i = 0; i < text.length; i++){
  var newButton = document.createElement('div');
  var textarea = document.createElement('span');
  textarea.textContent = text[i];
  newButton.style.background = color[i];
  newButton.className = "button " + shape[i] + " " + pageName + "-" + [i+1];
  newButton.id = "button-" + (i+1);
  newButton.setAttribute("onclick", "triggerNext(this.id)");
  newButton.appendChild(textarea);
  document.getElementsByClassName('container')[0].appendChild(newButton);
  }
}
// geoLocation api
function getLocation(){
  //variables
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
  //location functions
  let getPosition = function (options) {
    return new Promise(function (resolve, reject){
      navigator.geolocation.getCurrentPosition(resolve, reject, options)}
    )
  }
  getPosition()
  .then((position) => {
    geoLocation = new Array(2);
    geoLocation[0] = position.coords.latitude;
    geoLocation[1] = position.coords.longitude;
    return(200)
  })
  .catch((err) => {console.error(err.message)});
  return(200)
}
//fetches layout info for all pages and updates page
function loadPageContent(){
  fetch("page_data.json")
    .then(response => response.json())
    .then(json => {
      pageContent = json.content[language];
      base.updater();
    })
}
//calling functions
setLangColors();
let base = new Body();
