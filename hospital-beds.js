// geoLocation format: [latitude, longitude, cityName, dataFile]

// adding data manually
var geoLocation;
// geoLocation.push("delhi");
// geoLocation.push("https://coronabeds.jantasamvad.org/covid-info.js");
// geoLocation.push("https://coronabeds.jantasamvad.org/covid-facilities.js");
var allEntries; //format of totalEntries : [name, distance, vacancyPercentage, vacantBeds, hlat, hlong]
var specialEntries; //[suggested, nearest, most-probable]
var rankEntries;//name index score rank
const rankedObjects = {};//[name, score, distance, vacantBeds, latitude, longitude]



//attaches the dataFile
function getDataFile(fileLocation){
  var imported = document.createElement('script');
  imported.src = fileLocation;
  imported.type = 'text/javascript';
  document.head.appendChild(imported);
  return('ok');
}
// delhi covid website has two different objects one for dynamic info and for static info
getDataFile(geoLocation[3]);
getDataFile(geoLocation[4]);
// BUG: fill missing static info in the backend
// BUG: generalised name format for data file to implement on all states
//FOLLOWING ONLY WORK IF THE FILE HAS BEEN FETCHED

function mainCaller(){
  var lombardIgnition = async () => {console.log("senor! Lombard is starting")};
  lombardIgnition()
    .then(() => {console.log(`if this prints then file has been fetched ${gnctd_covid_facilities_data["Rajeev Gandhi Super Speciality Hospital"].type}`)})
    .then(() => {getSuggestions(geoLocation[0], geoLocation[1], gnctd_covid_facilities_data, gnctd_covid_data)})
}


async function getSuggestions(latitude, longitude, staticObject, dynamicObject){
  createAllEntriesArray(latitude, longitude, staticObject, dynamicObject);
  mainRanker();
  console.log(
    `suggested: ${allEntries[specialEntries[0]][0]}\nradial distance: ${allEntries[specialEntries[0]][1]}\nvacant beds: ${allEntries[specialEntries[0]][3]}`
  );
}

//testing specific function
function generateTable(tableGenerateNumber){
  var tableGenerateNumber = +document.getElementById('tableGenerateNumber').value;
  for (var i = 0; i < tableGenerateNumber; i++) {
    var row = document.createElement('tr');
    //print serial serialnumber
    var serial = document.createElement('td');
    serial.textContent = i + 1;
    //print name
    var name = document.createElement('td');
    name.textContent = rankedObjects[(i + 1)][0];
    //print distance
    var distance = document.createElement('td');
    distance.textContent = rankedObjects[(i + 1)][2];
    //print vacant beds
    var vacantBeds = document.createElement('td');
    vacantBeds.textContent = rankedObjects[(i + 1)][3];

    row.append(serial);
    row.append(name);
    row.append(distance);
    row.append(vacantBeds);
    document.getElementsByTagName('table')[0].append(row)
  }
}

//object organising and calculating functions
function createAllEntriesArray(latitude, longitude, staticObject, dynamicObject){
  var trialNumber = 0;
  var errorEntries = 0;
  var iterationNumber = 0;
  for (let key in staticObject){
    try {
      let coords = staticObject[key]["location"].match (/\@-?[\d\.]*\,([-?\d\.]*)/g)[0].slice(1,).split(",");
      let hospName = key, hlat = convertToRadian(+coords[0]), hlong = convertToRadian(+coords[1]), totalEntries = Object.keys(staticObject).length;
      let vacantBeds = dynamicObject.beds[key].vacant;
      let vacancyPercentage = vacantBeds * 100 / dynamicObject.beds[key].total;
      distance = distanceCalculator(latitude, hlat, longitude, hlong);
      if (iterationNumber == 0) {allEntries = new Array(totalEntries)};
      allEntries[iterationNumber] = [hospName, distance, vacancyPercentage, vacantBeds, hlat, hlong];
      iterationNumber++;
    } catch (e) {
      // console.log(e); "I don't like to see errors, so what"
      errorEntries++;
    } finally {
      trialNumber++
    }
  }
  allEntries.splice(iterationNumber, errorEntries);
  console.log(`working entries: ${iterationNumber}\nerror entries: ${errorEntries}\ntotal entries: ${errorEntries + iterationNumber} or ${trialNumber}`);
}
function distanceCalculator(myLatitude, hospLatitude, myLongitude, hospLongitude){
  const radius = 6371e3;
  var underRootTerm = squared(Math.sin((myLatitude - hospLatitude) / 2)) + Math.cos(myLatitude) * Math.cos(hospLatitude) * squared(Math.sin((myLongitude - hospLongitude) / 2));
  d = 2 * radius * Math.sqrt(underRootTerm);
  return d;
}
function convertToRadian(input){
  return (Math.PI * input) / 180;
}
function squared(number){return number**2}

//suggestor and ranking functions
async function mainRanker(){
  rankEntries = new Array(allEntries.length);
  passScoreAndName(rankEntries);
  passRank(rankEntries);
  getSpecialEntries(rankEntries);
  for (const key of rankEntries) {
    try {
      let rank = key[3].toString();
      rankedObjects[rank] = [key[0], key[2], allEntries[key[1]][1], allEntries[key[1]][3], allEntries[key[1]][4], allEntries[key[1]][5]];
    } catch (e) {
      console.log(`error in main ranker while making ranked object: ${e}`);
    }
  }
}
function passScoreAndName(rankEntries){
  for (var i = 0; i < allEntries.length; i++) {
    let name = allEntries[i][0], score, rank, indexId = i;
    function calculateScore(no){
      let object = allEntries[no];
      let distance = object[1], vacancyPercentage = object[2], vacantBeds = object[3];
      return (8000 - distance) * vacancyPercentage * vacantBeds;
    }
    score = calculateScore(i);
    rank = 1;
    rankEntries[i] = [name, indexId, score, rank];
  }
}
function passRank(rankEntries){
  for (let me of rankEntries) {
    var myScore = me[2];
    var myRank = me[3];
    for (let him of rankEntries) {
      var hisScore = him[2];
      var hisRank = him[3];
      if (myScore <  hisScore) {
        myRank++;
      }
    }
    me[3] = myRank;
  }
}
function getSpecialEntries(rankEntries){
    let firstRank, nearest, highAvailability, distance = 10000, vacancy = 0;
    for(let hospital of rankEntries){if(hospital[3] == 1){firstRank = hospital[1]}};
    for(let i in allEntries){
      if(allEntries[i][1] < distance){distance = allEntries[i][1]; nearest = i}
    };// BUG: prioritise in case of same distance or very close**
    for(let i in allEntries){
      if(allEntries[i][2] > vacancy){vacancy = allEntries[i][2]; highAvailability = i}
    };// BUG: prioritise in case of same vacancy
    specialEntries = [firstRank, +nearest, +highAvailability];
}
