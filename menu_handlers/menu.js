import { SavingSystem } from "./saving_system.js"
import { createPuzzle } from "../modules/puzzle_creator.js"
import { handlePuzzle } from "../modules/interaction_handler.js"
import { validate_solution } from "../modules/solution_validator.js"
import { Block } from "../structure/block.js"

const levels = [
    {
        levelName: "Intro",
        levelNameColor: "rgb(255, 0, 0)",
        levelDesc: "Introduction puzzles",
        levels: [],
        levelsFileName: "intro.json"
    }
]
let puzzleData = {
    levelsData: []
}
let selectionPageCircles = null
let selectionPages = null
let levelColors = ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)", "rgb(250, 200, 0)",
        "rgb(255, 220, 0)", "rgb(44, 44, 255)"]
let puzzleSize = [500, 500]

const levelsHolder = document.querySelector("#levels-holder")
const levelsHeader = document.querySelector("#levels-header")
const levelSelector = document.querySelector("#level-selector")
const levelSelectorReturn = document.querySelector("#level-selector-return")
const levelSelectorName = document.querySelector("#level-selector-name")
const levelSelectorSections = document.querySelector("#level-selector-sections")
const pagesCount = document.querySelector("#pages-count")
const levelHolder = document.querySelector("#level")

function loadAllLevels(){
    let filesLoaded = 0

    for (const level of levels){
        const levelDataFilePath = `levels/${level.levelsFileName}`

        let http = new XMLHttpRequest()
        http.open("get", levelDataFilePath, true)
        http.send()

        http.onload = function () {
            if (this.readyState === 4 && this.status === 200) {
                const data = JSON.parse(this.responseText)

                level.levels = data.levels

                filesLoaded++

                if (filesLoaded === levels.length){
                    setup()
                }
            }
        }
    }
}

function getLevelPuzzleData(level){
    for (const puzzleLevelData of puzzleData.levelsData){
        if (puzzleLevelData.levelName !== level.levelName) continue

        return puzzleLevelData
    }

    return null
}

function createLevelSelect(level){
    const levelSelect = document.createElement("div")
    levelSelect.classList.add("level-select")
    levelsHolder.append(levelSelect)

    const levelName = document.createElement("h2")
    levelName.innerText = level.levelName
    levelName.style.color = level.levelNameColor
    levelSelect.append(levelName)

    const levelDesc = document.createElement("h3")
    levelDesc.innerText = level.levelDesc
    levelSelect.append(levelDesc)

    const levelData = document.createElement("p")
    levelData.innerText = `${getLevelPuzzleData(level).levelsSolved.length} / ${level.levels.length}`
    levelSelect.append(levelData)

    levelSelect.addEventListener("click", () => {
        openLevelSelector(level)
    })
}

function setLevelSelectorState(state){
    if (state){
        levelSelector.style.visibility = "visible"
        levelsHolder.style.visibility = "hidden"
        levelsHeader.style.visibility = "hidden"
    }
    else{
        levelSelector.style.visibility = "hidden"
        levelsHolder.style.visibility = "visible"
        levelsHeader.style.visibility = "visible"
    }
}

function onLevelSelectionScroll(){
    if (!selectionPageCircles || !selectionPages) return

    const pageComputedStyle = window.getComputedStyle(selectionPages[0].element)
    let pageWidth = parseFloat(pageComputedStyle.width.slice(0, pageComputedStyle.width.length - 2))
    
    let scrollLeft = levelSelectorSections.scrollLeft + pageWidth / 3
    let scrolledPage = 0

    for (let i = 0; i < selectionPages.length; i++){
        let pageLeft = pageWidth * i
        let nextPageLeft = pageWidth * (i + 1)

        if (scrollLeft > pageLeft && scrollLeft < nextPageLeft){
            scrolledPage = i

            break
        }
    }
    
    for (const circle of selectionPageCircles){
        if (circle.pageNumber === scrolledPage){
            circle.element.style.backgroundColor = "rgb(255, 255, 255)"
        }
        else{
            circle.element.style.backgroundColor = "rgb(162, 162, 162)"
        }
    }
}

function loadLevel(level, levelIndex){
    levelHolder.style.visibility = "visible"

    for (const levelData of level.levels){
        if (levelData.levelIndex !== levelIndex) continue

        let puzzleBlocks = []
        let rPuzzleBlocks = []

        for (const block of levelData.blocks){
            let blockData = new Block(block[2][0])

            if (block[2].length > 1) blockData.rotateable = block[2][1]
            if (block[2].length > 2) blockData.optionalColor = block[2][2]

            let finalBlockData = [block[0], block[1], blockData]

            puzzleBlocks.push(finalBlockData)
        }

        for (const rBlock of levelData.removeBlocks){
            let blockData = new Block(rBlock[2][0])

            if (rBlock[2].length > 1) blockData.rotateable = rBlock[2][1]
            if (rBlock[2].length > 2) blockData.optionalColor = rBlock[2][2]

            let finalBlockData = [rBlock[0], rBlock[1], blockData]

            rPuzzleBlocks.push(finalBlockData)
        }

        let levelSettings = [puzzleSize, levelData.gridSize, levelData.starts, levelData.ends, levelColors, levelData.lineBreaks, levelData.lineRemovals,
            {
                hexagons: levelData.hexagons,
                colors: levelData.colors,
                stars: levelData.stars,
                triangles: levelData.triangles,
                blocks: puzzleBlocks,
                removeBlocks: rPuzzleBlocks,
                symmetry: levelData.symmetry,
                symmetryHexagons: levelData.symmetryHexagons,
                eliminationMarks: levelData.eliminationMarks,
                symmetryOpacity: levelData.symmetryOpacity
            }
        ]

        const puzzleData = createPuzzle(levelSettings[0], levelSettings[1], levelSettings[2], levelSettings[3], levelSettings[4], levelSettings[5], levelSettings[6],
            levelSettings[7]
        )

        levelHolder.append(puzzleData.element)

        handlePuzzle(puzzleData, validate_solution)

        break
    }
    
}

