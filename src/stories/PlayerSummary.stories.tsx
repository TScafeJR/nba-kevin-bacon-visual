import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import PlayerSummary from '../components/presentational/PlayerSummary';
import { buildPlayerNetwork } from '../data/graph-methods/player-network-methods';

const meta = {
    title: 'Components/PlayerSummary',
    component: PlayerSummary,
    // the header card spans the canvas's six columns and each tile two, as in the app
    decorators: [
        Story => (
            <div className="canvas" style={{ maxWidth: 1208, padding: 24 }}>
                <Story />
            </div>
        )
    ],
    args: {
        network: buildPlayerNetwork('jamesle01'),
        photo: {
            url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/250px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg',
            page: 'https://commons.wikimedia.org/wiki/File:LeBron_James_(51959977144)_(cropped2).jpg',
            author: 'Erik Drost',
            license: 'CC BY 2.0'
        },
        // LeBron James's career line, computed from src/data/player-stats.json
        career: {
            games: 1622,
            points: 26.781750924784216,
            rebounds: 7.4568434032059185,
            assists: 7.408138101109741,
            fieldGoalPct: 0.5066662434131166
        },
        statsLoaded: true
    }
} satisfies Meta<typeof PlayerSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    play: async({ canvas }) => {
        await expect(canvas.getByRole('heading', { level: 1, name: 'LeBron James' })).toBeVisible();
        await expect(canvas.getByText('253')).toBeVisible();
        await expect(canvas.getByText('26.8')).toBeVisible();
        await expect(canvas.getByText(/1,622 games · 50.7% from the field/)).toBeVisible();
        await expect(canvas.getByRole('link', { name: /Erik Drost, CC BY 2.0/ })).toBeVisible();
    }
};

// before the box scores arrive, the career tile holds its place with bars of the values' size
export const LoadingCareer: Story = {
    args: { career: null, statsLoaded: false },
    play: async({ canvas }) => {
        await expect(canvas.getByLabelText('Loading career numbers')).toBeVisible();
    }
};

// the fallback for a player without box scores or a photo: initials, and a sentence in the tile
export const NoBoxScoresOrPhoto: Story = {
    args: { network: buildPlayerNetwork('mikange01'), photo: null, career: null, statsLoaded: true },
    play: async({ canvas }) => {
        await expect(canvas.getByText('GM')).toBeInTheDocument();
        await expect(canvas.getByText('No box scores on record.')).toBeVisible();
    }
};
