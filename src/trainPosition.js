import { lTrainStations, lTrainStationsMap } from './data/lTrainStations.js';
import { normalizeValues } from './helpers/normalizeValues.js';

export const findAndNormalizeTrainPosition = (
    stopId,
    stopSequence,
    currStatus,
    stopNum,
    direction
) => {
    let lat = lTrainStationsMap?.[stopId]?.lat;
    let lng = lTrainStationsMap?.[stopId]?.lng;

    if (!lat || !lng) {
        console.error('Error computing latitude and longitude');
        return;
    }

    // If train is not STOPPED_AT a stop, find the middle between the previous and current stop
    // TODO: add more complex logic for where exactly train is between stops
    if (currStatus === 'IN_TRANSIT_TO') {
        const stopIdx =
            direction === 'N'
                ? lTrainStations.length - stopSequence - 1
                : stopSequence;

        const prevStop =
            direction === 'N'
                ? lTrainStations[stopIdx - 1] // Northbound
                : lTrainStations[stopIdx + 1]; // Southbound

        if (!prevStop) {
            console.error(`Error finding prev stop: stopIdx = ${stopSequence}`);
            return;
        }

        const prevStopPoint = {
            cx: lTrainStationsMap[prevStop.stopId].cx,
            cy: lTrainStationsMap[prevStop.stopId].cy,
        };

        const trainPath = document.querySelector('#map-canvas .l-train'); //TODO: Make dynamic when adding new trains (pass trainPath)
        const totalPathLength = trainPath.getTotalLength();

        const currStopLength = findPathLengthAtPoint(
            lTrainStationsMap[stopId].cx,
            lTrainStationsMap[stopId].cy,
            totalPathLength,
            trainPath
        );

        const prevStopLength = findPathLengthAtPoint(
            prevStopPoint.cx,
            prevStopPoint.cy,
            totalPathLength,
            trainPath
        );

        const midwayLength = (currStopLength + prevStopLength) / 2;
        const halfwayPoint = trainPath.getPointAtLength(midwayLength);

        return halfwayPoint;
    }

    const { normalizedLat, normalizedLng } = normalizeValues(lat, lng);

    return { x: normalizedLng, y: normalizedLat };
};

const findPathLengthAtPoint = (cx, cy, totalPathLength, path) => {
    const totalLength = path.getTotalLength();
    let closestDistance = totalLength;
    let closestPathDistance = 0;

    // Binary search approach (optional optimization for more accurate results):
    for (let i = 0; i <= totalLength; i += 0.5) {
        const point = path.getPointAtLength(i);
        const dx = point.x - cx;
        const dy = point.y - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestPathDistance = i;
        }
    }

    return closestPathDistance;
};
