let _puzzleData = null
let _events = []

let solving = false
let startClickDebounce = false
let drawLine = null
let drawLinePivot = []
let drawLineMove = [0, 0]
let drawLineCircle = null
let drawElements = []
let drawElementsPoints = []
let pointPrevAxises = []
let prevMousePosition = null
let mainAxis = "x"
let lastTouch = null

function removeEvents(){
    _events.forEach(_event => {
        _event.element.removeEventListener(_event.type, _event.handler)
    })

    _events = []
}

function startClick(puzzleStart, element){
    if (solving) return

    solving = true
    startClickDebounce = true

    setTimeout(() => {
        startClickDebounce = false
    }, 10)

    element.style.backgroundColor = _puzzleData.colors[2]
    document.body.style.cursor = "none"

    startDrawing(puzzleStart.puzzlePoint.position)
}

function startDrawing(pivotPoint){
    if (drawLine){
        drawLine.remove()
    }

    drawLinePivot = pivotPoint
    drawLineMove = [0, 0]
    drawLine = document.createElement("div")
    drawLine.classList.add("puzzle-line")
    drawLine.style.backgroundColor = _puzzleData.colors[2]
    prevMousePosition = null
    _puzzleData.element.append(drawLine)

    drawLineCircle = document.createElement("div")
    drawLineCircle.classList.add("puzzle-point")
    drawLineCircle.style.width = `${_puzzleData.pointSize}px`
    drawLineCircle.style.height = `${_puzzleData.pointSize}px`
    drawLineCircle.style.left = `${pivotPoint[0]}px`
    drawLineCircle.style.top = `${pivotPoint[1]}px`
    drawLineCircle.style.backgroundColor = _puzzleData.colors[2]
    _puzzleData.element.append(drawLineCircle)

    _puzzleData.element.requestPointerLock()
}

function createLineDuplicate(axis, prev, direction){
    let drawLineDuplicate = drawLine.cloneNode()
    
    if (axis === "x"){
        drawLineDuplicate.style.width = `${_puzzleData.pointDistance}px`

        if (direction === -1){
            drawLineDuplicate.style.left = `${prev + _puzzleData.pointSize / 2 - _puzzleData.pointDistance}px`
        }
        else{
            drawLineDuplicate.style.left = `${prev + _puzzleData.pointSize / 2}px`
        }
    }   
    else{
        drawLineDuplicate.style.height = `${_puzzleData.pointDistance}px`

        if (direction === -1){
            drawLineDuplicate.style.top = `${prev + _puzzleData.pointSize / 2 - _puzzleData.pointDistance}px`
        }
        else{
            drawLineDuplicate.style.top = `${prev + _puzzleData.pointSize / 2}px`
        }
    }

    _puzzleData.element.append(drawLineDuplicate)
    drawElements.push({
        element: drawLineDuplicate
    })
}

function createPivotPointElement(){
    let drawLinePoint = document.createElement("div")
    drawLinePoint.classList.add("puzzle-point")
    drawLinePoint.style.backgroundColor = _puzzleData.colors[2]
    drawLinePoint.style.width = `${_puzzleData.pointSize}px`
    drawLinePoint.style.height = `${_puzzleData.pointSize}px`
    drawLinePoint.style.left = `${drawLinePivot[0]}px`
    drawLinePoint.style.top = `${drawLinePivot[1]}px`
    _puzzleData.element.append(drawLinePoint)
    drawElementsPoints.push({
        element: drawLinePoint
    })
}

function pointReachedX(direction){
    let prev = drawLinePivot[0]

    pointPrevAxises.push(Array.from(drawLinePivot))

    drawLinePivot = [drawLinePivot[0] + _puzzleData.pointDistance * Math.sign(drawLineMove[0]), drawLinePivot[1]]
    drawLineMove = [0, 0]
    prevMousePosition = null
    createLineDuplicate("x", prev, direction)
    createPivotPointElement()
}

function pointReachedY(direction){
    let prev = drawLinePivot[1]

    pointPrevAxises.push(Array.from(drawLinePivot))

    drawLinePivot = [drawLinePivot[0], drawLinePivot[1] + _puzzleData.pointDistance * Math.sign(drawLineMove[1])]
    drawLineMove = [0, 0]
    prevMousePosition = null
    createLineDuplicate("y", prev, direction)
    createPivotPointElement()
}

