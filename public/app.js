
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
var scrollX = 0;
var nameColors = {};
var mode = 'script';
var maxScroll = 0;
var currentScroll = 0;
var hcurrentScroll = 0;
var beginClickY = 0;
var selectedLine = {};
var taskList = {};
var taskNumber = 0;
var objectTargeted = {};
var descriptionBox;
var createConfirmBox;
var createCancelBox;
var markNotStartedBox;
var markInProgressBox;
var markCompletedBox;
var textInput = '';
var positions = {};
var taskButtons = {};
var selectedObject = {};
var NORMALBOXCOLOR = 30;
var NORMALBOXHIGHLIGHTED = 75;
var NORMALTEXTBOX = 60;
var NORMALTEXTHIGHLIGHTED = 100;
var selectedTask = {};
var maxHScroll = 0;
var scrollingEnabled = false;

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
    var width = window.innerWidth - 150;
    if (mouseX >= x && mouseX < x + width && mouseY >= y && mouseY < y + this.height) 
      fill(NORMALBOXHIGHLIGHTED);
    else
      fill(NORMALBOXCOLOR);

    rect(x, y, width, this.height, 4);
    fill(0);
    textAlign(LEFT);

    var lineY = 0;
    textStyle(NORMAL);
    fill(255);
    text("Line " + this.number, x + 5, y + 20);
    if (this.characterName != null) {
      fill(nameColors[this.characterName].red, nameColors[this.characterName].blue, nameColors[this.characterName].green);
      textStyle(BOLD);
      text(this.characterName, x + 65, y + 20);
      lineY += 30;
    }
    if (this.instructions != null) {
      fill(150);
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
    var bwidth = window.innerWidth - 150;

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
    var bwidth = window.innerWidth - 150;

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
        red: floor(random(100, 255)),
        blue: floor(random(100, 255)),
        green: floor(random(100, 255)),
      }
    }
  }
}

class TaskButton {
  constructor(object, column, row, taskNum) {
    this.taskInfo = object;
    this.column = column;
    this.row = row;
    this.state = 0;
    this.taskNum = taskNum;
    console.log(this.taskNum);
  }

  drawButton(x, y) {
    if (mouseX > x + this.column * 105 && mouseX < x + this.column * 105 + 100 && mouseY > y + this.row * 32 && mouseY < y + this.row * 32 + 30) {
      if (this.state == 0)
        fill(250, 20, 20);
      else if (this.state == 1)
        fill(250);
      else 
        fill(50, 255, 50);
    }
    else {
      if (this.state == 0)
        fill(200, 10, 10);
      else if (this.state == 1)
        fill(200);
      else
        fill(30, 205, 30);
    }
    rect(x + this.column * 105, y + this.row * 32, 100, 30, 5);
    fill(0);
    textAlign(CENTER);
    textStyle(BOLD);
    text('Line ' + this.taskInfo.line_object.line_number, x + this.column * 105 + 50, y + this.row * 32 + 20);
  }

  clickButtons(x, y) {
    if (mouseX >= x + this.column * 105 && mouseX < x + this.column * 105 + 100  && mouseY >= y + this.row * 32 && mouseY < y + this.row * 32 + 30) {
      //selectedLine = this.taskInfo;
      if (mouseIsPressed) {
        selectedObject = this;
      }
    }
  }
  releaseButton() {
    selectedLine = this.taskInfo;
    selectedTask = this;
    selectedObject = {};
  }
}

