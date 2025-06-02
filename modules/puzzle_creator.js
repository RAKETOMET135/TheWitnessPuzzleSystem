import { Block } from "../structure/block.js"

function createPuzzlePoints(puzzle, size, grid, colors){
    let puzzlePoints = []

    for (let x = 0; x < grid[0]; x++){
        for (let y = 0; y < grid[1]; y++){
            const leftPosition = size + (size * 3) * x
            const topPosition = size + (size * 3) * y

            const puzzlePoint = document.createElement("div")
            puzzlePoint.classList.add("puzzle-point")
            puzzlePoint.style.width = `${size}px`
            puzzlePoint.style.height = `${size}px`
            puzzlePoint.style.left = `${leftPosition}px`
            puzzlePoint.style.top = `${topPosition}px`
            puzzlePoint.style.backgroundColor = colors[1]

            puzzle.append(puzzlePoint)
            puzzlePoints.push({
                puzzlePoint: puzzlePoint,
                position: [leftPosition, topPosition],
                gridPosition: [x, y]
            })
        }
    }

    return puzzlePoints
}

function createPuzzleLines(puzzle, puzzlePoints, size, grid, colors){
    let puzzleLines = []

    puzzlePoints.forEach(puzzlePoint => {
        const element = puzzlePoint.puzzlePoint
        const position = puzzlePoint.position
        const gridPosition = puzzlePoint.gridPosition

        if (gridPosition[0] < grid[0] - 1){
            const leftPosition = position[0] + size/2
            const topPosition = position[1]

            const horizontalLine = document.createElement("div")
            horizontalLine.classList.add("puzzle-line")
            horizontalLine.style.width = `${size * 3}px`
            horizontalLine.style.height = `${size}px`
            horizontalLine.style.left = `${leftPosition}px`
            horizontalLine.style.top = `${topPosition}px`
            horizontalLine.style.backgroundColor = colors[1]

            puzzle.append(horizontalLine)
            puzzleLines.push({
                puzzleLine: horizontalLine,
                position: [leftPosition, topPosition],
                gridPosition: gridPosition,
                direction: "horizontal",
                removed: false
            })
        }

        if (gridPosition[1] < grid[1] - 1){
            const leftPosition = position[0]
            const topPosition = position[1] + size/2

            const verticalLine = document.createElement("div")
            verticalLine.classList.add("puzzle-line")
            verticalLine.style.width = `${size}px`
            verticalLine.style.height = `${size * 3}px`
            verticalLine.style.left = `${leftPosition}px`
            verticalLine.style.top = `${topPosition}px`
            verticalLine.style.backgroundColor = colors[1]

            puzzle.append(verticalLine)
            puzzleLines.push({
                puzzleLine: verticalLine,
                position: [leftPosition, topPosition],
                gridPosition: gridPosition,
                direction: "vertical",
                removed: false
            })
        }
    })


    return puzzleLines
}

function createPuzzleStarts(puzzle, puzzlePoints, starts, size, pointSize, colors){
    let puzzleStarts = []

    let diff = size - pointSize

    for (let i = 0; i < puzzlePoints.length; i++){
        const puzzlePoint = puzzlePoints[i]
        const element = puzzlePoint.puzzlePoint
        const position = puzzlePoint.position
        const gridPosition = puzzlePoint.gridPosition

        for (let j = 0; j < starts.length; j++){
            const start = starts[j]

            if (start[0] !== gridPosition[0] || start[1] !== gridPosition[1]) continue

            const leftPosition = position[0] - diff / 2
            const topPosition = position[1] - diff / 2

            element.style.width = `${size}px`
            element.style.height = `${size}px`
            element.style.left = `${leftPosition}px`
            element.style.top = `${topPosition}px`
            element.style.zIndex = "10"

            puzzleStarts.push({
                puzzlePoint: puzzlePoint,
                gridPosition: gridPosition,
                defaultColor: colors[1],
                selectColor: colors[2]         
            })
        }
    }

    return puzzleStarts
}

