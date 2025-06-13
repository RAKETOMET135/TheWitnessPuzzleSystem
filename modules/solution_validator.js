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

    return [correct, correctHexagons]
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

function tileExists(group, gridPosition){
    let isInGroup = false

    for (let i = 0; i < group.length; i++){
        const tile = group[i]
        const _gridPosition = tile.gridPosition

        if (_gridPosition[0] !== gridPosition[0] || _gridPosition[1] !== gridPosition[1]) continue

        isInGroup = true

        break
    }

    return isInGroup
}

function getBlockSolutionVariants(tileData, group){
    let solutionVariants = []
    let solutionVariantsPointsCounts = []

    let blockParts = [tileData.blockData.getBlock(0)]
    if (tileData.blockData.rotateable){
        blockParts.push(tileData.blockData.getBlock(1))
        blockParts.push(tileData.blockData.getBlock(2))
        blockParts.push(tileData.blockData.getBlock(3))
    }

    group.forEach(tile => {
        const gridPosition = tile.gridPosition

        blockParts.forEach(blockPart => {
            blockPart.forEach(part => {
                let solutionPoints = []
                let realSolutionPointsCount = 0
                let adjustedGridPosition = [gridPosition[0], gridPosition[1]]
                let diff = [part[0], part[1]]

                blockPart.forEach(_part => {
                    let _adjustedGridPosition = [gridPosition[0] + _part[0] - diff[0], adjustedGridPosition[1] + _part[1] - diff[1]]
                    let imaginaryPoint = !tileExists(group, _adjustedGridPosition)

                    if (!imaginaryPoint){
                        realSolutionPointsCount++
                    }

                    solutionPoints.push(_adjustedGridPosition)
                })

                solutionVariants.push(solutionPoints)
                solutionVariantsPointsCounts.push(realSolutionPointsCount)
            })
        })
    })

    return [solutionVariants, solutionVariantsPointsCounts]
}

