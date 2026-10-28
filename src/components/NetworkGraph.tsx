import React, { Component, createRef, RefObject } from 'react';
import { Data, Network, Options } from 'vis-network/standalone';
import { Maximize2 } from 'lucide-react';
import '../style/NetworkGraph.css';

import { layoutRose } from '../data/graph-methods/rose-layout';
import { LONG_PARTNERSHIP_SEASONS } from '../data/constants';
import { PlayerNetwork, TeammateLink } from '../types';

// the canvas cannot read CSS custom properties, so these mirror the tokens in App.css
const COLOURS = {
    ink: '#0a0a0a',
    muted: '#6b6b6b',
    node: '#b5b5b5',
    edge: '#e4e4e4',
    hue: '#1d5fbf',
    hueEdge: 'rgba(29, 95, 191, 0.32)',
    surface: '#ffffff'
};
const FONT = 'Geist, Inter, system-ui, sans-serif';
const FRANCHISE_PREFIX = 'franchise:';

interface NetworkGraphProps {
    network: PlayerNetwork;
    hoveredId: string | null;
    onSelectPlayer: (playerId: string) => void;
    onHoverPlayer: (playerId: string | null) => void;
}

const GRAPH_OPTIONS: Options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    physics: false,
    layout: { improvedLayout: false },
    interaction: {
        hover: true,
        tooltipDelay: 60,
        dragNodes: false,
        selectConnectedEdges: true,
        keyboard: false
    },
    nodes: {
        shape: 'dot',
        borderWidth: 0,
        borderWidthSelected: 0,
        font: {
            face: FONT,
            size: 12,
            color: COLOURS.muted,
            strokeWidth: 4,
            strokeColor: COLOURS.surface
        },
        scaling: { label: { drawThreshold: 8, maxVisible: 15 } }
    },
    edges: {
        smooth: false,
        width: 1,
        selectionWidth: 0.5,
        hoverWidth: 0.5,
        arrows: { to: { enabled: false }, from: { enabled: false } }
    }
};

const tooltipFor = (teammate: TeammateLink): HTMLElement => {
    const box = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = teammate.name;
    const detail = document.createElement('span');
    const seasons = `${teammate.seasonsTogether} season${teammate.seasonsTogether === 1 ? '' : 's'} together`;
    detail.textContent = `${seasons} · ${teammate.franchises.join(', ')} ${teammate.yearSpan}`;
    box.append(name, detail);
    return box;
};

const buildGraph = (network: PlayerNetwork): Data => {
    const { points, labels } = layoutRose(network);

    const centre = {
        id: network.id,
        label: network.name,
        x: 0,
        y: 0,
        size: 15,
        color: {
            background: COLOURS.ink,
            border: COLOURS.ink,
            highlight: COLOURS.ink,
            hover: COLOURS.ink
        },
        font: {
            face: FONT,
            size: 26,
            color: COLOURS.ink,
            strokeWidth: 6,
            strokeColor: COLOURS.surface
        }
    };

    const teammates = points.map(({ teammate, x, y }) => {
        const long = teammate.seasonsTogether >= LONG_PARTNERSHIP_SEASONS;
        const fill = long ? COLOURS.hue : COLOURS.node;
        return {
            id: teammate.id,
            label: teammate.name,
            title: tooltipFor(teammate),
            x,
            y,
            size: long ? Math.min(7 + teammate.seasonsTogether, 18) : 4 + teammate.seasonsTogether,
            color: {
                background: fill,
                border: fill,
                highlight: { background: COLOURS.ink, border: COLOURS.ink },
                hover: { background: COLOURS.ink, border: COLOURS.ink }
            },
            font: long ? { size: 21, color: COLOURS.ink } : undefined
        };
    });

    const franchiseLabels = labels.map(label => ({
        id: `${FRANCHISE_PREFIX}${label.franchise}`,
        label: label.franchise,
        x: label.x,
        y: label.y,
        shape: 'text',
        chosen: false,
        font: { size: 22, color: COLOURS.muted, face: FONT, strokeWidth: 0 }
    }));

    const edges = points.map(({ teammate }) => {
        const long = teammate.seasonsTogether >= LONG_PARTNERSHIP_SEASONS;
        return {
            id: `${network.id}-${teammate.id}`,
            from: network.id,
            to: teammate.id,
            width: long ? 1.5 : 1,
            color: {
                color: long ? COLOURS.hueEdge : COLOURS.edge,
                highlight: COLOURS.ink,
                hover: COLOURS.ink
            }
        };
    });

    return { nodes: [...teammates, ...franchiseLabels, centre], edges };
};

