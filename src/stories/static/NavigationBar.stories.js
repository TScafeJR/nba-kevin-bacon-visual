import React from 'react';
import NavigationBar from '../../components/presentational/static/NavigationBar';

export default {
    title: 'Static/NavigationBar',
    component: NavigationBar
};

const Template = args => <NavigationBar {...args}/>;

export const BasicNavigationBar = Template.bind({});
