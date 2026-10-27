/* eslint-disable camelcase */ // keys mirror the snake_case player JSON
import playerData from './output.json';
import playerArr from './player-data2.json';
import { Player, PlayersById, RawPlayer } from '../types';

type FormattedPlayer = Omit<Player, 'teams' | 'teammates' | 'isHOFer'> & { teams: Set<string> };

const createSetOfSeasons = (player: RawPlayer): Set<string> => {
    const teams = player.teams.map(team => {
        if (team.team_id === 'TOT') {
            return '';
        }

        return `${team.league_id}-${team.team_id}-${team.season_year}`;
    });

    return new Set(teams.filter(team => team.length > 0));
};

const formatPlayerObj = (player: RawPlayer): FormattedPlayer => {
    return {
        career_start: player.career_start,
        career_end: player.career_end,
        position: player.position,
        height: player.height,
        weight: player.weight,
        birth_date: player.birth_date,
        colleges: player.colleges,
        name: player.name,
        bref_id: player.bref_id,
        bref_letter: player.bref_letter,
        teams: createSetOfSeasons(player)
    };
};

const formattedPlayers = playerData.map(player => formatPlayerObj(player));

const findTeammates = (
    playerToCompare: FormattedPlayer,
    allPlayers: FormattedPlayer[]
): string[] => {
    return allPlayers
        .reduce<FormattedPlayer[]>((arr, player) => {
            if([...player.teams].filter(team => playerToCompare.teams.has(team)).length) {
                arr.push(player);
            }
            return arr;
        }, [])
        .map(player => player.bref_id);
};

const playersWithTeammates = formattedPlayers
    .map(player => ({ ...player, teammates: findTeammates(player, formattedPlayers) }))
    .map(player => ({ ...player, teams: Array.from(player.teams) }));

const playersObj = playersWithTeammates.reduce<PlayersById>((obj, individualPlayer) => {
    obj[individualPlayer.bref_id] = individualPlayer;
    return obj;
}, {});

const addHOFStatus = (playerInfo: Player[]): Player[] => {
    return playerInfo.map(player => ({ ...player, isHOFer: player.name.includes('*') }));
};

const filterSelfOutTeammatesArr = (players: Player[]): Player[] => {
    return players.map(player => {
        const teammates = player.teammates.filter(filterPlayer => filterPlayer !== player.bref_id);
        return { ...player, teammates };
    });
};

console.log(JSON.stringify(filterSelfOutTeammatesArr(playerArr)));
