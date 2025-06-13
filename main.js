import { createPuzzle } from "./modules/puzzle_creator.js"
import { handlePuzzle } from "./modules/interaction_handler.js"
import { validate_solution } from "./modules/solution_validator.js"
import { Block } from "./structure/block.js"

//fix start becomming square when removal line

/*
Puzzle creation info

1. size [x, y]
2. gridSize [x, y] <-- int
3. starts [[x, y]]
4. ends [[x, y, direction]] <-- direction ("up", "down", "left", "right", + combinations("up-right", "down-right", "up-left", "down-left"))
5. colors [puzzleBackground, puzzleElements, line, correctLine, incorrectLine, hexagons, triangles, blocks, removeBlocks]
6. line breaks [[x, y, direction]] <-- position of left/top point [x, y] and then direction ("right", "down")
7. line removal [[x, y, direction]] <-- position of left/top point [x, y] and then direction ("right", "down")
8. rules object <-- hexagons [[x, y]], colors [[x, y, color]], stars [[x, y, color]], triangles [[x, y, count]], blocks [[x, y, blockType]], removeBlocks [[x, y, blockType], 
    symmetry type <-- type ("vertical", "horizontal", "both"), symmetry hexagons [colors, [[x, y, colorId]]], eliminationMarks [[x, y, color]]
*/

//IMPORTANT: 3 blocks in a group should work fine with removeBlocks, but more then that can cause lag on solution submit (due to every block making possible solutions exponentionaly higher)

/*
const _puzzleData = createPuzzle([500, 500], [5, 5], [[4, 4]], [[0, 4, "down-left"], [4, 1, "right"], [0, 0, "left"], [1, 4, "down"]], 
    ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)", "rgb(250, 200, 0)",
        "rgb(255, 220, 0)", "rgb(44, 44, 255)"
    ], 
    [[2, 0, "right"]],
    [[3, 0, "right"]],
    {
        //hexagons: [[0, 0], [2.5, 2], [2, 2.5]],
        colors: [
            [0, 3, "rgb(255, 0, 0)"]
        ],
        stars: [
            [0, 2, "rgb(255, 0, 0)"]
        ],
        //triangles: [
        //    [2, 2, 1]
        //],
        blocks: [
            [1, 0, new Block([[0, 0], [0, -1], [-1, 0], [-1, -1]])],
            [0, 0, new Block([[0, 0], [0, 1]])],
            [0, 1, new Block([[0, 0], [0, 1], [0, 2], [0, 3]], true)],
            [1, 1, new Block([[0, 0], [0, 1], [1, 0]], false, "rgb(255, 0, 0)")]
        ],
        removeBlocks: [
            [2, 1, new Block([[0, 0], [1, 0]])]
        ]
    })
*/

/*
const _puzzleData = createPuzzle([500, 500], [4, 4], [[0, 3]], [[3, 0, "up"]],
    ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)", "rgb(250, 200, 0)",
        "rgb(255, 220, 0)", "rgb(44, 44, 255)"
    ],
    [], [],
    {
        blocks: [
            [0, 0, new Block([[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [1, 1], [1, 2], [2, 1], [2, 2]])]
        ],
        removeBlocks: [
            [0, 1, new Block([[0, 0], [1, 0], [0, 1]], true)],
            [0, 2, new Block([[0, 0], [0, 1]])]
        ]
    }
)
*/

/*
const _puzzleData = createPuzzle([500, 500], [5, 5], [[0, 4], [1, 4]], [[2, 0, "up"]],
    ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)", "rgb(250, 200, 0)",
        "rgb(255, 220, 0)", "rgb(44, 44, 255)"
    ],
    [[0, 0, "right"], [4, 2, "down"]], [[0, 1, "down"], [3, 3, "down"]], {
        symmetry: "both",
        symmetryHexagons: [
            ["rgb(99, 235, 253)", "rgb(238, 255, 0)"],
            [
                [1, 1, 0]
            ]
        ],
        colors: [
            [3, 1, "rgb(255, 255, 255)"],
            [3, 2, "rgb(0, 0, 0)"]
        ]
    }
)
*/

const _puzzleData = createPuzzle([500, 500], [4, 4], [[0, 3]], [[3, 0, "up"]],
    ["rgb(100, 100, 100)", "rgb(66, 66, 66)", "rgb(255, 255, 255)", "rgb(50, 255, 50)", "rgb(255, 50, 50)", "rgb(33, 33, 33)", "rgb(250, 200, 0)",
        "rgb(255, 220, 0)", "rgb(44, 44, 255)"
    ],
    [], [],
    {
        eliminationMarks: [
            [1, 1, "rgb(255, 255, 255)"],
            [0, 1, "rgb(255, 255, 255)"],
            [1, 0, "rgb(255, 255, 255)"],
            [0, 0, "rgb(255, 255, 255)"]
        ],
        blocks: [
            [2, 1, new Block([[0, 0], [0, 1], [0, 2]])]
        ],
        hexagons: [
            [0.5, 3]
        ]
    }
)

document.body.append(_puzzleData.element)

handlePuzzle(_puzzleData, validate_solution)