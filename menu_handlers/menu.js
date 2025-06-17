import { SavingSystem } from "./saving_system.js"

const levels = [
    {
        levelName: "Intro",
        levelNameColor: "rgb(255, 0, 0)",
        levelDesc: "Introduction puzzles",
        levels: []
    }
]
let puzzleData = {
    levelsData: []
}

const levelsHolder = document.querySelector("#levels-holder")
const levelsHeader = document.querySelector("#levels-header")
const levelSelector = document.querySelector("#level-selector")

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

    setLevelSelectorState(true)
}

setup()