function isLevelCompleted(level, levelIndex){
    let completed = false

    const levelsData = puzzleData.levelsData

    for (const levelData of levelsData){
        if (levelData.levelName !== level.levelName) continue

        const levelsSolved = levelData.levelsSolved

        for (const solvedLevel of levelsSolved){
            if (solvedLevel !== levelIndex) continue

            completed = true

            break
        }

        break
    }

    return completed
}

function loadLevelSelection(level){
    while (levelSelectorSections.children.length > 0){
        levelSelectorSections.firstChild.remove()
    }
    while (pagesCount.children.length > 0){
        pagesCount.firstChild.remove()
    }

    const levels = level.levels
    let pages = Math.ceil(levels.length / 30)
    let createdLevels = 0

    let levelButtonColors = ["rgb(51, 51, 245)", "rgb(226, 226, 4)", "rgb(215, 93, 0)", "rgb(0, 255, 255)", "rgb(212, 3, 3)", "rgb(0, 208, 0)"]
    let levelButtonBackgrounds = ["rgb(45, 45, 216)", "rgb(197, 197, 2)", "rgb(190, 85, 5)", "rgb(4, 213, 213)", "rgb(168, 6, 6)", "rgb(2, 159, 2)"]
    let levelButtonColorIndex = 0

    let pageCircles = []
    let pagesArray = []

    for (let i = 0; i < pages; i++){
        const page = document.createElement("div")
        levelSelectorSections.append(page)
        page.style.left = `${100 * i}%`

        const pageContent = document.createElement("div")
        page.append(pageContent)

        const pageHeader = document.createElement("h1")
        pageContent.append(pageHeader)

        const pageLevelsHolder = document.createElement("div")
        pageContent.append(pageLevelsHolder)

        let levelsOnPage = 30
        if (createdLevels + levelsOnPage > levels.length) levelsOnPage = levels.length - createdLevels

        pageHeader.innerText = `${createdLevels + 1} - ${createdLevels + levelsOnPage}`

        for (let j = 0; j < levelsOnPage; j++){
            let createdLevelIndex = createdLevels
            const levelData = levels[createdLevelIndex]

            const levelButton = document.createElement("button")
            levelButton.innerText = `${createdLevelIndex + 1}`
            pageLevelsHolder.append(levelButton)
            
            let borderColor = levelButtonColors[levelButtonColorIndex]
            let buttonBackground = levelButtonBackgrounds[levelButtonColorIndex]
            levelButtonColorIndex++
            if (levelButtonColorIndex > levelButtonColors.length -1) levelButtonColorIndex = 0

            if (levelData.locked && !isLevelCompleted(level, levelData.key)){
                levelButton.style.borderColor = "rgb(94, 94, 94)"
                levelButton.style.backgroundColor = "rgb(60, 60, 60)"
                levelButton.style.color = "rgb(60, 60, 60)"
            }
            else{
                levelButton.style.borderColor = borderColor
                levelButton.style.backgroundColor = buttonBackground

                levelButton.addEventListener("click", () => {
                    loadLevel(level, createdLevelIndex)
                })
            }

            createdLevels++
        }

        const pageCircle = document.createElement("div")
        pagesCount.append(pageCircle)

        pageCircles.push({
            element: pageCircle,
            pageNumber: i
        })
        pagesArray.push({
            element: page,
            pageNumber: i
        })
    }

    selectionPageCircles = pageCircles
    selectionPages = pagesArray

    onLevelSelectionScroll()
}

function openLevelSelector(level){
    setLevelSelectorState(true)

    levelSelectorName.innerText = level.levelName
    levelSelectorName.style.color = level.levelNameColor

    loadLevelSelection(level)
}

function closeLevelSelector(){
    setLevelSelectorState(false)
}

function setDefaultPuzzleData(){
    for (const level of levels){
        puzzleData.levelsData.push({
            levelName: level.levelName,
            levelsSolved: []
        })
    }
}

function onPuzzleDataLoad(data){
    puzzleData = data
}

function savePuzzleData(savingSystem){
    savingSystem.data = puzzleData
    savingSystem.save()
}

function setup(){
    setDefaultPuzzleData()

    const savingSystem = new SavingSystem("puzzle_data")
    savingSystem.load(onPuzzleDataLoad)

    for (const level of levels){
        createLevelSelect(level)
    }

    window.addEventListener("beforeunload", () => {
        savePuzzleData(savingSystem)
    })
    setInterval(() => {
        savePuzzleData(savingSystem)
    }, 300000)
    levelSelectorReturn.addEventListener("click", closeLevelSelector)
    levelSelectorSections.addEventListener("scroll", onLevelSelectionScroll)

    setLevelSelectorState(false)

    levelHolder.style.visibility = "hidden"
}

loadAllLevels()