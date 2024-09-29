const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new transports.File({ filename: "logs/backup.log" }),
    new transports.Console(),
  ],
});

module.exports = logger;
