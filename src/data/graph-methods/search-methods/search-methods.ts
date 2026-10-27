import playerData from '../../players-obj.json';
import { PlayersById } from '../../../types';

type PlayerTracker = Record<string, { depth: number }>;
type NodeTracker = Record<string, { distance: number; edgesToOrigin: string[] }>;

const searchByPlayer = (playerName: string) => [];

const searchBySeason = (seasonYear: string) => [];

// const stepThroughNodes = (currPlayer, visitedNodes, nodeTrackerObj, playerObj, currDistance) => {
//     const currPlayerTeammates = currPlayer.teammates
//     const nodesToVisit = currPlayerTeammates.filter(teammate => !visitedNodes.has(teammate))
//
//     nodesToVisit.forEach(nodeId => {
//         visitedNodes.add(nodeId)
//         nodeTrackerObj[nodeId].distance = currDistance;
//
//     })
//
//     return {
//         visitedNodes,
//         nodeTracker: nodeTrackerObj
//     }
// }

const grabPaths = (playerId: string, arr: string[]): string[] => {
    return arr.filter(key => key.split('.').slice(-1)[0] === playerId);
};

const populateTrackerLevel = (
    trackerObj: PlayerTracker,
    playerObj: PlayersById,
    currDepth: number,
    visitedNodes: Set<string>
): PlayerTracker => {
    const relevantKeys = Object.keys(trackerObj).filter(key => key.split('.').length === currDepth);
    relevantKeys.forEach(key => {
        const lastestId = key.split('.').slice(-1)[0];
        const { teammates } = playerObj[lastestId];
        const nodesToVisit = [...teammates].filter(teammate => !visitedNodes.has(teammate));

        nodesToVisit.forEach(unvisitedNodes => {
            const keyName = `${key}.${unvisitedNodes}`;
            trackerObj[keyName] = { depth: currDepth + 1 };
        });
    });

    return trackerObj;
};

// Uses Dijkstra’s Unidirectional Algorithm to find the shortest path between any two nodes.
// I need to change this to a bidirectional Dijkstra Search, the Unidirectional search time
// increases exponentionally on depths >= 3. This won't be feasible for a responsive web app
const findShortestPathBetweenTwoPlayers = (
    player1Id: string,
    player2Id: string,
    playerObj: PlayersById
): NodeTracker => {
    const playerIdArr = Object.keys(playerObj);
    const edgesArr = [player1Id];
    let currDistance = 1;
    const visitedNodes = new Set<string>();
    let playerQueue = playerObj[player1Id].teammates.slice();

    let playerTracker: PlayerTracker = {
        [player1Id]: { depth: 1 }
    };

    const nodeTracker = playerIdArr.reduce<NodeTracker>((obj, playerId) => {
        obj[playerId] = {
            distance: Infinity,
            edgesToOrigin: edgesArr.slice()
        };
        return obj;
    }, {});

    nodeTracker[player1Id].distance = 0;

    while (nodeTracker[player2Id].distance === Infinity) {
        const nodesToVisit = playerQueue.filter(teammate => !visitedNodes.has(teammate));

        playerTracker = populateTrackerLevel(playerTracker, playerData, currDistance, visitedNodes);

        nodesToVisit.forEach(playerId => {
            visitedNodes.add(playerId);
            nodeTracker[playerId].distance = currDistance;
            nodeTracker[playerId].edgesToOrigin = grabPaths(playerId, Object.keys(playerTracker));
        });

        playerQueue = playerQueue.map(playerId => playerObj[playerId].teammates).flat();
        currDistance++;
    }

    return nodeTracker;
};

// console.log(findShortestPathBetweenTwoPlayers('johnsma02', 'onealsh01', playerData));

export {
    grabPaths,
    findShortestPathBetweenTwoPlayers,
    populateTrackerLevel
};
