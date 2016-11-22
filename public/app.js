
//console.log(firebase);
var database = firebase.database();
var name ="";
var userList = {};
var local_id = 0;
var storyScript = {};
var uploadedObject = false;
var uploadButton;
var scriptButton;
var timelineButton;
var episode_number = 1;
var lines = {};
var totalLines = 0;
var dialogs = {};
var scrollY = 0;
var nameColors = {};
var mode = 'script';
var maxScroll = 0;
var currentScroll = 0;
var beginClickY = 0;
var selectedLine = {};
var taskList = {};
var taskNumber = 0;
var objectTargeted = {};
var descriptionBox;
var createConfirmBox;
var createCancelBox;
var textInput = '';
var positions = {};
var taskButtons = {};

class Button {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.width = this.text.length * 12;
    this.height = 30;
  }

  drawButton() {
    if (this.hoverButton()) 
      fill(255);
    else
      fill(200);
    rect(this.x, this.y, this.width, this.height);
    
    fill(0);
    textAlign(CENTER);
    text(this.text, this.x + this.width/2, this.y+20);
  }

  hoverButton() {
    return (mouseX >= this.x && mouseX < this.x + this.width && mouseY >= this.y && mouseY < this.y + this.height);
  }
}

class DialogBox {
  constructor(number, text) {
    this.number = number;
    this.text = text;
    this.parseLine();
    this.height = 0;
    if (this.characterName != null)
      this.height += 30;
    if (this.instructions != null)
      this.height += 30;
    if (this.dialog != null)
      this.height += 30;
  }

  drawBox(x, y) {
    var width = window.innerWidth - 250;
    if (mouseX >= x && mouseX < x + width && mouseY >= y && mouseY < y + this.height) 
      fill(255);
    else
      fill(200);

    rect(x, y, width, this.height, 4);
    fill(0);
    textAlign(LEFT);

    var lineY = 0;
    textStyle(NORMAL);
    fill(50);
    text("Line " + this.number, x + 5, y + 20);
    if (this.characterName != null) {
      fill(nameColors[this.characterName].red, nameColors[this.characterName].blue, nameColors[this.characterName].green);
      textStyle(BOLD);
      text(this.characterName, x + 65, y + 20);
      lineY += 30;
    }
    if (this.instructions != null) {
      fill(0);
      textStyle(ITALIC);
      text(this.instructions, x + 65, y + 20 + lineY);
      lineY += 30;
    }
    if (this.dialog != null) {
      textStyle(NORMAL);
      fill(nameColors[this.characterName].red, nameColors[this.characterName].blue, nameColors[this.characterName].green);
      text(this.dialog, x + 65, y + 20 + lineY);
    }
  }

  drawButtons(x, y) {
    var bwidth = window.innerWidth - 250;

    if (mouseX >= bwidth - 10 && mouseX < bwidth + 40 && mouseY >= y + 5 && mouseY < y + 25) 
      fill(50, 255, 50);
    else
      fill(30, 205, 30);

    noStroke();
    rect (bwidth - 10, y + 5, 50, 20, 2);
    textAlign(CENTER);
    fill(255);
    textStyle(NORMAL);
    text("Create", bwidth + 15, y + 20);
  }

  clickButtons(x, y) {
    var bwidth = window.innerWidth - 250;

    if (mouseX >= bwidth - 10 && mouseX < bwidth + 40 && mouseY >= y + 5 && mouseY < y + 25) {
      if (mouseIsPressed) {
        selectedLine = {
          line_number: this.number,
          line_text: this.text,
          button_x: bwidth - 10,
          button_y: y + 5,
          button_width: 50,
          button_height: 20,
        };
      }
    }
  }

