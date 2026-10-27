import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Graph, { GraphEvents } from 'react-graph-vis';
import '../style/NetworkGraph.css';

import {
    getNodesAndEdgesFromPlayerName,
    filterPlayerNodesArr,
    filterPlayerEdgesArr
} from '../data/graph-methods/network-graph-methods';
import { findPlayerIdFromName } from '../data/graph-methods/search-methods/player-methods';
import { Player, PlayerEdge, PlayerNode } from '../types';

interface NetworkGraphProps {
    startingNodes: PlayerNode[];
    startingEdges: PlayerEdge[];
    displayPlayer: string;
    playerData: Array<Pick<Player, 'name'>>;
}

interface NetworkGraphState {
    graphNodes: PlayerNode[];
    graphEdges: PlayerEdge[];
    playerNameArr: string[];
}

class NetworkGraph extends Component<NetworkGraphProps, NetworkGraphState> {
    constructor(props: NetworkGraphProps) {
        super(props);
        this.state = {
            graphNodes: this.props.startingNodes,
            graphEdges: this.props.startingEdges,
            playerNameArr: this.props.playerData.map(playerObj => playerObj.name.replace('*', ''))
        };
    }

    handlePlayerChange(playerName: string){
        const formattedPlayerName = playerName.trim();
        if (this.state.playerNameArr.includes(formattedPlayerName)){
            const { edges, nodes } = getNodesAndEdgesFromPlayerName(formattedPlayerName);
            const currPlayerId = findPlayerIdFromName(formattedPlayerName);
            const combinedEdgeArr = [...this.state.graphEdges, ...edges];

            const filteredNodes = filterPlayerNodesArr(this.state.graphNodes, nodes);
            const filteredEdges = filterPlayerEdgesArr(currPlayerId, combinedEdgeArr);

            this.setState({
                graphNodes: filteredNodes,
                graphEdges: filteredEdges
            });
        }
    }

    componentDidUpdate(prevProps: NetworkGraphProps) {
        if (this.props.displayPlayer !== prevProps.displayPlayer) {
            this.handlePlayerChange(this.props.displayPlayer);
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

        const events: GraphEvents = {
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
