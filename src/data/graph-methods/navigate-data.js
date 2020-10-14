const playerData = require('../player-data.json');

const lengths = playerData.map(player => player.teams.length);

console.log(lengths.reduce((x, y) => x+y, 0)/lengths.length);

// console.log(playerData.map(player => player.teammates.length))
