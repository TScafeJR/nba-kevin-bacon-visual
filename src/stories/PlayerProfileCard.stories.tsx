import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import PlayerProfileCard from '../components/presentational/PlayerProfileCard';

const meta = {
    title: 'Components/PlayerProfileCard',
    component: PlayerProfileCard,
    decorators: [
        Story => (
            <div style={{ width: 384 }}>
                <Story />
            </div>
        )
    ],
    args: {
        node: {
            id: 'malonmo01',
            name: 'Moses Malone',
            isHOFer: true,
            seasons: 21,
            degree: 209,
            degreeCentrality: 0.0386,
            betweenness: 0.0511,
            degreeRank: 85,
            betweennessRank: 2
        },
        nodeCount: 5416,
        era: '1947–2026',
        photo: {
            url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Moses_Malone_%28cropped%29.jpg/250px-Moses_Malone_%28cropped%29.jpg',
            page: 'https://commons.wikimedia.org/wiki/File:Moses_Malone_(cropped).jpg',
            author: 'Basketball_Legends.jpg: Cpl. Lameen Witter derivative work: JoeJohnson2 (talk)',
            license: 'Public domain'
        },
        onOpenNetwork: fn()
    }
} satisfies Meta<typeof PlayerProfileCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HallOfFamer: Story = {};

// most players before 1980 have no free photo, so their initials stand in
export const WithoutPhoto: Story = {
    args: {
        node: {
            id: 'hoffmpa01',
            name: 'Paul Hoffman',
            isHOFer: false,
            seasons: 5,
            degree: 102,
            degreeCentrality: 0.2012,
            betweenness: 0.0455,
            degreeRank: 1,
            betweennessRank: 1
        },
        nodeCount: 508,
        era: '1950–1960',
        photo: null
    }
};

export const OneTeam: Story = {
    args: {
        node: {
            id: 'birdla01',
            name: 'Larry Bird',
            isHOFer: true,
            seasons: 13,
            degree: 64,
            degreeCentrality: 0.1212,
            betweenness: 0.3429,
            degreeRank: 18,
            betweennessRank: 1
        },
        nodeCount: 529,
        era: 'BOS, 1947–2026',
        photo: {
            url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Larrybird.jpg/250px-Larrybird.jpg',
            page: 'https://commons.wikimedia.org/wiki/File:Larrybird.jpg',
            author: 'Kurt Shimala',
            license: 'CC BY-SA 2.0'
        }
    }
};

// a one-season player on the edge of the network bridges nothing at all
export const PeripheralPlayer: Story = {
    args: {
        node: {
            id: 'josepyv01',
            name: 'Yvon Joseph',
            isHOFer: false,
            seasons: 1,
            degree: 14,
            degreeCentrality: 0.0026,
            betweenness: 0,
            degreeRank: 5013,
            betweennessRank: 4067
        },
        nodeCount: 5416,
        era: '1947–2026',
        photo: null
    }
};