function createPuzzleEnds(puzzle, puzzlePoints, ends, size, endLength, colors){
    let puzzleEnds = []

    for (let i = 0; i < puzzlePoints.length; i++){
        const puzzlePoint = puzzlePoints[i]
        const position = puzzlePoint.position
        const gridPosition = puzzlePoint.gridPosition

        for (let j = 0; j < ends.length; j++){
            const end = ends[j]

            if (gridPosition[0] !== end[0] || gridPosition[1] !== end[1]) continue

            let pointLeftPosition
            let pointTopPosition

            let lineLeftPosition
            let lineTopPosition
            let lineWidth
            let lineHeight

            const endPoint = document.createElement("div")
            endPoint.classList.add("puzzle-point")
            endPoint.style.width = `${size}px`
            endPoint.style.height = `${size}px`
            endPoint.style.backgroundColor = colors[1]
            
            const line = document.createElement("div")
            line.classList.add("puzzle-line")
            line.style.backgroundColor = colors[1]

            switch (end[2]){
                case "up":
                    pointLeftPosition = position[0]
                    pointTopPosition = position[1] - endLength

                    lineLeftPosition = position[0]
                    lineTopPosition = position[1] + endLength / 2 - size / 2
                    lineWidth = size
                    lineHeight = endLength

                    break
                case "down":
                    pointLeftPosition = position[0]
                    pointTopPosition = position[1] + endLength

                    lineLeftPosition = position[0]
                    lineTopPosition = position[1] + endLength - size / 4
                    lineWidth = size
                    lineHeight = endLength

                    break
                case "right":
                    pointLeftPosition = position[0] + endLength
                    pointTopPosition = position[1]

                    lineLeftPosition = position[0] + endLength - size / 4
                    lineTopPosition = position[1]
                    lineWidth = endLength
                    lineHeight = size

                    break
                case "up-right":
                    pointLeftPosition = position[0] + endLength - size / 32
                    pointTopPosition = position[1] - endLength - size / 32

                    lineLeftPosition = position[0] + endLength - size / 4
                    lineTopPosition = position[1] - endLength + size / 2.6
                    lineWidth = endLength
                    lineHeight = size
                    line.style.rotate = "-48.5deg"
                    line.style.transform = "scaleX(1.7)"

                    break
                case "down-right":
                    pointLeftPosition = position[0] + endLength - size / 32
                    pointTopPosition = position[1] + endLength - size / 32

                    lineLeftPosition = position[0] + endLength - size / 2.3
                    lineTopPosition = position[1] + endLength - size / 3.5
                    lineWidth = size
                    lineHeight = endLength

                    line.style.rotate = "-44.5deg"
                    line.style.transform = "scaleY(1.55)"

                    break
                case "up-left":
                    pointLeftPosition = position[0] - endLength - size / 32
                    pointTopPosition = position[1] - endLength - size / 32

                    lineLeftPosition = position[0] + endLength / 2 - size / 1.5
                    lineTopPosition = position[1] + endLength / 2 - size / 2
                    lineWidth = size
                    lineHeight = endLength

                    line.style.rotate = "-44.5deg"
                    line.style.transform = "scaleY(1.55)"

                    break
                case "down-left":
                    pointLeftPosition = position[0] - endLength - size / 32
                    pointTopPosition = position[1] + endLength + size / 32

                    lineLeftPosition = position[0] - endLength + size / 3.5
                    lineTopPosition = position[1] + endLength - size / 8.45
                    lineWidth = size
                    lineHeight = endLength

                    line.style.rotate = "-44.5deg"
                    line.style.transform = "scaleY(1.5)"

                    break
                default:
                    pointLeftPosition = position[0] - endLength
                    pointTopPosition = position[1]

                    lineLeftPosition = position[0] - endLength + size / 2
                    lineTopPosition = position[1]
                    lineWidth = endLength
                    lineHeight = size
            }

            endPoint.style.left = `${pointLeftPosition}px`
            endPoint.style.top = `${pointTopPosition}px`
            puzzle.append(endPoint)

            line.style.left = `${lineLeftPosition}px`
            line.style.top = `${lineTopPosition}px`
            line.style.width = `${lineWidth}px`
            line.style.height = `${lineHeight}px`
            puzzle.append(line)

            puzzleEnds.push({
                puzzlePoint: puzzlePoint,
                endPoint: endPoint,
                endLine: line,
                end: end,
                defaultColor: colors[1],
                selectColor: colors[2]
            })
        }
    }

    return puzzleEnds
}

