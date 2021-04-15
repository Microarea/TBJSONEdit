#!/usr/bin/env node

var express = require('express');
var path = require('path');
var nodeFs = require('fs');
var stripJsonComments = require('strip-json-comments');
var bodyParser = require('body-parser');
var opn = require('opn');
var app = express();
var args = process.argv.slice(2);
var fname = '';

//console.log('myArgs: ', args[0], __dirname);

function stripBOM(content) {
    content = content.toString()
        // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
        // because the buffer-to-string conversion in `fs.readFileSync()`
        // translates it to FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1)
    }
    return content
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', function(req, res) {
    if (args[0] == '-e') {
        res.sendFile(path.join(__dirname, 'client', 'autostart.html'));
    } else if (args[0] == '-f') {
        fname = args[1];
        res.sendFile(path.join(__dirname, 'client', 'editfile.html'));
    } else {
        res.sendFile(path.join(__dirname, 'client', 'home.html'));
    }
})

app.get('/openFolder', function(req, res) {
    var folderName = req.query.folderName;
    if (!nodeFs.existsSync(folderName)) {
        return res.status(500).send("The folder does not exists");
    }
    if (!nodeFs.lstatSync(folderName).isDirectory()) {
        return res.status(500).send("Selected element is not a folder");
    }
    var forms = [];
    nodeFs.readdirSync(folderName).filter(fn => fn.endsWith('.tbjson')).forEach(function(entry) {
        var content = nodeFs.readFileSync(path.join(folderName, entry), { encoding: "utf-8" }).toString();
        forms.push({ fname: entry, content: stripJsonComments(stripBOM(content)) });
    });

    if (forms.length == 0) {
        return res.status(500).send("No tbjson files in the selected folder");
    }
    res.json(forms);
})

app.post('/save', function(req, res) {
    var folderName = req.body.folderName;
    var forms = req.body.forms;
    nodeFs.readdirSync(folderName).filter(fn => fn.endsWith('.tbjson')).forEach(function(entry) {
        if (!forms.find(form => form.fname == entry)) {
            nodeFs.unlinkSync(path.join(folderName, entry));
        }
    });
    forms.forEach(form => {
        nodeFs.writeFileSync(path.join(folderName, form.fname), form.content, { encoding: "utf-8" });
    });
    res.status(200);
})

app.get('/filename', function(req, res) {
    res.json(fname);
})

app.get('/currentFolder', function(req, res) {
    var currentPath = process.cwd();
    res.json(currentPath);
})

var server = app.listen(3000, "localhost", function() {
    var host = server.address().address
    var port = server.address().port

    console.log(`JSON Editor listening at http://${host}:${port}`);
    opn(`http://${host}:${port}`);
})