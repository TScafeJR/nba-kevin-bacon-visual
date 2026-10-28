import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import NavigationBar from '../../components/presentational/static/NavigationBar';

const meta = {
    title: 'Static/NavigationBar',
    component: NavigationBar
} satisfies Meta<typeof NavigationBar>;

export default meta;

export const BasicNavigationBar: StoryObj<typeof meta> = {
    args: {
        onRandomPlayer: fn()
    }
};
