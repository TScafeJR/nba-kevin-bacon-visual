import React, { ChangeEvent, Component, PointerEvent, createRef } from 'react';
import '../../style/TemporalSlider.css';

// the first and last seasons, by end year, both included
export type YearRange = [number, number];

interface TemporalSliderProps {
    label: string;
    min: number;
    max: number;
    value: YearRange;
    onChange: (value: YearRange) => void;
}

// 1986 -> "1985-86", how the season is said aloud
const seasonName = (year: number): string => `${year - 1}-${String(year).slice(2)}`;

let sliderCount = 0;

// Two native range inputs over one track, so each thumb keeps the keyboard and screen reader
// support of a real slider. The inputs ignore the pointer except on their thumbs, which lets
// both be grabbed where they overlap.
class TemporalSlider extends Component<TemporalSliderProps> {
    private readonly labelId: string;
    private readonly rail = createRef<HTMLDivElement>();

    constructor(props: TemporalSliderProps) {
        super(props);
        this.labelId = `temporal-slider-${++sliderCount}`;
        this.onStartChange = this.onStartChange.bind(this);
        this.onEndChange = this.onEndChange.bind(this);
        this.onTrackPointerDown = this.onTrackPointerDown.bind(this);
    }

    onStartChange(e: ChangeEvent<HTMLInputElement>) {
        const [, end] = this.props.value;
        this.props.onChange([Math.min(Number(e.target.value), end), end]);
    }

    onEndChange(e: ChangeEvent<HTMLInputElement>) {
        const [start] = this.props.value;
        this.props.onChange([start, Math.max(Number(e.target.value), start)]);
    }

    // a press on the bare track moves the nearer thumb there
    onTrackPointerDown(e: PointerEvent<HTMLDivElement>) {
        const rail = this.rail.current;
        if (!rail || e.target instanceof HTMLInputElement) {
            return;
        }
        const { min, max, value: [start, end] } = this.props;
        const { left, width } = rail.getBoundingClientRect();
        const share = Math.min(Math.max((e.clientX - left) / width, 0), 1);
        const year = Math.round(min + share * (max - min));
        const nearerStart = Math.abs(year - start) < Math.abs(year - end) || (start === end && year < start);
        this.props.onChange(nearerStart ? [Math.min(year, end), end] : [start, Math.max(year, start)]);
    }

    position(year: number): number {
        const { min, max } = this.props;
        return max === min ? 0 : (year - min) / (max - min) * 100;
    }

    render() {
        const { label, min, max, value: [start, end] } = this.props;
        const seasons = end - start + 1;
        // where the thumbs meet, the one that can still move away from the nearer end goes on top
        const startOnTop = start === end && start > (min + max) / 2;

        return (
            <div className="slider" role="group" aria-labelledby={this.labelId}>
                <div className="slider-head">
                    <span id={this.labelId} className="slider-label">{label}</span>
                    <span className="slider-value num" aria-live="polite">
                        {start === end ? start : `${start}–${end}`}
                        <span className="slider-count"> · {seasons} season{seasons === 1 ? '' : 's'}</span>
                    </span>
                </div>
                <div className="slider-track" onPointerDown={this.onTrackPointerDown}>
                    <div className="slider-rail" ref={this.rail}>
                        <div
                            className="slider-fill"
                            style={{ left: `${this.position(start)}%`, right: `${100 - this.position(end)}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        className={startOnTop ? 'slider-input is-top' : 'slider-input'}
                        min={min}
                        max={max}
                        step={1}
                        value={start}
                        onChange={this.onStartChange}
                        aria-label="First season"
                        aria-valuetext={`${seasonName(start)} season`}
                    />
                    <input
                        type="range"
                        className="slider-input"
                        min={min}
                        max={max}
                        step={1}
                        value={end}
                        onChange={this.onEndChange}
                        aria-label="Last season"
                        aria-valuetext={`${seasonName(end)} season`}
                    />
                </div>
                <div className="slider-scale num" aria-hidden="true">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>
        );
    }
}

export default TemporalSlider;