function removePrevPoint(prevPointAxis){
    if (pointPrevAxises.length > 0 && drawElementsPoints.length > 0 && drawElements.length > 0)

    pointPrevAxises.splice(pointPrevAxises.length - 1, 1)

    let point = drawElementsPoints[drawElementsPoints.length - 1]
    if (point && point.element){
        point.element.remove()
    }
    drawElementsPoints.splice(drawElementsPoints.length - 1, 1)

    let line = drawElements[drawElements.length - 1]
    if (line && line.element){
        line.element.remove()
    }
    drawElements.splice(drawElements.length - 1, 1)

    drawLinePivot = prevPointAxis
}

function isAxisPoint(axisPoint){
    if (pointPrevAxises.length <= 0) return false

    let isFound = false

    for (let i = 0; i < pointPrevAxises.length; i++){
        const pointAxis = pointPrevAxises[i]

        if (Math.abs(axisPoint[0] - pointAxis[0]) < 2 && Math.abs(axisPoint[1] - pointAxis[1]) < 2){
            isFound = true

            break
        }
    }

    return isFound
}

function handleTouch(event){
    const touch = event.touches[0]

    if (!lastTouch) lastTouch = [touch.clientX, touch.clientY]

    const delta = [touch.clientX - lastTouch[0], touch.clientY - lastTouch[1]]

    lastTouch = [touch.clientX, touch.clientY]

    handleDrawingBoth(touch.clientX, touch.clientY, delta[0], delta[1])
}

function handleDrawing(event){
    handleDrawingBoth(event.clientX, event.clientY, event.movementX / 2, event.movementY / 2)
}

