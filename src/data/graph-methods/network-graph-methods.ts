import * as playerMethods from './search-methods/player-methods';
import * as nodeMethods from './node-methods';
import { PlayerEdge, PlayerNode } from '../../types';

const getNodesAndEdgesFromPlayerName = (
    playerName: string
): { nodes: PlayerNode[]; edges: PlayerEdge[] } => {
    const playerId = playerMethods.findPlayerIdFromName(playerName);
    const player = playerMethods.getPlayerFromId(playerId);

    const playerTeammates = playerMethods.getTeammatesFromPlayer(player);

    const nodeInfo = nodeMethods.constructNodes(player, playerTeammates);

    return {
        nodes: nodeInfo.nodes,
        edges: nodeMethods.constructEdgesFromStartingInfo(nodeInfo)
    };
};

const filterPlayerNodesArr = <T extends { id: string }>(oldArr: T[], newArr: T[]): T[] => {
    const containerObj: Record<string, T> = {};
    const filteredArr = [...oldArr, ...newArr]
        .filter(element => newArr.map(ele => ele.id).includes(element.id));


    filteredArr.forEach(element => {
        if (!containerObj[element.id]){
            containerObj[element.id] = element;
        }
    });


    return Object.values(containerObj);
};

const filterPlayerEdgesArr = (centralPlayer: string, edgesComboArr: PlayerEdge[]): PlayerEdge[] => {
    return edgesComboArr
        .filter(element => {
            return (
                (element.to === centralPlayer || element.from === centralPlayer) &&
                element.to !== element.from
            );
        });
};

export {
    getNodesAndEdgesFromPlayerName,
    filterPlayerNodesArr,
    filterPlayerEdgesArr
};
