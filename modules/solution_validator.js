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

function isConnected(point0, point1, solutionPoints){
    let connected = false

    for (let i = 0; i < solutionPoints.length; i++){
        const gridPoint = solutionPoints[i]

        if (gridPoint[0] !== point0[0] || gridPoint[1] !== point0[1]) continue

        if (i > 0){
            const prevGridPoint = solutionPoints[i - 1]

            if (prevGridPoint[0] === point1[0] && prevGridPoint[1] === point1[1]){
                connected = true

                break
            }
        }

        if (i < solutionPoints.length - 2){
            const nextGridPoint = solutionPoints[i + 1]

            if (nextGridPoint[0] === point1[0] && nextGridPoint[1] === point1[1]){
                connected = true

                break
            }
        }
    }

    return connected
}

function getNeighborTiles(tile, tiles){
    let neighborTiles = []

    const neighborTileGridPositions = []

    if (!tile.left){
        neighborTileGridPositions.push([tile.gridPosition[0] - 1, tile.gridPosition[1]])
    } 
    if (!tile.right){
        neighborTileGridPositions.push([tile.gridPosition[0] + 1, tile.gridPosition[1]])
    } 
    if (!tile.top){
        neighborTileGridPositions.push([tile.gridPosition[0], tile.gridPosition[1] - 1])
    }
    if (!tile.bottom){
        neighborTileGridPositions.push([tile.gridPosition[0], tile.gridPosition[1] + 1])
    }

    for (let i = 0; i < tiles.length; i++){
        const _tile = tiles[i]
        const gridPosition = _tile.gridPosition

        for (let j = 0; j < neighborTileGridPositions.length; j++){
            const neighborTileGridPosition = neighborTileGridPositions[j]

            if (neighborTileGridPosition[0] !== gridPosition[0] || neighborTileGridPosition[1] !== gridPosition[1]) continue

            neighborTiles.push(_tile)

            break
        }

        if (neighborTiles.length >= 4) break
    }

    return neighborTiles
}

function isTileInGroup(tile, groups){
    let inGroup = false

    for (let i = 0; i < groups.length; i++){
        const group = groups[i]

        for (let j = 0; j < group.length; j++){
            const groupTile = group[j]

            if (groupTile !== tile) continue

            inGroup = true

            break
        }

        if (inGroup) break
    }

    return inGroup
}

function checkNeighborTile(neighborTile, group, tiles, groups, level, rootTile){
    group.push(neighborTile)

    level++

    let neighborTiles = getNeighborTiles(neighborTile, tiles)
    for (let i = 0; i < neighborTiles.length; i++){
        const _neighborTile = neighborTiles[i]

        if (isTileInGroup(_neighborTile, groups)) continue

        checkNeighborTile(_neighborTile, group, tiles, groups, level, rootTile)
    }
}

function createGroups(solutionPointsGrid, puzzleData){
    let groups = []
    let tiles = []

    for (let x = 0; x < puzzleData.grid[0] - 1; x++){
        for (let y = 0; y < puzzleData.grid[1] - 1; y++){
            const topLeftPoint = [x, y]
            const topRightPoint = [x + 1, y]
            const bottomLeftPoint = [x, y + 1]
            const bottomRightPoint = [x + 1, y + 1]

            let topFilled = isConnected(topLeftPoint, topRightPoint, solutionPointsGrid)
            let bottomFilled = isConnected(bottomLeftPoint, bottomRightPoint, solutionPointsGrid)
            let leftFilled = isConnected(topLeftPoint, bottomLeftPoint, solutionPointsGrid)
            let rightFilled = isConnected(topRightPoint, bottomRightPoint, solutionPointsGrid)

            let _topFilled = topFilled
            let _bottomFilled = bottomFilled
            let _leftFilled = leftFilled
            let _rightFilled = rightFilled

            if (y === 0) topFilled = true
            if (y === puzzleData.grid[1] - 2) bottomFilled = true
            if (x === 0) leftFilled = true
            if (x === puzzleData.grid[0] - 2) rightFilled = true

            tiles.push({
                points: [topLeftPoint, topRightPoint, bottomLeftPoint, bottomRightPoint],
                left: leftFilled,
                right: rightFilled,
                top: topFilled,
                bottom: bottomFilled,
                gridPosition: [x, y],
                _left: _leftFilled,
                _right: _rightFilled,
                _top: _topFilled,
                _bottom: _bottomFilled
            })
        }
    }

    for (let i = 0; i < tiles.length; i++){
        const tile = tiles[i]

        if (isTileInGroup(tile, groups)) continue

        let group = [tile]
        groups.push(group)

        let neighborTiles = getNeighborTiles(tile, tiles)
        
        for (let j = 0; j < neighborTiles.length; j++){
            const neighborTile = neighborTiles[j]

            checkNeighborTile(neighborTile, group, tiles, groups, 0, tile)
        }
    }

    let filteredGroups = []
    for (let i = 0; i < groups.length; i++){
        const group = groups[i]

        let filteredGroup = []

        for (let j = 0; j < group.length; j++){
            const tile = group[j]

            let exists = false

            for (let k = 0; k < filteredGroup.length; k++){
                const fTile = filteredGroup[k]

                if (fTile !== tile) continue

                exists = true

                break
            }

            if (exists) continue

            filteredGroup.push(tile)
        }

        filteredGroups.push(filteredGroup)
    }

    groups = filteredGroups

    return groups
}   

