var c = document.getElementById('pane').getContext('2d');
var pane = document.getElementById('pane');
var wrapper = document.getElementById('wrapper');
var hasTurned = false;
// Keyboard events
c.canvas.contentEditable = true;
c.canvas.onkeydown = function(evt) {
    //turn left
    if(hasTurned === false){
      if(evt.keyCode === 37) {
          directionY = 0;
          if(directionX === -1) {
              return false;
          }
          else if(directionX === 1){
              return false;
          }
          else{
              directionX = -1;
          }
      }
      //turn right
      else if(evt.keyCode === 39) {
          directionY = 0;
          if(directionX === 1) {
              return false;
          }
          else if(directionX === -1){
              return false;
          }
          else{
              directionX = 1;
          }
      }
      //turn up
      else if(evt.keyCode === 38) {
          directionX = 0;
          if(directionY === -1) {
              return false;
          }
          else if(directionY === 1){
              return false;
          }
          else{
              directionY = -1;
          }
      }
      //turn down
      else if(evt.keyCode === 40) {
          directionX = 0;
          if(directionY === 1) {
              return false;
          }
          else if(directionY === -1){
              return false;
          }
          else{
              directionY = 1;
          }
      }
      hasTurned = true;
    }
      
}
c.canvas.onkeyup = function(evt) {
    evt.preventDefault();
};
// variables
var LENGTH = 30;
var WIDTH = 30;
var blockLength = Math.floor(c.canvas.width / LENGTH);
var blockWidth = Math.floor(c.canvas.height / WIDTH);
var gameBrd = [];
var snakeArray = [];
var levels = 1;
var mspf = 0;
var snakeLength = 0;
var snakeHeadX = 0;
var snakeHeadY = 0;
var directionX = 1;
var directionY = 0;
var whetherSplice = 0;
var lifeNum = 1;
var whetherFillBrd = 0;
var foodNum = 0;
var posiNum = 0;
var greenNum = 0;
var barrierNum = 0;
var notRun = true;
var maxi = 0;
getHighScores();
initGameBrd();
updateBrd();

//main codes
function updateBrd() {
    // clear canvas
    c.clearRect(0, 0, c.canvas.width, c.canvas.height)
    foodNum = 0;
    posiNum = 0;
    greenNum = 0;
    barrierNum = 0;
    // draw grid (or outline if we aren't using grid)
    c.beginPath();
    for(var i = 0; i < LENGTH + 1; i++) {
        c.moveTo(i * blockLength, 0);
        c.lineTo(i * blockLength, LENGTH * blockLength);
        c.stroke();
    }
    for(var j = 0; j < WIDTH + 1; j++) {
        c.moveTo(0, j * blockWidth);
        c.lineTo(WIDTH * blockWidth, j * blockWidth);
        c.stroke();
    }
    // draw board items (barrier2, food4, poison6, life8)
    drawBrd();
    // draw snake on board
    drawSnake();
}

function play() {
    if (notRun) {
        chooseLevels();
        startSnake();
        update();   
        notRun = false;
    }
}

function update() {
    hasTurned = false;
    whetherFillBrd = 1;
    snakeMove();
    whetherSplice = 1;
    snakeHit();
    eatSelf();
    if(whetherFillBrd === 1) {
        fillGameBrd();
    }
    updateBrd();
    maximumLength();
    if(whetherDie()) {
        setTimeout(update, mspf);
    } else {
        alert("game over");
        gameBrd = [];
        snakeArray = [];
        snakeLength = 0;
        snakeHeadX = 0;
        snakeHeadY = 0;
        directionX = 1;
        directionY = 0;
        whetherSplice = 0;
        lifeNum = 1;
        whetherFillBrd = 0;
        foodNum = 0;
        posiNum = 0;
        greenNum = 0;
        barrierNum = 0;
        initGameBrd();
        updateBrd();
        notRun = true;
        writeRecord();
        maxi = 0;
    }
}

