import React from 'react';
import Header from '../../components/static/Header';

export default {
    title: 'Static/Header',
    component: Header
}

const Template = (args) => <Header {...args}/>

export const PrimaryHeader = Template.bind({})