function createPuzzleBreaks(puzzle, size, breaks, colors){
    let puzzleBreaks = []

    for (let i = 0; i < breaks.length; i++){
        const puzzleBreak = breaks[i]

        const puzzleBreakElement = document.createElement("div")

        let xAdjust = 0
        let xAdjustGrid = 0
        let yAdjust = 0
        let yAdjustGrid = 0

        if (puzzleBreak[2] === "right"){
            xAdjust = size * 1.5
            puzzleBreakElement.style.transform = "scaleY(1.1)"
        }
        else if (puzzleBreak[2] === "down"){
            yAdjust = size * 1.5
            puzzleBreakElement.style.transform = "scaleX(1.1)"
        }

        const leftPosition = size + (size * 3) * puzzleBreak[0] + xAdjust
        const topPosition = size + (size * 3) * puzzleBreak[1] + yAdjust

        puzzleBreakElement.classList.add("puzzle-break")
        puzzleBreakElement.style.width = `${size}px`
        puzzleBreakElement.style.height = `${size}px`
        puzzleBreakElement.style.left = `${leftPosition}px`
        puzzleBreakElement.style.top = `${topPosition}px`
        puzzleBreakElement.style.backgroundColor = colors[0]
        puzzle.append(puzzleBreakElement)
        
        puzzleBreaks.push({
            element: puzzleBreakElement,
            position: [leftPosition, topPosition],
            gridPosition: [puzzleBreak[0], puzzleBreak[1]],
            direction: puzzleBreak[2],
            adjustedGridPosition: [puzzleBreak[0] + xAdjustGrid, puzzleBreak[1] + yAdjustGrid]
        })
    }

    return puzzleBreaks
}

function createPuzzleLineRemovals(puzzle, size, lineRemovals, colors, puzzleLines){
    let puzzleLineRemovals = []

    for (let i = 0; i < lineRemovals.length; i++){
        const lineRemoval = lineRemovals[i]

        for (let j = 0; j < puzzleLines.length; j++){
            const puzzleLine = puzzleLines[j]
            const gridPosition = puzzleLine.gridPosition

            if (gridPosition[0] !== lineRemoval[0] || gridPosition[1] !== lineRemoval[1]) continue

            if (puzzleLine.direction === "horizontal" && lineRemoval[2] === "right"){
                puzzleLine.puzzleLine.classList.add("puzzle-break")
                puzzleLine.puzzleLine.style.zIndex = "-1"
                puzzleLine.puzzleLine.style.backgroundColor = colors[0]
                puzzleLine.removed = true

                puzzleLineRemovals.push({
                    puzzleLine: puzzleLine,
                    position: puzzleLine.position,
                    gridPosition: [lineRemoval[0], lineRemoval[1]],
                    direction: gridPosition[2]
                })
            }
            else if (puzzleLine.direction === "vertical" && lineRemoval[2] === "down"){
                puzzleLine.puzzleLine.classList.add("puzzle-break")
                puzzleLine.puzzleLine.style.zIndex = "-1"
                puzzleLine.puzzleLine.style.backgroundColor = colors[0]
                puzzleLine.removed = true

                puzzleLineRemovals.push({
                    puzzleLine: puzzleLine,
                    position: puzzleLine.position,
                    gridPosition: [lineRemoval[0], lineRemoval[1]],
                    direction: gridPosition[2]
                })
            }
        }
    }

    return puzzleLineRemovals
}

