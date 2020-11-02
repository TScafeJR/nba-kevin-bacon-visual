const playerData = require('../../player-data3.json');
const playersObj = require('../../players-obj.json');

const findPlayerIdFromName = (searchPlayerName, playerArr = playerData) => {
    const playerObj = playerArr.reduce((obj, player) => {
        obj[player.name.replace('*', '')] = player;
        return obj;
    }, {});

    return playerObj[searchPlayerName.trim()].bref_id;
};

const getTeammatesFromPlayer = (player, playerObj = playersObj) => {
    return player.teammates.map(playerId => playerObj[playerId]);
};

const getPlayerFromId = (playerId, playerObj = playersObj) => {
    return playerObj[playerId];
};

module.exports = {
    findPlayerIdFromName,
    getTeammatesFromPlayer,
    getPlayerFromId
};
