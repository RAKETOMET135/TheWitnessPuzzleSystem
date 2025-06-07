let _puzzleData = null
let _events = []
let _solutionFunction = null

let solving = false
let startClickDebounce = false
let drawLine = null
let drawLineSymmetry = null
let drawLinePivot = []
let drawLinePivotSymmetry = []
let drawLineMove = [0, 0]
let drawLineMoveSymmetry = [0, 0]
let drawLineCircle = null
let drawLineCircleSymmetry = null
let drawElements = []
let drawElementsSymmetry = []
let drawElementsPoints = []
let drawElementsPointsSymmetry = []
let pointPrevAxises = []
let prevMousePosition = null
let mainAxis = "x"
let lastTouch = null
let selectedEnd = null
let selectedEndSymmetry = null
let usedStart = null
let usedStartSymmetry = null
let correct = false
let closeBreakPoints = null
let closeLineRemovals = null
let closeBreakPointsSymmetry = null
let closeLineRemovalsSymmetry = null
let isSymmetry = false
let symmetryLinePoints = []

function removeEvents(){
    _events.forEach(_event => {
        _event.element.removeEventListener(_event.type, _event.handler)
    })

    _events = []
}

function changeElementsColorToDefault(){
    for (let element of _puzzleData.element.children){
        if (element.classList.contains("puzzle-rule") || element.classList.contains("puzzle-break")) continue

        element.style.backgroundColor = _puzzleData.colors[1]
    }
}

function getLinkedStart(linked){
    for (let i = 0; i < _puzzleData.puzzleStarts.length; i++){
        const puzzleStart = _puzzleData.puzzleStarts[i]
        const gridPosition = puzzleStart.gridPosition
        
        if (gridPosition[0] !== linked[0] || gridPosition[1] !== linked[1]) continue

        return puzzleStart
    }

    return null
}

function getDrawLineMoveSymmetry(lineMove){
    let move = [0, 0]

    switch (_puzzleData.symmetry){
        case "vertical":
            move = [-lineMove[0], lineMove[1]]

            break
        case "horizontal":
            move = [lineMove[0], -lineMove[1]]

            break
        default:
            move = [-lineMove[0], -lineMove[1]]
    }

    return move
}

function startClick(puzzleStart, element){
    if (solving) return

    solving = true
    startClickDebounce = true

    if (usedStart && usedStart !== undefined){
        usedStart.puzzlePoint.puzzlePoint.style.transition = "none"
    }

    if (usedStartSymmetry && usedStartSymmetry !== undefined){
        usedStartSymmetry.puzzlePoint.puzzlePoint.style.transition = "none"
    }

    if (selectedEnd){
        selectedEnd.endLine.style.transition = "none"
        selectedEnd.endPoint.style.transition = "none"
    }

    if (selectedEndSymmetry){
        selectedEndSymmetry.endLine.style.transition = "none"
        selectedEndSymmetry.endPoint.style.transition = "none"
    }

    usedStart = puzzleStart

    if (_puzzleData.isSymmetry){
        isSymmetry = true
    }
    else{
        isSymmetry = false
    }

    if (isSymmetry){
        usedStartSymmetry = getLinkedStart(puzzleStart.linked)
    }

    if (correct){
        correct = false

        changeElementsColorToDefault()

        if (drawLine){
            drawLine.remove()
        }

        if (drawLineSymmetry){
            drawLineSymmetry.remove()
        }

        removePrevDuplicatedSymmetryLine()
        endDrawing() 

        selectedEnd = null
        selectedEndSymmetry = null
    }

    setTimeout(() => {
        startClickDebounce = false
    }, 10)

    element.style.backgroundColor = _puzzleData.colors[2]
    document.body.style.cursor = "none"

    if (isSymmetry){
        usedStartSymmetry.puzzlePoint.puzzlePoint.style.backgroundColor = _puzzleData.colors[2]
    }

    startDrawing(puzzleStart.puzzlePoint.position)
}

