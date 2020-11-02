const NodeMethods = require('./graph-methods/node-methods');

const playerData = require('./player-data3.json');

const HOF_PLAYERS = playerData.filter(players => players.isHOFer === true);
const STARTING_INFO = NodeMethods.constructStartingInfo(HOF_PLAYERS);
const STARTING_EDGES = NodeMethods.constructEdgesFromStartingInfo(STARTING_INFO);

module.exports = {
    playerData,
    NODES: STARTING_INFO.nodes,
    EDGES: STARTING_EDGES,
    STARTING_INFO
};
