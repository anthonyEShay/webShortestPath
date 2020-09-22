

var intervalTimer = 1000;
var elementArray = [];
var pathNode = [];
var currentPos = 0;
var currentPos2 = -1;
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

function drawRanWalls(numberRows, numberCols){
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
        elementArray[beginElement].wall = true;
        beginElement += numberCols;
    }
}

function startGame(numElements, gameType, mapType) {
    elementArray = [];
    pathNode = [];
    currentPos = 0;
    currentPos2 = -1;
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
        drawRanWalls(numberRows, numberCols);
        verifyClear(gameType);
        myGameArea.start(gameType);
        updateGameArea();
    }else{
        cancelFun();
        verifyClear(gameType);
        updateGameArea();
    }
}


function returnGame(gameType){
    if (gameType == "BFS"){
        return BFSUpdate;
    }
    if (gameType == "IDS"){
        return IDSUpdate;
    }
    if (gameType == "BIDS"){
        return BIDSUpdate;
    }
}

function verifyClear(gameType){
    if(gameType == "BFS"){
        frontier = [];
        frontier.push([currentPos]);
    }
    if(gameType == "IDS"){
        frontier = [];
        idfDepthLevel = 1;
        progressMade = [0, 0];
        frontier.push([currentPos]);
        idsStartPoint = currentPos;
    }
    if(gameType == "BIDS"){
        frontier = [];
        idfDepthLevel = 1;
        progressMade = [0, 0];
        frontier.push([currentPos]);
        idsStartPoint = currentPos;
        progressMadeEnd = [0, 0];
        idsEndPoint = 0;
        frontierEnd = [];
        for(x of elementArray){
            if(x.endPoint){
                idsEndPoint = x.posNumber;
                break;
            }
        }
        frontierEnd.push([idsEndPoint]);
        currentPos2 = idsEndPoint;
        exhaustedL1 = [];
        exhaustedL2 = [];
        triggerV = -1;
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
    currentPos = topPath[topPath.length - 1];
    elementArray[currentPos].visited = true;
    if (elementArray[currentPos].endPoint == true){
        stepCounter += 1;
        for (x of topPath){
            elementArray[x].finalPath = true;
        }
        updateGameArea();
        frontier = [];
        cancelFun();
        return;
    }
    
    //expand left/right/top/down if element not exist in explored, add new created paths to end of frontier
    temp = expandDirection(topPath.slice(), "top");
    if(temp != null){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    temp = expandDirection(topPath.slice(), "left");
    if(temp != null){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    temp = expandDirection(topPath.slice(), "bot");
    if(temp != null){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    temp = expandDirection(topPath.slice(), "right");
    if(temp != null){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    
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

idfDepthLevel = 0;
progressMade = [];
idsStartPoint = 0;
function IDSUpdate(){
    if (frontier.length == 0 && progressMade[0] == progressMade[1]){
        //frontier is empty and pM1 (max length reached last run) pM0 = previous max length reached
        cancelFun();
        return;
    }
    if(frontier.length == 0){
        progressMade[0] = progressMade[1];
        progressMade[1] = 0;
        for(x of elementArray){
            x.visited = false;
            x.reachNumber = -1;
        }
        currentPos = idsStartPoint;
        frontier = [];
        frontier.push([currentPos]);
        idfDepthLevel += 1;
    }
    
    topPath = frontier[frontier.length - 1];
    frontier.splice(frontier.length - 1, 1);
    if(topPath.length > progressMade[1]){
        progressMade[1] = topPath.length;
    }
    currentPos = topPath[topPath.length - 1];
    elementArray[currentPos].visited = true;
    if (elementArray[currentPos].endPoint == true){
        stepCounter += 1;
        for (x of topPath){
            elementArray[x].finalPath = true;
        }
        updateGameArea();
        frontier = [];
        progressMade = [0, 0];
        cancelFun();
        return;
    }
    
    
    temp = expandDirection(topPath.slice(), "top");
    if(temp != null && temp.length <= idfDepthLevel){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    temp = expandDirection(topPath.slice(), "left");
    if(temp != null && temp.length <= idfDepthLevel){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    temp = expandDirection(topPath.slice(), "bot");
    if(temp != null && temp.length <= idfDepthLevel){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    temp = expandDirection(topPath.slice(), "right");
    if(temp != null && temp.length <= idfDepthLevel){
        if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
            elementArray[temp[temp.length - 1]].reachNumber = temp.length;
            frontier.push(temp);
        }
    }
    
    stepCounter += 1;
    skipCounter += 1;
    if(skipCounter != skipSpeed){
        IDSUpdate();
    }else{
        updateGameArea();
        skipCounter = 0;
    }
}

progressMadeEnd = [];
idsEndPoint = 0;
frontierEnd = [];
exhaustedL1 = [];
exhaustedL2 = [];
triggerV = 0
function BIDSUpdate(){
    //Do IDS on start node, do IDS on end node. If at any time one finds a square that is visited and not in expanded (start IDS) or in expanded (end IDS)
    //Search is complete, look in correct frontier for path that contains that element number, connect the paths into one and set it as final path
    if (frontier.length == 0 && frontierEnd.length == 0 && progressMade[0] == progressMade[1] && progressMadeEnd[0] == progressMadeEnd[1]){
        cancelFun();
        return;
    }
    if(frontier.length == 0 && frontierEnd.length == 0){
        if(triggerV != -1){
            goodPath = findBestPath();
            stepCounter += 1;
            for (x of goodPath){
                elementArray[x].finalPath = true;
            }
            updateGameArea();
            frontier = []; frontierEnd = [];
            progressMade = [0, 0]; progressMadeEnd = [0, 0];
            cancelFun();
            return;
        }
        progressMade[0] = progressMade[1];
        progressMade[1] = 0;
        progressMadeEnd[0] = progressMadeEnd[1];
        progressMadeEnd[1] = 0;
        
        for(x of elementArray){
            x.visited = false;
            x.reachNumber = -1;
            x.reachNumber2 = -1;
        }
        currentPos = idsStartPoint;
        currentPos2 = idsEndPoint;
        frontier = [];
        explored = [];
        frontier.push([currentPos]);
        explored.push(currentPos);
        frontierEnd = [];
        frontierEnd.push([currentPos2]);
        idfDepthLevel += 1;
        exhaustedL1 = [];
        exhaustedL2 = [];
    }
    
    idsReturn = idsStep(frontier, progressMade, 1);
    if(idsReturn[0] == 1){
        triggerV = idsReturn[1][idsReturn[1].length - 1];
        console.log("Trigger1: " + triggerV);
    }
    if(idsReturn[0] == 2){
        stepCounter += 1;
        for (x of idsReturn[1]){
            elementArray[x].finalPath = true;
        }
        updateGameArea();
        frontier = []; frontierEnd = [];
        progressMade = [0, 0]; progressMadeEnd = [0, 0];
        cancelFun();
        return;
    }
    
    idsReturn = idsStep(frontierEnd, progressMadeEnd, 2);
    if(idsReturn[0] == 1){
        triggerV = idsReturn[1][idsReturn[1].length - 1];
        console.log("Trigger2: " + triggerV);
    }
    if(idsReturn[0] == 2){
        stepCounter += 1;
        for (x of idsReturn[1]){
            elementArray[x].finalPath = true;
        }
        updateGameArea();
        frontier = []; frontierEnd = [];
        progressMade = [0, 0]; progressMadeEnd = [0, 0];
        cancelFun();
        return;
    }
    
    stepCounter += 1;
    skipCounter += 1;
    if(skipCounter != skipSpeed){
        BIDSUpdate();
    }else{
        updateGameArea();
        skipCounter = 0;
    }
}
//Array for each that holds a chain once dead/thrown out
//When triggered mark trigger point
//Both halves finish searching and at end both dead path lists checked and one with shortest route to trigger point is made a final path

function findBestPath(){
    maxValue = myGameArea.canvas.width * myGameArea.canvas.height;
    workArray = [maxValue, -1]; //distance, position
    workArray2 = [maxValue, -1];
    count = 0;
    for(x of exhaustedL1){
        testing = x.indexOf(triggerV);
        if(testing != -1){
            if(testing < workArray[0]){
                workArray[0] = testing;
                workArray[1] = count;
            }
        }
        count++;
    }
    count = 0;
    for(x of exhaustedL2){
        testing = x.indexOf(triggerV);
        if(testing != -1){
            if(testing < workArray2[0]){
                workArray2[0] = testing;
                workArray2[1] = count;
            }
        }
        count++;
    }
    console.log(workArray + " : " + exhaustedL1.length);
    console.log(workArray2 + " : " + exhaustedL2.length);
    
    temp1 = exhaustedL1[workArray[1]].slice(0, workArray[0]);
    temp2 = exhaustedL2[workArray2[1]].slice(0, workArray2[0] + 1);
    temp2.reverse();
    console.log(temp1.concat(temp2).join());
    return temp1.concat(temp2);
}

function idsStep(frontier, progressMade, posNum ){
    if(frontier.length == 0){
        return [0, null];
    }
    topPath = frontier[frontier.length - 1];
    frontier.splice(frontier.length - 1, 1);
    if(topPath.length > progressMade[1]){
        progressMade[1] = topPath.length;
    }
    if(posNum == 1){
        currentPos = topPath[topPath.length - 1];
        workingPos = currentPos;
    }else{
        currentPos2 = topPath[topPath.length - 1];
        workingPos = currentPos2;
    }
    
    returnValue = 0
    if (posNum == 1 && elementArray[workingPos].endPoint == true){
        return [2, topPath];
    }
    if (posNum == 1 && elementArray[workingPos].visited && !explored.includes(workingPos)){
        returnValue = 1; //return [1, topPath];
        console.log(topPath.join());
    }
    
    if(posNum == 2 && elementArray[workingPos].startPoint == true){
        return [2, topPath];
    }
    if (posNum == 2 && explored.includes(workingPos)){
        returnValue = 1; //return [1, topPath];
        console.log(topPath.join());
    }
    
    elementArray[workingPos].visited = true;
    if(posNum == 1 && !explored.includes(workingPos)){
        explored.push(workingPos);
    }
    
    doesContinue = 0;
    if(posNum == 1){
        temp = expandDirection(topPath.slice(), "top");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
                elementArray[temp[temp.length - 1]].reachNumber = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
        temp = expandDirection(topPath.slice(), "left");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
                elementArray[temp[temp.length - 1]].reachNumber = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
        temp = expandDirection(topPath.slice(), "bot");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
                elementArray[temp[temp.length - 1]].reachNumber = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
        temp = expandDirection(topPath.slice(), "right");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber > temp.length || elementArray[temp[temp.length - 1]].reachNumber == -1){
                elementArray[temp[temp.length - 1]].reachNumber = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
    }else{
        temp = expandDirection(topPath.slice(), "top");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber2 > temp.length || elementArray[temp[temp.length - 1]].reachNumber2 == -1){
                elementArray[temp[temp.length - 1]].reachNumber2 = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
        temp = expandDirection(topPath.slice(), "left");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber2 > temp.length || elementArray[temp[temp.length - 1]].reachNumber2 == -1){
                elementArray[temp[temp.length - 1]].reachNumber2 = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
        temp = expandDirection(topPath.slice(), "bot");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber2 > temp.length || elementArray[temp[temp.length - 1]].reachNumber2 == -1){
                elementArray[temp[temp.length - 1]].reachNumber2 = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
        temp = expandDirection(topPath.slice(), "right");
        if(temp != null && temp.length <= idfDepthLevel){
            if(elementArray[temp[temp.length - 1]].reachNumber2 > temp.length || elementArray[temp[temp.length - 1]].reachNumber2 == -1){
                elementArray[temp[temp.length - 1]].reachNumber2 = temp.length;
                frontier.push(temp);
                doesContinue++;
            }
        }
    }
    
    
    if(doesContinue == 0 && posNum == 1){
        exhaustedL1.push(topPath.slice());
    }else if (doesContinue == 0){
        exhaustedL2.push(topPath.slice());
    }
    if(returnValue == 1){
        return [1, topPath];
    }else{
        return [0, null];
    }
}

function expandDirection(sArray, direction){
    curElement = sArray[sArray.length - 1];
    tempRow = Math.floor(curElement / numberCols);
    tempCol = curElement - tempRow * numberCols;
    if(direction == "top"){
        testElement = curElement - numberCols;
        try{
        if( testElement < 0 || elementArray[testElement].wall || sArray.includes(testElement)){
            return null;
        }
        sArray.push(testElement);
        }
        catch(err){
            console.log(err);
            console.log("Error: " + typeof testElement + ", " + typeof curElement + ", " + typeof numberCols);
        }
        return sArray;
    }
    if(direction == "bot"){
        testElement = curElement + numberCols;
        try{
        if(testElement >= elementArray.length || elementArray[testElement].wall || sArray.includes(testElement)){
            return null;
        }
        sArray.push(testElement);
        }
        catch(err){
            console.log(err);
            console.log("Error: " + typeof testElement + ", " + typeof curElement + ", " + typeof numberCols);
            console.log("Error: " + testElement + ", " + curElement + ", " + numberCols);
        }
        return sArray;
    }
    if( direction == "left"){
        testElement = curElement - 1;
        if(tempCol == 0 || elementArray[testElement].wall || sArray.includes(testElement)){
            return null;
        }
        sArray.push(testElement);
        return sArray;
    }
    if(direction == "right"){
        testElement = curElement + 1;
        if(tempCol == numberCols - 1 || elementArray[testElement].wall || sArray.includes(testElement)){
            return null;
        }
        sArray.push(testElement);
        return sArray;
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
        //this.canvas.addEventListener('click', gotClick, false);
        this.canvas.addEventListener('mousedown', dragStart, false);
        this.canvas.addEventListener('mouseup', dragOver, false);
        this.canvas.addEventListener('mouseleave', dragOver, false);
        this.canvas.addEventListener('mousemove', gotDrag, false);
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


function gotClick(event){
    //console.log(event);
    leftMargin = myGameArea.canvas.offsetLeft + myGameArea.canvas.clientLeft;
    topMargin = myGameArea.canvas.offsetTop + myGameArea.canvas.clientTop;
    actualLeft = event.pageX - leftMargin;
    actualTop = event.pageY - topMargin;
    //console.log("GameX: " + actualLeft + " GameY: " + actualTop);
    actualElement = findElement(actualLeft, actualTop);
    //console.log(actualElement);
    if(actualElement != -1 && !dragPosition[3]){
        lastClick = [true, actualElement];
        dragCondition = false;
    }else{
        dragCondition = false;
        dragPosition[3] = false;
    }
}

var lastClick = [false, -1];
var dragCounter = 0;
var dragTracking = false;
var dragCondition = false;
function dragStart(event){
    dragCounter = 0;
    if(dragTracking){
        dragCondition = true;
    }
}

var dragPosition = [-1, -1, -1, false];
function gotDrag(event){
    if (!dragCondition){
        return;
    }
    if(dragPosition[0] != event.pageX || dragPosition[1] != event.pageY){
        if(dragCounter < 3){
            dragCounter++;
            return;
        }
        leftMargin = myGameArea.canvas.offsetLeft + myGameArea.canvas.clientLeft;
        topMargin = myGameArea.canvas.offsetTop + myGameArea.canvas.clientTop;
        actualLeft = event.pageX - leftMargin;
        actualTop = event.pageY - topMargin;
        actualElement = findElement(actualLeft, actualTop);
        dragPosition = [event.pageX, event.pageY, actualElement, true];
        //console.log(actualElement);
    }
}

function dragOver(event){
    dragCondition = false;
    if (dragCounter < 3){
        leftMargin = myGameArea.canvas.offsetLeft + myGameArea.canvas.clientLeft;
        topMargin = myGameArea.canvas.offsetTop + myGameArea.canvas.clientTop;
        actualLeft = event.pageX - leftMargin;
        actualTop = event.pageY - topMargin;
        //console.log("GameX: " + actualLeft + " GameY: " + actualTop);
        actualElement = findElement(actualLeft, actualTop);
        if(actualElement != -1){
            lastClick = [true, actualElement];
        }
    }
}


function findElement(posX, posY){
    for(x of elementArray){
        xRange = [x.x, x.x + x.width];
        if(xRange[0] <= posX && posX <= xRange[1]){
            yRange = [x.y, x.y + x.height];
            if(yRange[0] <= posY && posY <= yRange[1]){
                return x.posNumber;
            }
        }
    }
    return -1;
}

function component(width, height, color, x, y, pNumber) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.posNumber = pNumber;
    this.wall = false;
    this.visited = false;
    this.reachNumber = -1;
    this.reachNumber2 = -1;
    this.startPoint = false;
    this.endPoint = false;
    this.finalPath = false;
    //Unused ( No Touch, Wall, Visited) or part of Path
    this.update = function(aBorder){
        
        ctx = myGameArea.context;
        if(this.startPoint){
            ctx.fillStyle = "yellow";
        }else if(this.endPoint){
            ctx.fillStyle = "red";
        }else if (this.wall){
            ctx.fillStyle = "black";
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
        if (aCount == currentPos || aCount == currentPos2){
            x.update(1);
        }else if(pathNode.includes(x.posNumber)){//element is part of pathNode
            x.update(2);
        }else{//Unused Node
            x.update(3);
        }
        aCount += 1;
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