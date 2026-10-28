import playersObj from '../players-obj.json';
import { Player, PlayerNetwork, PlayersById, SeasonEntry, TeammateLink } from '../../types';

// A team entry reads "NBA-UTA-1985-86": league, franchise code, season
const parseTeamEntry = (entry: string): Omit<SeasonEntry, 'teammateCount'> => {
    const [league, franchise, startYear, endYear] = entry.split('-');
    return {
        key: entry,
        league,
        franchise,
        season: `${startYear}-${endYear}`,
        endYear: Number(startYear) + 1
    };
};

const cleanName = (name: string): string => name.replace('*', '');

const isHallOfFamer = (player: Player): boolean => player.name.includes('*');

// "1986–2003", or "1991" for a single season
const formatYearSpan = (first: number, last: number): string => {
    return first === last ? `${first}` : `${first}–${last}`;
};

const buildTeammateLink = (player: Player, teammate: Player): TeammateLink => {
    const playerTeams = new Set(player.teams);
    const shared = teammate.teams.filter(entry => playerTeams.has(entry)).map(parseTeamEntry);
    const sharedYears = Array.from(new Set(shared.map(entry => entry.endYear)))
        .sort((a, b) => a - b);

    // the franchise they spent the most seasons on together, ties to the earliest
    const yearsByFranchise = shared.reduce<Record<string, number>>((counts, entry) => {
        counts[entry.franchise] = (counts[entry.franchise] || 0) + 1;
        return counts;
    }, {});
    const franchises = Object.keys(yearsByFranchise);
    const franchise = franchises.reduce(
        (best, code) => yearsByFranchise[code] > yearsByFranchise[best] ? code : best,
        franchises[0]
    );

    return {
        id: teammate.bref_id,
        name: cleanName(teammate.name),
        isHOFer: isHallOfFamer(teammate),
        seasonsTogether: sharedYears.length,
        franchise,
        franchises,
        sharedTeamKeys: shared.map(entry => entry.key),
        yearSpan: sharedYears.length ? formatYearSpan(sharedYears[0], sharedYears[sharedYears.length - 1]) : ''
    };
};

const buildPlayerNetwork = (playerId: string, players: PlayersById = playersObj): PlayerNetwork => {
    const player = players[playerId];
    // the source lists some players as their own teammate, and some teammates twice
    const teammateIds = Array.from(new Set(player.teammates))
        .filter(teammateId => teammateId !== player.bref_id);
    const teammates = teammateIds
        .map(teammateId => players[teammateId])
        .filter(Boolean)
        .map(teammate => buildTeammateLink(player, teammate))
        .sort((a, b) => b.seasonsTogether - a.seasonsTogether || a.name.localeCompare(b.name));

    const seasons: SeasonEntry[] = player.teams.map(entry => ({
        ...parseTeamEntry(entry),
        teammateCount: teammates.filter(teammate => teammate.sharedTeamKeys.includes(entry)).length
    }));

    const franchises = Array.from(new Set(seasons.map(entry => entry.franchise)));
    const seasonCount = new Set(seasons.map(entry => entry.endYear)).size;

    return {
        id: player.bref_id,
        name: cleanName(player.name),
        isHOFer: isHallOfFamer(player),
        player,
        teammates,
        seasons,
        franchises,
        seasonCount,
        hofTeammateCount: teammates.filter(teammate => teammate.isHOFer).length
    };
};

export {
    parseTeamEntry,
    cleanName,
    isHallOfFamer,
    formatYearSpan,
    buildTeammateLink,
    buildPlayerNetwork
};
