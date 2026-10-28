import type { PlayersById } from '../src/types/index.ts';

// One team's roster in one season, with the teammate pairs it forms worked out up front, so a
// subgraph is assembled from precomputed edges rather than from rosters on every request.
export interface Roster {
    league: string;
    team: string;
    // the season's end year, 1986 for 1985-86, as everywhere else in the app
    year: number;
    // indices into TemporalIndex.playerIds
    players: Int32Array;
    // flat pairs of player indices, [a0, b0, a1, b1, ...] with a < b in each pair
    edges: Int32Array;
}

// A subgraph in compressed sparse row form: the neighbours of node i are
// targets[offsets[i]] up to targets[offsets[i + 1]]. The arrays sit on SharedArrayBuffers so
// every worker can read one copy instead of each receiving its own.
export interface Subgraph {
    ids: string[];
    offsets: Int32Array;
    targets: Int32Array;
    edgeCount: number;
}

// rosters ordered by year, with the years alongside for binary search
interface Timeline {
    years: number[];
    rosters: Roster[];
}

// "NBA-UTA-1985-86" -> the league, the team and the season's end year
const parseTeamKey = (key: string): { league: string; team: string; year: number } => {
    const [league, team, startYear] = key.split('-');
    return { league, team, year: Number(startYear) + 1 };
};

// the first position in a sorted array whose value is at least `value`
const lowerBound = (sorted: number[], value: number): number => {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
        const mid = (low + high) >>> 1;
        if (sorted[mid] < value) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
};

const sharedInt32 = (length: number): Int32Array => {
    return new Int32Array(new SharedArrayBuffer(length * Int32Array.BYTES_PER_ELEMENT));
};

const buildTimeline = (rosters: Roster[]): Timeline => ({
    years: rosters.map(roster => roster.year),
    rosters
});

export class TemporalIndex {
    readonly playerIds: string[];
    readonly firstYear: number;
    readonly lastYear: number;
    private readonly all: Timeline;
    private readonly byTeam: Map<string, Timeline>;
    private readonly byYearAndTeam: Map<string, Roster[]>;

    constructor(players: PlayersById) {
        this.playerIds = Object.keys(players).sort();
        const indexOf = new Map(this.playerIds.map((id, index) => [id, index]));

        const members = new Map<string, number[]>();
        this.playerIds.forEach((id, index) => {
            new Set(players[id].teams).forEach(key => {
                members.set(key, [...members.get(key) ?? [], index]);
            });
        });

        const rosters = Array.from(members, ([key, indices]): Roster => {
            const sorted = Array.from(new Set(indices)).sort((a, b) => a - b);
            const edges: number[] = [];
            sorted.forEach((a, i) => sorted.slice(i + 1).forEach(b => edges.push(a, b)));
            return { ...parseTeamKey(key), players: Int32Array.from(sorted), edges: Int32Array.from(edges) };
        }).sort((a, b) => a.year - b.year || a.team.localeCompare(b.team));

        if (!rosters.length || indexOf.size !== this.playerIds.length) {
            throw new Error('The player data has no team seasons to index');
        }

        this.all = buildTimeline(rosters);
        this.firstYear = rosters[0].year;
        this.lastYear = rosters[rosters.length - 1].year;

        const teamRosters = new Map<string, Roster[]>();
        this.byYearAndTeam = new Map();
        rosters.forEach(roster => {
            teamRosters.set(roster.team, [...teamRosters.get(roster.team) ?? [], roster]);
            const key = `${roster.year}:${roster.team}`;
            this.byYearAndTeam.set(key, [...this.byYearAndTeam.get(key) ?? [], roster]);
        });
        this.byTeam = new Map(Array.from(teamRosters, ([team, list]) => [team, buildTimeline(list)]));
    }

    // O(1): one team's season, a list because a code can be reused across leagues
    rostersFor(year: number, team: string): Roster[] {
        return this.byYearAndTeam.get(`${year}:${team}`) ?? [];
    }

    // O(log n + k) for the k rosters in the range, from a binary search on the timeline
    rostersInRange(startYear: number, endYear: number, team?: string): Roster[] {
        const timeline = team ? this.byTeam.get(team) : this.all;
        if (!timeline) {
            return [];
        }
        return timeline.rosters.slice(
            lowerBound(timeline.years, startYear),
            lowerBound(timeline.years, endYear + 1)
        );
    }

    // team codes with at least one season in the range
    teamsInRange(startYear: number, endYear: number): string[] {
        return Array.from(new Set(this.rostersInRange(startYear, endYear).map(roster => roster.team))).sort();
    }

    hasTeam(team: string): boolean {
        return this.byTeam.has(team);
    }

    // everyone who played in the range (for the team, if given), linked when they shared a
    // roster in it; a pair who were teammates for several seasons still gets one edge
    subgraph(startYear: number, endYear: number, team?: string): Subgraph {
        const rosters = this.rostersInRange(startYear, endYear, team);
        const total = this.playerIds.length;
        const local = new Map<number, number>();
        const pairs = new Set<number>();
        rosters.forEach(roster => {
            roster.players.forEach(player => {
                if (!local.has(player)) {
                    local.set(player, local.size);
                }
            });
            for (let i = 0; i < roster.edges.length; i += 2) {
                pairs.add(roster.edges[i] * total + roster.edges[i + 1]);
            }
        });

        const nodeCount = local.size;
        const ends = Array.from(pairs, pair => [
            local.get(Math.floor(pair / total)) ?? 0,
            local.get(pair % total) ?? 0
        ]);
        const offsets = sharedInt32(nodeCount + 1);
        ends.forEach(([a, b]) => {
            offsets[a + 1]++;
            offsets[b + 1]++;
        });
        for (let i = 0; i < nodeCount; i++) {
            offsets[i + 1] += offsets[i];
        }
        const targets = sharedInt32(ends.length * 2);
        const cursor = offsets.slice(0, nodeCount);
        ends.forEach(([a, b]) => {
            targets[cursor[a]++] = b;
            targets[cursor[b]++] = a;
        });

        const ids: string[] = [];
        local.forEach((index, player) => {
            ids[index] = this.playerIds[player];
        });
        return { ids, offsets, targets, edgeCount: ends.length };
    }
}
