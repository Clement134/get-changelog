/* eslint-disable no-restricted-syntax */
/* eslint-disable global-require */
const { createWriteStream, createReadStream } = require('fs');
const readline = require('readline');
const path = require('path');
const { CanvasRenderService } = require('chartjs-node-canvas');

const COLOR_PALETTE = ['#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b', '#4d908e', '#577590', '#277da1'];
const width = 400;
const height = 400;
const filePath = path.resolve(__dirname, process.argv[2]);

const canvasRenderService = new CanvasRenderService(width, height, undefined, undefined, () => {
    const Chart = require('chart.js');
    require('chartjs-plugin-datalabels');
    delete require.cache[require.resolve('chart.js')];
    delete require.cache[require.resolve('chartjs-plugin-datalabels')];
    return Chart;
});

function renderChart(data, chartPath, { title, colorMapping }) {
    const configuration = {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [
                {
                    data: Object.values(data),
                    backgroundColor(context) {
                        return colorMapping[Object.keys(data)[context.dataIndex]];
                    },
                },
            ],
        },
        options: {
            title: {
                display: true,
                fontSize: 18,
                text: title || 'Common changelog locations',
            },
            legend: {
                position: 'bottom',
            },
            plugins: {
                datalabels: {
                    color: 'white',
                    font: {
                        weight: 'bold',
                    },
                },
            },
        },
    };
    canvasRenderService.renderToStream(configuration).pipe(createWriteStream(chartPath));
}

(async () => {
    const rl = readline.createInterface({
        input: createReadStream(filePath),
    });
    const stats = { inactive: {}, active: {}, total: {} };
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() - 1);

    for await (const line of rl) {
        const { file, lastPublish } = JSON.parse(line);
        const bucket = new Date(lastPublish) > oneYearFromNow ? 'active' : 'inactive';
        if (!stats[bucket][file]) stats[bucket][file] = 0;
        if (!stats.total[file]) stats.total[file] = 0;
        stats[bucket][file] += 1;
        stats.total[file] += 1;
    }

    // group data with lower value
    const aggregatedStats = {
        inactive: { other: 0 },
        active: { other: 0 },
        total: { other: 0 },
    };
    ['active', 'inactive', 'total'].forEach((bucket) => {
        for (const [file, value] of Object.entries(stats[bucket])) {
            if (value < 10) aggregatedStats[bucket].other += value;
            else aggregatedStats[bucket][file] = value;
        }
    });
    console.log(aggregatedStats);

    // generate color mapping to keep the same colors between graphs
    const colorMapping = Object.fromEntries(Object.entries(aggregatedStats.total).map(([key], index) => [key, COLOR_PALETTE[index]]));
    ['active', 'inactive', 'total'].forEach((bucket) => {
        renderChart(aggregatedStats[bucket], path.resolve(__dirname, `../charts/chart-${bucket}.png`), {
            title: `Common changelog locations (${bucket})`,
            colorMapping,
        });
    });
})();
