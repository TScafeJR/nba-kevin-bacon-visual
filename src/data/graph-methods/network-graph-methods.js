const playerMethods = require('./search-methods/player-methods');
const nodeMethods = require('./node-methods');

const getNodesAndEdgesFromPlayerName = playerName => {
    const playerId = playerMethods.findPlayerIdFromName(playerName);
    const player = playerMethods.getPlayerFromId(playerId);

    const playerTeammates = playerMethods.getTeammatesFromPlayer(player);

    const nodeInfo = nodeMethods.constructNodes(player, playerTeammates);

    return {
        nodes: nodeInfo.nodes,
        edges: nodeMethods.constructEdgesFromStartingInfo(nodeInfo)
    };
};

const filterPlayerNodesArr = (oldArr, newArr) => {
    const containerObj = {};
    const filteredArr = [...oldArr, ...newArr]
        .filter(element => newArr.map(ele => ele.id).includes(element.id));


    filteredArr.forEach(element => {
        if (!containerObj[element.id]){
            containerObj[element.id] = element;
        }
    });


    return Object.values(containerObj);
};

const filterPlayerEdgesArr = (centralPlayer, edgesComboArr) => {
    return edgesComboArr
        .filter(element => {
            return (
                (element.to === centralPlayer || element.from === centralPlayer) &&
                element.to !== element.from
            );
        });
};

module.exports = {
    getNodesAndEdgesFromPlayerName,
    filterPlayerNodesArr,
    filterPlayerEdgesArr
};