function getNearbyLines(puzzlePoint, puzzleLines){
    let nearbyPuzzleLines = []

    const gridPosition = puzzlePoint.gridPosition

    for (let i = 0; i < puzzleLines.length; i++){
        const puzzleLine = puzzleLines[i]
        const lineGridPosition = puzzleLine.gridPosition

        if (lineGridPosition[0] === gridPosition[0] && lineGridPosition[1] === gridPosition[1]){
            if (!puzzleLine.removed){
                nearbyPuzzleLines.push(puzzleLine)
            }
        }
        else if (lineGridPosition[0] + 1 === gridPosition[0] && lineGridPosition[1] === gridPosition[1]){
            if (!puzzleLine.removed && puzzleLine.direction === "horizontal"){
                nearbyPuzzleLines.push(puzzleLine)
            }
        }
        else if (lineGridPosition[0] === gridPosition[0] && lineGridPosition[1] + 1 === gridPosition[1]){
            if (!puzzleLine.removed && puzzleLine.direction === "vertical"){
                nearbyPuzzleLines.push(puzzleLine)
            }
        }
    }

    return nearbyPuzzleLines
}

function fixSingleLinePoints(puzzleLines, puzzlePoints, colors, puzzleEnds){
    for (let i = 0; i < puzzlePoints.length; i++){
        const puzzlePoint = puzzlePoints[i]

        let nearbyPuzzleLines = getNearbyLines(puzzlePoint, puzzleLines)

        if (nearbyPuzzleLines.length === 1){
            let hasEnd = false

            for (let j = 0; j < puzzleEnds.length; j++){
                const puzzleEnd = puzzleEnds[j]

                if (puzzleEnd.puzzlePoint.gridPosition[0] !== puzzlePoint.gridPosition[0] || puzzleEnd.puzzlePoint.gridPosition[1] !== puzzlePoint.gridPosition[1]) continue

                hasEnd = true

                break
            }

            if (!hasEnd){
                puzzlePoint.puzzlePoint.style.borderRadius = "0"
            }
        }   
        else if (nearbyPuzzleLines.length === 0){
            puzzlePoint.puzzlePoint.style.backgroundColor = colors[0]
            puzzlePoint.puzzlePoint.classList.add("puzzle-break")
        }
    }
}

function createHexagons(puzzle, puzzlePoints, size, colors, hexagons){
    let hexagonData = []

    hexagons.forEach(hexagon => {
        const leftPosition = size + (size * 3) * hexagon[0]
        const topPosition = size + (size * 3) * hexagon[1]

        const hexagonElement = document.createElement("div")
        hexagonElement.classList.add("hexagon")
        hexagonElement.classList.add("puzzle-rule")
        hexagonElement.style.width = `${size - size / 8}px`
        hexagonElement.style.height = `${size}px`
        hexagonElement.style.left = `${leftPosition + size / 16}px`
        hexagonElement.style.top = `${topPosition}px`
        hexagonElement.style.backgroundColor = colors[5]
        hexagonElement.style.rotate = "90deg"
        hexagonElement.style.scale = "0.9"

        puzzle.append(hexagonElement)
        hexagonData.push({
            hexagon: hexagon,
            element: hexagonElement,
            position: [leftPosition, topPosition]
        })
    })

    return hexagonData
}

function createTile(puzzle, size, gridPosition){
    const tile = document.createElement("div")
    tile.classList.add("puzzle-rule")
    tile.style.width = `${size * 2}px`
    tile.style.height = `${size * 2}px`
    tile.style.left = `${size * 2 + (size * 3) * gridPosition[0]}px`
    tile.style.top = `${size * 2 + (size * 3) * gridPosition[1]}px`
    puzzle.append(tile)
    return tile
}

function createColors(puzzle, size, colorsData){
    let colorData = []

    for (let i = 0; i < colorsData.length; i++){
        const color = colorsData[i]

        const tile = createTile(puzzle, size, [color[0], color[1]])
        const colorElement = document.createElement("div")
        colorElement.classList.add("color")
        colorElement.style.backgroundColor = color[2]
        colorElement.style.width = `${size * 1.2}px`
        colorElement.style.height = `${size * 1.2}px`
        tile.append(colorElement)

        colorData.push({
            tile: tile,
            gridPosition: [color[0], color[1]],
            color: color[2],
            element: colorElement,
            colorSensitive: true
        })
    }

    return colorData
}