  parseLine() {
    var fullLine = this.text;
    var talking = '';
    while(fullLine != '') {
      if (fullLine.indexOf(':') > 0) {
        this.characterName = fullLine.substring(0, fullLine.indexOf(':'));
        fullLine = fullLine.substring(fullLine.indexOf(':') + 1);
      }
      else if (fullLine.charAt(0) == ' ' || fullLine.charAt(0) == '\n' || fullLine.charAt(0) == '\r') {
        fullLine = fullLine.substring(1);
      }
      else if (fullLine.charAt(0) == '[' && fullLine.indexOf(']') > 0) {
        this.instructions = fullLine.substring(0, fullLine.indexOf(']')+1);
        fullLine = fullLine.substring(fullLine.indexOf(']') + 1);
      }
      else {
        talking += fullLine;
        fullLine = '';
      }
    }
    if (talking != '') {
      this.dialog = talking;
    }
    if (!(this.characterName in nameColors)) {
      nameColors[this.characterName] = {
        red: floor(random(0, 155)),
        blue: floor(random(0, 155)),
        green: floor(random(0, 155)),
      }
    }
  }
}

class TaskButton {
  constructor(object, column, row) {
    this.taskInfo = object;
    this.column = column;
    this.row = row;
  }

  drawButton(x, y) {
    if (mouseX > x + this.column * 105 && mouseX < x + this.column * 105 + 100 && mouseY > y + this.row * 32 && mouseY < y + this.row * 32 + 30)
      fill(250);
    else
      fill(200);
    rect(x + this.column * 105, y + this.row * 32, 100, 30, 5);
    fill(0);
    textAlign(CENTER);
    textStyle(BOLD);
    text('Line ' + this.taskInfo.line_object.line_number, x + this.column * 105 + 50, y + this.row * 32 + 20);
  }

  clickButtons(x, y) {

    if (mouseX >= x + this.column * 105 && mouseX < x + this.column * 105 + 100  && mouseY >= y + this.row * 32 && mouseY < y + this.row * 32 + 30) {
      if (mouseIsPressed) {
        selectedLine = this.taskInfo;
      }
    }
  }
}

