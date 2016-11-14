console.log(firebase);
var database = firebase.database();
var name ="";

function setup () {
	createCanvas(640, 360);
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

function keyPressed() {
	if (keyCode == ENTER) {
		if (name != "") {
		writeUserData("user_" + floor(random(0, 999999)), name, "email@gmail.com", "");
		name = "";
		console.log("entered");
		}
	}

}