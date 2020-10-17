import React from 'react';
import NetworkGraph from '../components/NetworkGraph';

export default {
    title: 'Components/NetworkGraph',
    component: NetworkGraph
}

const Template = (args) => <NetworkGraph {...args}/>

export const Primary = Template.bind({});
Primary.args = {
    startingEdges: [
        {to: 'first', from: 'second'},
        {to: 'first', from: 'third'},
        {to: 'first', from: 'fourth'},
        {to: 'third', from: 'second'}
    ],
    startingNodes: [
        {id: 'first', label: 'First Node'},
        {id: 'second', label: 'Second Node'},
        {id: 'third', label: 'Third Node'},
        {id: 'fourth', label: 'Fourth Node'},
    ]
}
