import React from 'react';

import Searchbar from '../components/Searchbar';

export default {
    title: 'Components/Searchbar',
    component: Searchbar
};

const Template = args => <Searchbar {...args}/>;

export const BasicSearch = Template.bind({});