function startDrawing(pivotPoint){
    if (drawLine){
        drawLine.remove()
    }

    drawLinePivot = pivotPoint
    closeBreakPoints = getNearbyBreakPoints(pivotPoint)
    closeBreakPointsSymmetry = getNearbyBreakPointsSymmetry(pivotPoint)
    closeLineRemovals = getNearbyLineRemovals(pivotPoint)
    closeLineRemovalsSymmetry = getNearbyLineRemovalsSymmetry(pivotPoint)
    drawLineMove = [0, 0]
    drawLine = document.createElement("div")
    drawLine.classList.add("puzzle-line")
    drawLine.style.backgroundColor = _puzzleData.colors[2]
    drawLine.style.zIndex = "20"
    prevMousePosition = null
    _puzzleData.element.append(drawLine)

    drawLineCircle = document.createElement("div")
    drawLineCircle.classList.add("puzzle-point")
    drawLineCircle.style.width = `${_puzzleData.pointSize}px`
    drawLineCircle.style.height = `${_puzzleData.pointSize}px`
    drawLineCircle.style.left = `${pivotPoint[0]}px`
    drawLineCircle.style.top = `${pivotPoint[1]}px`
    drawLineCircle.style.backgroundColor = _puzzleData.colors[2]
    drawLineCircle.style.zIndex = "20"
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
    drawLinePoint.style.zIndex = "20"
    _puzzleData.element.append(drawLinePoint)
    drawElementsPoints.push({
        element: drawLinePoint
    })
}

function pointReachedX(direction){
    let prev = drawLinePivot[0]

    pointPrevAxises.push(Array.from(drawLinePivot))

    drawLinePivot = [drawLinePivot[0] + _puzzleData.pointDistance * Math.sign(drawLineMove[0]), drawLinePivot[1]]
    closeBreakPoints = getNearbyBreakPoints(drawLinePivot)
    closeBreakPointsSymmetry = getNearbyBreakPointsSymmetry(drawLinePivot)
    closeLineRemovals = getNearbyLineRemovals(drawLinePivot)
    closeLineRemovalsSymmetry = getNearbyLineRemovalsSymmetry(drawLinePivot)
    drawLineMove = [0, 0]
    prevMousePosition = null
    createLineDuplicate("x", prev, direction)
    createPivotPointElement()
}

function pointReachedY(direction){
    let prev = drawLinePivot[1]

    pointPrevAxises.push(Array.from(drawLinePivot))

    drawLinePivot = [drawLinePivot[0], drawLinePivot[1] + _puzzleData.pointDistance * Math.sign(drawLineMove[1])]
    closeBreakPoints = getNearbyBreakPoints(drawLinePivot)
    closeBreakPointsSymmetry = getNearbyBreakPointsSymmetry(drawLinePivot)
    closeLineRemovals = getNearbyLineRemovals(drawLinePivot)
    closeLineRemovalsSymmetry = getNearbyLineRemovalsSymmetry(drawLinePivot)
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
    closeBreakPoints = getNearbyBreakPoints(drawLinePivot)
    closeBreakPointsSymmetry = getNearbyBreakPointsSymmetry(drawLinePivot)
    closeLineRemovals = getNearbyLineRemovals(drawLinePivot)
    closeLineRemovalsSymmetry = getNearbyLineRemovalsSymmetry(drawLinePivot)
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

    if (isSymmetry && !isFound){
        for (let i = 0; i < symmetryLinePoints.length; i++){
            const symmetryPoint = symmetryLinePoints[i]

            if (Math.abs(axisPoint[0] - symmetryPoint[0]) < 2 && Math.abs(axisPoint[1] - symmetryPoint[1]) < 2){
                isFound = true

                break
            }
        }
    }

    return isFound
}

function isRightBlock(){
    let isBlock = false

    if (!drawLinePivotSymmetry) return isBlock

    if (_puzzleData.symmetry === "vertical"){
        if (Math.abs((drawLinePivot[0] + _puzzleData.pointDistance) - (drawLinePivotSymmetry[0] - _puzzleData.pointDistance)) < 2){
            isBlock = true
        }
    }
    else if (_puzzleData.symmetry === "both"){
        if (Math.abs((drawLinePivot[0] + _puzzleData.pointDistance) - (drawLinePivotSymmetry[0] - _puzzleData.pointDistance)) < 2
            && Math.abs(drawLinePivot[1] - drawLinePivotSymmetry[1]) < 2
        ){
            isBlock = true
        }
    }

    return isBlock
}

