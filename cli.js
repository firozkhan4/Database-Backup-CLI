const { program } = require("commander");
const backupEngine = require("./backupEngine");

program
  .version("1.0.0")
  .description("Database Backup CLI Tool")
  .option("-d, --dbms <type>", "DBMS type (mysql, postgres, mongodb, sqlite)")
  .option("-h, --host <host>", "Database host")
  .option("-u, --user <user>", "Database user")
  .option("-p, --password <password>", "Database password")
  .option("-n, --dbname <dbname>", "Database name")
  .option("-o, --output <path>", "Output backup directory", "./backups")
  .option("-s, --schedule <cron>", 'Backup schedule (e.g. "* * * * *")')
  .option("-c, --cloud", "Upload to cloud storage (AWS S3)")
  .parse(process.argv);

const options = program.opts();
backupEngine.backupDatabase(options);
