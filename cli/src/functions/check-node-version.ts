import chalk from "chalk";

export function checkNodeVersion() {
  const [major] = process.version.split(".");
  if (parseInt(major.replace('v', ''), 10) < 20) {
    console.log("")
    console.log(chalk.redBright(`🚨 Node.js version >= 20 is required. Version ${process.version} detected.`));
    console.log("")
    process.exit(1);
  }
};
