import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import Searchbar from '../components/Searchbar';

const meta = {
    title: 'Components/Searchbar',
    component: Searchbar
} satisfies Meta<typeof Searchbar>;

export default meta;

export const BasicSearch: StoryObj<typeof meta> = {
    args: {
        onSelectPlayer: fn()
    }
};
