import { createPuzzle } from "../modules/puzzle_creator.js"
import { Block } from "../structure/block.js"

let __helperData = null

let __puzzleGrid = [2, 2]
let __puzzleStarts = []
let __puzzleEnds = []
let __lineBreaks = []
let __lineRemovals = []
let __hexagons = []
let __rules = {}

let createdPuzzles = 0

function startExists(gridPosition){
    for (let i = 0; i < __puzzleStarts.length; i++){
        const puzzleStart = __puzzleStarts[i]

        if (puzzleStart[0] !== gridPosition[0] || puzzleStart[1] !== gridPosition[1]) continue

        return i
    }

    return null
}

function endExists(gridPosition){
    for (let i = 0; i < __puzzleEnds.length; i++){
        const puzzleEnd = __puzzleEnds[i]

        if (puzzleEnd[0] !== gridPosition[0] || puzzleEnd[1] !== gridPosition[1]) continue

        return i
    }

    return null
}

function hexagonExists(gridPosition){
    for (let i = 0; i < __hexagons.length; i++){
        const hexagon = __hexagons[i]

        if (hexagon[0] !== gridPosition[0] || hexagon[1] !== gridPosition[1]) continue

        return i
    }

    return null
}

function updateNumber(){
    const numberElement = document.querySelector("#created-puzzles")

    numberElement.innerText = `${createdPuzzles} / 150`
}

function getObject(){
    let c = createdPuzzles - 1
    let locked = true
    if (c < 0){
        c = 0
        locked = false
    }

    let object = {
        levelIndex: createdPuzzles,
        locked: locked,
        key: c,
        gridSize: __puzzleGrid,
        starts: __puzzleStarts,
        ends: __puzzleEnds,
        lineBreaks: __lineBreaks,
        lineRemovals: __lineRemovals,
        hexagons: __hexagons,
        colors: [],
        triangles: [],
        stars: [],
        blocks: [],
        removeBlocks: [],
        eliminationMarks: [],
        symmetry: null,
        symmetryHexagons: [],
        symmetryOpacity: 1
    }

    return object
}

function exportPuzzle(){
    let object = {
        levels: __helperData
    }

    try {
        const blob = new Blob([JSON.stringify(object, null, 4)], { type: "application/json" })
        const downloadURL = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = downloadURL
        a.download = "puzzle_data.json"
        a.click()
        URL.revokeObjectURL(downloadURL)
    }
    catch (err) {
        alert("⚠️ Něco se pokazilo")
    }
}

