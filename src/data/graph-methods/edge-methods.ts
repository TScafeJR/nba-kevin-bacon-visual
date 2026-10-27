import playerData from '../output.json';
import { RawPlayer } from '../../types';

const getAllEdges = (input: RawPlayer[]) => {
    return input.map(player => player.name);
};

const formatEdgesOfPlayer = (player: RawPlayer) => {
    return player.teammates['py/set'].map(teammate => {
        return {
            from: player.bref_id,
            to: teammate
        };
    });
};

const calcSize = (player: RawPlayer) => {
    return player.teammates['py/set'].length;
};
