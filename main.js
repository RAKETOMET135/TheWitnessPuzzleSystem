import { createPuzzle } from "./modules/puzzle_creator.js"
import { handlePuzzle } from "./modules/interaction_handler.js"

const puzzleData = createPuzzle([500, 500], [4, 4], [[0, 3]], [[3, 0, "up"]], ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)"])
document.body.append(puzzleData.element)

handlePuzzle(puzzleData)