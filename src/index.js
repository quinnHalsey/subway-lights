import protobuf from 'protobufjs';
import lTrainPath from './data/lTrainPath';

import { findAndNormalizeTrainPosition } from './trainPosition';

async function fetchLTrainData() {
    try {
        const res = await fetch(
            'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
            { cache: 'no-cache' }
        );

        console.log('-------- fetching new train data ---------');

        if (!res.ok) {
            throw new Error(`Failed to fetch GTFS data: ${res.status}`);
        }

        const buffer = await res.arrayBuffer(); // Get response as ArrayBuffer

        // Load the local GTFS Realtime Protobuf schema
        const root = await protobuf.load('../protos/gtfs-realtime.proto');
        const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

        // Decode the Protobuf message
        const message = FeedMessage.decode(new Uint8Array(buffer));
        const data = FeedMessage.toObject(message, {
            enums: String,
            longs: String,
        });

        return data.entity;
    } catch (err) {
        console.error('Error:', err);
    }
}

async function fetchServiceAlerts() {
    try {
        const res = await fetch(
            'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json'
        );
        if (!res.ok) {
            throw new Error(`Failed to fetch service alerts: ${res.status}`);
        }

        const body = await res.json();
        return body.entity;
    } catch (err) {
        console.error('Error:', err);
    }
}

fetchServiceAlerts().then((alerts) => {
    alerts.forEach(({ alert }) => {
        if (!alert['transit_realtime.mercury_alert'].alert_type === 'Delays') {
            console.log(alert);
        }
    });
    return;
});

async function updateTrainPositions() {
    const trains = await fetchLTrainData();
    console.log(trains.length, 'trains length');
    trains.forEach((train, i) => {
        if (train.vehicle) return; // If object is a follow-up object to train at i - 1, already pulled needed data and can skip

        const stopId = train.tripUpdate?.stopTimeUpdate[0]?.stopId?.slice(0, 3);
        const stopSequence = train.tripUpdate?.stopTimeUpdate[0]?.stopSequence;
        const currStatus = trains[i + 1]?.vehicle?.currentStatus || '';
        const stopNum = Number(stopId?.slice(1, 3));
        const direction = train.tripUpdate?.stopTimeUpdate[0]?.stopId?.slice(3);

        if (!currStatus) {
            // NOTE - this is a train that is scheduled and not in service yet
            return;
        }

        const trainPosition = findAndNormalizeTrainPosition(
            stopId,
            stopSequence,
            currStatus,
            stopNum,
            direction
        );

        if (!trainPosition) {
            console.error(
                'No train position found for train:',
                train,
                trains[i + 1]
            );
            return;
        }

        // Create a circle element to represent current train position
        const trainMarker = `<circle cx="${trainPosition.x}" cy="${trainPosition.y}" r="4" class="train" id="train-${i}" />`;
        document
            .querySelector('#map-canvas #l-train__trains')
            .insertAdjacentHTML('beforeend', trainMarker);
    });
}

const clearTrainMarkers = () => {
    const trainContainer = document.querySelector(
        '#map-canvas #l-train__trains'
    );
    trainContainer.innerHTML = '';
};

const updateAndClearTrainPositions = async () => {
    clearTrainMarkers();
    await updateTrainPositions();
};

setInterval(updateAndClearTrainPositions, 5000);
updateAndClearTrainPositions();

//TODO: can hardcode this path in index.html once final output is determined
const svgPath = document.querySelector('#map-canvas .l-train');
svgPath.setAttribute('d', lTrainPath);

const trainPath = document.querySelector('#map-canvas .l-train');
const totalLength = trainPath.getTotalLength();

console.log(totalLength);
