const express = require('express')
const app = express()
const serverPort = 3003
const https = require("https")
var cors = require('cors')

var fs = require('fs');
const PriorityQueue = require("./priorityqueue.js")
const priorityQueue = new PriorityQueue()

var stocks = JSON.parse(fs.readFileSync('stocks.json', 'utf8'));
var port = process.env.PORT || serverPort;
app.use(cors());


app.get('/api/:url', (request, response) => {
    const url ='https://finance.google.com/finance/getprices?q=' + request.params.url;
    https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            response.send(body)
        });
    });
})

app.get('/stocks/:searchstring', (request, response) => {
    const searchstring = request.params.searchstring;
    response.send(JSON.stringify(test(searchstring)));
})
function test(searchstring){
    let match = priorityQueue.get(searchstring)
    if(match !== undefined)
        return match.result
    
    let matchStrings = []
    stocks["stocks"].forEach(stock => {
        let sim1 = similarity(stock[0], searchstring) 
        if ( sim1> 0.5){
            matchStrings.push([sim1, stock])
        }else{
            let sim2 = similarity(stock[1], searchstring)
            if(sim2 > 0.5){
                matchStrings.push([sim2, stock])
            } 
        }
    });

    matchStrings = matchStrings.sort(Comparator).slice(0, 5).map((a) => a[1]);
    priorityQueue.push({key: searchstring, result: matchStrings})
    return matchStrings
}

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
})

function Comparator(a, b) {
    if (a[0] > b[0]) return -1;
    if (a[0] < b[0]) return 1;
    return 0;
  }
 
function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }

function editDistance(s1, s2) {
s1 = s1.toLowerCase();
s2 = s2.toLowerCase();

var costs = new Array();
for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
    if (i == 0)
        costs[j] = j;
    else {
        if (j > 0) {
        var newValue = costs[j - 1];
        if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
            costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
        }
    }
    }
    if (i > 0)
    costs[s2.length] = lastValue;
}
return costs[s2.length];
}