function chooseLevels() {
    var tf = true;
    while(tf) {
        var choice = Number(prompt("easy(1) medium(2) hard(3)"));
        if(choice === 1) {
            tf = false;
            mspf = 500;
        } else if(choice === 2) {
            tf = false;
            mspf = 300;
        } else if(choice === 3) {
            tf = false;
            mspf = 100;
        }
    }
    pane.focus();
}

function initGameBrd() {
    for(var i = 0; i < LENGTH; i++) {
        gameBrd[i] = [];
        for(var j = 0; j < WIDTH; j++) {
            gameBrd[i][j] = 0;
        }
    }
}

function fillGameBrd() {
    if (foodNum < Math.floor(LENGTH/levels)){
        dropFoods();
    }
    if (greenNum < 5-levels){
        dropLife();
    }
    if (posiNum < levels * 3){
        dropPoison();
    }
    if (barrierNum < Math.floor(0.5*LENGTH/levels)){
        dropBarriers();
    }
}

function drawBrd() {
    for(var i = 0; i < LENGTH; i++) {
        for(var j = 0; j < WIDTH; j++) {
            if(gameBrd[i][j] === 2) {
                barrierNum ++;
                c.fillStyle = "black";
                c.fillRect(i * blockLength + blockLength / 8, j * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
            } else if(gameBrd[i][j] === 4) {
                foodNum ++;
                c.fillStyle = "red";
                c.fillRect(i * blockLength + blockLength / 8, j * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
            } else if(gameBrd[i][j] === 6) {
                posiNum ++;
                c.fillStyle = "pink";
                c.fillRect(i * blockLength + blockLength / 8, j * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
            } else if(gameBrd[i][j] === 8) {
                greenNum ++;
                c.fillStyle = "green";
                c.fillRect(i * blockLength + blockLength / 8, j * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
            }
        }
    }
}

function dropBarriers() {
    var row = Math.floor(Math.random() * LENGTH);
    var col = Math.floor(Math.random() * WIDTH);
    for(var i = 0; i < levels * 5; i++) {
        if(gameBrd[row][col] === 0) {
            gameBrd[row][col] = 2;
        }
    }
}

function dropFoods() {
    var row = Math.floor(Math.random() * LENGTH);
    var col = Math.floor(Math.random() * WIDTH);
    for(var i = 0; i <= 3; i++) {
        if(gameBrd[row][col] === 0) {
            gameBrd[row][col] = 4;
        }
    }
}

function dropPoison() {
    var row = Math.floor(Math.random() * LENGTH);
    var col = Math.floor(Math.random() * WIDTH);
    for(var i = 0; i < 1; i++) {
        if(gameBrd[row][col] === 0) {
            gameBrd[row][col] = 6;
        }
    }
}

function dropLife() {
    var row = Math.floor(Math.random() * LENGTH);
    var col = Math.floor(Math.random() * WIDTH);
    if(gameBrd[row][col] === 0) {
        gameBrd[row][col] = 8;
    }
}

function startSnake() {
    var col = Math.floor(Math.random() * (LENGTH/2 - 3));
    var row = Math.floor(Math.random() * WIDTH);
    snakeHeadX = col;
    snakeHeadY = row;
    while(snakeArray.length < 3) {
        c.fillStyle = "blue";
        c.fillRect(snakeHeadX * blockLength + blockLength / 8, snakeHeadY * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
        snakeMove();
        snakeLength++;
    }
    c.fillStyle = "red";
    c.fillRect((col + 2) * blockLength + blockLength / 8, row * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
    whetherSplice = 1;
    fillGameBrd();
}

function snakeMove() {
    snakeHeadX = (snakeHeadX + directionX + WIDTH)%WIDTH;
    snakeHeadY = (snakeHeadY + directionY + LENGTH)%LENGTH;
    if(whetherSplice === 1) {
        snakeArray.splice(0, 1);
    }
    snakeArray.push([snakeHeadX, snakeHeadY]);
}

function drawSnake() {
    for(var i = 0; i < snakeArray.length; i++) {
        c.fillStyle = "blue";
        c.fillRect(snakeArray[i][0] * blockLength + blockLength / 8, snakeArray[i][1] * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
        c.fillStyle = "red";
        c.fillRect(snakeHeadX * blockLength + blockLength / 8, snakeHeadY * blockWidth + blockWidth / 8, 3 / 4 * blockLength, 3 / 4 * blockWidth);
    }
}

function eatSelf() {
    for (var i = 0; i < snakeArray.length-1; i ++){
        if (snakeHeadX === snakeArray[i][0] && snakeHeadY === snakeArray[i][1]){
            snakeArray.splice(0, i);
            lifeNum --;
        }
    }
}

function snakeHit() {
    //food
    if(gameBrd[snakeHeadX][snakeHeadY] === 4) {
        whetherSplice = 0;
        gameBrd[snakeHeadX][snakeHeadY] = 0;
        foodNum --;
    }
    //barrier
    else if(gameBrd[snakeHeadX][snakeHeadY] === 2) {
        lifeNum--;
        gameBrd[snakeHeadX][snakeHeadY] = 0;
        barrierNum --;
    }
    //poison
    else if(gameBrd[snakeHeadX][snakeHeadY] === 6) {
        var half = Math.floor(snakeArray.length / 2);
        snakeArray.splice(0, half);
        gameBrd[snakeHeadX][snakeHeadY] = 0;
        posiNum --;
    }
    //extra life
    else if(gameBrd[snakeHeadX][snakeHeadY] === 8) {
        lifeNum++;
        gameBrd[snakeHeadX][snakeHeadY] = 0;
        greenNum --;
    } 
    else {
        whetherFillBrd = 0;
    }
    document.getElementById("lives").innerHTML = lifeNum;
}

function whetherDie() {
    if(lifeNum < 1) {
        return false;
    } else {
        return true;
    }
}

// maximum length
function maximumLength(){
    if (snakeArray.length > maxi){
        maxi = snakeArray.length;
        document.getElementById("score").innerHTML = maxi;
    }
}
// Post to php
function post(path, params) {
  var xmlhttp= makeHttpObject();
  xmlhttp.open("POST",path,true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  var sendText = "";
  for(var prop in params){
    sendText+= prop+"="+params[prop]+"&";
  }
  xmlhttp.send(sendText);
}
//post('https://doctor-sinatra.codio.io:9500/add_result.php',{name: "Lundy", score: 5});
function writeRecord(){
    var names = prompt("You score "+ maxi+"\nWhat's your name");
    post('https://doctor-sinatra.codio.io:9500/add_result.php',{name: names, score: maxi});
    getHighScores();
}

function makeHttpObject() {
    try {
        return new XMLHttpRequest();
    } catch(error) {}
    try {
        return new ActiveXObject("Msxml2.XMLHTTP");
    } catch(error) {}
    try {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } catch(error) {}
    throw new Error("Could not create HTTP request object.");
}

function fopen(file) {
    var request = makeHttpObject();
    request.open("GET", file, false);
    return request;
}

function fread(obj) {
    obj.send(null);
    return obj.responseText;
}

function getHighScores(){
  var file = fopen("highscores.txt");
  var text = fread(file); 
  var records = text.split("\n");
  for (var i = 0; i < records.length; i++){
      records[i]=records[i].split(",");
  }
  for(var j = 0; j < records.length -1; j++){
    for(var i = 0; i < records.length - j - 1; i++){
      while(Number(records[i][1]) < Number(records[i+1][1])){
        var temp = records[i+1];
        records[i+1] = records[i];
        records[i] = temp;
      }
    }
  }
  printHighScores(records);
}

function printHighScores(scoreArray){
  scoreText ="<h1>High Scores</h1>";
  scoreText += "<ol>";
  for (var i=0; i<scoreArray.length-2; i++){
    scoreText +="<li>"
    scoreText += scoreArray[i][0] +" - "+scoreArray[i][1];
    scoreText +="</li>"
  }
  scoreText += "</ol>";
  document.getElementById("highscores").innerHTML = scoreText;
}