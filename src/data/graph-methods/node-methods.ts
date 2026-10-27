import { getTeammatesFromPlayer } from './search-methods/player-methods';
import { Player, PlayerEdge, PlayerNode, StartingInfo } from '../../types';

const formatPlayerNodes = (input: Player[]): PlayerNode[] => {
    return input.map(player => {
        return {
            id: player.bref_id,
            label: player.name.replace('*', '')
        };
    });
};

const constructNodes = (player: Player, teammates: Player[]): StartingInfo => {
    const playersAsNodes = formatPlayerNodes(teammates);
    const playerFormatted = formatPlayerNodes([player]);
    const allPlayers = [...playersAsNodes, ...playerFormatted];

    return {
        nodes: allPlayers,
        teammates: playersAsNodes,
        centralPlayer: playerFormatted[0]
    };
};

const constructStartingInfo = (hofPlayers: Player[]): StartingInfo => {
    const RANDOM_HOF_PLAYER = hofPlayers[Math.floor(Math.random() * hofPlayers.length)];
    const playersTeammates = getTeammatesFromPlayer(RANDOM_HOF_PLAYER);
    const { nodes, centralPlayer, teammates } = constructNodes(RANDOM_HOF_PLAYER, playersTeammates);

    return {
        nodes,
        teammates,
        centralPlayer
    };
};

const constructEdgesFromStartingInfo = (startingInfo: StartingInfo): PlayerEdge[] => {
    const uniqueTeammates = Array.from(new Set(startingInfo.teammates));
    return uniqueTeammates.map(playerObj => {
        return {
            from: startingInfo.centralPlayer.id,
            to: playerObj.id
        };
    });
};

export {
    formatPlayerNodes,
    constructStartingInfo,
    constructEdgesFromStartingInfo,
    constructNodes
};
