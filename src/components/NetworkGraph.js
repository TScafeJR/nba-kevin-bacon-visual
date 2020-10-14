import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Graph from 'react-graph-vis';


class NetworkGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            graphNodes: this.props.startingNodes,
            graphEdges: this.props.startingEdges

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
                    treeSpacing: 800,
                    shakeTowards: 'roots'
                }
            },
            nodes: {
                // shape: 'database'
            },
            edges: {
                color: '#000000'
            },
            height: '700px'
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