function constructPuzzle(){
    const puzzleSize = [500, 500]
    const colors = ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)", "rgb(250, 200, 0)",
        "rgb(255, 220, 0)", "rgb(44, 44, 255)"
    ]

    __rules = {
        hexagons: __hexagons
    }

    const createdPuzzle = createPuzzle(puzzleSize, __puzzleGrid, __puzzleStarts, __puzzleEnds, colors, __lineBreaks, __lineRemovals, __rules)

    let rules = createdPuzzle.rules

    for (const rule of rules){
        if (rule.type === "hexagons"){
            for (const hexagon of rule.data){
                hexagon.element.style.zIndex = "25"
                hexagon.element.style.pointerEvents = "none"
            }
        }
    }

    for (const puzzleLine of createdPuzzle.puzzleLines){
        puzzleLine.puzzleLine.addEventListener("mousedown", (event) => {
            if (event.button !== 1) return

            let x = 0
            let y = 0

            if (puzzleLine.direction === "vertical"){
                y = 0.5
            }
            else{
                x = 0.5
            }

            let hexagonIndex = hexagonExists([puzzleLine.gridPosition[0] + x, puzzleLine.gridPosition[1] + y])

            if (!hexagonIndex && hexagonIndex !== 0){
                __hexagons.push([puzzleLine.gridPosition[0] + x, puzzleLine.gridPosition[1] + y])
            }
            else{
                __hexagons.splice(hexagonIndex, 1)
            }

            constructPuzzle()
        })

        puzzleLine.puzzleLine.addEventListener("click", () => {
            let direction = puzzleLine.direction
            if (direction === "vertical"){
                direction = "down"
            }
            else{
                direction = "right"
            }

            let stateChanged = false

            for (let i = 0; i < __lineBreaks.length; i++){
                const lineBreak = __lineBreaks[i]

                if (lineBreak[0] !== puzzleLine.gridPosition[0] || lineBreak[1] !== puzzleLine.gridPosition[1] || lineBreak[2] !== direction) continue

                __lineBreaks.splice(i, 1)
                __lineRemovals.push(lineBreak)

                stateChanged = true

                break
            }

            if (!stateChanged){
                for (let i = 0; i < __lineRemovals.length; i++){
                    const lineRemoval = __lineRemovals[i]

                    if (lineRemoval[0] !== puzzleLine.gridPosition[0] || lineRemoval[1] !== puzzleLine.gridPosition[1] || lineRemoval[2] !== direction) continue

                    __lineRemovals.splice(i, 1)

                    stateChanged = true

                    break
                }
            }

            if (!stateChanged){
                __lineBreaks.push([puzzleLine.gridPosition[0], puzzleLine.gridPosition[1], direction])
            }

            constructPuzzle()
        })
    }

    for (const puzzleBreak of createdPuzzle.puzzleBreaks){
        puzzleBreak.element.addEventListener("click", () => {
            let direction = puzzleBreak.direction

            for (let i = 0; i < __lineBreaks.length; i++){
                const lineBreak = __lineBreaks[i]

                if (lineBreak[0] !== puzzleBreak.gridPosition[0] || lineBreak[1] !== puzzleBreak.gridPosition[1] || lineBreak[2] !== direction) continue

                __lineBreaks.splice(i, 1)
                __lineRemovals.push(lineBreak)

                break
            }

            constructPuzzle()
        })
    }

    for (const puzzleRemoval of createdPuzzle.puzzleLineRemovals){
        puzzleRemoval.puzzleLine.puzzleLine.addEventListener("click", () => {
            let direction = puzzleRemoval.direction

            for (let i = 0; i < __lineRemovals.length; i++) {
                const lineRemoval = __lineRemovals[i]

                if (lineRemoval[0] !== puzzleRemoval.gridPosition[0] || lineRemoval[1] !== puzzleRemoval.gridPosition[1] || lineRemoval[2] !== direction) continue

                __lineRemovals.splice(i, 1)

                break
            }

            constructPuzzle()
        })
    }

    for (const puzzlePoint of createdPuzzle.puzzlePoints){
        puzzlePoint.puzzlePoint.style.zIndex = "20"

        puzzlePoint.puzzlePoint.addEventListener("mousedown", (event) => {
            if (event.button !== 1) return

            let hexagonIndex = hexagonExists(puzzlePoint.gridPosition)

            if (!hexagonIndex && hexagonIndex !== 0){
                __hexagons.push(puzzlePoint.gridPosition)
            }
            else{
                __hexagons.splice(hexagonIndex, 1)
            }

            constructPuzzle()
        })

        puzzlePoint.puzzlePoint.addEventListener("click", () => {
            let startIndex = startExists(puzzlePoint.gridPosition)

            if (!startIndex && startIndex !== 0){
                __puzzleStarts.push(puzzlePoint.gridPosition)
            }
            else{
                __puzzleStarts.splice(startIndex, 1)
            }

            constructPuzzle()
        })

        puzzlePoint.puzzlePoint.addEventListener("contextmenu", (ev) => {
            ev.preventDefault()

            let endIndex = endExists(puzzlePoint.gridPosition)

            if (!endIndex && endIndex !== 0){
                __puzzleEnds.push([puzzlePoint.gridPosition[0], puzzlePoint.gridPosition[1], "up"])
            }   
            else{
                let puzzleEnd = __puzzleEnds[endIndex]
                let nextRotation = "none"

                switch (puzzleEnd[2]){
                    case "up":
                        nextRotation = "down"
                        break
                    case "down":
                        nextRotation = "left"
                        break
                    case "left":
                        nextRotation = "right"
                        break
                    case "right":
                        nextRotation = "up-right"
                        break
                    case "up-right":
                        nextRotation = "down-right"
                        break
                    case "down-right":
                        nextRotation = "up-left"
                        break
                    case "up-left":
                        nextRotation = "down-left"
                        break
                    default:
                        nextRotation = "none"
                }

                if (nextRotation === "none"){
                    __puzzleEnds.splice(endIndex, 1)
                }
                else{
                    puzzleEnd[2] = nextRotation
                }
            }

            constructPuzzle()
        })
    }

    document.body.append(createdPuzzle.element)
}

function setup(){
    let loadedData = window.localStorage.getItem("helper_data")

    if (loadedData){
        loadedData = JSON.parse(loadedData)

        __helperData = loadedData
    }
    else{
        __helperData = []
    }

    createdPuzzles = __helperData.length

    updateNumber()

    constructPuzzle()

    const gridInputX = document.querySelector("#grid-size-x")
    const gridInputY = document.querySelector("#grid-size-y")
    const gridInputApply = document.querySelector("#grid-size-apply")
    
    gridInputApply.addEventListener("click", () => {
        let x
        let y

        try {
            x = parseInt(gridInputX.value)
        }
        catch {
            x = 2
        }

        try {
            y = parseInt(gridInputY.value)
        }
        catch {
            y = 2
        }

        __puzzleGrid = [x, y]

        constructPuzzle()
    })

    const exportData = document.querySelector("#export-data")

    exportData.addEventListener("click", () => {
        exportPuzzle()
    })

    const addData = document.querySelector("#add-data")

    addData.addEventListener("click", () => {
        let object = getObject()

        __helperData.push(object)

        window.localStorage.setItem("helper_data", JSON.stringify(__helperData))

        window.location.href = ""
    })
}

setup()