function handleDrawingBoth(clientX, clientY, movementX, movementY){
    if (!solving) return

    if (!prevMousePosition) prevMousePosition = [clientX, clientY]

    const mousePosition = [prevMousePosition[0] + movementX, prevMousePosition[1] + movementY]

    let diffX = mousePosition[0] - prevMousePosition[0]
    let diffY = mousePosition[1] - prevMousePosition[1]

    drawLineMove = [drawLineMove[0] + diffX, drawLineMove[1] + diffY]

    let direction = 1
    let multiX = 1
    let multiY = 1
    let margin = 2

    if (Math.abs(drawLineMove[0]) > margin || Math.abs(drawLineMove[1]) > margin){
        if (Math.abs(drawLineMove[0]) > Math.abs(drawLineMove[1])) {
            mainAxis = "x"
            drawLineMove[1] = 0
        }
        else {
            mainAxis = "y"
            drawLineMove[0] = 0
        }
    }

    if (drawLineMove[0] > _puzzleData.pointDistance) drawLineMove[0] = _puzzleData.pointDistance
    if (drawLineMove[1] > _puzzleData.pointDistance) drawLineMove[1] = _puzzleData.pointDistance

    //if (Math.abs(drawLineMove[0]) * multiX > Math.abs(drawLineMove[1]) * multiY){
    if (mainAxis === "x"){
        drawLine.style.top = `${drawLinePivot[1]}px`
        drawLine.style.height = `${_puzzleData.pointSize}px`
        drawLineCircle.style.top = `${drawLinePivot[1]}px`

        if (drawLineMove[0] < 0 && drawLinePivot[0] > _puzzleData.pointSize){
            drawLine.style.width = `${Math.abs(drawLineMove[0])}px`
            drawLine.style.left = `${drawLinePivot[0] + _puzzleData.pointSize / 2 - Math.abs(drawLineMove[0])}px`
            drawLineCircle.style.left = `${drawLinePivot[0] - Math.abs(drawLineMove[0])}px`
            direction = -1
        }
        else if (drawLineMove[0] < 0){
            drawLineMove = [drawLineMove[0] - diffX, drawLineMove[1]]
            drawLine.style.width = "0px"
            drawLineCircle.style.left = `${drawLinePivot[0]}px`
        }
        
        if (drawLineMove[0] > 0 && drawLinePivot[0] < _puzzleData.pointSize + (_puzzleData.pointSize * 3) * (_puzzleData.grid[0] - 2)){
            drawLine.style.width = `${drawLineMove[0]}px`
            drawLine.style.left = `${drawLinePivot[0] + _puzzleData.pointSize / 2}px`
            drawLineCircle.style.left = `${drawLinePivot[0] + Math.abs(drawLineMove[0])}px`
        }
        else if (drawLineMove[0] > 0){
            drawLineMove = [drawLineMove[0] - diffX, drawLineMove[1]]
            drawLine.style.width = "0px"
            drawLineCircle.style.left = `${drawLinePivot[0]}px`
        }
        
        if (drawLineMove[0] < 0 && isAxisPoint([drawLinePivot[0] - _puzzleData.pointDistance, drawLinePivot[1]]) && drawLineMove[0] <= -_puzzleData.pointDistance + _puzzleData.pointSize + margin){
            drawLineMove = [-_puzzleData.pointDistance + _puzzleData.pointSize + margin, 0]
            
            drawLine.style.width = `${Math.abs(drawLineMove[0])}px`
            drawLine.style.left = `${drawLinePivot[0] + _puzzleData.pointSize / 2 - Math.abs(drawLineMove[0])}px`
            drawLineCircle.style.left = `${drawLinePivot[0] - Math.abs(drawLineMove[0])}px`
            direction = -1
        }
        
        if (drawLineMove[0] > 0 && isAxisPoint([drawLinePivot[0] + _puzzleData.pointDistance, drawLinePivot[1]]) && drawLineMove[0] >= _puzzleData.pointDistance - _puzzleData.pointSize - margin){
            drawLineMove = [_puzzleData.pointDistance - _puzzleData.pointSize - margin, 0]

            drawLine.style.width = `${drawLineMove[0]}px`
            drawLine.style.left = `${drawLinePivot[0] + _puzzleData.pointSize / 2}px`
            drawLineCircle.style.left = `${drawLinePivot[0] + Math.abs(drawLineMove[0])}px`
        }
    }
    else{
        drawLine.style.left = `${drawLinePivot[0]}px`
        drawLine.style.width = `${_puzzleData.pointSize}px`
        drawLineCircle.style.left = `${drawLinePivot[0]}px`

        if (drawLineMove[1] < 0 && drawLinePivot[1] > _puzzleData.pointSize * 2){
            drawLine.style.height = `${Math.abs(drawLineMove[1])}px`
            drawLine.style.top = `${drawLinePivot[1] + _puzzleData.pointSize / 2 - Math.abs(drawLineMove[1])}px`
            drawLineCircle.style.top = `${drawLinePivot[1] - Math.abs(drawLineMove[1])}px`
            direction = -1
        }
        else if (drawLineMove[1] < 0){
            drawLineMove = [drawLineMove[0], drawLineMove[1] - diffY]
            drawLine.style.height = "0px"
            drawLineCircle.style.top = `${drawLinePivot[1]}px`
        }
        
        if (drawLineMove[1] > 0 && drawLinePivot[1] < _puzzleData.pointSize + (_puzzleData.pointSize * 3) * (_puzzleData.grid[1] - 1)){
            drawLine.style.height = `${drawLineMove[1]}px`
            drawLine.style.top = `${drawLinePivot[1] + _puzzleData.pointSize / 2}px`
            drawLineCircle.style.top = `${drawLinePivot[1] + Math.abs(drawLineMove[1])}px`
        }
        else if (drawLineMove[1] > 0){
            drawLineMove = [drawLineMove[0], drawLineMove[1] - diffY]
            drawLine.style.height = "0px"
            drawLineCircle.style.top = `${drawLinePivot[1]}px`
        }

        if (drawLineMove[1] < 0 && isAxisPoint([drawLinePivot[0], drawLinePivot[1] - _puzzleData.pointDistance]) && drawLineMove[1] <= -_puzzleData.pointDistance + _puzzleData.pointSize + margin){
            drawLineMove = [0, -_puzzleData.pointDistance + _puzzleData.pointSize + margin]
            
            drawLine.style.height = `${Math.abs(drawLineMove[1])}px`
            drawLine.style.top = `${drawLinePivot[1] + _puzzleData.pointSize / 2 - Math.abs(drawLineMove[1])}px`
            drawLineCircle.style.top = `${drawLinePivot[1] - Math.abs(drawLineMove[1])}px`
            direction = -1
        }
        
        if (drawLineMove[1] > 0 && isAxisPoint([drawLinePivot[0], drawLinePivot[1] + _puzzleData.pointDistance]) && drawLineMove[1] >= _puzzleData.pointDistance - _puzzleData.pointSize - margin){
            drawLineMove = [0, _puzzleData.pointDistance - _puzzleData.pointSize - margin]

            drawLine.style.height = `${drawLineMove[1]}px`
            drawLine.style.top = `${drawLinePivot[1] + _puzzleData.pointSize / 2}px`
            drawLineCircle.style.top = `${drawLinePivot[1] + Math.abs(drawLineMove[1])}px`
        }
    }

    prevMousePosition = mousePosition

    if (Math.abs(drawLineMove[0]) >= _puzzleData.pointDistance - margin || Math.abs(drawLineMove[1]) >= _puzzleData.pointDistance - margin){
        //if (Math.abs(drawLineMove[0]) * multiX > Math.abs(drawLineMove[1] * multiY)){
        if (mainAxis === "x"){
            if (Math.abs(drawLineMove[0]) >= _puzzleData.pointDistance - margin){
                pointReachedX(direction)

                handleDrawingBoth(clientX, clientY, movementX, movementY)
            }
        }
        else{
            if (Math.abs(drawLineMove[1]) >= _puzzleData.pointDistance - margin){
                pointReachedY(direction)

                handleDrawingBoth(clientX, clientY, movementX, movementY)
            }
        }
    }

    if (pointPrevAxises.length > 0){
        let prevPointAxis = pointPrevAxises[pointPrevAxises.length - 1]

        if (prevPointAxis[0] < drawLinePivot[0] && direction === -1 && Math.abs(drawLineMove[0]) > Math.abs(drawLineMove[1])){
            removePrevPoint(prevPointAxis)

            drawLineMove = [_puzzleData.pointDistance - 1 - margin, drawLineMove[1]]

            handleDrawingBoth(clientX, clientY, movementX, movementY)
        }
        else if (prevPointAxis[0] > drawLinePivot[0] && direction === 1 && Math.abs(drawLineMove[0]) > Math.abs(drawLineMove[1])){
            removePrevPoint(prevPointAxis)

            drawLineMove = [-_puzzleData.pointDistance + 1 + margin, drawLineMove[1]]

            handleDrawingBoth(clientX, clientY, movementX, movementY)
        }
        else if (prevPointAxis[1] < drawLinePivot[1] && direction === -1 && Math.abs(drawLineMove[0]) < Math.abs(drawLineMove[1])){
            removePrevPoint(prevPointAxis)

            drawLineMove = [drawLineMove[0], _puzzleData.pointDistance - 1 - margin]

            handleDrawingBoth(clientX, clientY, movementX, movementY)
        }
        else if (prevPointAxis[1] > drawLinePivot[1] && direction === 1 && Math.abs(drawLineMove[0]) < Math.abs(drawLineMove[1])){
            removePrevPoint(prevPointAxis)

            drawLineMove = [drawLineMove[0], -_puzzleData.pointDistance + 1 + margin]

            handleDrawingBoth(clientX, clientY, movementX, movementY)
        }
    }
}

