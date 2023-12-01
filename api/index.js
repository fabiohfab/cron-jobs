let express = require("express");
let cluster = require('cluster');
let process = require('process')
let app = express();

app.use(express.json())

app.set('jobs', [])

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const apiRoutes = require('./apiRoutes.js');
app.use('/api', apiRoutes);


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