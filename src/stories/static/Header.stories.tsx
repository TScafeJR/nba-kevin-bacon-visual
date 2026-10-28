import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Header from '../../components/presentational/static/Header';

const meta = {
    title: 'Static/Header',
    component: Header
} satisfies Meta<typeof Header>;

export default meta;

export const PrimaryHeader: StoryObj<typeof meta> = {
    args: {
        onSelectPlayer: fn(),
        onRandomPlayer: fn()
    }
};
