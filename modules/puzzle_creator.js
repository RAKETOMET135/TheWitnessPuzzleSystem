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
                direction: "horizontal"
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
                direction: "vertical"
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

function createColors(puzzle, size, colors, colorsData){
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

export function createPuzzle(size, grid, starts, ends, colors, rules){
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

    let _rules = []

    if (rules.hexagons){
        const hexagonData = createHexagons(puzzle, puzzlePoints, pointSize, colors, rules.hexagons)
        _rules.push({
            data: hexagonData,
            type: "hexagons"
        })
    }

    if (rules.colors){
        const colorsData = createColors(puzzle, pointSize, colors, rules.colors)
        _rules.push({
            data: colorsData,
            type: "colors"
        })
    }

    return {
        element: puzzle,
        puzzlePoints: puzzlePoints,
        puzzleLines: puzzleLines,
        puzzleStarts: puzzleStarts,
        puzzleEnds: puzzleEnds,
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