declare module 'react-graph-vis' {
    import { Component, CSSProperties } from 'react';

    type IdType = string | number;

    export interface GraphData {
        nodes: Array<{ id: IdType; label?: string }>;
        edges: Array<{ from: IdType; to: IdType }>;
    }

    export interface GraphEventParams {
        nodes: IdType[];
        edges: IdType[];
        [key: string]: unknown;
    }

    export type GraphEvents = Record<string, (params: GraphEventParams) => void>;

    export interface GraphProps {
        graph: GraphData;
        options?: Record<string, unknown>;
        events?: GraphEvents;
        getNetwork?: (network: unknown) => void;
        identifier?: string;
        style?: CSSProperties;
    }

    export default class Graph extends Component<GraphProps> {}
}