class NetworkGraph extends Component<NetworkGraphProps> {
    private container: RefObject<HTMLDivElement | null>;
    private network: Network | null;
    private graphCache: { id: string; graph: Data } | null;

    constructor(props: NetworkGraphProps) {
        super(props);
        this.container = createRef();
        this.network = null;
        this.graphCache = null;
        this.fit = this.fit.bind(this);
    }

    componentDidMount() {
        this.mountNetwork();
    }

    componentDidUpdate(prevProps: NetworkGraphProps) {
        if (prevProps.network.id !== this.props.network.id) {
            // the canvas comes and goes with the empty state
            if (!this.container.current) {
                this.destroyNetwork();
            } else if (!this.network) {
                this.mountNetwork();
            } else {
                this.network.setData(this.getGraph());
                window.requestAnimationFrame(() => this.fit());
            }
        } else if (this.network && prevProps.hoveredId !== this.props.hoveredId) {
            if (this.props.hoveredId) {
                this.network.selectNodes([this.props.hoveredId]);
            } else {
                this.network.unselectAll();
            }
        }
    }

    componentWillUnmount() {
        this.destroyNetwork();
    }

    getGraph(): Data {
        const { network } = this.props;
        if (!this.graphCache || this.graphCache.id !== network.id) {
            this.graphCache = { id: network.id, graph: buildGraph(network) };
        }
        return this.graphCache.graph;
    }

    mountNetwork() {
        if (!this.container.current) {
            return;
        }
        const network = new Network(this.container.current, this.getGraph(), GRAPH_OPTIONS);

        // bound once, so these read the latest props through `this`
        network.on('click', ({ nodes }: { nodes: string[] }) => {
            const [id] = nodes;
            if (id && id !== this.props.network.id && !id.startsWith(FRANCHISE_PREFIX)) {
                this.props.onSelectPlayer(id);
            }
        });
        network.on('hoverNode', ({ node }: { node: string }) => {
            const isTeammate = !node.startsWith(FRANCHISE_PREFIX) && node !== this.props.network.id;
            this.props.onHoverPlayer(isTeammate ? node : null);
        });
        network.on('blurNode', () => this.props.onHoverPlayer(null));

        this.network = network;
        // labels are measured on the canvas, so draw again once the web font arrives
        document.fonts.ready.then(() => this.network?.redraw());
    }

    destroyNetwork() {
        this.network?.destroy();
        this.network = null;
    }

    fit() {
        if (this.network) {
            this.network.fit({ animation: { duration: 240, easingFunction: 'easeOutQuad' } });
        }
    }


    renderLegend() {
        const { network } = this.props;
        const hasLong = network.teammates.some(teammate => {
            return teammate.seasonsTogether >= LONG_PARTNERSHIP_SEASONS;
        });
        return (
            <ul className="graph-legend">
                <li><span className="swatch swatch-centre" />{network.name}</li>
                {hasLong &&
                    <li><span className="swatch swatch-long" />{LONG_PARTNERSHIP_SEASONS}+ seasons together</li>
                }
                <li><span className="swatch swatch-short" />{hasLong ? 'Fewer' : 'Teammates'}</li>
            </ul>
        );
    }

    render() {
        const { network } = this.props;
        const empty = network.teammates.length === 0;

        return (
            <section className="panel graph-panel" aria-labelledby="graph-title">
                <header className="panel-header">
                    <div>
                        <h2 id="graph-title">Teammate network</h2>
                        <p className="panel-sub">Grouped by franchise; the closer to the centre, the more seasons together.</p>
                    </div>
                    <div className="graph-tools">
                        {!empty && this.renderLegend()}
                        <button type="button" className="icon-button" onClick={this.fit} aria-label="Fit the network to the frame" title="Fit to frame">
                            <Maximize2 size={15} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    </div>
                </header>
                <div className="graph-canvas">
                    {empty
                        ? <p className="empty-state">{network.name} has no teammates on record in this data.</p>
                        : <div ref={this.container} />}
                </div>
            </section>
        );
    }
}

export default NetworkGraph;