function isLeftBlock(){
    let isBlock = false

    if (!drawLinePivotSymmetry) return isBlock

    if (_puzzleData.symmetry === "vertical"){
        if (Math.abs((drawLinePivot[0] - _puzzleData.pointDistance) - (drawLinePivotSymmetry[0] + _puzzleData.pointDistance)) < 2){
            isBlock = true
        }
    }
    else if (_puzzleData.symmetry === "both"){
        if (Math.abs((drawLinePivot[0] - _puzzleData.pointDistance) - (drawLinePivotSymmetry[0] + _puzzleData.pointDistance)) < 2
            && Math.abs(drawLinePivot[1] - drawLinePivotSymmetry[1]) < 2
        ){
            isBlock = true
        }
    }

    return isBlock
}

function isTopBlock(){
    let isBlock = false

    if (!drawLinePivotSymmetry) return isBlock

    if (_puzzleData.symmetry === "horizontal"){
        if (Math.abs((drawLinePivot[1] - _puzzleData.pointDistance) - (drawLinePivotSymmetry[1] + _puzzleData.pointDistance)) < 2){
            isBlock = true
        }
    }
    else if (_puzzleData.symmetry === "both"){
        if (Math.abs((drawLinePivot[1] - _puzzleData.pointDistance) - (drawLinePivotSymmetry[1] + _puzzleData.pointDistance)) < 2
            && Math.abs(drawLinePivot[0] - drawLinePivotSymmetry[0]) < 2
        ){
            isBlock = true
        }
    }

    return isBlock
}

function isBottomBlock(){
    let isBlock = false

    if (!drawLinePivotSymmetry) return isBlock

    if (_puzzleData.symmetry === "horizontal"){
        if (Math.abs((drawLinePivot[1] + _puzzleData.pointDistance) - (drawLinePivotSymmetry[1] - _puzzleData.pointDistance)) < 2){
            isBlock = true
        }
    }
    else if (_puzzleData.symmetry === "both"){
        if (Math.abs((drawLinePivot[1] + _puzzleData.pointDistance) - (drawLinePivotSymmetry[1] - _puzzleData.pointDistance)) < 2
            && Math.abs(drawLinePivot[0] - drawLinePivotSymmetry[0]) < 2
        ){
            isBlock = true
        }
    }

    return isBlock
}

function getEndPoints(pivotPointPosition){
    let endPoints = []

    for (let i = 0; i < _puzzleData.puzzleEnds.length; i++){
        const endPoint = _puzzleData.puzzleEnds[i]
        const position = endPoint.puzzlePoint.position

        if (Math.abs(position[0] - pivotPointPosition[0]) < 2 && Math.abs(position[1] - pivotPointPosition[1]) < 2){
            endPoints.push(endPoint)
        }
    }

    if (endPoints.length <= 0) return null

    return endPoints
}

function getEndPoint(pivotPointPosition, direction){
    let _endPoint = null

    for (let i = 0; i < _puzzleData.puzzleEnds.length; i++){
        const endPoint = _puzzleData.puzzleEnds[i]
        const position = endPoint.puzzlePoint.position
        const endDirection = endPoint.end[2]

        let isPosition = Math.abs(position[0] - pivotPointPosition[0]) < 2 && Math.abs(position[1] - pivotPointPosition[1]) < 2

        if (isPosition){
            if (endDirection === direction || endDirection === "up-right" && direction === "right" || endDirection === "up-right" && direction === "up"
                || endDirection === "down-right" && direction === "right" || endDirection === "down-right" && direction === "down"
                || endDirection === "up-left" && direction === "left" || endDirection === "up-left" && direction === "up"
                || endDirection === "down-left" && direction === "left" || endDirection === "down-left" && direction === "down"
            ){
                _endPoint = endPoint

                break
            }
        }
    }

    return _endPoint
}

function enableEnd(endPoint){
    endPoint.endPoint.style.backgroundColor = _puzzleData.colors[2]
    endPoint.endLine.style.backgroundColor = _puzzleData.colors[2]
    endPoint.endPoint.style.zIndex = "20"
    endPoint.endLine.style.zIndex = "20"
    selectedEnd = endPoint
}

function disableEnd(){
    if (!selectedEnd) return

    selectedEnd.endPoint.style.backgroundColor = _puzzleData.colors[1]
    selectedEnd.endLine.style.backgroundColor = _puzzleData.colors[1]
    selectedEnd.endPoint.style.zIndex = "1"
    selectedEnd.endLine.style.zIndex = "1"
    selectedEnd = null
}

