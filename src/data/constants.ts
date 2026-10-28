import * as NodeMethods from './graph-methods/node-methods';
import playerData from './player-data3.json';

const HOF_PLAYERS = playerData.filter(players => players.isHOFer === true);
// the end years of the first and latest seasons in the data, so 1947 for 1946-47
const FIRST_SEASON = Math.min(...playerData.map(player => Number(player.career_start)));
const LAST_SEASON = Math.max(...playerData.map(player => Number(player.career_end)));
const STARTING_INFO = NodeMethods.constructStartingInfo(HOF_PLAYERS);
const STARTING_EDGES = NodeMethods.constructEdgesFromStartingInfo(STARTING_INFO);

const NODES = STARTING_INFO.nodes;
const EDGES = STARTING_EDGES;

// teammates who shared at least this many seasons carry the graph's one hue
const LONG_PARTNERSHIP_SEASONS = 4;

export {
    playerData,
    HOF_PLAYERS,
    NODES,
    EDGES,
    STARTING_INFO,
    FIRST_SEASON,
    LAST_SEASON,
    LONG_PARTNERSHIP_SEASONS
};