let __blockSolutionsRemove = null
let __allSolutionVariants = null
let __blockSolutionsRemoveCounts = null
let __areaSize = null
let __removeCount = null
let __blockCount = null
function createSolutionVariant(solutionVariant, i, count){
    if (i > __blockSolutionsRemove.length - 1){
        if (count < __areaSize) return
        if (count > __areaSize + __removeCount) return
        if (__blockCount - count > __removeCount) return
        if (__areaSize + __removeCount !== __blockCount) return

        __allSolutionVariants.push(solutionVariant)

        return
    }

    for (let j = 0; j < __blockSolutionsRemove[i].length; j++){
        let _solutionVariant = []

        for (let solution of solutionVariant){
            _solutionVariant.push(solution)
        }
        for (let solution of __blockSolutionsRemove[i][j]){
            _solutionVariant.push(solution)
        }

        createSolutionVariant(_solutionVariant, i + 1, count + __blockSolutionsRemoveCounts[i][j])
    }
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

function checkGroup(group, ruleDatas){
    let groupCorrect = true
    let checkColor = false
    let toCheckColor = null
    let stars = []
    let blockSolutions = []
    let hasBlocks = false
    let hasRemoveBlocks = false
    let removeBlockCount = 0
    let removeBlocks = []
    let blocks = []
    let blockCount = 0
    let eliminationMarksCount = 0
    let eliminationMarks = []

    let datas = []

    for (let i = 0; i < group.length; i++) {
        const tile = group[i]
        let tileData = null

        for (let j = 0; j < ruleDatas.length; j++) {
            const data = ruleDatas[j]

            if (data.gridPosition[0] !== tile.gridPosition[0] || data.gridPosition[1] !== tile.gridPosition[1]) continue

            tileData = data
        }

        if (!tileData) continue

        if (tileData.colorSensitive) {
            checkColor = true
            toCheckColor = tileData.color
        }

        if (tileData.star) {
            let starGroupExists = false

            for (let j = 0; j < stars.length; j++) {
                const starGroup = stars[j]

                if (starGroup.color !== tileData.starColor) continue

                starGroupExists = true
                starGroup.stars.push(tileData)
            }

            if (!starGroupExists) {
                stars.push({
                    color: tileData.starColor,
                    stars: [tileData]
                })
            }
        }

        if (tileData.triangle) {
            let tileFilledCount = 0
            if (tile._left) tileFilledCount++
            if (tile._right) tileFilledCount++
            if (tile._top) tileFilledCount++
            if (tile._bottom) tileFilledCount++

            if (tileData.triangleCount !== tileFilledCount) {
                groupCorrect = false
            }
        }

        if (tileData.block) {
            let possibleSolutions = getPossibleBlockSolutions(tileData, group)
            hasBlocks = true
            blockCount += tileData.blockData.getBlock(0).length
            blocks.push(tileData)
            blockSolutions.push(possibleSolutions)
        }

        if (tileData.removeBlock) {
            hasRemoveBlocks = true
            removeBlocks.push(tileData)
            removeBlockCount += tileData.removeBlockData.getBlock(0).length
        }

        if (tileData.eliminationMark) {
            eliminationMarksCount++
            eliminationMarks.push(tileData)
        }

        datas.push(tileData)
    }

    for (let i = 0; i < datas.length; i++) {
        const data = datas[i]

        if (checkColor && data.color) {
            if (data.color !== toCheckColor) groupCorrect = false
        }

        if (data.color) {
            for (let j = 0; j < stars.length; j++) {
                const starGroup = stars[j]

                if (starGroup.color !== data.color) continue

                starGroup.stars.push(data)
            }
        }

        if (data.blockColor) {
            for (let j = 0; j < stars.length; j++) {
                const starGroup = stars[j]

                if (starGroup.color !== data.blockColor) continue

                starGroup.stars.push(data)
            }
        }

        if (data.eliminationMarkColor) {
            for (let j = 0; j < stars.length; j++) {
                const starGroup = stars[j]

                if (starGroup.color !== data.eliminationMarkColor) continue

                starGroup.stars.push(data)
            }
        }
    }

    for (let i = 0; i < stars.length; i++) {
        const starGroup = stars[i]

        if (starGroup.stars.length !== 2) groupCorrect = false
    }

    if (!hasRemoveBlocks) {
        if (blockSolutions.length > 0) {
            let oneCorrect = false

            for (let i = 0; i < blockSolutions[0].length; i++) {
                const solutionPoints = blockSolutions[0][i].solutionPoints
                let cBlockSolutions = []
                let usedSolutionPoints = solutionPoints

                if (blockSolutions.length === 1) {
                    oneCorrect = true

                    break
                }

                for (let j = 1; j < blockSolutions.length; j++) {
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
    }
    else if (blockCount > 0) {
        let blockSolutionsRemove = []
        let blockSolutionsRemoveCounts = []
        let allSolutionVariants = []

        blocks.forEach(block => {
            let allBlockSolution = getBlockSolutionVariants(block, group)
            let allBlockSolutionVariants = allBlockSolution[0]
            let allBlockSolutionVariantsCounts = allBlockSolution[1]

            blockSolutionsRemove.push(allBlockSolutionVariants)
            blockSolutionsRemoveCounts.push(allBlockSolutionVariantsCounts)
        })

        __blockSolutionsRemove = blockSolutionsRemove
        __blockSolutionsRemoveCounts = blockSolutionsRemoveCounts
        __allSolutionVariants = allSolutionVariants
        __areaSize = group.length
        __removeCount = removeBlockCount
        __blockCount = blockCount

        for (let i = 0; i < blockSolutionsRemove[0].length; i++) {
            const blockRootSolution = blockSolutionsRemove[0][i]
            let solutionVariantBase = []

            blockRootSolution.forEach(rootSolution => {
                solutionVariantBase.push(rootSolution)
            })

            createSolutionVariant(solutionVariantBase, 1, blockSolutionsRemoveCounts[0][i])
        }

        let adjustedAllSolutionVariants = []

        for (let i = 0; i < allSolutionVariants.length; i++) {
            const solutionVariant = allSolutionVariants[i]
            const adjustedSolutionVariant = []
            let notAddedPoints = []

            for (let j = 0; j < solutionVariant.length; j++) {
                if (!tileExists(group, solutionVariant[j])) {
                    adjustedSolutionVariant.push(solutionVariant[j])

                    continue
                }

                for (let k = 0; k < solutionVariant.length; k++) {
                    if (k === j) continue

                    if (solutionVariant[k][0] !== solutionVariant[j][0] || solutionVariant[k][1] !== solutionVariant[j][1]) continue

                    let wasNotAdded = false

                    for (let l = 0; l < notAddedPoints.length; l++) {
                        if (notAddedPoints[l][0] !== solutionVariant[j][0] || notAddedPoints[l][1] !== solutionVariant[j][1]) continue

                        wasNotAdded = true

                        break
                    }

                    if (wasNotAdded) {
                        adjustedSolutionVariant.push(solutionVariant[j])
                    }
                    else {
                        notAddedPoints.push(solutionVariant[j])
                    }

                    break
                }
            }

            if (adjustedSolutionVariant.length === removeBlockCount) {
                adjustedAllSolutionVariants.push(adjustedSolutionVariant)
            }
        }

        function getAllRemoveBlockSolutions(tileData, solutionVariant) {
            let allPossibleSolutions = []

            let blockParts = [tileData.removeBlockData.getBlock(0)]
            if (tileData.removeBlockData.rotateable) {
                blockParts.push(tileData.removeBlockData.getBlock(1))
                blockParts.push(tileData.removeBlockData.getBlock(2))
                blockParts.push(tileData.removeBlockData.getBlock(3))
            }

            solutionVariant.forEach(tile => {
                for (let i = 0; i < blockParts.length; i++) {
                    const blockPart = blockParts[i]

                    let allPartsPossible = true
                    let solutionPoints = []

                    for (let j = 0; j < blockPart.length; j++) {
                        const part = blockPart[j]
                        let rTilePosition = [tile[0] + part[0], tile[1] + part[1]]
                        let possible = false

                        for (let k = 0; k < solutionVariant.length; k++) {
                            const _tile = solutionVariant[k]

                            if (_tile[0] !== rTilePosition[0] || _tile[1] !== rTilePosition[1]) continue

                            possible = true

                            break
                        }

                        if (!possible) {
                            allPartsPossible = false

                            break
                        }

                        solutionPoints.push(rTilePosition)
                    }

                    if (allPartsPossible) {
                        allPossibleSolutions.push({
                            tile: tile,
                            solutionPoints: solutionPoints
                        })
                    }
                }
            })

            return allPossibleSolutions
        }

        let atleastOneCorrect = false

        for (let i = 0; i < adjustedAllSolutionVariants.length; i++) {
            const solutionVariant = adjustedAllSolutionVariants[i]
            let allBlockSolutions = []
            let canExist = true

            for (let j = 0; j < removeBlocks.length; j++) {
                const removeBlock = removeBlocks[j]

                let sols = getAllRemoveBlockSolutions(removeBlock, solutionVariant)

                if (sols.length <= 0) {
                    canExist = false

                    break
                }

                allBlockSolutions.push(sols)
            }

            if (!canExist) continue

            let oneCorrect = false

            for (let i = 0; i < allBlockSolutions[0].length; i++) {
                const solutionPoints = allBlockSolutions[0][i].solutionPoints
                let cBlockSolutions = []
                let usedSolutionPoints = solutionPoints

                if (allBlockSolutions.length === 1) {
                    oneCorrect = true

                    break
                }

                for (let j = 1; j < allBlockSolutions.length; j++) {
                    cBlockSolutions.push(allBlockSolutions[j])
                }

                let correct = checkBlockSolution(solutionPoints, cBlockSolutions, usedSolutionPoints)

                if (correct) oneCorrect = true
            }

            if (!oneCorrect) continue

            atleastOneCorrect = true
        }

        if (!atleastOneCorrect) groupCorrect = false
    }

    if (blockCount - removeBlockCount !== group.length && hasBlocks) groupCorrect = false
    if (hasRemoveBlocks && blockCount <= 0) groupCorrect = false

    if (eliminationMarksCount === datas.length && eliminationMarksCount > 0){
        groupCorrect = false
    }

    return groupCorrect
}

let __eliminationMarks = []
let __groupData = []
function eliminationMarkCheck(group, variant, i){
    let correct = false

    if (__eliminationMarks.length - 1 < i) return checkGroup(group, variant)

    let curEliminationMark = __eliminationMarks[i]
    let hasThisEliminationMark = false

    for (let j = 0; j < variant.length; j++){
        const tileData = variant[j]

        if (tileData !== curEliminationMark) continue

        hasThisEliminationMark = true
    }

    if (!hasThisEliminationMark) return eliminationMarkCheck(group, variant, i + 1)

    for (let j = 0; j < variant.length; j++){
        const tileData = variant[j]

        if (tileData === curEliminationMark) continue

        let modVariant = []

        for (let k = 0; k < variant.length; k++){
            const _tileData = variant[k]

            if (_tileData === curEliminationMark || _tileData === tileData) continue

            modVariant.push(_tileData)
        }

        let modVariantCorrect = eliminationMarkCheck(group, modVariant, i + 1)

        if (!modVariantCorrect) continue

        correct = true
    }

    return correct
}

function checkGroups(groups, ruleDatas, results){
    let correct = true

    groups.forEach(group => {
        let groupData = []
        let eliminationMarks = []
        let groupCorrect = true

        let result = null
        for (let i = 0; i < results.length; i++){
            const groupResult = results[i]

            if (groupResult.group !== group) continue

            result = groupResult
            break
        }

        let rem = 0
        if (result){
            rem = result.rem
        }

        for (let i = 0; i < group.length; i++){
            const tile = group[i]
            let tileData = null

            for (let j = 0; j < ruleDatas.length; j++) {
                const data = ruleDatas[j]

                if (data.gridPosition[0] !== tile.gridPosition[0] || data.gridPosition[1] !== tile.gridPosition[1]) continue

                tileData = data
            }

            if (!tileData) continue

            if (tileData.eliminationMark){
                if (result){
                    if (rem > 0){
                        rem--

                        continue
                    }
                    else{
                        eliminationMarks.push(tileData)
                        groupData.push(tileData)
                    }
                }
                else{
                    eliminationMarks.push(tileData)
                    groupData.push(tileData)
                }
            }
            else{
                groupData.push(tileData)
            }
        }

        if (eliminationMarks.length > 0){
            let oneVariantCorrect = false

            __eliminationMarks = eliminationMarks
            __groupData = groupData

            for (let i = 0; i < groupData.length; i++){
                const tileData = groupData[i]

                if (tileData === eliminationMarks[0]) continue

                let variant = []

                for (let j = 0; j < groupData.length; j++){
                    const _tileData = groupData[j]

                    if (_tileData === eliminationMarks[0] || _tileData === tileData) continue

                    variant.push(_tileData)
                }

                let variantCorrect = eliminationMarkCheck(group, variant, 1)

                if (!variantCorrect) continue
    
                oneVariantCorrect = true
            }

            if (!oneVariantCorrect) correct = false
        }
        else{
            groupCorrect = checkGroup(group, groupData)
        }

        if (!groupCorrect) correct = false
    })

    return correct
}

function getHexagonGroups(hexagonsData){
    let group0 = []
    let group1 = []

    for (let i = 0; i < hexagonsData.length; i++){
        const hexagon = hexagonsData[i]
        const colorId = hexagon.hexagon[2]

        if (colorId === 0){
            group0.push(hexagon)
        } 
        else {
            group1.push(hexagon)
        }
    }

    let groups = [group0, group1]

    return groups
}

function isHexagonInGroup(group, hexagon){
    let inGroup = false
    const position = hexagon.gridPosition

    for (let i = 0; i < group.length; i++){
        const tile = group[i]
        const points = tile.points

        for (let j = 0; j < points.length; j++){
            const point = points[j]

            if (point[0] !== position[0] || point[1] !== position[1]) continue

            inGroup = true

            break
        }


        let intX = Number.isInteger(position[0])
        let intY = Number.isInteger(position[1])

        if (intX){
            if (position[0] === points[0][0] || position[0] === points[1][0]){
                if (position[1] > points[0][1] && position[1] < points[2][1]){
                    inGroup = true
                }
            }
        }
        else if (intY){
            if (position[1] === points[0][1] || position[1] === points[2][1]){
                if (position[0] > points[0][0] && position[0] < points[1][0]){
                    inGroup = true
                }
            }
        }

        if (inGroup) break
    }

    return inGroup
}

function getHexagonsInGroup(group, hexagons){
    let groupHexagons = []

    for (let i = 0; i < hexagons.length; i++){
        const hexagon = hexagons[i]

        let inGroup = isHexagonInGroup(group, hexagon)

        if (!inGroup) continue

        groupHexagons.push(hexagon)
    }

    return groupHexagons
}

function getIncorrectHexagons(hexagons, correctHexagons){
    let incorrectHexagons = []

    for (let i = 0; i < hexagons.length; i++){
        const hexagon = hexagons[i]

        let correct = false

        for (let j = 0; j < correctHexagons.length; j++){
            const correctHexagon = correctHexagons[j]

            if (correctHexagon !== hexagon) continue

            correct = true

            break
        }

        if (correct) continue

        incorrectHexagons.push(hexagon)
    }

    return incorrectHexagons
}

function getEliminationMarksInGroup(group, ruleDatas){
    let eliminationMarks = []

    for (let i = 0; i < group.length; i++){
        const tile = group[i]
        const tileGridPosition = tile.gridPosition

        for (let j = 0; j < ruleDatas.length; j++){
            const eliminationMark = ruleDatas[j]
            const gridPosition = eliminationMark.gridPosition

            if (gridPosition[0] !== tileGridPosition[0] || gridPosition[1] !== tileGridPosition[1]) continue
            if (!eliminationMark.eliminationMark) continue

            eliminationMarks.push(eliminationMark)

            break
        }
    }

    return eliminationMarks
}

function checkHexagonsEliminationMark(groups, ruleDatas, correctHexagons, hexagons){
    let incorrectHexagons = getIncorrectHexagons(hexagons, correctHexagons)
    let result = []

    for (let i = 0; i < groups.length; i++){
        const group = groups[i]

        let groupHexagons = getHexagonsInGroup(group, incorrectHexagons)
        let eliminationMarks = getEliminationMarksInGroup(group, ruleDatas)

        let groupResult = {
            result: eliminationMarks.length - groupHexagons.length,
            group: group,
            rem: groupHexagons.length
        }

        result.push(groupResult)
    }

    return result
}

export function validate_solution(solutionEnd, solutionPoints, solutionPointsGrid, solutionStart, puzzleData, solutionPointsGridSymmetry){ 
    solutionPointsGrid.push(solutionEnd.puzzlePoint.gridPosition)

    let points0 = []
    let points1 = []

    if (solutionPointsGridSymmetry){
        for (let i = 0; i < solutionPointsGrid.length; i++){
            points0.push(solutionPointsGrid[i])
        }

        solutionPointsGrid.push([-99999999, -99999999])

        for (let i = 0; i < solutionPointsGridSymmetry.length; i++){
            const solutionPointGridSymmetry = solutionPointsGridSymmetry[i]

            solutionPointsGrid.push(solutionPointGridSymmetry)
            points1.push(solutionPointGridSymmetry)
        }
    }

    if (puzzleData.rules.length <= 0){
        return true
    }
    else{
        let rulesCorrect = true
        let hexagonsCorrect = true
        let hexagonsCorrectData = []
        let hexagonsData = []

        let ruleDatas = []

        for (let i = 0; i < puzzleData.rules.length; i++){
            const rule = puzzleData.rules[i]

            if (rule.type === "hexagons"){
                let correctData = checkHexagons(solutionPointsGrid, rule.data, puzzleData)

                if (!correctData[0]){
                    hexagonsCorrect = false
                    hexagonsCorrectData = correctData[1]
                    hexagonsData = rule.data
                }
            }
            else if (rule.type === "hexagonsColors"){
                let hexagonGroups = getHexagonGroups(rule.data)

                let correct0 = checkHexagons(points0, hexagonGroups[0], puzzleData)
                let correct1 = checkHexagons(points1, hexagonGroups[1], puzzleData)

                if (!correct0 || !correct1){
                    rulesCorrect = false

                    break
                }
            }
            else if (rule.type === "colors" || rule.type === "stars" || rule.type === "triangles" || rule.type === "blocks" || rule.type === "removeBlocks"
                || rule.type === "eliminationMarks"
            ){
                for (let j = 0; j < rule.data.length; j++){
                    ruleDatas.push(rule.data[j])
                }
            }
        }

        if (!rulesCorrect) return false

        let groups = createGroups(solutionPointsGrid, puzzleData)

        let results = []
        if (!hexagonsCorrect){
            let result = checkHexagonsEliminationMark(groups, ruleDatas, hexagonsCorrectData, hexagonsData)

            for (let i = 0; i < result.length; i++){
                const groupResult = result[i]

                if (groupResult.result < 0){
                    rulesCorrect = false

                    break
                }
            }

            results = result
        }

        if (!rulesCorrect) return false

        let correct = checkGroups(groups, ruleDatas, results)
        if (!correct) rulesCorrect = false

        if (rulesCorrect){
            return true
        }
    }

    return false
}