function convertPositionToSymmetry(gridPosition){
    if (_puzzleData.symmetry === "vertical") return [_puzzleData.grid[0] - 1 - gridPosition[0], gridPosition[1]]
    if (_puzzleData.symmetry === "horizontal") return [gridPosition[0], _puzzleData.grid[1] - 1 - gridPosition[1]]

    return [_puzzleData.grid[0] - 1 - gridPosition[0], _puzzleData.grid[1] - 1 - gridPosition[1]]
}

function convertGridToPosition(gridPosition){
    const leftPosition = _puzzleData.pointSize + (_puzzleData.pointSize * 3) * gridPosition[0]
    const topPosition =  _puzzleData.pointSize + (_puzzleData.pointSize * 3) * gridPosition[1]

    return [leftPosition, topPosition]
}

function getSymmetryLinePoints(){
    let gridPositions = convertPositionsToGrid(pointPrevAxises)
    let symmetryLinePoints = []

    for (let i = 0; i < gridPositions.length; i++){
        let symmetryGridPosition = convertPositionToSymmetry(gridPositions[i])

        symmetryLinePoints.push(convertGridToPosition(symmetryGridPosition))
    }

    return symmetryLinePoints
}

function getNearbyLineRemovalsSymmetry(point){
    let _point = convertPositionToGrid(point)
    let _gridPoint = convertPositionToSymmetry(_point)
    let gridPoint = convertGridToPosition(_gridPoint)

    let nearbyLineRemovals = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    for (let i = 0; i < _puzzleData.puzzleLineRemovals.length; i++){
        const lineRemoval = _puzzleData.puzzleLineRemovals[i]
        const position = lineRemoval.position

        if (Math.abs(position[0] - gridPoint[0]) < 2){
            if (position[1] > gridPoint[1] && position[1] < gridPoint[1] + _puzzleData.pointDistance){
                nearbyLineRemovals.bottom = lineRemoval
            }
            else if (position[1] < gridPoint[1] && position[1] > gridPoint[1] - _puzzleData.pointDistance){
                nearbyLineRemovals.top = lineRemoval
            }
        }
        else if (Math.abs(position[1] - gridPoint[1]) < 2){
            if (position[0] > gridPoint[0] && position[0] < gridPoint[0] + _puzzleData.pointDistance) {
                nearbyLineRemovals.right = lineRemoval
            }
            else if (position[0] < gridPoint[0] && position[0] > gridPoint[0] - _puzzleData.pointDistance) {
                nearbyLineRemovals.left = lineRemoval
            }
        }
    }

    let nearbyLineRemovalsFixed = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    if (_puzzleData.symmetry === "vertical"){
        nearbyLineRemovalsFixed.top = nearbyLineRemovals.top
        nearbyLineRemovalsFixed.bottom = nearbyLineRemovals.bottom
        nearbyLineRemovalsFixed.left = nearbyLineRemovals.right
        nearbyLineRemovalsFixed.right = nearbyLineRemovals.left
    }
    else if (_puzzleData.symmetry === "horizontal"){
        nearbyLineRemovalsFixed.top = nearbyLineRemovals.bottom
        nearbyLineRemovalsFixed.bottom = nearbyLineRemovals.top
        nearbyLineRemovalsFixed.left = nearbyLineRemovals.left
        nearbyLineRemovalsFixed.right = nearbyLineRemovals.right
    }
    else {
        nearbyLineRemovalsFixed.top = nearbyLineRemovals.bottom
        nearbyLineRemovalsFixed.bottom = nearbyLineRemovals.top
        nearbyLineRemovalsFixed.left = nearbyLineRemovals.right
        nearbyLineRemovalsFixed.right = nearbyLineRemovals.left
    }

    return nearbyLineRemovalsFixed
}

