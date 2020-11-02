const { expect } = require('chai');

const { grabPaths } = require('../../../../../src/data/graph-methods/search-methods/search-methods');

describe('Search methods', () => {
    describe('grabPaths', () => {
        it('returns an array of paths where the last element equals the playerId for every element', () => {
            const playerId = 'tscafe01';
            const pathArr = [
                'abc.few.rbtwef.tscafe01',
                'wqs.fef.wfered.regr',
                'sdf.fwfe.wfewrw.gerr',
                'gte.cde.gergrv.tscafe01',
                'ger.rtrb.ergrr.egrgg',
                'ergre.cde.reger.grreg',
                'gegr.brrt.egrerg.egrggr',
                'ewqe.rbtrb.e33323r.tscafe01'
            ];

            grabPaths(playerId, pathArr).forEach(playerPath => {
                expect(playerPath.split('.').slice(-1)[0] === playerId).to.be.true;
            });
        });
    });
});