function getPossibleBlockSolutions(tileData, group){
    let possibleSolutions = []

    let blockParts = [tileData.blockData.getBlock(0)]
    if (tileData.blockData.rotateable){
        blockParts.push(tileData.blockData.getBlock(1))
        blockParts.push(tileData.blockData.getBlock(2))
        blockParts.push(tileData.blockData.getBlock(3))
    }

    group.forEach(tile => {
        const gridPosition = tile.gridPosition

        for (let i = 0; i < blockParts.length; i++){
            const blockPart = blockParts[i]

            let allPartsPossible = true
            let solutionPoints = []

            for (let j = 0; j < blockPart.length; j++) {
                const part = blockPart[j]
                let rTilePosition = [gridPosition[0] + part[0], gridPosition[1] + part[1]]
                let possible = false

                for (let k = 0; k < group.length; k++) {
                    const _tile = group[k]
                    const _gridPosition = _tile.gridPosition

                    if (_gridPosition[0] !== rTilePosition[0] || _gridPosition[1] !== rTilePosition[1]) continue

                    possible = true

                    break
                }

                if (!possible) {
                    allPartsPossible = false

                    break
                }

                solutionPoints.push(rTilePosition)
            }

            if (allPartsPossible){
                possibleSolutions.push({
                    tile: tile,
                    solutionPoints: solutionPoints
                })
            }
        }
    })

    return possibleSolutions
}

function checkBlockSolution(solutionPoints, otherSolutions, usedSolutionPoints){
    let correct = false

    for (let i = 0; i < otherSolutions[0].length; i++){
        const otherSolutionPoints = otherSolutions[0][i].solutionPoints
        let possible = true

        for (let j = 0; j < usedSolutionPoints.length; j++){
            const usedSolutionPoint = usedSolutionPoints[j]
            let exists = false

            for (let k = 0; k < otherSolutionPoints.length; k++){
                const solutionPoint = otherSolutionPoints[k]

                if (solutionPoint[0] !== usedSolutionPoint[0] || solutionPoint[1] !== usedSolutionPoint[1]) continue

                exists = true

                break
            }

            if (exists){
                possible = false

                break
            }
        }

        if (!possible) continue

        if (otherSolutions.length <= 1){
            correct = true

            break
        }

        let cOtherSolutions = []

        for (let j = 1; j < otherSolutions.length; j++){
            cOtherSolutions.push(otherSolutions[j])
        }

        let cUsedSolutionPoints = usedSolutionPoints.concat(otherSolutionPoints)

        let solCorrect = checkBlockSolution(otherSolutionPoints, cOtherSolutions, cUsedSolutionPoints)

        if (!solCorrect) continue

        correct = true

        break
    }

    return correct
}