function getNearbyBreakPointsSymmetry(point){
    let _point = convertPositionToGrid(point)
    let _gridPoint = convertPositionToSymmetry(_point)
    let gridPoint = convertGridToPosition(_gridPoint)

    let nearbyBreakPoints = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    for (let i = 0; i < _puzzleData.puzzleBreaks.length; i++){
        const puzzleBreak = _puzzleData.puzzleBreaks[i]
        const position = puzzleBreak.position

        if (Math.abs(position[0] - gridPoint[0]) < 2){
            if (position[1] > gridPoint[1] && position[1] < gridPoint[1] + _puzzleData.pointDistance){
                nearbyBreakPoints.bottom = puzzleBreak
            }
            else if (position[1] < gridPoint[1] && position[1] > gridPoint[1] - _puzzleData.pointDistance){
                nearbyBreakPoints.top = puzzleBreak
            }
        }
        else if (Math.abs(position[1] - gridPoint[1]) < 2){
            if (position[0] > gridPoint[0] && position[0] < gridPoint[0] + _puzzleData.pointDistance) {
                nearbyBreakPoints.right = puzzleBreak
            }
            else if (position[0] < gridPoint[0] && position[0] > gridPoint[0] - _puzzleData.pointDistance) {
                nearbyBreakPoints.left = puzzleBreak
            }
        }
    }

    let nearbyBreakPointsFixed = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    if (_puzzleData.symmetry === "vertical"){
        nearbyBreakPointsFixed.top = nearbyBreakPoints.top
        nearbyBreakPointsFixed.bottom = nearbyBreakPoints.bottom
        nearbyBreakPointsFixed.left = nearbyBreakPoints.right
        nearbyBreakPointsFixed.right = nearbyBreakPoints.left
    }
    else if (_puzzleData.symmetry === "horizontal"){
        nearbyBreakPointsFixed.top = nearbyBreakPoints.bottom
        nearbyBreakPointsFixed.bottom = nearbyBreakPoints.top
        nearbyBreakPointsFixed.left = nearbyBreakPoints.left
        nearbyBreakPointsFixed.right = nearbyBreakPoints.right
    }
    else {
        nearbyBreakPointsFixed.top = nearbyBreakPoints.bottom
        nearbyBreakPointsFixed.bottom = nearbyBreakPoints.top
        nearbyBreakPointsFixed.left = nearbyBreakPoints.right
        nearbyBreakPointsFixed.right = nearbyBreakPoints.left
    }

    return nearbyBreakPointsFixed
}

function getNearbyBreakPoints(point){
    let nearbyBreakPoints = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    for (let i = 0; i < _puzzleData.puzzleBreaks.length; i++){
        const puzzleBreak = _puzzleData.puzzleBreaks[i]
        const position = puzzleBreak.position

        if (Math.abs(position[0] - point[0]) < 2){
            if (position[1] > point[1] && position[1] < point[1] + _puzzleData.pointDistance){
                nearbyBreakPoints.bottom = puzzleBreak
            }
            else if (position[1] < point[1] && position[1] > point[1] - _puzzleData.pointDistance){
                nearbyBreakPoints.top = puzzleBreak
            }
        }
        else if (Math.abs(position[1] - point[1]) < 2){
            if (position[0] > point[0] && position[0] < point[0] + _puzzleData.pointDistance) {
                nearbyBreakPoints.right = puzzleBreak
            }
            else if (position[0] < point[0] && position[0] > point[0] - _puzzleData.pointDistance) {
                nearbyBreakPoints.left = puzzleBreak
            }
        }
    }

    return nearbyBreakPoints
}

function getNearbyLineRemovals(point){
    let nearbyLineRemovals = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    for (let i = 0; i < _puzzleData.puzzleLineRemovals.length; i++){
        const lineRemoval = _puzzleData.puzzleLineRemovals[i]
        const position = lineRemoval.position

        if (Math.abs(position[0] - point[0]) < 2){
            if (position[1] > point[1] && position[1] < point[1] + _puzzleData.pointDistance){
                nearbyLineRemovals.bottom = lineRemoval
            }
            else if (position[1] < point[1] && position[1] > point[1] - _puzzleData.pointDistance){
                nearbyLineRemovals.top = lineRemoval
            }
        }
        else if (Math.abs(position[1] - point[1]) < 2){
            if (position[0] > point[0] && position[0] < point[0] + _puzzleData.pointDistance) {
                nearbyLineRemovals.right = lineRemoval
            }
            else if (position[0] < point[0] && position[0] > point[0] - _puzzleData.pointDistance) {
                nearbyLineRemovals.left = lineRemoval
            }
        }
    }

    return nearbyLineRemovals
}

function touchStart(event){
    const touch = event.touches[0]

    lastTouch = [touch.clientX, touch.clientY]
}

function handleTouch(event){
    event.preventDefault()

    const touch = event.touches[0]

    if (!lastTouch) lastTouch = [touch.clientX, touch.clientY]

    const delta = [touch.clientX - lastTouch[0], touch.clientY - lastTouch[1]]

    lastTouch = [touch.clientX, touch.clientY]

    handleDrawingBoth(touch.clientX, touch.clientY, delta[0] * 2, delta[1] * 2)
}

