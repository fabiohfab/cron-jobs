var express = require("express");
var axios = require('axios').default;
var CronJob = require('cron').CronJob;
var CircularJSON = require('circular-json');
var { v4: uuidv4 } = require('uuid');
var cluster = require('cluster');
var process = require('process')
var fs = require('fs');

var app = express();

const cronJobs = []

app.use(express.json()) 
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const cpuCount = require('os').cpus().length;
  
  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
  
} else {
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}

cluster.on('fork', (worker) => {
  console.log("cluster forking new worker", worker.id);
});

cluster.on('listening', (worker, address) => {
  console.log("cluster listening new worker", worker.id);
});

function createCronJob(req, id) {
  var temp_job = new CronJob(req.body.schedule, function() {

    let dateObject = new Date()

    let date = ("0" + dateObject.getDate()).slice(-2);
    let month = ("0" + (dateObject.getMonth() + 1)).slice(-2);
    let year = dateObject.getFullYear();
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    let seconds = dateObject.getSeconds();

    axios({
      method: req.body.httpMethod,
      url: req.body.uri,
      data: {message:`${year}-${month}-${date} ${hours}:${minutes}:${seconds} - ${req.body.body}`},
      headers: {'content-type': 'application/json'},
    }).then(data => {
      fs.appendFile(`logs_${id}.txt`, `${year}-${month}-${date} ${hours}:${minutes}:${seconds} - ${req.body.body}\n`, 
      function (err) {
        if (err) {
          console.log(err);
        }
      });
    }).catch(error => {
      fs.appendFile(`logs_${id}.txt`, `Error: ${error}\n`, 
      function (err) {
        if (err) {
          console.log(err);
        }
      });
    })
  }, null, true, req.body.timeZone);

  return temp_job
}

app.get("/", (req, res, next) => {
  try {
    res.status(200).json(`${req.body.message}`);
  } catch (e) {
    res.status(400).json({'error': e.message})
  }
})

app.get("/cron", (req, res, next) => {
  try {
    let json = {}
    for(var key in cronJobs) {
      json[key] = JSON.parse(CircularJSON.stringify(cronJobs[key]))
    };
    res.send([json]);
  } catch(e) {
    res.status(400).json({"error": e.message})
  }
})

app.get("/cron/:id", (req, res, next) => {
  try {
    let json = {}
    json[req.params.id] = JSON.parse(CircularJSON.stringify(cronJobs[req.params.id]))
    res.send([json]);
  } catch(e) {
    res.status(400).json({"error": e.message})
  }
})

app.post("/cron", (req, res, next) => {
  try {
    let id = uuidv4()
    
    var job = createCronJob(req, id)
    job.start();


    cronJobs[id] = job
    cronJobs[id]['uri'] = req.body.uri
    cronJobs[id]['httpMethod'] = req.body.httpMethod
    cronJobs[id]['body'] = req.body.body
    cronJobs[id]['timeZone'] = req.body.timeZone
    cronJobs[id]['schedule'] = req.body.schedule

    res.status(200).json("Success");
  } catch(e) {
    res.status(400).json({"error": e.message})
  }
})

app.post("/cron/:id", (req, res, next) => {
  try {
    var job = cronJobs[req.params.id]
    if(job.running) {
      job.stop();
      res.status(200).json("Job stoped")
    } else {
      job.start();
      res.status(200).json("Job started")
    }
  } catch(e) {
    res.status(400).json({"error": e.message})
  }
})

app.put("/cron/:id", (req, res, next) => {
  try {
    let id = req.params.id

    var job = createCronJob(req, id)
    
    cronJobs[req.params.id].stop()
    delete cronJobs[req.params.id]

    job.start();

    cronJobs[id] = job
    cronJobs[id]['uri'] = req.body.uri
    cronJobs[id]['httpMethod'] = req.body.httpMethod
    cronJobs[id]['body'] = req.body.body
    cronJobs[id]['timeZone'] = req.body.timeZone
    cronJobs[id]['schedule'] = req.body.schedule

    res.status(200).json("Success");
  } catch(e) {
    console.log(e.message)
    res.status(400).json({"error": e.message})
  }
})

app.delete("/cron/:id", (req, res, next) => {
  try {
    cronJobs[req.params.id].stop()
    delete cronJobs[req.params.id]
    res.status(200).json("Success");
  } catch(e) {
    res.status(400).json({"error": e.message})
  }
})

app.get("/file/:id", (req, res, next) => {
  const file = `logs_${req.params.id}.txt`;
  res.download(file);
})