function setup () {
  createCanvas(window.innerWidth - 100, window.innerHeight - 100);

  var userDataPromise = readUserData();

  userDataPromise.then(function(data) {
    local_id = objSize(userList);
  });

  // Check for the various File API support.
  if (window.File && window.FileReader) {
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

  uploadButton = new Button(50, 50, "Upload");
  scriptButton = new Button((window.innerWidth-100)/2 - 100, 10, "Script");
  timelineButton = new Button((window.innerWidth-100)/2 + 100, 10, "Time Line");

  createButtons();
}

function draw () {

  background(0);

  if (mode == 'script') {

    if (uploadedObject) {
      //uploadButton.drawButton();
    }
    if (name == '') {
      if (dialogs != null) {
        var space = 0;
        for (var i = 0; i < totalLines; i++) {
          if (dialogs[i] != null) {
            dialogs[i].drawBox(50, 75 + space - scrollY);
            dialogs[i].drawButtons(50, 75 + space - scrollY);
            dialogs[i].clickButtons(50, 75 + space - scrollY);
            space += dialogs[i].height + 5;
          }
        }
        maxScroll = space;
      }
    }
    if (scrollY < 0) {
      scrollY += abs(scrollY) / 5;
    }

    if (scrollY > maxScroll - 500) {
      scrollY -= abs(maxScroll - 500 - scrollY) / 5;
    }

    if (maxScroll > (windowHeight - 50)) {
      var barSize = 1 + ((windowHeight - 50) / maxScroll) * (windowHeight - 50);
      currentScroll = 50 + (scrollY / maxScroll) * (windowHeight - 50 - barSize * 3);
      fill(255);
      if (mouseIsPressed && mouseX >= windowWidth - 125) {
        currentScroll = mouseY - barSize/2;
        scrollY = (currentScroll - 50) / (windowHeight - 50 - barSize * 3) * (maxScroll);
      }
      rect(windowWidth - 125, currentScroll, 25, barSize); 
    }
  }

  else if (mode == 'create') {
    fill(200);
    rect(100, 100, windowWidth - 300, windowHeight - 250, 10);
    textAlign(CENTER);
    textStyle(BOLD);
    fill(0);
    text("CREATE TASK", windowWidth/2, 120);

    textAlign(LEFT);
    textStyle(NORMAL);
    text("Line Number: " + selectedLine.line_number + "\n\n" + 
      "Line Text: " + selectedLine.line_text, 150, 200);
    text("Description of Task: ", 150, 400);
    fill(200);
    if ((hoveringOver(descriptionBox)) || (objectTargeted == descriptionBox)) {
      fill(250);
    }
    else
      fill(220);
    rect(descriptionBox.x, descriptionBox.y, descriptionBox.width, descriptionBox.height, 5);
    fill(0);
    text(textInput, 280, 400);

    if ((hoveringOver(createConfirmBox)) || (objectTargeted == createConfirmBox)) {
      fill(50, 250, 50);
    }
    else
      fill(30, 200, 30);
    rect(createConfirmBox.x, createConfirmBox.y, createConfirmBox.width, createConfirmBox.height, 5);
    fill(255);
    textAlign(CENTER);
    textStyle(BOLD);
    text('Confirm', createConfirmBox.x + createConfirmBox.width/2, createConfirmBox.y + 20);

    if ((hoveringOver(createCancelBox)) || (objectTargeted == createCancelBox)) {
      fill(250, 20, 20);
    }
    else
      fill(200, 10, 10);
    rect(createCancelBox.x, createCancelBox.y, createCancelBox.width, createCancelBox.height, 5);
    fill(255);
    textAlign(CENTER);
    textStyle(BOLD);
    text('Cancel', createCancelBox.x + createCancelBox.width/2, createCancelBox.y + 20);
  }

  else {
    var i = 0;
    var j = 0;
    var taskCount = 0;
    for (uniqueLines in positions) {
      for(task in positions[uniqueLines]) {
        taskButtons[taskCount] = new TaskButton(positions[uniqueLines][task], i, j);
        j++;
        taskCount ++;
      }
      i++;
      j = 0;
    }

    for (var k = 0; k < objSize(taskButtons); k++) {
      taskButtons[k].drawButton(50, 200);
      taskButtons[k].clickButtons(50, 200);
    }
    fill(200);
    rect(50, 400, windowWidth-200, windowHeight-550, 10);

    if (selectedLine != null) {
      fill(0);
      textAlign(LEFT);
      textStyle(NORMAL);
      if (selectedLine.line_object != null) {
        text("Text: " + selectedLine.line_object.line_text, 60, 430);
        text("Task: " + selectedLine.description, 60, 500);
      }
    }
  }

  fill(0);
  rect(0, 0, windowWidth, 50);
  fill(255);
  textAlign(LEFT);
  textStyle(BOLD);
  text("Enter the episode number: " + name, 50, 25)

  scriptButton.drawButton();
  timelineButton.drawButton();

}

function populateLines() {
  if (storyScript != null) {
    if (storyScript.text != '') {
      var fulltext = storyScript.text;
      var lineNum = 0;
      var nextLine = '';
      while (fulltext != '' && fulltext != null) {
        if (fulltext.indexOf('\n') > 0) {
          nextLine = fulltext.substring(0, fulltext.indexOf('\n'))
          if (nextLine != '\n' && nextLine != '\r') {
            lines[lineNum] = nextLine;
            lineNum ++;
          }
          if (fulltext.indexOf('\n')) {
            fulltext = fulltext.substring(fulltext.indexOf('\n')+1);
          }
        }
        else {
          lines[lineNum] = fulltext;
          lineNum ++;
          fulltext = '';
        }
      }
      totalLines = objSize(lines);
      for (var i = 0; i < totalLines; i++) {
        dialogs[i] = new DialogBox(i, lines[i]);
      }
    }
  }
  else {
    lines = {};
    dialogs = {};
  }
}

function mousePressed() {
  beginClickY = mouseY;
}

function keyTyped() {
  if (mode == 'script')
    if (keyCode != ENTER)
    name += key;
  if (mode == 'create' && objectTargeted == descriptionBox) {
    if (keyCode == ENTER) {
      textInput += '\n';
    }
    else 
      textInput += key;
  }
}

function mouseWheel(event) {
  var barSize = 1 + ((windowHeight - 50) / maxScroll) * (windowHeight - 50);
  scrollY += event.delta / 2;
}

function mouseReleased() {
  if (scriptButton.hoverButton())
      mode = 'script';

  if (timelineButton.hoverButton() && mode != 'timeline') {
    mode = 'timeline';

    positions = {};
    for(var i = 0; i < objSize(taskList); i++) {
      var task_lineNum = taskList[i].line_object.line_number;
      if (positions[task_lineNum] == null)
        positions[task_lineNum] = {};
      positions[task_lineNum][i] = taskList[i];
    }
    //console.log(positions);
    selectedLine = {};
  }

  if (mode == 'script') {
    if (uploadButton.hoverButton() && uploadedObject) {
      writeScriptData();
      uploadedObject = false;
    }

    if (selectedLine != null) {
      if (mouseX >= selectedLine.button_x && mouseX < selectedLine.button_x + selectedLine.button_width && mouseY >=  selectedLine.button_y && mouseY <  selectedLine.button_y +  selectedLine.button_height) {
        mode = 'create';
        textInput = '';
        objectTargeted = {};
      }
    }
  }
  if (mode == 'create') {
    if (hoveringOver(descriptionBox)) {
      objectTargeted = descriptionBox;
    }
    else if (hoveringOver(createConfirmBox)) {
      taskList[taskNumber] = {
        line_object: selectedLine,
        description: textInput,
      };
      taskNumber++;
      objectTargeted = {};
      textInput = '';
      mode = 'script';
    }
    else if (hoveringOver(createCancelBox)) {
      objectTargeted = {};
      textInput = '';
      mode = 'script';
    }
    else {
      objectTargeted = {};
    }
  }
}

function keyPressed() {
  if (mode == 'script') {
    if (keyCode == ENTER) {
      // if (name != "") {
      // writeUserData("user_" + local_id, name, "email@gmail.com", "");
      // name = "";
      // console.log("entered");
      // }

      if (name != "") {
        var number = parseInt(name)
        if (Number.isInteger(number)) {
          episode_number = number;
          storyScript = {};
          getScriptNumber();
        }
        name = "";
      }
    }

    if (keyCode == BACKSPACE) {
      if (name.length > 0) {
        name = name.substring(0, name.length-1);
      }
    }
  }
  if (mode == 'create') {
    if (keyCode == BACKSPACE) {
      if (textInput != "") {
        textInput = textInput.substring(0, textInput.length-1);
      }
    }
  }
}

function writeUserData(userId, name, email) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: "email",
  });
}

