import protobuf from 'protobufjs';
import { lTrainPath } from './data/lTrainPath';

console.log('connection test - SUCCESS');

const testDiv = document.getElementById('l-train');

//Structure of API data: L TRAIN: https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l
/* 
    Data for each train comes in twos in the entity array
    e.g. entity[0] = {
        id: '1',
        isDeleted: false,
        tripUpdate: {
            trip: {
                tripId: '123450_L..S',
                startDate: '20241113',
                scheduleRelationship: 'SCHEDULED',
                routeId: 'L',
                directionId: 0,
            },
            stopTimeUpdate: [
                {
                    stopSequence: 21,
                    arrival: { delay: 130, time: '1731550060', uncertainty: 0 },
                    departure: { delay: 130, time: '1731550090', uncertainty: 0 },
                    stopId: 'L27S',
                    scheduleRelationship: 'SCHEDULED',
                },
                {
                    stopSequence: 22,
                    arrival: { delay: 130, time: '1731550210', uncertainty: 0 },
                    departure: { delay: 130, time: '1731550240', uncertainty: 0 },
                    stopId: 'L28S',
                    scheduleRelationship: 'SCHEDULED',
                },
                {
                    stopSequence: 23,
                    arrival: { delay: 130, time: '1731550270', uncertainty: 0 },
                    stopId: 'L29S',
                    scheduleRelationship: 'SCHEDULED',
                },
            ],
            timestamp: '1731550072',
        },
    };

    entity[1] = {
         id: '2',
         isDeleted: false,
         vehicle: {
             trip: {
                 tripId: '123050_L..S',
                 startDate: '20241113',
                 scheduleRelationship: 'SCHEDULED',
                 routeId: 'L',
                 directionId: 0,
             },
             currentStopSequence: 21,
             currentStatus: 'IN_TRANSIT_TO',
             timestamp: '1731549744',
             congestionLevel: 'UNKNOWN_CONGESTION_LEVEL',
             stopId: 'L27S',
         },
     };

     these two represent same train -- as indicated by same TRIP ID and startDate/currentStopSequence 
     may only require one for all data needed entity[0]
*/

/* SCHEMA (from proto file)
    1. FeedMessage
        Purpose: Represents the contents of a feed message.
        Fields:
            header: Metadata about the feed (type: FeedHeader).
            entity: A list of entities contained in the feed (type: FeedEntity).
            extensions: Allows third-party developers to extend the specification.

    2. FeedHeader
        Purpose: Contains metadata about the feed.
        Fields:
            gtfs_realtime_version: Version of the feed specification (type: string).
            incrementality: Indicates whether the fetch is incremental (type: Incrementality).
            timestamp: Timestamp of when the feed was created (type: uint64).
            extensions: Allows third-party developers to extend the specification.

    3. FeedEntity
        Purpose: Represents an entity in the transit feed.
        Fields:
            id: Unique identifier for the entity (type: string).
            is_deleted: Indicates if the entity is to be deleted (type: bool).
            trip_update: Information about trip updates (type: TripUpdate).
            vehicle: Information about vehicle positions (type: VehiclePosition).
            alert: Information about alerts (type: Alert).
            shape, stop, trip_modifications: Additional optional fields for further details.

    4. TripUpdate
        Purpose: Provides real-time updates for a trip.
        Fields:
            trip: The trip this update applies to (type: TripDescriptor).
            vehicle: Additional information about the vehicle serving the trip (type: VehicleDescriptor).
            stop_time_update: A list of updates for stop times (type: StopTimeUpdate).
            timestamp: The most recent moment the vehicle's progress was measured (type: uint64).
            delay: Current schedule deviation for the trip (type: int32).
            trip_properties: Updated properties of the trip (type: TripProperties).

    5. VehiclePosition
        Purpose: Provides real-time positioning information for a vehicle.
        Fields:
            trip: The trip the vehicle is serving (type: TripDescriptor).
            vehicle: Additional information about the vehicle (type: VehicleDescriptor).
            position: Current position of the vehicle (type: Position).
            current_stop_sequence: Index of the current stop (type: uint32).
            stop_id: Identifier for the current stop (type: string).
            current_status: Status of the vehicle with respect to the current stop (type: VehicleStopStatus).
            timestamp: Timestamp of when the vehicle's position was measured (type: uint64).
            congestion_level: Congestion level affecting the vehicle (type: CongestionLevel).
            occupancy_status: Passenger occupancy status (type: OccupancyStatus).
            multi_carriage_details: Details of multiple carriages (type: CarriageDetails).

    6. Alert
        Purpose: Represents an alert in the transit network.
        Fields:
            active_period: Time ranges when the alert is active (type: TimeRange).
            informed_entity: Entities to notify of the alert (type: EntitySelector).
            cause: Cause of the alert (type: Cause).
            effect: Effect of the alert (type: Effect).
            url: Additional information about the alert (type: TranslatedString).
            header_text, description_text: Text for the alert (type: TranslatedString).
            severity_level: Severity of the alert (type: SeverityLevel).
            image, image_alternative_text: Visual representation of the alert (type: TranslatedImage and TranslatedString).

    7. Position
        Purpose: Represents a geographical position.
        Fields:
            latitude: Latitude in WGS-84 coordinate system (type: float).
            longitude: Longitude in WGS-84 coordinate system (type: float).
            bearing: Direction in degrees (type: float).
            odometer: Odometer value in meters (type: double).
            speed: Momentary speed in meters per second (type: float).

    8. TripDescriptor
        Purpose: Identifies a trip instance.
        Fields:
            trip_id: Identifier of the trip (type: string).
            route_id: Identifier of the route (type: string).
            direction_id: Direction of travel (type: uint32).
            start_time, start_date: Scheduled start time and date (type: string).

    9. CarriageDetails
        Purpose: Provides details about individual carriages in a vehicle.
        Fields:
            id: Unique identifier for the carriage (type: string).
            label: User-visible label for the carriage (type: string).
            occupancy_status: Occupancy status for the carriage (type: OccupancyStatus).
            occupancy_percentage: Occupancy percentage for the carriage (type: int32).
            carriage_sequence: Order of the carriage (type: uint32).

    10. TimeRange
        Purpose: Represents a time interval.
        Fields:
            start: Start time in POSIX time (type: uint64).
            end: End time in POSIX time (type: uint64).

    11. EntitySelector
        Purpose: Selector for an entity in a GTFS feed.
        Fields:
            agency_id, route_id, route_type, trip, stop_id, direction_id: Various identifiers for filtering entities.
*/

async function fetchLTrainData() {
    try {
        // Fetch the GTFS Realtime feed
        const res = await fetch(
            'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l'
        );

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

        console.log(data);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

fetchLTrainData();

const svgPath = document.querySelector('#map-canvas .l-train');
svgPath.setAttribute('d', lTrainPath);
