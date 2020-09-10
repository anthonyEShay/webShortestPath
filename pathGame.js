

var intervalTimer = 1000;
var elementArray = [];
var pathNode = [];
var currentPos = 0;
var stepCounter = 0;
var numberCols = 0;
var numberRows = 0;
var skipSpeed = 1;
var skipCounter = 0;

function adjustBoxes(numBoxes, mapSize, atype){
    numBoxes = parseInt(numBoxes);
    mapSize = parseInt(mapSize);
    atype = parseInt(atype);
    boxDensity = numBoxes;
    if(atype == 1){
        density = Math.floor((mapSize*2) / (3*numBoxes + 1));
        boxDensity = density;
    }else{
        density = numBoxes;
    }
    numberLevels = mapSize - Math.floor(.5*density);
    numberLevels = numberLevels/(density + Math.floor(.5*density));
    overage = Math.ceil(numberLevels) * (density + Math.floor(.5*density)) - (mapSize - 2);
    
    console.log(overage + " " + Math.ceil(numberLevels) + " " + density*1.5);
    console.log(Math.floor(.35*density - 2)*Math.ceil(numberLevels));
    
    yFix = 0;
    if ( overage >= Math.floor(.35*density - 2)*Math.ceil(numberLevels)){
        numberLevels = Math.floor(numberLevels);
    }else{
        numberLevels = Math.ceil(numberLevels);
        while(true){
            yFix += 1;
            if (yFix * numberLevels >= overage){
                break;
            }
        }
        while (true){
            overage = Math.ceil(numberLevels) * (density + Math.floor(.5*density) - yFix) - (mapSize - 2);
            if(overage < 0 && overage * -1 > (density + Math.floor(.5*density) - yFix)){
                numberLevels += 1;
            }else{
                break;
            }
        }
        density = density - yFix;
    }
    returnList = [numberLevels, density, boxDensity];
    return returnList;
}

function startGame(numElements, gameType, mapType) {
    elementArray = [];
    pathNode = [];
    currentPos = 0;
    stepCounter = 0;
    skipCounter = 0;
    numberCols = parseInt(numElements);
    
    xValues = adjustBoxes(numberCols, 1100, 1);
    yValues = adjustBoxes(xValues[2], 600, 2);
    
    xPosition = Math.floor(xValues[1]/2);
    yPosition = Math.floor(yValues[1]/2);
    
    numberCols = xValues[0];
    numberRows = yValues[0];
    
    numCounter = 0;
    for (a = 0; a < numberRows; a++){
        for (i = 0; i < numberCols; i++){
            temp = new component(xValues[2], xValues[2], "gray", xPosition, yPosition, numCounter);
            xPosition += xValues[1] + Math.floor(xValues[1]/2);
            elementArray.push(temp);
            numCounter += 1;
        }
        xPosition = Math.floor(xValues[1]/2);
        yPosition += xValues[1] + Math.floor(yValues[1]/2);
    }
    
    console.log("Levels: " + numberLevels + " Total: " + elementArray.length);
    if (mapType == "Random"){
        console.log("Row: " + String(numberRows) + " Col: " + String(numberCols));
        ahalf = Math.floor(numberCols / 3);
        tempCol = Math.floor(Math.random()*(ahalf))
        tempRow = Math.floor(Math.random()*(numberRows))
        console.log("Col/Row: " + String(tempCol) + " " + String(tempRow))
        elementArray[tempCol + tempRow*numberCols].startPoint = true;
        currentPos = tempCol + tempRow*numberCols;
        
        tempCol = numberCols - 1 - Math.floor(Math.random()*(ahalf));
        tempRow = Math.floor(Math.random()*(numberRows))
        console.log("Col/Row: " + String(tempCol) + " " + String(tempRow))
        elementArray[tempCol + tempRow*numberCols].endPoint = true;
        
        //Draw a wall
        tempCol = Math.floor(Math.random()*(ahalf)) + ahalf;
        wallSize = Math.floor((2/3)* numberRows);
        beginElement = tempCol + numberCols*(numberRows - 1);
        for(i = 0; i < wallSize; i++){
            elementArray[beginElement].wall = true;
            beginElement -= numberCols;
        }
        
        tempCol2 = Math.floor(Math.random()*(ahalf)) + ahalf;
        if(tempCol - tempCol2 <= 1 && tempCol - tempCol2 >= -1){
            if(tempCol - tempCol2 == 0){
                tempCol += 2;
            }else{
                tempCol += 2 * (tempCol - tempCol2);
            }
        }else{
            tempCol = tempCol2
        }
        wallSize = Math.floor((2/3)* numberRows);
        beginElement = tempCol;
        for(i = 0; i < wallSize; i++){
            console.log(i + " " + beginElement);
            elementArray[beginElement].wall = true;
            beginElement += numberCols;
        }
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
        for (x of pathNode){
            elementArray[x].finalPath = true;
        }
        updateGameArea();
        frontier = [];
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
    skipCounter += 1;
    if(skipCounter != skipSpeed){
        BFSUpdate();
    }else{
        updateGameArea();
        skipCounter = 0;
    }
}

function expandDirection(sArray, direction){
    curElement = sArray[sArray.length - 1];
    tempRow = Math.floor(curElement / numberCols);
    tempCol = curElement - tempRow * numberCols;
    if(direction == "top"){
        testElement = curElement - numberCols;
        try{
        if( testElement < 0 || elementArray[testElement].wall || explored.includes(testElement)){
            return null;
        }
        explored.push(testElement);
        sArray.push(testElement);
        frontier.push(sArray);
        }
        catch(err){
            console.log(err);
            console.log("Error: " + typeof testElement + ", " + typeof curElement + ", " + typeof numberCols);
        }
        return;
    }
    if(direction == "bot"){
        testElement = curElement + numberCols;
        try{
        if(testElement >= elementArray.length || elementArray[testElement].wall || explored.includes(testElement)){
            return null;
        }
        explored.push(testElement);
        sArray.push(testElement);
        frontier.push(sArray);
        }
        catch(err){
            console.log(err);
            console.log("Error: " + typeof testElement + ", " + typeof curElement + ", " + typeof numberCols);
            console.log("Error: " + testElement + ", " + curElement + ", " + numberCols);
        }
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
    this.finalPath = false;
    //Unused ( No Touch, Wall, Visited) or part of Path
    this.update = function(aBorder){
        
        ctx = myGameArea.context;
        if (this.wall){
            ctx.fillStyle = "black";
        }else if(this.startPoint){
            ctx.fillStyle = "yellow";
        }else if(this.endPoint){
            ctx.fillStyle = "red";
        }else if (this.finalPath){
            ctx.fillStyle = "blue";
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