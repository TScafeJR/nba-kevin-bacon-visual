import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import Searchbar from '../components/Searchbar';

export default {
    title: 'Components/Searchbar',
    component: Searchbar
} as Meta;

const Template: Story<ComponentProps<typeof Searchbar>> = args => <Searchbar {...args}/>;

export const BasicSearch = Template.bind({});

BasicSearch.args = {
    startingInfo: {
        centralPlayer: {
            id: 'tscafe01',
            label: 'Tyrone Scafe'
        }
    },
    displayPlayer: 'Tyrone Scafe',
    handleSearchChange: () => {}
};
