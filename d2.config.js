/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    name: 'Signature Manager',
    title: 'Signature Manager',
    description: 'Signature Manager',
    entryPoints: {
        app: './src/App.jsx',
    },

    direction: 'auto',
}

module.exports = config
