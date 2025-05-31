function checkHexagons(solutionPointsGrid, ruleData, puzzleData){
    let correct = false
    let correctHexagons = []

    for (let i = 0; i < solutionPointsGrid.length; i++){
        const gridPoint = solutionPointsGrid[i]

        for (let j = 0; j < ruleData.length; j++){
            const hexagon = ruleData[j]

            if (hexagon.hexagon[0] !== gridPoint[0] || hexagon.hexagon[1] !== gridPoint[1]) continue

            correctHexagons.push(hexagon)
        }
    }

    for (let i = 0; i < ruleData.length; i++){
        const hexagon = ruleData[i]
        const isXInt = Number.isInteger(hexagon.hexagon[0])
        const isYInt = Number.isInteger(hexagon.hexagon[1])

        if (isXInt && isYInt) continue

        if (isYInt){
            const lower = Math.floor(hexagon.hexagon[0])
            const higher = Math.ceil(hexagon.hexagon[0])

            for (let j = 0; j < solutionPointsGrid.length; j++){
                const gridPoint = solutionPointsGrid[j]

                let isSequence = false

                if (gridPoint[0] === lower && gridPoint[1] === hexagon.hexagon[1]){
                    if (j > 0){
                        if (solutionPointsGrid[j - 1][0] === higher && solutionPointsGrid[j - 1][1] === gridPoint[1]) isSequence = true
                    }

                    if (j < solutionPointsGrid.length - 2){
                        if (solutionPointsGrid[j + 1][0] === higher && solutionPointsGrid[j + 1][1] === gridPoint[1]) isSequence = true
                    }
                }

                if (isSequence){
                    correctHexagons.push(hexagon)

                    break
                }
            }
        }
        else{
            const lower = Math.floor(hexagon.hexagon[1])
            const higher = Math.ceil(hexagon.hexagon[1])

            for (let j = 0; j < solutionPointsGrid.length; j++){
                const gridPoint = solutionPointsGrid[j]

                let isSequence = false

                if (gridPoint[1] === lower && gridPoint[0] === hexagon.hexagon[0]){
                    if (j > 0){
                        if (solutionPointsGrid[j - 1][1] === higher && solutionPointsGrid[j - 1][0] === gridPoint[0]) isSequence = true
                    }

                    if (j < solutionPointsGrid.length - 2){
                        if (solutionPointsGrid[j + 1][1] === higher && solutionPointsGrid[j + 1][0] === gridPoint[0]) isSequence = true
                    }
                }

                if (isSequence){
                    correctHexagons.push(hexagon)

                    break
                }
            }
        }
    }

    if (ruleData.length === correctHexagons.length){
        correct = true
    }

    return correct
}

export function validate_solution(solutionEnd, solutionPoints, solutionPointsGrid, solutionStart, puzzleData){ 
    if (puzzleData.rules.length <= 0){
        return true
    }
    else{
        let rulesCorrect = true

        for (let i = 0; i < puzzleData.rules.length; i++){
            const rule = puzzleData.rules[i]

            if (rule.type === "hexagons"){
                let correct = checkHexagons(solutionPointsGrid, rule.data, puzzleData)

                if (!correct){
                    rulesCorrect = false

                    break
                }
            }
        }

        if (rulesCorrect){
            return true
        }
    }

    return false
}