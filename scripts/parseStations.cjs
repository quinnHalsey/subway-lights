// Return inner HTML for an svg group with circles for each station

//Station ID,Complex ID,GTFS Stop ID,Division,Line,Stop Name,Borough,Daytime Routes,Structure,GTFS Latitude,GTFS Longitude,North Direction Label,South Direction Label,ADA,ADA Direction Notes,ADA NB,ADA SB,Capital Outage NB,Capital Outage SB

const fs = require('fs');
const path = require('path');

const inputFilePath = process.argv[2];
const outputFileName = process.argv[3];

if (!inputFilePath || !outputFileName) {
    console.error('Usage: node parsePath.js <inputFilePath> <outputFileName>');
    process.exit(1);
}

const stationsData = fs.readFileSync(inputFilePath, 'utf8');

const parseStations = (data) => {
    const stationData = data
        .trim()
        .split('\n')
        .map((line) => {
            const parts = line.split(',');
            return {
                id: parts[0],
                stopId: parts[2],
                name: parts[5],
                lat: Number(parts[9]),
                lng: Number(parts[10]),
            };
        });

    const stationsObject = stationData.reduce((acc, station) => {
        acc[station.stopId] = station;
        return acc;
    }, {});

    const outputPath = path.join(
        __dirname,
        '..',
        'src',
        'data',
        outputFileName
    );

    const content = `export const ${outputFileName.replace(
        '.js',
        ''
    )} = ${JSON.stringify(stationData)};
export const ${outputFileName.replace('.js', '')}Map = ${JSON.stringify(
        stationsObject
    )};`;

    fs.writeFileSync(outputPath, content);
};

try {
    parseStations(stationsData);
} catch (err) {
    console.error('Error parsing stations:', err);
}