function createStars(puzzle, size, stars){
    let starData = []

    for (let i = 0; i < stars.length; i++){
        const star = stars[i]

        const tile = createTile(puzzle, size, [star[0], star[1]])
        const starElement1 = document.createElement("div")
        starElement1.classList.add("star-1")
        starElement1.style.backgroundColor = star[2]
        starElement1.style.width = `${size * 1}px`
        starElement1.style.height = `${size * 1}px`
        tile.append(starElement1)
        const starElement2 = document.createElement("div")
        starElement2.classList.add("star-2")
        starElement2.style.backgroundColor = star[2]
        starElement2.style.width = `${size * 1}px`
        starElement2.style.height = `${size * 1}px`
        tile.append(starElement2)

        starData.push({
            tile: tile,
            gridPosition: [star[0], star[1]],
            starColor: star[2],
            element: starElement1,
            element2: starElement2,
            star: true
        })
    }

    return starData
}

function createTriangles(puzzle, size, triangles, colors){
    let trianglesData = []

    for (let i = 0; i < triangles.length; i++){
        const triangle = triangles[i]
        let triangleElements = []

        const tile = createTile(puzzle, size, [triangle[0], triangle[1]])
        const triangleElement = document.createElement("div")
        triangleElement.classList.add("triangle")
        triangleElement.classList.add("puzzle-rule")
        triangleElement.style.backgroundColor = colors[6]
        triangleElement.style.width = `${size / 2}px`
        triangleElement.style.height = `${size / 2}px`
        triangleElement.classList.add("triangle-center")

        if (triangle[2] === 2){
            triangleElement.style.transform = "translate(-60%, 0)"

            const triangleElement2 = triangleElement.cloneNode()
            triangleElement2.style.transform = "translate(60%, 0)"
            tile.append(triangleElement2)
            triangleElements.push(triangleElement2)
        }
        else if (triangle[2] === 3){
            const triangleElement2 = triangleElement.cloneNode()
            triangleElement2.style.transform = "translate(120%, 0)"
            tile.append(triangleElement2)
            triangleElements.push(triangleElement2)

            const triangleElement3 = triangleElement.cloneNode()
            triangleElement3.style.transform = "translate(-120%, 0)"
            tile.append(triangleElement3)
            triangleElements.push(triangleElement3)
        }

        tile.append(triangleElement)
        triangleElements.push(triangleElement)

        trianglesData.push({
            tile: tile,
            gridPosition: [triangle[0], triangle[1]],
            triangleElements: triangleElements,
            triangle: true,
            triangleCount: triangle[2]
        })
    }

    return trianglesData
}

