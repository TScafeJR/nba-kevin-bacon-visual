const playersObj = require('../players-obj.json');

const formatPlayerNodes = input => {
    return input.map(player => {
        return {
            id: player.bref_id,
            label: player.name.replace('*', '')
        };
    });
};

const constructStartingInfo = hofPlayers => {
    const RANDOM_HOF_PLAYER = hofPlayers[Math.floor(Math.random() * hofPlayers.length)];
    const teammates = RANDOM_HOF_PLAYER.teammates.map(playerId => playersObj[playerId]);
    const playersAsNodes = formatPlayerNodes(teammates);
    const randomHOFerFormatted = formatPlayerNodes([RANDOM_HOF_PLAYER]);
    const allPlayers = [...playersAsNodes, ...randomHOFerFormatted];

    return {
        nodes: allPlayers,
        teammates: playersAsNodes,
        centralPlayer: randomHOFerFormatted[0]
    };
};

const constructEdgesFromStartingInfo = startingInfo => {
    const uniqueTeammates = Array.from(new Set(startingInfo.teammates));
    return uniqueTeammates.map(playerObj => {
        return {
            from: startingInfo.centralPlayer.id,
            to: playerObj.id
        };
    });
};

module.exports = {
    formatPlayerNodes,
    constructStartingInfo,
    constructEdgesFromStartingInfo
};
