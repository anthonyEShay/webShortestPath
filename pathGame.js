

var intervalTimer = 1000;
var elementArray = [];
var pathNode = [];
var currentPos = 0;
var stepCounter = 0;
var numberCols = 0;
var numberRows = 0;

function startGame(numElements, density, gameType, mapType) {
    elementArray = [];
    pathNode = [];
    currentPos = 0;
    stepCounter = 0;
    numberCols = numElements;
    xPosition = Math.floor(density/2);
    yPosition = Math.floor(density/2);
    numberLevels = 600 - .5*density;
    numberLevels = Math.floor(numberLevels/(density*1.5));
    numberRows = numberLevels;
    console.log(numberLevels);
    numCounter = 0;
    for (a = 0; a < numberLevels; a++){
        for (i = 0; i < numElements; i++){
            temp = new component(density, density, "gray", xPosition, yPosition, numCounter);
            xPosition += density + Math.floor(density/2);
            elementArray.push(temp);
            numCounter += 1;
        }
        xPosition = Math.floor(density/2);
        yPosition += density + Math.floor(density/2);
    }
    if (mapType == "Random"){
        console.log("Col/Row: " + String(numberRows) + " " + String(numberCols));
        ahalf = Math.floor(numberCols / 2);
        tempCol = Math.floor(Math.random()*(ahalf))
        tempRow = Math.floor(Math.random()*(numberRows))
        console.log("Col/Row: " + String(tempCol) + " " + String(tempRow))
        elementArray[tempCol + tempRow*numberCols].startPoint = true;
        currentPos = tempCol + tempRow*numberCols;
        
        tempCol = Math.floor(Math.random()*(numberCols - ahalf) + ahalf);
        tempRow = Math.floor(Math.random()*(numberRows))
        console.log("Col/Row: " + String(tempCol) + " " + String(tempRow))
        elementArray[tempCol + tempRow*numberCols].endPoint = true;
        
        //Draw a wall, change up above into thirds so middle remains empty
    }
    verifyClear(gameType);
    myGameArea.start(gameType);
}

function returnGame(gameType){
    if (gameType == "BFS"){
        return BFSUpdate;
    }
}

function verifyClear(gameType){
    if(gameType == "BFS"){
        frontier = [];
        explored = [];
        frontier.push([currentPos]);
        explored.push(currentPos);
    }
}

var frontier = [];
var explored = [];
function BFSUpdate(){
    if (frontier.length == 0){
        cancelFun();
        return;
    }
    //Take top path list off of the frontier, make it current path(pathNode), make last of path current pos and set as visited
    topPath = frontier[0];
    frontier.splice(0, 1);
    pathNode = topPath;
    currentPos = topPath[topPath.length - 1];
    elementArray[currentPos].visited = true;
    if (elementArray[currentPos].endPoint == true){
        stepCounter += 1;
        updateGameArea();
        cancelFun();
        return;
    }
    
    //expand left/right/top/down if element not exist in explored, add new created paths to end of frontier
    expandDirection(topPath.slice(), "top");
    expandDirection(topPath.slice(), "left");
    expandDirection(topPath.slice(), "bot");
    expandDirection(topPath.slice(), "right");
    
    //If expanded element is endpoint, set correct path, currentPos = endpoint, empty frontier
    
    stepCounter += 1;
    updateGameArea();
}

