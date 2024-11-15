const fs = require('fs');
const path = require('path');

const inputFilePath = process.argv[2];
const outputFileName = process.argv[3];

if (!inputFilePath || !outputFileName) {
    console.error('Usage: node parsePath.js <inputFilePath> <outputFileName>');
    process.exit(1);
}

function parsePath(inputFilePath, outputFileName) {
    // Read input file
    const data = fs.readFileSync(inputFilePath, 'utf8');
    const BOX_SIZE = 1000;
    const MARGIN = 0.001;

    // used to define bounds of scaling region
    let maxLng, maxLat, minLat, minLng;

    // Parse raw data and get coordinates
    const latLngArray = data
        .trim()
        .split('\n')
        .map((line, i) => {
            const parts = line.split(',');
            const lat = parseFloat(parts[2]);
            const lng = parseFloat(parts[3]);

            if (i === 0) {
                maxLng = lng;
                maxLat = lat;
                minLng = lng;
                minLat = lat;
            }

            if (Math.abs(lat) > Math.abs(maxLat)) maxLat = lat;
            if (Math.abs(lng) > Math.abs(maxLng)) maxLng = lng;
            if (Math.abs(lat) < Math.abs(minLat)) minLat = lat;
            if (Math.abs(lng) < Math.abs(minLng)) minLng = lng;

            return { lat, lng };
        });

    // Adjust bounds with margin
    maxLat += MARGIN;

    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    // Generate SVG path string
    const pathString = latLngArray
        .map((point, index) => {
            const command = index === 0 ? 'M' : 'L';
            const scaledLng = Number(
                (((point.lng - minLng) / lngRange) * BOX_SIZE).toFixed(3)
            );
            const scaledLat = Number(
                (((point.lat - minLat) / latRange) * BOX_SIZE).toFixed(3)
            );
            return `${command} ${scaledLng},${scaledLat}`;
        })
        .join(' ');

    // Write output to file
    const outputPath = path.join(
        __dirname,
        '..',
        'src',
        'data',
        outputFileName
    );
    const outputContent = `export const ${outputFileName.replace(
        '.js',
        ''
    )} = "${pathString}";`;

    fs.writeFileSync(outputPath, outputContent);

    return pathString;
}

// Execute the script
try {
    parsePath(inputFilePath, outputFileName);
    console.log(`Successfully wrote path data to src/data/${outputFileName}`);
} catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
}
