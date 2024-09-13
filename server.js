const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/songs', (req, res) => {
    const musicDir = path.join(__dirname, 'public', 'music');
    fs.readdir(musicDir, (err, files) => {
        if (err) {
            res.status(500).send('Unable to scan directory');
            return;
        }
        res.json(files.filter(file => file.endsWith('.mp3')));
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