function expandDirection(sArray, direction){
    curElement = sArray[sArray.length - 1];
    tempRow = Math.floor(curElement / numberCols);
    tempCol = curElement - tempRow * numberCols;
    if(direction == "top"){
        testElement = curElement - numberCols;
        if( testElement < 0 || elementArray[testElement].wall || explored.includes(testElement)){
            return null;
        }
        explored.push(testElement);
        sArray.push(testElement);
        frontier.push(sArray);
        return;
    }
    if(direction == "bot"){
        testElement = curElement + numberCols;
        if(testElement >= elementArray.length || elementArray[testElement].wall || explored.includes(testElement)){
            return null;
        }
        explored.push(testElement);
        sArray.push(testElement);
        frontier.push(sArray);
        return;
    }
    if( direction == "left"){
        testElement = curElement - 1;
        if(tempCol == 0 || elementArray[testElement].wall || explored.includes(testElement)){
            return null;
        }
        explored.push(testElement);
        sArray.push(testElement);
        frontier.push(sArray);
        return;
    }
    if(direction == "right"){
        testElement = curElement + 1;
        if(tempCol == numberCols - 1 || elementArray[testElement].wall || explored.includes(testElement)){
            return null;
        }
        explored.push(testElement);
        sArray.push(testElement);
        frontier.push(sArray);
        return;
    }
}

function swapElements(pos1, pos2){
    atemp = elementArray[pos1].x;
    elementArray[pos1].x = elementArray[pos2].x;
    elementArray[pos2].x = atemp;
    [elementArray[pos1], elementArray[pos2] ] = [elementArray[pos2], elementArray[pos1] ];
}

function fixPositions(aCount){
    for(i = 0; i < aCount; i++){
        elementArray[i].x = positionLog[i];
    }
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function(gameType) {
        this.canvas.width = 1100;
        this.canvas.height = 600;
        this.canvas.style.border = "2px solid";
        this.context = this.canvas.getContext("2d");
        this.gameT = gameType;
        /*
        this.addEventListener('click', function(event){
            var x = event.pageX - elemLeft, y = event.pageY - elemTop;
            elementArray.forEach(function(element) {
                if (y > element.top && y < element.top + element.height 
                    && x > element.left && x < element.left + element.width) {
                    alert('clicked an element');
                }
            });
        }, false); 
        */
        div = document.getElementById("gameBox");
        div.appendChild(this.canvas);
        clearInterval(this.interval);
        this.interval = setInterval(returnGame(this.gameT), intervalTimer);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    cancel : function(){
        clearInterval(this.interval);
    },
    updateTimer : function(){
        clearInterval(this.interval);
        myGameArea.interval = setInterval(returnGame(this.gameT), intervalTimer);
    }
}

function component(width, height, color, x, y, pNumber) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.posNumber = pNumber;
    this.wall = false;
    this.visited = false;
    this.startPoint = false;
    this.endPoint = false;
    //Unused ( No Touch, Wall, Visited) or part of Path
    this.update = function(aBorder){
        
        ctx = myGameArea.context;
        if (this.wall){
            ctx.fillStyle = "black";
        }else if(this.startPoint){
            ctx.fillStyle = "yellow";
        }else if(this.endPoint){
            ctx.fillStyle = "orange";
        }else if (this.visited){
            ctx.fillStyle = "green";
        }else{
            ctx.fillStyle = color;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if(aBorder == 1){
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - 2, this.y, 2, this.height);
            ctx.fillRect(this.x + this.width, this.y, 2, this.height);
            ctx.fillRect(this.x - 2, this.y + this.height, this.width + 4, 2);
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, 2);
        }else if (aBorder == 2){
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x - 2, this.y, 2, this.height);
            ctx.fillRect(this.x + this.width, this.y, 2, this.height);
            ctx.fillRect(this.x - 2, this.y + this.height, this.width + 4, 2);
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, 2);
        }
    }
}

function updateGameArea() {
    myGameArea.clear();
    aCount = 0;
    for (x of elementArray){
        if (aCount == currentPos){
            x.update(1);
        }else if(pathNode.includes(x.posNumber)){//element is part of pathNode
            x.update(2);
        }else{//Unused Node
            x.update(3);
        }
        aCount += 1;
    }
    currentPos += 1;
    if (currentPos == elementArray.length){
        currentPos = 0;
    }
    aString = " " + stepCounter.toString();
    document.getElementById("test2").innerHTML = aString;
    
}

function cancelFun(){
    myGameArea.cancel();
}

function changeTimer(tempS){
    intervalTimer = tempS;
    myGameArea.updateTimer();
}