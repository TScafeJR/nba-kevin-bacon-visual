import type { Player, PlayersById } from '../../../src/types/index.ts';

// "BOS", 1986 -> "NBA-BOS-1985-86"
export const teamKey = (team: string, year: number): string => {
    return `NBA-${team}-${year - 1}-${String(year).slice(2)}`;
};

export const player = (id: string, seasons: Array<[string, number]>): Player => ({
    career_start: String(Math.min(...seasons.map(([, year]) => year))),
    career_end: String(Math.max(...seasons.map(([, year]) => year))),
    position: 'F',
    height: '6-8',
    weight: '220',
    birth_date: '',
    colleges: '',
    name: id === 'a' ? 'Player A*' : `Player ${id.toUpperCase()}`,
    bref_id: id,
    bref_letter: id[0],
    teams: seasons.map(([team, year]) => teamKey(team, year)),
    teammates: []
});

// a and b play together for two Boston seasons, c joins them for the second and then moves to
// the Lakers with d, so c is the only bridge between {a, b} and d; e plays alone, later
export const smallLeague: PlayersById = {
    a: player('a', [['BOS', 1985], ['BOS', 1986]]),
    b: player('b', [['BOS', 1985], ['BOS', 1986]]),
    c: player('c', [['BOS', 1986], ['LAL', 1987]]),
    d: player('d', [['LAL', 1987]]),
    e: player('e', [['LAL', 1990]])
};

// enough players that the service splits the work across workers, with rosters that reshuffle
// every season so the network is connected but uneven
export const largeLeague = (): PlayersById => {
    const players: PlayersById = {};
    for (let i = 0; i < 480; i++) {
        const id = `p${String(i).padStart(3, '0')}`;
        const first = 1950 + i % 20;
        const seasons: Array<[string, number]> = [];
        for (let year = first; year < first + 3 + i % 5; year++) {
            seasons.push([`T${(i * 7 + year * 3) % 12}`, year]);
        }
        players[id] = player(id, seasons);
    }
    return players;
};
