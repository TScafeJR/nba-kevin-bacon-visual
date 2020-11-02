import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Graph from 'react-graph-vis';
import '../style/NetworkGraph.css';

const { getNodesAndEdgesFromPlayerName, filterPlayerNodesArr, filterPlayerEdgesArr } = require('../data/graph-methods/network-graph-methods');
const { findPlayerIdFromName } = require('../data/graph-methods/search-methods/player-methods');

class NetworkGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            graphNodes: this.props.startingNodes,
            graphEdges: this.props.startingEdges,
            currentPlayer: this.props.displayPlayer,
            playerNameArr: this.props.playerData.map(playerObj => playerObj.name.replace('*', ''))
        };
    }

    handlePlayerChange(){
        const formattedPlayerName = typeof this.state.currentPlayer === 'string' ? this.state.currentPlayer.trim() : '';
        if (this.state.playerNameArr.includes(formattedPlayerName)){
            const { edges, nodes } = getNodesAndEdgesFromPlayerName(formattedPlayerName);
            const currPlayerId = findPlayerIdFromName(this.state.currentPlayer);
            const combinedEdgeArr = [...this.state.graphEdges, ...edges];

            const filteredNodes = filterPlayerNodesArr(this.state.graphNodes, nodes);
            const filteredEdges = filterPlayerEdgesArr(currPlayerId, combinedEdgeArr);

            this.setState({
                graphNodes: filteredNodes,
                graphEdges: filteredEdges
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.displayPlayer !== prevProps.displayPlayer) {
            this.setState({ currentPlayer: this.props.displayPlayer });
            this.handlePlayerChange();
        }
    }

    render() {
        const graph = {
            nodes: this.state.graphNodes,
            edges: this.state.graphEdges
        };

        const options = {
            layout: {
                hierarchical: {
                    enabled: false,
                    nodeSpacing: 400,
                    treeSpacing: 800
                }
            },
            nodes: {
                // shape: 'database'
            },
            edges: {
                color: '#000000',
                arrows: {
                    to: {
                        enabled: false
                    },
                    from: {
                        enabled: false
                    }
                }
            },
            height: '600px'
        };

        const events = {
            select: function(event) {
                const { nodes, edges } = event;
            }
        };

        return (
            <div className='graph'>
                <Graph
                    graph={graph}
                    options={options}
                    events={events}
                    getNetwork={network => {
                        //  if you want access to vis.js network api you can set the state in a parent component using this property
                    }}
                />
            </div>
        );
    }
}

export default hot(module)(NetworkGraph);
