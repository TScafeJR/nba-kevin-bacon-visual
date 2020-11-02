import React from 'react';
import Header from '../../components/presentational/static/Header';

export default {
    title: 'Static/Header',
    component: Header
};

const Template = args => <Header {...args}/>;

export const PrimaryHeader = Template.bind({});

PrimaryHeader.args = {
    startingInfo: {},
    displayPlayer: 'Kobe Bryant',
    handleSearchChange: () => {}
}
