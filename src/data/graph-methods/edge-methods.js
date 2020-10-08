const playerData = require('../output.json')

const getAllEdges = input => {
    return input.map(player => player.name);
}

const formatEdgesOfPlayer = player => {
    return player.teammates['py/set'].map(teammate => {
        return {
            from: player.bref_id,
            to: teammate
        }
    })
}

const calcSize = player => {
    return player.teammates['py/set'].length
}


console.log(calcSize(playerData[3]))
