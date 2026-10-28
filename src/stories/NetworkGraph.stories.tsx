import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import NetworkGraph from '../components/NetworkGraph';
import { buildPlayerNetwork } from '../data/graph-methods/player-network-methods';

const meta = {
    title: 'Components/NetworkGraph',
    component: NetworkGraph,
    decorators: [
        Story => (
            <div style={{ height: 640, display: 'grid' }}>
                <Story />
            </div>
        )
    ]
} satisfies Meta<typeof NetworkGraph>;

export default meta;

export const Primary: StoryObj<typeof meta> = {
    args: {
        network: buildPlayerNetwork('malonka01'),
        hoveredId: null,
        onSelectPlayer: fn(),
        onHoverPlayer: fn()
    }
};
