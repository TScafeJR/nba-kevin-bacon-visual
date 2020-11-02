const { expect } = require('chai');
const { filterPlayerNodesArr, filterPlayerEdgesArr } = require('../../../../src/data/graph-methods/network-graph-methods');

describe('Network Graph Methods', () => {
    describe('filterArr', () => {
        const newArr = [
            { id: '1' },
            { id: '3' },
            { id: '5' },
            { id: '11' },
            { id: '13' }
        ];

        const oldArr = [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '7' },
            { id: '9' }
        ];

        it('Removes all of the elements from the old array not in new arr', () => {
            const finalArr = filterPlayerNodesArr(oldArr, newArr);
            const finalArrIds = finalArr.map(ele => ele.id);

            ['2', '7', '9'].forEach(element => {
                expect(!finalArrIds.includes(element));
            });
        });

        it('Returns all of the elements from the new array', () => {
            const finalArr = filterPlayerNodesArr(oldArr, newArr);
            const finalArrIds = finalArr.map(ele => ele.id);

            ['1', '3', '5', '11', '13'].forEach(element => {
                expect(finalArrIds.includes(element));
            });
        });

        it('Should not contain any duplicates', () => {
            const finalArr = filterPlayerNodesArr(oldArr, newArr);
            const finalArrIds = finalArr.map(ele => ele.id);
            expect(finalArrIds.length).to.eql(new Set(finalArrIds).size);
        });
    });

    describe('filterPlayerEdgesArr', () => {
        it('has every element with the current player id', () => {
            const playerId = 'tscafe01';
            const edgeArr = [
                {to: 'asantos01', from: 'tscafe01'},
                {to: 'asantos01', from: 'dadebayo01'},
                {to: 'tscafe01', from: 'iashmore01'},
                {to: 'bpolicard01', from: 'tscafe01'},
                {to: 'bpolicard01', from: 'dadebayo'},
                {to: 'bpolicard01', from: 'asantos01'},
                {to: 'tscafe02', from: 'asantos01'}
            ];

            const finalArr = filterPlayerEdgesArr(playerId, edgeArr);
            finalArr.forEach(element => {
                const hasPlayerIdVal = element.to === playerId || element.from === playerId;
                expect(hasPlayerIdVal).to.be.true;
            });
        });
    });
});