function handleDrawing(event){
    handleDrawingBoth(event.clientX, event.clientY, event.movementX / 2, event.movementY / 2)
}

function handleDrawingBoth(clientX, clientY, movementX, movementY){
    if (!solving) return

    if (!prevMousePosition) prevMousePosition = [clientX, clientY]

    if (isSymmetry){
        symmetryLinePoints = getSymmetryLinePoints()
        drawLinePivotSymmetry = convertPositionToGrid(drawLinePivot)
        drawLinePivotSymmetry = convertPositionToSymmetry(drawLinePivotSymmetry)
        drawLinePivotSymmetry = convertGridToPosition(drawLinePivotSymmetry)
    }

    const mousePosition = [prevMousePosition[0] + movementX, prevMousePosition[1] + movementY]

    let diffX = mousePosition[0] - prevMousePosition[0]
    let diffY = mousePosition[1] - prevMousePosition[1]

    drawLineMove = [drawLineMove[0] + diffX, drawLineMove[1] + diffY]

    let direction = 1
    let margin = 2

    if (!isSymmetry){
        closeLineRemovals = {
            top: null,
            bottom: null,
            left: null,
            right: null
        }
    }

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

    if (mainAxis === "x"){
        drawLine.style.top = `${drawLinePivot[1]}px`
        drawLine.style.height = `${_puzzleData.pointSize}px`
        drawLineCircle.style.top = `${drawLinePivot[1]}px`

        if (drawLineMove[0] < 0 && drawLinePivot[0] > _puzzleData.pointSize * 2 && !closeLineRemovals.left && !closeLineRemovalsSymmetry.left){
            if (closeBreakPoints.left && drawLineMove[0] < -_puzzleData.pointSize / 2 || closeBreakPointsSymmetry.left && drawLineMove[0] < -_puzzleData.pointSize / 2){
                drawLineMove[0] = -_puzzleData.pointSize / 2
            }

            if (isSymmetry && isLeftBlock() && drawLineMove[0] < -_puzzleData.pointDistance + _puzzleData.pointSize / 2){
                drawLineMove[0] = -_puzzleData.pointDistance + _puzzleData.pointSize / 2
            }

            drawLine.style.width = `${Math.abs(drawLineMove[0])}px`
            drawLine.style.left = `${drawLinePivot[0] + _puzzleData.pointSize / 2 - Math.abs(drawLineMove[0])}px`
            drawLineCircle.style.left = `${drawLinePivot[0] - Math.abs(drawLineMove[0])}px`
            direction = -1

            disableEnd()
        }
        else if (drawLineMove[0] < 0){
            drawLineMove = [drawLineMove[0] - diffX, drawLineMove[1]]
            drawLine.style.width = "0px"
            drawLineCircle.style.left = `${drawLinePivot[0]}px`

            let endPoint = getEndPoint(drawLinePivot, "left")
            if (endPoint){
                disableEnd()
                enableEnd(endPoint)
            }
        }
        
        if (drawLineMove[0] > 0 && drawLinePivot[0] < _puzzleData.pointSize + (_puzzleData.pointSize * 3) * (_puzzleData.grid[0] - 1) - 1 && !closeLineRemovals.right && !closeLineRemovalsSymmetry.right){
            if (closeBreakPoints.right && drawLineMove[0] > _puzzleData.pointSize / 2 || closeBreakPointsSymmetry.right && drawLineMove[0] > _puzzleData.pointSize / 2){
                drawLineMove[0] = _puzzleData.pointSize / 2
            }

            if (isSymmetry && isRightBlock() && drawLineMove[0] > _puzzleData.pointDistance - _puzzleData.pointSize / 2){
                drawLineMove[0] = _puzzleData.pointDistance - _puzzleData.pointSize / 2
            }

            drawLine.style.width = `${drawLineMove[0]}px`
            drawLine.style.left = `${drawLinePivot[0] + _puzzleData.pointSize / 2}px`
            drawLineCircle.style.left = `${drawLinePivot[0] + Math.abs(drawLineMove[0])}px`

            disableEnd()
        }
        else if (drawLineMove[0] > 0){
            drawLineMove = [drawLineMove[0] - diffX, drawLineMove[1]]
            drawLine.style.width = "0px"
            drawLineCircle.style.left = `${drawLinePivot[0]}px`

            let endPoint = getEndPoint(drawLinePivot, "right")
            if (endPoint){
                disableEnd()
                enableEnd(endPoint)
            }
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

        if (drawLineMove[1] < 0 && drawLinePivot[1] > _puzzleData.pointSize * 2 && !closeLineRemovals.top && !closeLineRemovalsSymmetry.top){
            if (closeBreakPoints.top && drawLineMove[1] < -_puzzleData.pointSize / 2 || closeBreakPointsSymmetry.top && drawLineMove[1] < -_puzzleData.pointSize / 2){
                drawLineMove[1] = -_puzzleData.pointSize / 2
            }

            if (isSymmetry && isTopBlock() && drawLineMove[1] < -_puzzleData.pointDistance + _puzzleData.pointSize / 2){
                drawLineMove[1] = -_puzzleData.pointDistance + _puzzleData.pointSize / 2
            }

            drawLine.style.height = `${Math.abs(drawLineMove[1])}px`
            drawLine.style.top = `${drawLinePivot[1] + _puzzleData.pointSize / 2 - Math.abs(drawLineMove[1])}px`
            drawLineCircle.style.top = `${drawLinePivot[1] - Math.abs(drawLineMove[1])}px`
            direction = -1

            disableEnd()
        }
        else if (drawLineMove[1] < 0){
            drawLineMove = [drawLineMove[0], drawLineMove[1] - diffY]
            drawLine.style.height = "0px"
            drawLineCircle.style.top = `${drawLinePivot[1]}px`

            let endPoint = getEndPoint(drawLinePivot, "up")
            if (endPoint){
                disableEnd()
                enableEnd(endPoint)
            }
        }
        
        if (drawLineMove[1] > 0 && drawLinePivot[1] < _puzzleData.pointSize + (_puzzleData.pointSize * 3) * (_puzzleData.grid[1] - 1) && !closeLineRemovals.bottom && !closeLineRemovalsSymmetry.bottom){
            if (closeBreakPoints.bottom && drawLineMove[1] > _puzzleData.pointSize / 2 || closeBreakPointsSymmetry.bottom && drawLineMove[1] > _puzzleData.pointSize / 2){
                drawLineMove[1] = _puzzleData.pointSize / 2
            }

            if (isSymmetry && isBottomBlock() && drawLineMove[1] > _puzzleData.pointDistance - _puzzleData.pointSize / 2){
                drawLineMove[1] = _puzzleData.pointDistance - _puzzleData.pointSize / 2
            }

            drawLine.style.height = `${drawLineMove[1]}px`
            drawLine.style.top = `${drawLinePivot[1] + _puzzleData.pointSize / 2}px`
            drawLineCircle.style.top = `${drawLinePivot[1] + Math.abs(drawLineMove[1])}px`

            disableEnd()
        }
        else if (drawLineMove[1] > 0){
            drawLineMove = [drawLineMove[0], drawLineMove[1] - diffY]
            drawLine.style.height = "0px"
            drawLineCircle.style.top = `${drawLinePivot[1]}px`

            let endPoint = getEndPoint(drawLinePivot, "down")
            if (endPoint){
                disableEnd()
                enableEnd(endPoint)
            }
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

    if (isSymmetry){
        createDuplicatedLineSymmetry()
    }
}

function removePrevDuplicatedSymmetryLine(){
    while (_puzzleData.symmetryHelper.children.length > 0){
        _puzzleData.symmetryHelper.firstChild.remove()
    }
}

function createDuplicatedLineSymmetry(){
    removePrevDuplicatedSymmetryLine()

    for (let i = 0; i < _puzzleData.element.children.length; i++){
        const child = _puzzleData.element.children[i]

        if (child.style.backgroundColor === _puzzleData.colors[2] || child.style.backgroundColor === _puzzleData.colors[3] ||
            child.style.backgroundColor === _puzzleData.colors[4]
        ){
            const clone =  child.cloneNode()

            _puzzleData.symmetryHelper.append(clone)
        }
    }

    if (_puzzleData.symmetry === "vertical"){
        _puzzleData.symmetryHelper.style.transform = "scaleX(-1)"
    }
    else if (_puzzleData.symmetry === "horizontal"){
        _puzzleData.symmetryHelper.style.transform = "scaleY(-1)"
    }
    else{
        _puzzleData.symmetryHelper.style.transform = "scaleX(-1) scaleY(-1)"
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

function convertPositionsToGrid(pointPositions){
    let gridPositions = []

    pointPositions.forEach(pointPosition => {
        for (let i = 0; i < _puzzleData.puzzlePoints.length; i++){
            const puzzlePoint = _puzzleData.puzzlePoints[i]
            const position = puzzlePoint.position

            if (Math.abs(position[0] - pointPosition[0]) < 2 && Math.abs(position[1] - pointPosition[1]) < 2){
                const gridPosition = puzzlePoint.gridPosition

                gridPositions.push(gridPosition)

                break
            }
        }
    })

    return gridPositions
}

function convertPositionToGrid(point){
    for (let i = 0; i < _puzzleData.puzzlePoints.length; i++) {
        const puzzlePoint = _puzzleData.puzzlePoints[i]
        const position = puzzlePoint.position

        if (Math.abs(position[0] - point[0]) < 2 && Math.abs(position[1] - point[1]) < 2) {
            const gridPosition = puzzlePoint.gridPosition

            return gridPosition
        }
    }

    return null
}

function documentClick(){
    if (solving && !startClickDebounce){
        solving = false

        document.body.style.cursor = "default"

        let correctSolution = false
        correct = false

        if (selectedEnd && _solutionFunction){
            let pointAxises = Array.from(pointPrevAxises)

            pointAxises.push(selectedEnd.puzzlePoint.position)

            let gridPointAxises = convertPositionsToGrid(pointAxises)
            let gridPointAxisesSymmetry = null

            if (isSymmetry){
                symmetryLinePoints = getSymmetryLinePoints()

                gridPointAxisesSymmetry = convertPositionsToGrid(symmetryLinePoints)

                let symmetryEndPosition = convertPositionToSymmetry(selectedEnd.puzzlePoint.gridPosition)

                gridPointAxisesSymmetry.push(symmetryEndPosition)
                gridPointAxisesSymmetry.push(usedStartSymmetry.gridPosition)
            }

            correctSolution = _solutionFunction(selectedEnd, pointAxises, gridPointAxises, usedStart, _puzzleData, gridPointAxisesSymmetry)
            correct = correctSolution

            drawLineCircle.style.display = "none"

            if (correct){
                drawElements.forEach(drawElement => {
                    drawElement.element.style.backgroundColor = _puzzleData.colors[3]
                })

                drawElementsPoints.forEach(drawElementsPoint => {
                    drawElementsPoint.element.style.backgroundColor = _puzzleData.colors[3]
                })

                usedStart.puzzlePoint.puzzlePoint.style.backgroundColor = _puzzleData.colors[3]
                selectedEnd.endPoint.style.backgroundColor = _puzzleData.colors[3]
                selectedEnd.endLine.style.backgroundColor = _puzzleData.colors[3]

                if (isSymmetry){
                    usedStartSymmetry.puzzlePoint.puzzlePoint.style.backgroundColor = _puzzleData.colors[3]
                }
            }
            else {
                drawElements.forEach(drawElement => {
                    drawElement.element.style.backgroundColor = _puzzleData.colors[4]
                })

                drawElementsPoints.forEach(drawElementsPoint => {
                    drawElementsPoint.element.style.backgroundColor = _puzzleData.colors[4]
                })

                usedStart.puzzlePoint.puzzlePoint.style.backgroundColor = _puzzleData.colors[4]
                selectedEnd.endPoint.style.backgroundColor = _puzzleData.colors[4]
                selectedEnd.endLine.style.backgroundColor = _puzzleData.colors[4]

                if (isSymmetry){
                    usedStartSymmetry.puzzlePoint.puzzlePoint.style.backgroundColor = _puzzleData.colors[4]
                }
            }
        }

        createDuplicatedLineSymmetry()

        document.exitPointerLock()

        if (correctSolution) return

        removePrevDuplicatedSymmetryLine()
        changeElementsColorToDefault()

        if (drawLine){
            drawLine.remove()
        }

        endDrawing()
    }
}

export function handlePuzzle(puzzleData, solutionFunction){
    if (_puzzleData){
        removeEvents()
    }

    _puzzleData = puzzleData
    _solutionFunction = solutionFunction

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
    document.addEventListener("touchmove", handleTouch, { passive: false })
    _events.push({
        element: document,
        handler: handleTouch,
        type: "touchmove"
    })
    document.addEventListener("touchstart", touchStart)
    _events.push({
        element: document,
        handler: touchStart,
        type: "touchstart"
    })
}