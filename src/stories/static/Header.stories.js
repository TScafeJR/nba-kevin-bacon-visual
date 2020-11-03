import React from 'react';
import Header from '../../components/presentational/static/Header';

const CONSTANTS = require('../../../src/data/constants');

export default {
    title: 'Static/Header',
    component: Header
};

const Template = args => <Header {...args}/>;

export const PrimaryHeader = Template.bind({});

PrimaryHeader.args = {
    startingInfo: CONSTANTS.STARTING_INFO,
    displayPlayer: 'Kobe Bryant',
    handleSearchChange: () => {}
}
