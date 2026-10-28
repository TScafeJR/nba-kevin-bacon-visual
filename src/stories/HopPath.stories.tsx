import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import HopPath, { HopLink } from '../components/presentational/HopPath';
import { buildPlayerNetwork } from '../data/graph-methods/player-network-methods';
import { PlayerPhoto } from '../types';

// real Wikimedia Commons photos from src/data/player-photos.json
const PHOTOS: Record<string, PlayerPhoto> = {
    jamesle01: {
        url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/250px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg',
        page: 'https://commons.wikimedia.org/wiki/File:LeBron_James_(51959977144)_(cropped2).jpg',
        author: 'Erik Drost',
        license: 'CC BY 2.0'
    },
    varejan01: {
        url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Anderson_Varej%C3%A3o_2021.jpg/250px-Anderson_Varej%C3%A3o_2021.jpg',
        page: 'https://commons.wikimedia.org/wiki/File:Anderson_Varej%C3%A3o_2021.jpg',
        author: 'Erik Drost',
        license: 'CC BY 2.0'
    },
    ilgauzy01: {
        url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Zydrunas_Ilgauskas_Cleveland_Cavaliers.jpg/250px-Zydrunas_Ilgauskas_Cleveland_Cavaliers.jpg',
        page: 'https://commons.wikimedia.org/wiki/File:Zydrunas_Ilgauskas_Cleveland_Cavaliers.jpg',
        author: 'Keith Allison',
        license: 'CC BY-SA 2.0'
    },
    irvinky01: {
        url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Kyrie_Irving_-_51831823383.jpg/250px-Kyrie_Irving_-_51831823383.jpg',
        page: 'https://commons.wikimedia.org/wiki/File:Kyrie_Irving_-_51831823383.jpg',
        author: 'Erik Drost',
        license: 'CC BY 2.0'
    }
};

const lebron = buildPlayerNetwork('jamesle01');

// the real link between two players, read from the first one's network
const linkBetween = (from: string, to: string): HopLink | null => {
    const teammate = buildPlayerNetwork(from).teammates.find(link => link.id === to);
    return teammate
        ? { franchises: teammate.franchises, yearSpan: teammate.yearSpan, seasonsTogether: teammate.seasonsTogether }
        : null;
};

const stop = (id: string, name: string) => ({ id, name, photo: PHOTOS[id] ?? null });

const meta = {
    title: 'Components/HopPath',
    component: HopPath,
    args: {
        stops: [stop('jamesle01', 'LeBron James')],
        links: [],
        suggestions: lebron.teammates.slice(0, 3),
        photos: PHOTOS,
        onSelectPlayer: fn()
    }
} satisfies Meta<typeof HopPath>;

export default meta;

type Story = StoryObj<typeof meta>;

// a path of one stop offers the longest partnerships as the first hop
export const FirstHop: Story = {
    play: async({ args, canvas, userEvent }) => {
        await expect(canvas.getByRole('heading', { name: 'Hop from LeBron James' })).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: /Anderson Varejão/ }));
        await expect(args.onSelectPlayer).toHaveBeenCalledWith('varejan01');
    }
};

// two hops: each link names the team and seasons the two players shared, and an earlier stop goes back
export const TwoDegrees: Story = {
    args: {
        stops: [stop('jamesle01', 'LeBron James'), stop('irvinky01', 'Kyrie Irving'), stop('duranke01', 'Kevin Durant')],
        links: [linkBetween('jamesle01', 'irvinky01'), linkBetween('irvinky01', 'duranke01')],
        suggestions: []
    },
    play: async({ args, canvas, userEvent }) => {
        await expect(canvas.getByRole('heading', { name: '2 degrees from LeBron James' })).toBeVisible();
        await expect(canvas.getByText('Kevin Durant').closest('[aria-current="page"]')).not.toBeNull();
        await expect(canvas.getByText('CLE')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: /LeBron James/ }));
        await expect(args.onSelectPlayer).toHaveBeenCalledWith('jamesle01');
    }
};

// two stops that were never teammates still join, with a plain arrow and no team or years
export const UnknownLink: Story = {
    args: {
        stops: [stop('jamesle01', 'LeBron James'), stop('mikange01', 'George Mikan')],
        links: [null],
        suggestions: []
    },
    play: async({ canvas }) => {
        await expect(canvas.getByText('→')).toBeVisible();
        await expect(canvas.getByRole('heading', { name: '1 degree from LeBron James' })).toBeVisible();
    }
};
