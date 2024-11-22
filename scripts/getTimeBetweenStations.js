import { exampleStopTimeUpdate as stops } from '../src/data/stopTimeUpdateEx.js';

const timesToNextStations = stops.map((stop, i) => {
    const timeBetweenNorth =
        i === stops.length - 1
            ? 0
            : stops[i + 1].arrival.time - stop.departure.time;
    const timeBetweenSouth =
        i === 0 ? 0 : stop.arrival.time - stops[i - 1].departure.time;

    return {
        stopId: stop.stopId,
        timeToNextStationSouth: parseInt(timeBetweenSouth, 10),
        timeToNextStationNorth: parseInt(timeBetweenNorth, 10),
    };
});

console.log(timesToNextStations);