function checkGroups(groups, ruleDatas){
    let correct = true

    groups.forEach(group => {
        let groupCorrect = true
        let checkColor = false
        let toCheckColor = null
        let stars = []
        let blockSolutions = []
        let hasBlocks = false
        let blockCount = 0

        let datas = []

        for (let i = 0; i < group.length; i++){
            const tile = group[i]
            let tileData = null

            for (let j = 0; j < ruleDatas.length; j++){
                const data = ruleDatas[j]

                if (data.gridPosition[0] !== tile.gridPosition[0] || data.gridPosition[1] !== tile.gridPosition[1]) continue

                tileData = data
            }

            if (!tileData) continue

            if (tileData.colorSensitive){
                checkColor = true
                toCheckColor = tileData.color
            }

            if (tileData.star){
                let starGroupExists = false

                for (let j = 0; j < stars.length; j++){
                    const starGroup = stars[j]

                    if (starGroup.color !== tileData.starColor) continue

                    starGroupExists = true
                    starGroup.stars.push(tileData)
                }

                if (!starGroupExists){
                    stars.push({
                        color: tileData.starColor,
                        stars: [tileData]
                    })
                }
            }

            if (tileData.triangle){
                let tileFilledCount = 0
                if (tile._left) tileFilledCount++
                if (tile._right) tileFilledCount++
                if (tile._top) tileFilledCount++
                if (tile._bottom) tileFilledCount++

                if (tileData.triangleCount !== tileFilledCount){
                    groupCorrect = false
                }
            }

            if (tileData.block){
                let possibleSolutions = getPossibleBlockSolutions(tileData, group)
                hasBlocks = true
                blockCount += tileData.blockData.getBlock(0).length

                blockSolutions.push(possibleSolutions)
            }

            datas.push(tileData)
        }

        for (let i = 0; i < datas.length; i++){
            const data = datas[i]

            if (checkColor && data.color){
                if (data.color !== toCheckColor) groupCorrect = false
            }

            if (data.color){
                for (let j = 0; j < stars.length; j++){
                    const starGroup = stars[j]

                    if (starGroup.color !== data.color) continue

                    starGroup.stars.push(data)
                }
            }
        }

        for (let i = 0; i < stars.length; i++){
            const starGroup = stars[i]

            if (starGroup.stars.length !== 2) groupCorrect = false
        }

        if (blockSolutions.length > 0){
            let oneCorrect = false

            for (let i = 0; i < blockSolutions[0].length; i++){
                const solutionPoints = blockSolutions[0][i].solutionPoints
                let cBlockSolutions = []
                let usedSolutionPoints = solutionPoints

                if (blockSolutions.length === 1){
                    oneCorrect = true

                    break
                }
    
                for (let j = 1; j < blockSolutions.length; j++){
                    cBlockSolutions.push(blockSolutions[j])
                }

                let correct = checkBlockSolution(solutionPoints, cBlockSolutions, usedSolutionPoints)

                if (correct) oneCorrect = true
            }

            if (!oneCorrect) groupCorrect = false
        }
        else {
            if (hasBlocks) groupCorrect = false
        }
        
        if (blockCount !== group.length && hasBlocks) groupCorrect = false

        if (!groupCorrect) correct = false
    })

    return correct
}

export function validate_solution(solutionEnd, solutionPoints, solutionPointsGrid, solutionStart, puzzleData){ 
    solutionPointsGrid.push(solutionEnd.puzzlePoint.gridPosition)

    if (puzzleData.rules.length <= 0){
        return true
    }
    else{
        let rulesCorrect = true

        let ruleDatas = []

        for (let i = 0; i < puzzleData.rules.length; i++){
            const rule = puzzleData.rules[i]

            if (rule.type === "hexagons"){
                let correct = checkHexagons(solutionPointsGrid, rule.data, puzzleData)

                if (!correct){
                    rulesCorrect = false

                    break
                }
            }
            else if (rule.type === "colors" || rule.type === "stars" || rule.type === "triangles" || rule.type === "blocks"){
                for (let j = 0; j < rule.data.length; j++){
                    ruleDatas.push(rule.data[j])
                }
            }
        }

        if (!rulesCorrect) return false

        let groups = createGroups(solutionPointsGrid, puzzleData)

        let correct = checkGroups(groups, ruleDatas)
        if (!correct) rulesCorrect = false

        if (rulesCorrect){
            return true
        }
    }

    return false
}