function writeScriptData() {

  firebase.database().ref('scripts/episode_' + episode_number).set({
    filename: storyScript.filename,
    text: storyScript.text
  });
}


function readUserData() {
  return firebase.database().ref('/users/').once('value').then(function(snapshot) {
    var username = snapshot.val();
    userList = username;
  });
}

function readScriptData() {
  return firebase.database().ref('/scripts/episode_' + episode_number).once('value').then(function(snapshot) {
    var getScripts = snapshot.val();
    if (getScripts != null) {
      storyScript = getScripts;
    }
    else {
      storyScript = {};
    }
  });
}

function objSize(obj) {
  var count = 0;
  for (each in obj) {
    count++;
  }
  return count;
}

function handleFileSelect(evt) {
  var file = evt.target.files[0]; // FileList object

  var readFile = new FileReader();
  readFile.onload = function(e) {
    storyScript['filename'] = file.name;
    storyScript['text'] = e.target.result;
    uploadedObject = true;
  };
  readFile.readAsText(file,'UTF-8');
  //console.log(readFile);
}

function getScriptNumber() {
  var scriptDataPromise = readScriptData();

  scriptDataPromise.then(function(data) {
    console.log("got script");
    populateLines();
  });
}

function createButtons() {
  descriptionBox = {
    x: 275,
    y: 385,
    width: windowWidth - 550,
    height: windowHeight - 600,
  };

  createCancelBox = {
    x: windowWidth/2 - 40 + 60,
    y: windowHeight - 200,
    width: 100,
    height: 30,
  };


  createConfirmBox = {
    x: windowWidth/2 - 40- 60,
    y: windowHeight - 200,
    width: 100,
    height: 30,
  };

}

function hoveringOver(object) {
  return (mouseX > object.x && mouseX < object.x + object.width && mouseY > object.y && mouseY < object.y + object.height)
}

//document.getElementById('file').addEventListener('change', handleFileSelect, false);