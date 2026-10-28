import type { ChangeEvent } from 'react';

export interface Player {
    career_start: string;
    career_end: string;
    position: string;
    height: string;
    weight: string;
    birth_date: string;
    colleges: string;
    name: string;
    bref_id: string;
    bref_letter: string;
    teams: string[];
    teammates: string[];
    isHOFer?: boolean;
}

export type PlayersById = Record<string, Player>;

export interface PlayerNode {
    id: string;
    label: string;
}

export interface PlayerEdge {
    from: string;
    to: string;
}

export interface StartingInfo {
    nodes: PlayerNode[];
    teammates: PlayerNode[];
    centralPlayer: PlayerNode;
}

export interface SeasonEntry {
    key: string;
    league: string;
    franchise: string;
    season: string;
    endYear: number;
    teammateCount: number;
}

export interface TeammateLink {
    id: string;
    name: string;
    isHOFer: boolean;
    seasonsTogether: number;
    franchise: string;
    franchises: string[];
    sharedTeamKeys: string[];
    yearSpan: string;
}

export interface PlayerNetwork {
    id: string;
    name: string;
    isHOFer: boolean;
    player: Player;
    teammates: TeammateLink[];
    seasons: SeasonEntry[];
    franchises: string[];
    seasonCount: number;
    hofTeammateCount: number;
}

// one player's totals for one team in one season, null where the league did not track the stat
export interface StintTotals {
    g: number;
    mp: number | null;
    fg: number | null;
    fga: number | null;
    trb: number | null;
    ast: number | null;
    pts: number | null;
}

// keyed by player id, then by team key ("NBA-UTA-1985-86")
export type StatsById = Record<string, Record<string, StintTotals>>;

export interface StatLine {
    games: number;
    points: number | null;
    rebounds: number | null;
    assists: number | null;
    fieldGoalPct: number | null;
}

// a Wikimedia Commons thumbnail and the credit its license asks for
export interface PlayerPhoto {
    url: string;
    page: string;
    author: string;
    license: string;
}

export type PhotosById = Record<string, PlayerPhoto>;

export type CentralitySort = 'betweenness' | 'degree';

// one player's place in the teammate network of a range of seasons, from GET /api/network
export interface CentralityNode {
    id: string;
    name: string;
    isHOFer: boolean;
    // seasons played in the range, on the team if the request named one
    seasons: number;
    // distinct teammates in the range, and that as a share of everyone else who played in it
    degree: number;
    degreeCentrality: number;
    // the share of shortest teammate paths between other players that run through this one, 0 to 1
    betweenness: number;
    degreeRank: number;
    betweennessRank: number;
}

export interface NetworkResponse {
    startYear: number;
    endYear: number;
    team: string | null;
    sort: CentralitySort;
    nodeCount: number;
    edgeCount: number;
    nodes: CentralityNode[];
    // the player named by ?focus=, wherever they rank, or null when they did not play in the range
    focus: CentralityNode | null;
}

export interface TeamsResponse {
    startYear: number;
    endYear: number;
    teams: string[];
}

export type SearchChangeEvent = ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

// Shapes of the raw jsonpickle export in src/data/output.json
interface PySet<T> {
    'py/set': T[];
}

export interface RawSeasonEntry {
    'py/object': string;
    'season_year': string;
    'team_id': string;
    'league_id': string;
}

export interface RawPlayer {
    'py/object': string;
    'career_start': string;
    'career_end': string;
    'position': string;
    'height': string;
    'weight': string;
    'birth_date': string;
    'colleges': string;
    'name': string;
    'bref_id': string;
    'bref_letter': string;
    'teams': RawSeasonEntry[];
    'team_id_set': PySet<string>;
    'teammates': PySet<string>;
    'seasons': Array<{ 'py/id': number }>;
}
