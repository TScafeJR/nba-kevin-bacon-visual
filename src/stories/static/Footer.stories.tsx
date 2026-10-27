import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import Footer from '../../components/presentational/static/Footer';
import '../../style/Footer.css';

export default {
    title: 'Static/Footer',
    component: Footer
} as Meta;

const Template: Story = args => <Footer {...args}/>;

export const PrimaryFooter = Template.bind({});
