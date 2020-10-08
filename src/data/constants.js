const NodeMethods = require('./graph-methods/node-methods');

const playerData = require('./output.json');

const NODES = NodeMethods.getAllNodes(playerData).slice(0,5)

module.exports = {
    NODES
}
