import React, { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import Header from '../../components/presentational/static/Header';
import * as CONSTANTS from '../../../src/data/constants';

export default {
    title: 'Static/Header',
    component: Header
} as Meta;

const Template: Story<ComponentProps<typeof Header>> = args => <Header {...args}/>;

export const PrimaryHeader = Template.bind({});

PrimaryHeader.args = {
    startingInfo: CONSTANTS.STARTING_INFO,
    displayPlayer: 'Kobe Bryant',
    handleSearchChange: () => {}
};
