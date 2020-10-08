import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Graph from 'react-graph-vis';

const CONSTANTS = require('../data/constants');

class NetworkGraph extends Component {
    render() {
        const graph = {
            nodes: CONSTANTS.NODES,
            edges: [
                { from: 'abdelal01', to: 'abdulza01' },
                { from: 'abdulka01', to: 'abdelal01' },
                { from: 'abdulza01', to: 'abdulka01' },
                // { from: 2, to: 5 }
            ]
        };

        const options = {
            layout: {
                hierarchical: false
            },
            edges: {
                color: '#000000'
            },
            height: '500px'
        };

        const events = {
            select: function(event) {
                var { nodes, edges } = event;
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
