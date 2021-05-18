let pages = ["language", "locationConsent", "city", "bedstats"]
let pageNumber = 0;
var pageName = pages[pageNumber];
let languages = ["hindi", "english", "marathi", "bengali", "telugu", "urdu"];//available languages
var language;
var ipLocationConsent;//contains ip location permission
var geoLocation;//stores location
var pageContent;//contains layout of all the pages
var buttons = document.querySelectorAll(".button");
var body = document.getElementsByTagName("body")[0];
var captionHeader = document.getElementById("caption");
var loadingPage = document.getElementById("loadingPage");
const helpMessage = "If you want to help email at voulanteer@bedstats.in";

//object model for page rendering
class Body {
  constructor() {}
  updater(){
    this.btnUpdate();
    this.captUpdate();
    if(pageName == "bedstats"){this.printSuggested()}
  }
  btnUpdate(){
    var text = pageContent[pageName].button;
    var color = pageContent[pageName].buttonColor;
    var shape = pageContent[pageName].buttonShape;
    btnClear();
    btnMake(text, shape, color);
  }
  captUpdate(){
    var captionContent = (pageName != "city") ? pageContent[pageName].caption : `${pageContent[pageName].caption} ${geoLocation[2]}`;
    captionHeader.textContent = captionContent;
  }
  printSuggested(){
    var hospitalInfo = document.getElementsByClassName('bedstats-1')[0];
    hospitalInfo.firstChild.textContent = `${rankedObjects[1][0]}\nVacant Beds: ${rankedObjects[1][3]}`;
  }
}

// called by click events
async function triggerNext(id){
  var serial = id.slice(-1) - 1;
  var x = serial;
  // loadingpage
  loadToggle("on");
  if (pageName != "bedstats") {
    await clickHandler(x)
      .then(() => loadToggle("off"))
      .then(() => pageNumber++)
      .then(() => pageName = pages[pageNumber])
      .catch(err => {flashMessage(err.name, err.message);console.log(err); loadToggle("off")});
    buttons = document.querySelectorAll(".button");//updates button selector
  } else {
    await clickHandler(x)
    .then(() => loadToggle("off"))
    .catch(err => {flashMessage(err.name, err.message);console.log(err); loadToggle("off")});
  }
}
// toggles loading overlay
function loadToggle(action) {
  let status = (action === "on") ? 1 : 0;
  var displayOptions = ["none", "flex"];
  loadingPage.style.display = displayOptions[status]
}
var displayIndexNo = 1; // for bedstats page
// handles functions on click events
function clickHandler(x){
  return new Promise((resolve, reject) => {
    if(pageName == "language"){
      language = languages[x];
      if (x < 2) {
        document.querySelector("header").style.opacity = "0";
        loadPageContent();
        // flashMessage("NOTE:", "your location will be sent to google api for obtaining city name, we are currently working on an alternative");
      }
      else {
        let e = {
          "name" : "Language error",
          "message" : `we don"t support ${language.replace(/^\w/, (c) => c.toUpperCase())} yet\n${helpMessage}`};
        throw e;
      };
      resolve("ok");
    } else if (pageName == "locationConsent") {
        var consentStatus = ["yes", "no"];
        ipLocationConsent = consentStatus[x];
        if (ipLocationConsent =="yes") {
          let loadLocation = async () => {
          await locationCaller()
            .then(() => loadPageContent())
            .then(() => flashMessage("NOTE", "only New Delhi supported"))
            .then(() => getDataFile(geoLocation[3], geoLocation[4]))
            .then(() => resolve("ok"))
            .catch(err => {flashMessage(err.name, err.message)});
          }
          loadLocation();

        } else if (ipLocationConsent == "no") {
        // open iframe modal for selection get a value for location
        // var overlay = document.createElement("div");
        // var iframe = document.createElement("div");
        // overlay.className = "overlay-bg";
        // iframe.className = "overlay-container";
        // overlay.appendChild(iframe);
        // document.body.appendChild(overlay);
        flashMessage("ERROR", "Manual selection currently in development");
        resolve("ok")    ;
        }
    } else if (pageName == "city") {
      let buildArray = async() => {
        if (x == 0){
          getSuggestions(geoLocation[0], geoLocation[1], gnctd_covid_facilities_data, gnctd_covid_data)
          .then(loadPageContent())
          .then(resolve("ok"))
          .catch(err => {throw err})
        }
        else{
          let e = {
            "name" : "location error",
            "message" : "We'll be supporting other cities very soon!"
          };
          throw e
          }
        }
        buildArray();
    } else if (pageName == "bedstats") {
        var hospitalInfo = document.getElementsByClassName('bedstats-1')[0];
        if (x == 1) {
          hospitalInfo.firstChild.textContent = `${rankedObjects[(displayIndexNo + 1)][0]}\nVacant Beds: ${rankedObjects[(displayIndexNo + 1)][3]}`;
          displayIndexNo++;
          resolve("ok")
        } else if(x == 2){
          if(displayIndexNo == 1){displayIndexNo++};
          hospitalInfo.firstChild.textContent = `${rankedObjects[(displayIndexNo - 1)][0]}\nVacant Beds: ${rankedObjects[(displayIndexNo - 1)][3]}`;
          displayIndexNo--;
          resolve("ok")
        } else if(x == 3) {
          flashMessage("ERROR", "In development")
        } else if(x ==4) {
          generateTable(100);
          scrollBy(0,100);
        }
      }
  })
}
//removes all buttons from page
function btnClear(){
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].parentNode.removeChild(buttons[i])
  }
}
//creates buttons for a page using arrays: textContent, shape [circle, rectangle], color
function btnMake(text, shape, color){
  for (let i in text){
  i = +i;
  var newButton = document.createElement("div");
  var textarea = document.createElement("span");
  textarea.textContent = text[i];
  newButton.style.background = color[i];
  newButton.className = `button ${shape[i]} ${pageName}-${[i+1]}`;
  newButton.id = `button-${(i+1)}`;
  newButton.setAttribute("onclick", "triggerNext(this.id)");
  newButton.appendChild(textarea);
  document.getElementsByClassName("container")[0].appendChild(newButton);
  }
}

//fetches layout info for all pages and updates page
function loadPageContent(){
    fetch("page_data.json")
      .then(response => response.json())
      .then(json => {
        pageContent = json.content[language];
        base.updater();
      })
      .catch(err => {throw err})
}
async function flashMessage(messageType, message){
  var messageContainer =  document.createElement("div");
  var messageCaption =  document.createElement("p");
  var messageBody =  document.createElement("p");
  messageContainer.className = "message";
  messageCaption.className = "message-type";
  messageBody.className = "message-body";
  messageCaption.textContent = messageType;
  messageBody.textContent = message;
  messageContainer.appendChild(messageCaption);
  messageContainer.appendChild(messageBody);
  await document.body.prepend(messageContainer);
  var messageElement = document.getElementsByClassName("message")[0];
   setTimeout(function(){ messageElement.remove() }, 5000);
  // setTimeout(, 5000);
}
function setLangColors(){
  let langColors = ["#ff1616", "black", "#ff5757", "rgb(31, 79, 166)", "#008037", "#c4882d"];
  langColors = ["#ff1616", "black", "gray", "gray", "gray", "gray"]; // update when support
  if (pageName == "language") {
    for (var i = 0; i < buttons.length; i++){
      buttons[i].style.background = langColors[i];
    }
  }
}
//calling functions
setLangColors();
document.onLoad = loadToggle("off");
let base = new Body();
