import childProcess from 'child_process';
import cron from 'node-cron';
import moment from 'moment';
import { readFile } from 'fs/promises';
const setting = JSON.parse(await readFile("setting.json", "utf8"));

const mainScript = './index.js'
const cronJob = setting?.cron

const job = cron.schedule(cronJob, () => {
  job.stop()
  console.log('Run job at', moment().format('YYYY-MM-DD HH:mm:ss'))
  runScript(mainScript, function (err) {
    if (err) throw err;
    console.log('Finished job at', moment().format('YYYY-MM-DD HH:mm:ss'))
    job.start()
  });
}, {
  scheduled: false,
  timezone: "Asia/Bangkok"
})

function runScript(scriptPath, callback) {
  // keep track of whether callback has been invoked to prevent multiple invocations
  var invoked = false;
  var process = childProcess.fork(scriptPath);
  // listen for errors as they may prevent the exit event from firing
  process.on('error', function (err) {
      if (invoked) return;
      invoked = true;
      callback(err);
  });
  // execute the callback once the process has finished running
  process.on('exit', function (code) {
      if (invoked) return;
      invoked = true;
      var err = code === 0 ? null : new Error('exit code ' + code);
      callback(err);
  });
}

console.log('==================== Run Cronjob ====================')
console.log('CRONJOB_TIMER:', cronJob)
job.start()
