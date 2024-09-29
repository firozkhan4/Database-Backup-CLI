const cron = require("node-cron");
const fs = require("fs");
const archiver = require("archiver");
const { exec } = require("child_process");
const logger = require("./logger");
const { uploadToS3 } = require("./storage");

// Function to backup the database
async function backupDatabase(options) {
  const { dbms, host, user, password, dbname, output, schedule, cloud } =
    options;

  const backupCommand = getBackupCommand(
    dbms,
    host,
    user,
    password,
    dbname,
    output
  );

  // If scheduling is set, use cron to schedule backups
  if (schedule) {
    cron.schedule(schedule, () => {
      runBackup(backupCommand, output, cloud);
    });
    logger.log("info", `Scheduled backup for ${dbms} database ${dbname}`);
  } else {
    runBackup(backupCommand, output, cloud);
  }
}

// Get the backup command for each DBMS
function getBackupCommand(dbms, host, user, password, dbname, output) {
  let command;
  switch (dbms) {
    case "mysql":
      command = `mysqldump -h ${host} -u ${user} -p${password} ${dbname} > ${output}/${dbname}_backup.sql`;
      break;
    case "postgres":
      command = `PGPASSWORD="${password}" pg_dump -h ${host} -U ${user} ${dbname} > ${output}/${dbname}_backup.sql`;
      break;
    case "mongodb":
      command = `mongodump --host ${host} --db ${dbname} --out ${output}/${dbname}_backup`;
      break;
    case "sqlite":
      command = `sqlite3 ${dbname} .dump > ${output}/${dbname}_backup.sql`;
      break;
    default:
      throw new Error("Unsupported DBMS");
  }
  return command;
}

// Run the backup command and compress the backup
function runBackup(command, output, cloud) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.log("error", `Error backing up database: ${stderr}`);
      return;
    }

    logger.log("info", "Database backup completed");
    compressBackup(output);

    if (cloud) {
      uploadToS3(`${output}.zip`);
    }
  });
}

// Compress the backup directory into a zip file
function compressBackup(output) {
  const outputZip = fs.createWriteStream(`${output}.zip`);
  const archive = archiver("zip", { zlib: { level: 9 } });

  outputZip.on("close", () =>
    logger.log("info", `Backup compressed to ${output}.zip`)
  );

  archive.pipe(outputZip);
  archive.directory(output, false);
  archive.finalize();
}

module.exports = { backupDatabase };
