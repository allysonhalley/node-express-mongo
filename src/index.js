const express = require('express');
const bodyParser = require('body-parser');

const port = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded ({ extended: false }));

require('./app/controllers/index')(app);

app.get('/', (req, res) => res.send('Hello World Docker!'));

app.listen(port, () => console.log(`App is running!`));