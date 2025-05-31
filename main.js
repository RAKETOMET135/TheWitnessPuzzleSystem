import { createPuzzle } from "./modules/puzzle_creator.js"
import { handlePuzzle } from "./modules/interaction_handler.js"

const puzzleData = createPuzzle([500, 500], [4, 4], [[0, 3], [2, 2]], [[3, 0, "up"], [3, 1, "right"], [0, 1, "left"], [1, 3, "down"]], 
    ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)"])
document.body.append(puzzleData.element)

handlePuzzle(puzzleData)