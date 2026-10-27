import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import NavigationBar from '../../components/presentational/static/NavigationBar';

export default {
    title: 'Static/NavigationBar',
    component: NavigationBar
} as Meta;

const Template: Story = args => <NavigationBar {...args}/>;

export const BasicNavigationBar = Template.bind({});
