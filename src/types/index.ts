/* eslint-disable camelcase */ // keys mirror the snake_case player JSON
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

export type SearchChangeEvent = ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

// Shapes of the raw jsonpickle export in src/data/output.json
interface PySet<T> {
    'py/set': T[];
}

export interface RawSeasonEntry {
    'py/object': string;
    season_year: string;
    team_id: string;
    league_id: string;
}

export interface RawPlayer {
    'py/object': string;
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
    teams: RawSeasonEntry[];
    team_id_set: PySet<string>;
    teammates: PySet<string>;
    seasons: Array<{ 'py/id': number }>;
}
