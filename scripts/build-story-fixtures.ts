// Writes the slice of the player data that Storybook loads in place of the full files (see
// .storybook/main.ts): the players the stories build networks for and their teammates, with every
// teammate list trimmed to that slice so each network in it stays whole. The full files run to
// 6 MB each, which every story that touched the data compiled and parsed, and under load that
// timed story tests out. Run by `make data` after build-player-data.ts.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Player, PlayersById } from '../src/types/index.ts';

// every player a story builds a network or a hop link for
const ROOTS = ['jamesle01', 'malonka01', 'irvinky01', 'duranke01', 'mikange01'];

const DATA = new URL('../src/data/', import.meta.url);
const OUT = new URL('../src/stories/fixtures/', import.meta.url);

const players = JSON.parse(readFileSync(new URL('players-obj.json', DATA), 'utf8')) as PlayersById;

const missing = ROOTS.filter(id => !players[id]);
if (missing.length) {
    throw new Error(`Not in the player data: ${missing.join(', ')}`);
}

const ids = new Set(ROOTS.flatMap(id => [id, ...players[id].teammates.filter(teammate => players[teammate])]));
const slice: Player[] = Array.from(ids).sort().map(id => ({
    ...players[id],
    teammates: players[id].teammates.filter(teammate => ids.has(teammate))
}));
const sliceById = slice.reduce<PlayersById>((obj, player) => {
    obj[player.bref_id] = player;
    return obj;
}, {});

mkdirSync(OUT, { recursive: true });
writeFileSync(new URL('players-obj.json', OUT), JSON.stringify(sliceById));
writeFileSync(new URL('player-data3.json', OUT), JSON.stringify(slice));
console.log(`Wrote ${slice.length} of ${Object.keys(players).length} players for the stories`);
