
const express = require('express');
let axios = require('axios').default;
let CronJob = require('cron').CronJob;
let CircularJSON = require('circular-json');
let { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const router = express.Router();
let fs = require('fs');

const client = new MongoClient(process.env.MONGODB_URL);
const database = client.db("Glartek");
const cronJobs = database.collection("cronJobs");

cronJobs.deleteMany()

function createCronJob(job) {
  return new CronJob(
    job.schedule, 
    async function () {
      let dateObject = new Date()

      let date = ("0" + dateObject.getDate()).slice(-2);
      let month = ("0" + (dateObject.getMonth() + 1)).slice(-2);
      let year = dateObject.getFullYear();
      let hours = dateObject.getHours();
      let minutes = dateObject.getMinutes();
      let seconds = dateObject.getSeconds();

      let cronJob = await cronJobs.findOne({id: job.id, version: job.version})
      if(cronJob?.running) {
        axios({
          method: cronJob.httpMethod,
          url: cronJob.uri,
          data: { message: `${year}-${month}-${date} ${hours}:${minutes}:${seconds} - ${cronJob.body}` },
          headers: { 'content-type': 'application/json', 'accept': 'application/json' },
        }).then((data) => {
            fs.appendFile(`logs_${job.id}.txt`, `${year}-${month}-${date} ${hours}:${minutes}:${seconds} - ${cronJob.body}\n`,
              function (err) {
                if (err) {
                  console.log(err);
                }
              });
            cronJobs.updateOne({ id: job.id, version: job.version }, { $set: { last_execution: this.lastExecution, executions: cronJob.executions + 1} })
        })
        .catch(error => {
          fs.appendFile(`logs_${job.id}.txt`, `Error: ${error}\n`,
            function (err) {
              if (err) {
                console.log(err);
              }
            });
            cronJobs.updateOne({ id: job.id, version: job.version }, { $set: { last_execution: this.lastExecution, errors: cronJob.errors + 1} })
        })
      } else if(!cronJob) {
        this.stop()
      }      
    },
    null,
    true, 
    job.timeZone
  );
}

router.get("/cron", async (req, res, next) => {
  try {
    let jobs = req.app.get('jobs')
    const cursor = cronJobs.find();

    let docs = []
    for await (const doc of cursor) {
      docs.push(doc)
    }

    req.app.set('jobs', jobs)

    res.send(docs);
  } catch (e) {
    res.status(400).json({ "error": e.message })
  }
})

router.get("/cron/:id", async (req, res, next) => {
  try {
    const query = { id: req.params.id };
    const cronJob = await cronJobs.findOne(query);
    
    res.send(cronJob);
  } catch (e) {
    res.status(400).json({ "error": e.message })
  }
})

router.post("/cron", async (req, res, next) => {
  try {
    let id = uuidv4()

    const doc = {
      'id': id,
      'uri': req.body.uri,
      'httpMethod': req.body.httpMethod,
      'body': req.body.body,
      'timeZone': req.body.timeZone,
      'schedule': req.body.schedule,
      'running': true,
      'executions': 0,
      'errors': 0,
      'version': 1,
    }
    await cronJobs.insertOne(doc);

    let job = createCronJob(doc)
    job.start();

    res.status(200).json("Success");
  } catch (e) {
    res.status(400).json({ "error": e.message })
  }
})

router.put("/cron/:id/status", async (req, res, next) => {
  try {
    const query = { id: req.params.id };
    const cronJob = await cronJobs.findOne(query);

    if (cronJob.running) {
      await cronJobs.updateOne(query, { $set: { running: false }});
      res.status(200).json("Job stoped")
    } else {
      await cronJobs.updateOne(query, { $set: { running: true }});
      res.status(200).json("Job started")
    }
  } catch (e) {
    res.status(400).json({ "error": e.message })
  }
})

router.put("/cron/:id", async (req, res, next) => {
  try {
    let id = req.params.id

    let cronJob = await cronJobs.findOne({id: id})
    let version = cronJob.version;

    const query = { id: req.params.id };
    await cronJobs.deleteOne(query);

    const doc = {
      'id': id,
      'uri': req.body.uri,
      'httpMethod': req.body.httpMethod,
      'body': req.body.body,
      'timeZone': req.body.timeZone,
      'schedule': req.body.schedule,
      'running': cronJob.running,
      'last_execution': cronJob.last_execution,
      'executions': cronJob.executions,
      'errors': cronJob.errors,
      'version': version + 1
    }
    await cronJobs.insertOne(doc);

    let job = createCronJob(doc)
    job.start();

    res.status(200).json("Success");
  } catch (e) {
    console.log(e.message)
    res.status(400).json({ "error": e.message })
  }
})

router.delete("/cron/:id", async (req, res, next) => {
  try {
    const query = { id: req.params.id };
    await cronJobs.deleteOne(query);

    res.status(200).json("Success");
  } catch (e) {
    res.status(400).json({ "error": e.message })
  }
})

router.get("/file/:id", (req, res, next) => {
  const file = `logs_${req.params.id}.txt`;
  res.download(file);
})

module.exports = router;