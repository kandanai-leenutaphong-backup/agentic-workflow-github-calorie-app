'use strict';

const { createServer } = require('./app');

const port = process.env.PORT || 3000;
createServer().listen(port, () => console.log(`Calorie app on http://localhost:${port}`));
