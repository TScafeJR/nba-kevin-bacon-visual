import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import TemporalSlider, { YearRange } from '../components/presentational/TemporalSlider';

const meta = {
    title: 'Components/TemporalSlider',
    component: TemporalSlider,
    args: {
        label: 'Seasons',
        min: 1947,
        max: 2026,
        value: [1986, 2003],
        onChange: fn()
    },
    // controlled: the story keeps the value in its args, so dragging also updates the controls
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div style={{ maxWidth: 560, padding: 24, background: 'var(--surface)' }}>
                <TemporalSlider
                    {...args}
                    onChange={(value: YearRange) => {
                        args.onChange(value);
                        updateArgs({ value });
                    }}
                />
            </div>
        );
    }
} satisfies Meta<typeof TemporalSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CareerRange: Story = {};

export const SingleSeason: Story = {
    args: { value: [1996, 1996] }
};

// where the thumbs meet near the end, the first-season thumb sits on top so it can still move
export const MeetingAtTheEnd: Story = {
    args: { value: [2026, 2026] }
};

export const WholeHistory: Story = {
    args: { value: [1947, 2026] }
};
