import { MAX_LAT, MIN_LAT, MAX_LNG, MIN_LNG, BOX_SIZE } from './constants.js';

export const normalizeValues = (lat, lng) => {
    const normalizedLng = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * BOX_SIZE;
    const normalizedLat = ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * BOX_SIZE;
    return { normalizedLng, normalizedLat };
};
