import React from 'react';

import Footer from '../../components/presentational/static/Footer';
import '../../style/Footer.css';

export default {
    title: 'Static/Footer',
    component: Footer
};

const Template = args => <Footer {...args}/>;

export const PrimaryFooter = Template.bind({});
