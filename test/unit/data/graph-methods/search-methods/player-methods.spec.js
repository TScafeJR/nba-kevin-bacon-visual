const { expect } = require('chai');

const { findPlayerIdFromName } = require('../../../../../src/data/graph-methods/search-methods/player-methods');
const { mockPlayerArr } = require('./mock-data');

describe('Player Methods', () => {
    describe('findPlayerIdFromName', () => {
        it('returns the id of a player from an arr of players', () => {
            expect(findPlayerIdFromName('Nick Anderson', mockPlayerArr)).to.eql('anderni01');
        });

        it('can format the spaces at the end and beginning of the player name to return the id', () => {
            expect(findPlayerIdFromName(' Nick Anderson ', mockPlayerArr)).to.eql('anderni01');
        });
    });
});
