function doGet(e) {
  try { // attempt to parse a url parameter, v
    let view = e.parameters.v; // v represents the html file that will be viewed
    return HtmlService.createTemplateFromFile(view).evaluate();
  }
  catch(err) { // if no parameter is specified, view index.html
    return HtmlService.createTemplateFromFile('index').evaluate();
  }
}

function include(filename) { // imports html files (stylesheet and client side scripts) 
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// Converts a folder URL into the folder's ID. Necessary for .getFolderById() 
function folderUrlToId(url) {
  url += '/' //prevents last char of ID from being sliced if url does not contain any parameters after the ID
  let start = url.indexOf('/', url.indexOf('folders')) + 1; // beginning index of ID
  let end = url.indexOf('?'); // '?' will be immediately after the ID, or not present in which .indexOf() will return -1
  return url.slice(start,end); //slices the folder ID from the url
}

//console.log(folderUrlToId('https://drive.google.com/drive/u/0/folders/1FFpJfF-q5QNJiitRcyn_3Qpd5W5eknJG'));


//returns the name of a folder as a string, given the url to the folder
function folderUrlToName(url) {
  let id = folderUrlToId(url);
  return DriveApp.getFolderById(id).getName();
}

//console.log(folderUrlToName('https://drive.google.com/drive/u/0/folders/1FFpJfF-q5QNJiitRcyn_3Qpd5W5eknJG'));


//returns the name of a sheet, given the url of the sheet
function spreadsheetUrlToName(url){
  return SpreadsheetApp.openByUrl(url).getName();
}

//console.log(spreadsheetUrlToName('https://docs.google.com/spreadsheets/d/1Yskn8uv3ddZOceqOyull_KpdINqVROoeb1Zp-sQydUY/edit#gid=0'));


/**
 * Returns an array of student objects, each with a first, last, and user property
 * Reads the student info from a google sheet, the url of which is the input parameter
 * 
 * The sheet must be formatted so that there is a header row, with first names in column A, 
 * last names in column B, and usernames in the last column holding data
 * 
 * This format is produced automatically by downloading a roster from a schoology classroom, which is why it was chosen
 */
function getStudents(url){
  let sheet = SpreadsheetApp.openByUrl(url);
  SpreadsheetApp.setActiveSpreadsheet(sheet);
  let roster = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  let lastRow = roster.getLastRow();
  let lastColumn = roster.getLastColumn();
  
  let range = roster.getRange(2, 1, lastRow - 1, lastColumn); //excludes column headers in the top row
  let values = range.getValues(); // returns an array of arrays, where each array is a row from the range
  let students = [];

  for(var row in values){ // creates an object literal for each student and adds it to the students array
    students.push({
      first: values[row][0],
      last: values[row][1],
      user: values[row][lastColumn - 1]
    });
  }
  return students;
}

//console.log(getStudents('https://docs.google.com/spreadsheets/d/1Yskn8uv3ddZOceqOyull_KpdINqVROoeb1Zp-sQydUY/'));


//creates a child folder for each student in a class section folder
function createStudentFolders(subFolder, rosterURL, classFolderName, studentFolderAppend){
  if(subFolder){ //checks to see if a subfolder link was provided
    subFolder = DriveApp.getFolderById(folderUrlToId(subFolder)); // sets the linked folder as the parent for the class folder
  } else{
    subFolder = DriveApp; // if no subfolder specified, creates the class folder in the main drive
  }
  let students = getStudents(rosterURL);
  let classFolder = subFolder.createFolder(classFolderName);

  let student;
  for(let i = 0; i < students.length; i++){
    student = students[i]
    folderName = student.last + ', ' + student.first;
    if(studentFolderAppend){ // appends a given string on the student folder name, if provided
      folderName += " (" + studentFolderAppend + ")";
    }
    classFolder.createFolder(folderName);
  }
}
//let studentUrl = 'https://docs.google.com/spreadsheets/d/1Yskn8uv3ddZOceqOyull_KpdINqVROoeb1Zp-sQydUY/edit#gid=0';
//let testFolder = 'https://drive.google.com/drive/folders/1FFpJfF-q5QNJiitRcyn_3Qpd5W5eknJG';
//createStudentFolders("Test Class", studentUrl, testFolder);



// This function was what originally inspired this project
// I had made some student folders by hand, and ended up needing to rename them all later
// Rather than doing that by hand as well, I wrote the script below to automate the process
/*
function renameFolders(id){
  let sourceFolder = DriveApp.getFolderById(id)
  let folders = sourceFolder.getFolders();
  while(folders.hasNext()) {
    let subfolder = folders.next();
    subfolderName = subfolder.getName();
    //do stuff
    //newSubfolderName = subfolderName.slice(0, -16); 
    //subfolder.setName(newSubfolderName);
    //console.log(subfolderName + " renamed to " + newSubfolderName);
  }
  console.log("done");
}
*/
