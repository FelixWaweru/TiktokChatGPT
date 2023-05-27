const fs = require('fs');
const path = require('path');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(logMessage);

  const logFilePath = path.join(__dirname, `logs/${new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString().slice(0,10)}--access.log`);
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

module.exports = log;
