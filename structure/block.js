export class Block{
    constructor(blocks, rotateable = false, optionalColor = null){
        this.root = [0, 0]
        this.blocks = blocks
        this.optionalColor = optionalColor

        if (!rotateable){
            this.rotateable = false
        }
        else{
            this.rotateable = rotateable
        }
    }

    _getPartRotatedCoords(part, rotation){
        if (rotation === 0) return [part[0], part[1]]
        if (rotation === 1) return [-part[1], part[0]]
        if (rotation === 2) return [-part[0], -part[1]]
        if (rotation === 3) return [part[1], -part[0]]

        return null
    }

    getBlock(rotation){
        let blocks = []

        for (let i = 0; i < this.blocks.length; i++){
            const part = this.blocks[i]

            blocks.push(this._getPartRotatedCoords(part, rotation))
        }

        return blocks
    }
}