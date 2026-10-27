import * as NodeMethods from './graph-methods/node-methods';
import playerData from './player-data3.json';

const HOF_PLAYERS = playerData.filter(players => players.isHOFer === true);
const STARTING_INFO = NodeMethods.constructStartingInfo(HOF_PLAYERS);
const STARTING_EDGES = NodeMethods.constructEdgesFromStartingInfo(STARTING_INFO);

const NODES = STARTING_INFO.nodes;
const EDGES = STARTING_EDGES;

export {
    playerData,
    NODES,
    EDGES,
    STARTING_INFO
};
