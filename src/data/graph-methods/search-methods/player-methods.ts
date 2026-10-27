import playerData from '../../player-data3.json';
import playersObj from '../../players-obj.json';
import { Player, PlayersById } from '../../../types';

const findPlayerIdFromName = (
    searchPlayerName: string,
    playerArr: Player[] = playerData
): string => {
    const playerObj = playerArr.reduce<PlayersById>((obj, player) => {
        obj[player.name.replace('*', '')] = player;
        return obj;
    }, {});

    return playerObj[searchPlayerName.trim()].bref_id;
};

const getTeammatesFromPlayer = (player: Player, playerObj: PlayersById = playersObj): Player[] => {
    return player.teammates.map(playerId => playerObj[playerId]);
};

const getPlayerFromId = (playerId: string, playerObj: PlayersById = playersObj): Player => {
    return playerObj[playerId];
};

export {
    findPlayerIdFromName,
    getTeammatesFromPlayer,
    getPlayerFromId
};
