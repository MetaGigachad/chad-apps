import fs from "fs";
import path from "path";
import yaml from "yaml";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { merge } from "allof-merge";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 <in-path> [options]")
  .positional("in-path", {
    describe: "Input file path",
    type: "string",
    demandOption: true,
  })
  .option("o", {
    alias: "out-path",
    describe: "Output file path",
    type: "string",
  })
  .example(
    "$0 input.yaml -o output.yaml",
    "Specify input file as `input.yaml` and output file as `output.yaml`",
  )
  .help("h") // Add help flag
  .alias("h", "help") // Alias `-h` for help
  .showHelpOnFail(true, "Specify --help for available options").argv;

// Compute default output file path if not provided
if (!argv.o) {
  const inputFileName = path.basename(argv._[0]);
  const outputFileName = `${path.parse(inputFileName).name}-out.yaml`;
  argv.o = `./${outputFileName}`;
}

// Read input file
const fileContent = fs.readFileSync(argv._[0], "utf8");
const data = yaml.parse(fileContent);

const onMergeError = (msg) => {
  throw new Error(msg);
};

// Process data
let processed = merge(data, { onMergeError });

processed = yaml.parse(yaml.stringify(processed), { merge: true })

// Write to output file
fs.writeFileSync(argv.o, yaml.stringify(processed), "utf8");
