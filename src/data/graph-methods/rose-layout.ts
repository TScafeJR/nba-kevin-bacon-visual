import { PlayerNetwork, TeammateLink } from '../../types';

export interface RosePoint {
    teammate: TeammateLink;
    x: number;
    y: number;
}

export interface RoseLabel {
    franchise: string;
    count: number;
    x: number;
    y: number;
}

export interface RoseLayout {
    points: RosePoint[];
    labels: RoseLabel[];
}

const SECTOR_GAP = 0.06;
// the frame is wider than it is tall, so the rose is drawn as an ellipse to use it
const ASPECT = 1.5;
const INNER_RATIO = 0.26;
const LABEL_RATIO = 1.17;

// Each franchise gets an arc of the rose sized by how many teammates came from it, in career
// order clockwise from the top. Within an arc, distance from the centre falls as seasons together
// rise: the longest partnership sits closest, one-season teammates on the rim.
const layoutRose = (network: Pick<PlayerNetwork, 'teammates' | 'franchises'>, radius = 320): RoseLayout => {
    const { teammates } = network;
    const groups = network.franchises
        .map(franchise => ({
            franchise,
            // alphabetical, so long partnerships spread around the arc instead of bunching at its start
            members: teammates
                .filter(teammate => teammate.franchise === franchise)
                .sort((a, b) => a.name.localeCompare(b.name))
        }))
        .filter(group => group.members.length > 0);

    const maxSeasons = Math.max(1, ...teammates.map(teammate => teammate.seasonsTogether));
    const inner = radius * INNER_RATIO;
    const radiusFor = (seasons: number): number => {
        if (maxSeasons === 1) {
            return radius;
        }
        return radius - (radius - inner) * (seasons - 1) / (maxSeasons - 1);
    };

    const gapTotal = groups.length > 1 ? SECTOR_GAP * groups.length : 0;
    const usable = Math.PI * 2 - gapTotal;
    let angle = -Math.PI / 2 + (groups.length > 1 ? SECTOR_GAP / 2 : 0);

    const points: RosePoint[] = [];
    const labels: RoseLabel[] = [];

    groups.forEach(group => {
        const sweep = usable * group.members.length / teammates.length;
        group.members.forEach((teammate, index) => {
            const theta = angle + sweep * (index + 0.5) / group.members.length;
            // stagger the crowded rim over three rows so neighbours do not sit on one line
            const stagger = teammate.seasonsTogether <= 2 ? index % 3 * radius * 0.06 : 0;
            const r = radiusFor(teammate.seasonsTogether) + stagger;
            points.push({ teammate, x: Math.cos(theta) * r * ASPECT, y: Math.sin(theta) * r });
        });

        const mid = angle + sweep / 2;
        const labelRadius = radius * LABEL_RATIO + radius * 0.12;
        labels.push({
            franchise: group.franchise,
            count: group.members.length,
            x: Math.cos(mid) * labelRadius * ASPECT,
            y: Math.sin(mid) * labelRadius
        });
        angle += sweep + (groups.length > 1 ? SECTOR_GAP : 0);
    });

    return { points, labels };
};

export { layoutRose };