function setup () {
  createCanvas(window.innerWidth - 25, window.innerHeight * 0.9);

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

function windowResized() {
  createButtons();
  resizeCanvas(window.innerWidth - 25, window.innerHeight * 0.9);
}

function draw () {

  background(51);

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

    if (maxScroll > (windowHeight * 0.9)) {
      var barSize = 1 + ((windowHeight * 0.9) / maxScroll) * (windowHeight * 0.9);
      currentScroll = 50 + (scrollY / maxScroll) * (windowHeight * 0.9 - barSize * 1.5);
      fill(255);
      if (mouseIsPressed && mouseX >= windowWidth - 50)
        scrollingEnabled = true;
      if (scrollingEnabled) {
        currentScroll = mouseY - barSize/2;
        scrollY = (currentScroll - 50) / (windowHeight * 0.9 - barSize * 1.5) * (maxScroll);
      }
      rect(windowWidth - 50, currentScroll, 25, barSize); 
    }
  }

  else if (mode == 'create') {
    fill(NORMALBOXCOLOR);
    rect(100, 100, windowWidth - 300, windowHeight - 250, 10);
    textAlign(CENTER);
    textStyle(BOLD);
    fill(155);
    text("CREATE TASK", windowWidth/2, 120);

    textAlign(LEFT);
    textStyle(NORMAL);
    text("Line Number: " + selectedLine.line_number + "\n\n" + 
      "Line Text: " + selectedLine.line_text, 150, 200);
    text("Description of Task: ", 150, 400);
    if ((hoveringOver(descriptionBox)) || (objectTargeted == descriptionBox)) {
      fill(NORMALTEXTHIGHLIGHTED);
    }
    else
      fill(NORMALTEXTBOX);
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

  // Timeline
  else {
    
    // keep scroll to bound
    if (scrollX < 0) {
      scrollX += abs(scrollX) / 5;
    }

    if (maxHScroll >= windowWidth * 0.9) {
      if (scrollX > maxHScroll - windowWidth * 0.9) {
        scrollX -= abs(maxHScroll - windowWidth * 0.9 - scrollX) / 5;
      }
    }

    // Draw the preview screen
    fill(255);
    rectMode(CENTER);
    rect(windowWidth / 2, (windowHeight * 0.9) * 1/4 + 50, ((windowHeight * 0.9) / 2) * 16 / 9, (windowHeight * 0.9) / 2);
    var belowScreen = (windowHeight * 0.9) * 1 / 4 + 50 + (windowHeight * 0.9) / 4;
    textAlign(CENTER);
    fill(0);
    text('NO IMAGE UPLOADED FOR THIS SCENE', windowWidth / 2, (windowHeight * 0.9) * 1/4 + 50);
    // Line
    rectMode(CORNERS);
    fill(NORMALBOXCOLOR);
    rect(50, belowScreen + 10, windowWidth * 0.95, belowScreen + 15);
    rectMode(CORNER);
    var numberofBoxes = objSize(positions);
    var totalBoxes = objSize(taskList);
    var boxSize = (windowWidth * 0.95 - 50) / numberofBoxes;
    var buttonPosition = 0;
    var trimmedPositions = {};
    var start = 0;
    for (each in positions) {
      trimmedPositions[start] = positions[each];
      start ++;
    }
    for (var i = 0; i < numberofBoxes; i++) {
      var totalState = objSize(trimmedPositions[i]);
      for (var j = 0; j < objSize(trimmedPositions[i]); j++) {
        if (taskButtons[buttonPosition].state == 0)
          totalState -= 1;
        else if (taskButtons[buttonPosition].state == 1)
          totalState -= 0.5;

        if (totalState == 0)
          fill(200, 10, 10);
        else if (totalState > 0 && totalState < objSize(trimmedPositions[i]))
          fill(200);
        else
          fill(30, 205, 30);
        rect(50 + taskButtons[buttonPosition].column * boxSize, belowScreen + 10, boxSize, 5);

        buttonPosition ++;
      }
    }
    // scroll bar
    if (maxHScroll > (windowWidth * 0.95)) {
      var hbarSize = 1 + (((windowWidth * 0.95) / maxHScroll)) * (windowWidth * 0.95) - 100;
      hcurrentScroll = 50 + (scrollX / (maxHScroll - windowWidth * 0.9 + 50)) * (windowWidth * 0.95 - hbarSize);
      fill(255);
      if (mouseIsPressed && mouseY >= belowScreen + 15 && mouseY <= belowScreen + 25)
        scrollingEnabled = true;
      if (scrollingEnabled) {
        hcurrentScroll = mouseX - hbarSize/2;
        scrollX = (hcurrentScroll - 50) / (windowWidth * 0.95 - hbarSize) * (maxHScroll - windowWidth * 0.9 + 50);
      }
      rect(hcurrentScroll, belowScreen + 15, hbarSize, 10); 
    }

    // Draw the tasks buttons
    rectMode(CORNERS);
    fill(NORMALBOXCOLOR);
    var extraSpace = 0;
    extraSpace += maxHScroll;
    extraSpace -= windowWidth * 0.9;
    if (extraSpace < 1)
      extraSpace = 0;
    rect(50 - scrollX, belowScreen + 30, windowWidth * 0.95 - scrollX + extraSpace, (windowHeight * 0.9) * 5 / 6, 5);
    rectMode(CORNER);
    maxHScroll = 0;
    for (var k = 0; k < objSize(taskButtons); k++) {
      maxHScroll += 105;
      taskButtons[k].drawButton(60 - scrollX, belowScreen + 30 + 10);
      taskButtons[k].clickButtons(60 - scrollX, belowScreen + 30 + 10);
    }
    if (maxHScroll > windowWidth * 0.95) {

    }

    rectMode(CORNERS);
    // The Information Box
    fill(NORMALBOXCOLOR);
    rect(50, (windowHeight * 0.9) * 5 / 6 + 10, (windowWidth * 0.95), (windowHeight * 0.9), 5);

    rectMode(CORNER);

    if (selectedLine != null) {
      fill(255);
      textAlign(LEFT);
      textStyle(NORMAL);
      if (selectedLine.line_object != null) {
        text("Text: " + selectedLine.line_object.line_text, 60, (windowHeight * 0.9) * 5 / 6 + 30);
        text("Task: " + selectedLine.description, 60, (windowHeight * 0.9) * 5 / 6 + 60);
      }
    }
    if (objSize(selectedTask) != 0) {
      if ((hoveringOver(markNotStartedBox)) || (objectTargeted == markNotStartedBox)) {
         fill(250, 20, 20);
      }
      else
        fill(200, 10, 10);
      rect(markNotStartedBox.x, markNotStartedBox.y, markNotStartedBox.width, markNotStartedBox.height, 5);
      fill(255);
      textAlign(CENTER);
      textStyle(BOLD);
      text('Not Started', markNotStartedBox.x + markNotStartedBox.width/2, markNotStartedBox.y + 20);

      if ((hoveringOver(markInProgressBox)) || (objectTargeted == markInProgressBox)) {
        fill(200);
      }
      else
        fill(150);
      rect(markInProgressBox.x, markInProgressBox.y, markInProgressBox.width, markInProgressBox.height, 5);
      fill(255);
      textAlign(CENTER);
      textStyle(BOLD);
      text('In Progress', markInProgressBox.x + markInProgressBox.width/2, markInProgressBox.y + 20);

      if ((hoveringOver(markCompletedBox)) || (objectTargeted == markCompletedBox)) {
        fill(50, 250, 50);
      }
      else
        fill(30, 200, 30);
      rect(markCompletedBox.x, markCompletedBox.y, markCompletedBox.width, markCompletedBox.height, 5);
      fill(255);
      textAlign(CENTER);
      textStyle(BOLD);
      text('Completed', markCompletedBox.x + markCompletedBox.width/2, markCompletedBox.y + 20);
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
  if (mode == 'script') {
    //var barSize = 1 + ((windowHeight - 50) / maxScroll) * (windowHeight - 50);
    scrollY += event.delta / 2;
  }
  if (mode == 'timeline') {
    if (maxHScroll > windowWidth * 0.9) {
      scrollX += event.delta / 2;
    }
  }
}

function mouseReleased() {
  if (scrollingEnabled)
    scrollingEnabled = false;
  if (mode == 'timeline') {
    if (objSize(selectedObject) != 0) {
      selectedObject.releaseButton();
    }
    else {
      if (!hoveringOver(markNotStartedBox) && !hoveringOver(markInProgressBox) && !hoveringOver(markCompletedBox)) {
        selectedLine = {};
        selectedTask = {};
      }
    }
  }

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

    var i = 0;
    var j = 0;
    var taskCount = 0;
    for (uniqueLines in positions) {
      for(task in positions[uniqueLines]) {
        //if (taskButtons[taskCount] == null)
          taskButtons[taskCount] = new TaskButton(positions[uniqueLines][task], i, j, taskCount);
        j++;
        taskCount ++;
      }
      i++;
      j = 0;
    }
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
        state: 0,
      };
      taskNumber++;
      objectTargeted = {};
      textInput = '';
      mode = 'script';
      writeTaskData();
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

  if (mode == 'timeline') {
    if (hoveringOver(markNotStartedBox)) {
      if (selectedTask != {}) {
        selectedTask.state = 0;
        taskList[selectedTask.taskNum].state = 0;
        writeTaskData();
      }
    }
    if (hoveringOver(markInProgressBox)) {
      if (selectedTask != {}) {
        selectedTask.state = 1;
        taskList[selectedTask.taskNum].state = 1;
        writeTaskData();
      }
    }
    if (hoveringOver(markCompletedBox)) {
      if (selectedTask != {}) {
        selectedTask.state = 2;
        taskList[selectedTask.taskNum].state = 2;
        writeTaskData();
      }
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
          dialogs = {};
          lines = {};
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

function writeTaskData() {

  firebase.database().ref('tasks/episode_' + episode_number).set(taskList);
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

function readTaskData() {
  return firebase.database().ref('/tasks/episode_' + episode_number).once('value').then(function(snapshot) {
    var getTasks = snapshot.val();
    if (getTasks != null) {
      taskList = getTasks;
      taskNumber = objSize(taskList);
    }
    else {
      taskList = {};
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

  var taskDataPromise = readTaskData();

  taskDataPromise.then(function(data) {
    console.log('got tasks');
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

  markNotStartedBox = {
    x: windowWidth * .95 - 315,
    y: windowHeight * .9 - 40,
    width: 100,
    height: 30,
  };

  markInProgressBox = {
    x: windowWidth * .95 - 210,
    y: windowHeight * .9 - 40,
    width: 100,
    height: 30,
  };

  markCompletedBox = {
    x: windowWidth * .95 - 105,
    y: windowHeight * .9 - 40,
    width: 100,
    height: 30,
  };
}

function hoveringOver(object) {
  return (mouseX > object.x && mouseX < object.x + object.width && mouseY > object.y && mouseY < object.y + object.height)
}

//document.getElementById('file').addEventListener('change', handleFileSelect, false);