/* Function popTrello() - Max Stoaks
Populates Trello with data from the Projects sheet

TODO:
-change getValue() to getValues() [bulk operation performance better] - DONE
*/


function popTrello() {
  var key = "YOUR-KEY" ;
  var token = "YOUR-TOKEN";

  //get the projects... need A (name), C(description), J(phase), T(gsb prioritize), V(ds prioritize)

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.setActiveSheet(ss.getSheetByName("Projects"));
  var dataRange = activeSheet.getDataRange();
  var numCols = dataRange.getNumRows();

  var valuesArray = dataRange.getDisplayValues();



  var allProjects = new Array();

  //create a list of all projects
  for (var x = 1; x < dataRange.getNumRows(); x++) {
    var proj = new Object();
    proj.name = valuesArray[x][0];
    proj.description = valuesArray[x][2];
    proj.phase = valuesArray[x][9];
    proj.gsbPrioritize = valuesArray[x][19];
    proj.dsPrioritize = valuesArray[x][21];
    allProjects.push(proj);
    Logger.log("Added project " + proj.name + " to allProjects");
  }

  //create a list of all projects - THIS WAS WAY SLOW
  /*for (var x = 2; x <= dataRange.getNumRows(); x++) {
    var proj = new Object();
    proj.name = dataRange.getCell(x,1).getValue();
    proj.description = dataRange.getCell(x,3).getValue();
    proj.phase = dataRange.getCell(x,10).getValue();
    proj.gsbPrioritize = dataRange.getCell(x,20).getValue();
    proj.dsPrioritize = dataRange.getCell(x,22).getValue();
    allProjects.push(proj);
    Logger.log("Added project " + proj.name + " to allProjects");
  }*/

  var deliveryProjects = new Array();
  var hldCompleteProjects = new Array();
  var hldProjects = new Array();
  var conceptCompleteProjects = new Array();
  var conceptProjects = new Array();
  var preconceptProjects = new Array();
  //var gsbPrioProjects = new Array();

  //create list of all GSB Prioritize projects NOTE - does not include completed "In Production" phase

  allProjects.forEach(function(element) {
    if (element.gsbPrioritize == "TRUE")
    {
      if (element.phase == "Delivery")
      {
        deliveryProjects.push(element);
      }
      else if (element.phase == "High Level Design Complete")
      {
        hldCompleteProjects.push(element);
      }
      else if (element.phase == "High Level Design") {
        hldProjects.push(element);}
      else if (element.phase == "Concept Complete") {
        conceptCompleteProjects.push(element);}
      else if (element.phase == "Concept" ) {
        conceptProjects.push(element)}
      else  if (element.phase == "Pre-concept") preconceptProjects.push(element);
    }
  });

  // add them in groups of phases so they appear ordered by groups in Trello - (they are already alpha)

  var gsbPrioProjects = deliveryProjects.concat(hldCompleteProjects).concat(hldProjects).concat(conceptCompleteProjects).concat(conceptProjects).concat(preconceptProjects);

  addListCardsTrello(gsbPrioProjects);
}

//function to add a list and cards to Trello given an array of objects
function addListCardsTrello(gsbPrioProjects) {
  Logger.log("in addListCardsTrello");

  var key = "YOUR-KEY" ;
  var token = "YOUR-TOKEN";
  var boardID = "YOUR-BOARD-ID";
  var now = new Date();
  var listName = "To Be Prioritized generated " + now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + "  " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

  //label IDs
  LABEL_DELIVERY_ID = "59e93a511314a339993f11b0";
  LABEL_HIGH_LEVEL_DESIGN_COMP_ID = "59e93a511314a339993f11ae";
  LABEL_HIGH_LEVEL_DESIGN_ID = "59e93a511314a339993f11af";
  LABEL_CONCEPT_COMPLETE_ID = "59e93a511314a339993f11ad";
  LABEL_PRE_OR_CONCEPT_ID = "59efaf0eb34709dd691157cb";

  //create a new list

  var payload = {
    'key': key,
    'token' : token,
    'name' : listName,
    'idBoard' : boardID
  }

  var params = {
    'contentType':'application/json',
    'method': 'post',
    'payload' : JSON.stringify(payload)
 }



  //var response = UrlFetchApp.fetch('https://api.trello.com/1/lists?name=' + listName + '&idBoard=59e93a51a6567f5905abf3f3&key='+ key +'&token=' +token   , params);
  var response = UrlFetchApp.fetch('https://api.trello.com/1/lists', params);



  var responseHeaders = response.getAllHeaders();
  var responseText = response.getContentText();

  var newListID = JSON.parse(responseText).id;

  //create a card for each item in the passed array
  gsbPrioProjects.forEach(function(element){
    var projName = element.name;
    var projDesc = element.description;

    //add the label info
    switch (element.phase) {
      case "Delivery": element.labelID = LABEL_DELIVERY_ID;
      break;
      case "High Level Design Complete": element.labelID = LABEL_HIGH_LEVEL_DESIGN_COMP_ID;
      break;
      case "High Level Design": element.labelID = LABEL_HIGH_LEVEL_DESIGN_ID;
      break;
      case "Concept Complete": element.labelID = LABEL_CONCEPT_COMPLETE_ID;
      break;
      case "Concept": element.labelID = LABEL_PRE_OR_CONCEPT_ID;
      break;
      case "Pre-concept": element.labelID = LABEL_PRE_OR_CONCEPT_ID;
      break;
    };

    var payloadCard = {
        'key': key,
        'token' : token,
        'name' : element.name,
        'idList' : newListID,
        'desc' : element.description,
        'idLabels' : element.labelID
      };

    var paramsCard = {
      'contentType':'application/json',
      'method': 'post',
      'payload' : JSON.stringify(payloadCard)
    }


    var response = UrlFetchApp.fetch('https://api.trello.com/1/cards', paramsCard);



  });

}



//======================== NOT USED=======================/
function getNowDateTimeString() {
  var d = new Date();
  var month = '' + (d.getMonth() + 1);
  var day = '' + d.getDate();
  var year = d.getFullYear();
  var hour = d.getHours()
  var min = d.getMinutes();
  var sec = d.getSeconds();

  if (month.length < 2) {month = '0' + month};
  if (day.length < 2) {day = '0' + day};

  return([year, month, day].join('-'));
}
