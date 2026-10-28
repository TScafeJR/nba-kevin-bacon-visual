import type { Meta, StoryObj } from '@storybook/react-vite';

import Footer from '../../components/presentational/static/Footer';

const meta = {
    title: 'Static/Footer',
    component: Footer
} satisfies Meta<typeof Footer>;

export default meta;

export const PrimaryFooter: StoryObj<typeof meta> = {
    args: {
        playerCount: 5416,
        lastSeason: 2026
    }
};
