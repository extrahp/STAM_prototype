
//console.log(firebase);
var database = firebase.database();
var name ="";
var userList = {};
var local_id = 0;

function setup () {
	createCanvas(640, 360);

	var dataPromise = readUserData();

	dataPromise.then(function(data) {
		local_id = objSize(userList);
		console.log(local_id);
	});

	// Check for the various File API support.
	if (window.File && window.FileReader) {
	} else {
	  alert('The File APIs are not fully supported in this browser.');
	}

	//console.log(readFile);
}

function draw () {

	background(155);
	ellipse(50, 50, 80, 80);
	color(255);
	text("Enter your name: " + name, 200, 200)

	if (keyIsDown(BACKSPACE)) {
		if (name != "") {
			name = name.substring(0, name.length-1);
		}
	}
}

function writeUserData(userId, name, email) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: "email",
  });
}

function keyTyped() {
	name += key;
}

function readUserData() {
	return firebase.database().ref('/users/').once('value').then(function(snapshot) {
		var username = snapshot.val();
		userList = username;
	});
}

function keyPressed() {
	if (keyCode == ENTER) {
		if (name != "") {
		writeUserData("user_" + local_id, name, "email@gmail.com", "");
		name = "";
		console.log("entered");
		}
	}
}

function objSize(obj) {
	var count = 0;
	for (each in obj) {
		count++;
	}
	return count;
}