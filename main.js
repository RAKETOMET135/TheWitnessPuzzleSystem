import { createPuzzle } from "./modules/puzzle_creator.js"
import { handlePuzzle } from "./modules/interaction_handler.js"
import { validate_solution } from "./modules/solution_validator.js"

/*
Puzzle creation info

1. size [x, y]
2. gridSize [x, y] <-- int
3. starts [[x, y]]
4. ends [[x, y, direction]] <-- direction ("up", "down", "left", "right")
5. colors [puzzleBackground, puzzleElements, line, correctLine, incorrectLine, hexagons]
6. rules object <-- hexagons [[x, y]] 
*/


const _puzzleData = createPuzzle([500, 500], [4, 4], [[0, 3], [2, 2]], [[3, 0, "up"], [3, 1, "right"], [0, 1, "left"], [1, 3, "down"]], 
    ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)"], 
    {
        hexagons: [[0, 0], [2.5, 2], [2, 2.5]]
    })
document.body.append(_puzzleData.element)

handlePuzzle(_puzzleData, validate_solution)