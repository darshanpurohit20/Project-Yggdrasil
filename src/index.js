const { sprout, bloom, rest } = require('./engine');
const { render } = require('./renderer');

const args = process.argv.slice(2);

function main() {
    if (args.length === 0) {
        console.log("Usage: node index.js [sprout|bloom] && node index.js render");
        return;
    }

    const command = args[0];

    switch (command) {
        case 'sprout':
            console.log("Starting Morning Sprout Phase...");
            sprout();
            break;
        case 'bloom':
            console.log("Starting Midday Bloom Phase...");
            bloom();
            break;
        case 'render':
            console.log("Rendering Ecosystem...");
            render();
            break;
        case 'rest':
            console.log("Tree entering rest state...");
            rest();
            break;
        default:
            console.log(`Unknown command: ${command}`);
            break;
    }
}

main();