function createBlocks(puzzle, size, blocks, colors){
    let blocksData = []

    let partSize = size / 2.5

    function resizePart(partElement){
        const miniElement = document.createElement("div")
        miniElement.classList.add("puzzle-rule")
        miniElement.style.backgroundColor = colors[7]
        miniElement.style.width = `${partSize / 1.4}px`
        miniElement.style.height = `${partSize / 1.4}px`
        partElement.append(miniElement)
    }

    for (let i = 0; i < blocks.length; i++){
        const block = blocks[i]
        let blockElements = []

        const tile = createTile(puzzle, size, [block[0], block[1]])
        
        let parts = block[2].getBlock(0)
        let minX = 99999999
        let maxX = -99999999
        let minY = 99999999
        let maxY = -99999999

        parts.forEach(part => {
            if (part[0] < minX) minX = part[0]
            if (part[0] > maxX) maxX = part[0]
            if (part[1] < minY) minY = part[1]
            if (part[1] > maxY) maxY = part[1]
        })

        let xN = Math.abs(minX - maxX)
        let yN = Math.abs(minY - maxY)
        let leftMargin = ((size * 2) - (xN * (partSize))) / 2 - ((partSize) / 2)
        let topMargin = ((size * 2) - (yN * (partSize))) / 2 - ((partSize) / 2)

        parts.forEach(part => {
            let leftPosition = leftMargin + (partSize) * (part[0] - minX)
            let topPosition = 0 - (partSize) * (part[1] - minY) + (partSize * maxY) + topMargin

            const partElement = document.createElement("div")
            partElement.classList.add("puzzle-rule")
            partElement.style.width = `${partSize}px`
            partElement.style.height = `${partSize}px`
            partElement.style.left = `${leftPosition}px`
            partElement.style.top = `${topPosition}px`
            //partElement.style.backgroundColor = "rgb(0, 0, 0)"
            partElement.style.display = "flex"
            partElement.style.alignItems = "center"
            partElement.style.justifyContent = "center"
            partElement.style.boxSizing = "border-box"
            partElement.style.margin = "0"
            partElement.style.padding = "0"
            resizePart(partElement)
            tile.append(partElement)
        })
    }

    return blocksData
}

export function createPuzzle(size, grid, starts, ends, colors, breaks, lineRemovals, rules){
    const puzzle = document.createElement("div")
    puzzle.classList.add("puzzle-holder")
    puzzle.style.width = `${size[0]}px`
    puzzle.style.height = `${size[1]}px`
    puzzle.style.backgroundColor = colors[0]

    let pointSize = size[0] / (grid[0] * 3)
    if (pointSize > size[1] / (grid[1] * 3)) pointSize = size[1] / (grid[1] * 3)

    let startSize = pointSize * 1.75
    let endLength = pointSize / 1.5

    const puzzlePoints = createPuzzlePoints(puzzle, pointSize, grid, colors)
    const puzzleLines = createPuzzleLines(puzzle, puzzlePoints, pointSize, grid, colors)
    const puzzleStarts = createPuzzleStarts(puzzle, puzzlePoints, starts, startSize, pointSize, colors)
    const puzzleEnds = createPuzzleEnds(puzzle, puzzlePoints, ends, pointSize, endLength, colors)
    const puzzleBreaks = createPuzzleBreaks(puzzle, pointSize, breaks, colors)
    const puzzleLineRemovals = createPuzzleLineRemovals(puzzle, pointSize, lineRemovals, colors, puzzleLines)

    fixSingleLinePoints(puzzleLines, puzzlePoints, colors, puzzleEnds)

    let _rules = []

    if (rules.hexagons){
        const hexagonData = createHexagons(puzzle, puzzlePoints, pointSize, colors, rules.hexagons)
        _rules.push({
            data: hexagonData,
            type: "hexagons"
        })
    }

    if (rules.colors){
        const colorsData = createColors(puzzle, pointSize, rules.colors)
        _rules.push({
            data: colorsData,
            type: "colors"
        })
    }

    if (rules.stars){
        const starsData = createStars(puzzle, pointSize, rules.stars)
        _rules.push({
            data: starsData,
            type: "stars"
        })
    }

    if (rules.triangles){
        const trianglesData = createTriangles(puzzle, pointSize, rules.triangles, colors)
        _rules.push({
            data: trianglesData,
            type: "triangles"
        })
    }

    if (rules.blocks){
        const blocksData = createBlocks(puzzle, pointSize, rules.blocks, colors)
        _rules.push({
            data: blocksData,
            type: "blocks"
        })
    }

    return {
        element: puzzle,
        puzzlePoints: puzzlePoints,
        puzzleLines: puzzleLines,
        puzzleStarts: puzzleStarts,
        puzzleEnds: puzzleEnds,
        puzzleBreaks: puzzleBreaks,
        puzzleLineRemovals: puzzleLineRemovals,
        size: size,
        grid: grid,
        starts: starts,
        ends: ends,
        colors: colors,
        pointSize: pointSize,
        pointDistance: pointSize * 3,
        rules: _rules
    }
}