function endDrawing(){
    drawElements.forEach(drawElement => {
        drawElement.element.remove()
    })

    drawElementsPoints.forEach(drawElementsPoint => {
        drawElementsPoint.element.remove()
    })

    pointPrevAxises = []
    drawElements = []
    drawElementsPoints = []
    drawLineCircle.remove()
    drawLineCircle = null
}

function documentClick(){
    if (solving && !startClickDebounce){
        solving = false

        document.body.style.cursor = "default"

        for (let element of _puzzleData.element.children){
            element.style.backgroundColor = _puzzleData.colors[1]
        }

        if (drawLine){
            drawLine.remove()
        }

        endDrawing()

        document.exitPointerLock()
    }
}

export function handlePuzzle(puzzleData){
    if (_puzzleData){
        removeEvents()
    }

    _puzzleData = puzzleData

    for (let i = 0; i < puzzleData.puzzleStarts.length; i++){
        const puzzleStart = puzzleData.puzzleStarts[i]
        const element = puzzleStart.puzzlePoint.puzzlePoint

        function click(){
            startClick(puzzleStart, element)
        }

        element.addEventListener("click", click)

        _events.push({
            element: element,
            handler: click,
            type: "click"
        })
    }

    document.addEventListener("click", documentClick)
    _events.push({
        element: document,
        handler: documentClick,
        type: "click"
    })
    document.addEventListener("mousemove", handleDrawing)
    _events.push({
        element: document,
        handler: handleDrawing,
        type: "mousemove"
    })
    document.addEventListener("touchmove", handleTouch)
    _events.push({
        element: document,
        handler: handleTouch,
        type: "touchmove"
    })
}