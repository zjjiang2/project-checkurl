const arg = require("arg");
const { axiosRequest } = require("./axiosRequest");
const fs = require("fs");
const version = require("../package.json");
// eslint-disable-next-line no-unused-vars
const colors = require("colors");
// eslint-disable-next-line no-unused-vars
const { exit } = require("process");

//function to handle all argument options
function versionOption(rawArgs) {
  try {
    const args = arg(
      {
        "--version": Boolean,
        "--v": "--version",
        "--ignore": String,
        "--i": "--ignore",
        "--all": Boolean,
        "--a": "--all",
        "--good": Boolean,
        "--g": "--good",
        "--bad": Boolean,
        "--b": "--bad",
        "--json": Boolean,
        "--j": "--json",
      },
      { argv: rawArgs.slice(2) }
    );
    return {
      showVersion: args["--version"] || false,
      showAll: args["--all"] || false,
      showGood: args["--good"] || false,
      showBad: args["--bad"] || false,
      showJson: args["--json"] || false,
      ignoreUrl: args["--ignore"] || "",
    };
  } catch (err) {
    console.error("Invalid Arguments or Path Name".red);
    process.exit(1);
  }
}

//displays the  final results
async function displayResult(data, options, ignoreUrls = []) {
  const urlRegex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/;=]*))/g;

  var showsAll = true;
  if (options.showGood == true || options.showBad == true) {
    showsAll = false;
  }

  let matching = urlRegex.exec(data);
  var promises = [];

  while (matching) {
    const siteName = matching[1];
    if (!ignoreUrls.some((url) => siteName.startsWith(url))) {
      let checkLinks = new Promise(function (resolve) {
        axiosRequest(siteName)
          .then((res) => {
            var jsonOutput = { url: siteName, status: res.status };
            if (res.status == 200) {
              if (options.showGood || showsAll) {
                if (options.showJson) {
                  resolve(jsonOutput);
                } else {
                  console.log("|Good|\t\t".bgGreen.black + siteName.green);
                }
              } else {
                resolve(null);
              }
            } else if (res.status == 404 || res.status == 400) {
              if (options.showBad || showsAll) {
                if (options.showJson) {
                  resolve(jsonOutput);
                } else {
                  console.log("|Bad|\t\t".bgRed.black + siteName.red);
                }
              } else {
                resolve(null);
              }
            } else {
              if (showsAll) {
                if (options.showJson) {
                  resolve(jsonOutput);
                } else {
                  console.log("|Unknown|\t".bgWhite.black + siteName.gray);
                }
              } else {
                resolve(null);
              }
            }
          })
          .catch((error) => {
            if (showsAll) {
              if (options.showJson) {
                resolve({ url: siteName, status: error.status });
              } else {
                console.log(
                  "|Error|\t\t".bgYellow.black + siteName.yellow + "\t" + error
                );
              }
            } else {
              resolve(null);
            }
          });
      });
      promises.push(checkLinks);
    }
    matching = urlRegex.exec(data);
  }

  Promise.all(promises).then((done) => {
    var display = [];
    for (let i = 0; i < done.length; i++) {
      if (done[i] != null) {
        display.push(done[i]);
      }
    }
    //console.log(done);
    console.log(display);
    process.exit(0);
  });
}

//Main function
function cli(args) {
  //recieve argument options
  let options = versionOption(args);
  //determine output types
  if (
    options.showVersion == true ||
    args.slice(2) == "/v" ||
    args.slice(2) == "/version"
  ) {
    console.log(
      "project-checkurl By Jason Jiang, Release 0.1 | Version ".blue +
        version.version.blue
    );
  } else {
    //no arguments received
    if (args.length == 2) {
      console.error("No Arguments Received".red);
      console.error("Avaliable options:".green);
      console.error("fileName.txt".green);
      console.error("--v".green + " or " + "--version".green);
      console.error("--g".green + " or " + "--good".green);
      console.error("--b".green + " or " + "--bad".green);
      console.error("--a".green + " or " + "--all".green);
      console.error("--j".green + " or " + "--json".green);
      console.error(
        "--i".green + " or " + "--ignore".green + " ignoreFileName.txt"
      );
      process.exit(1);
    } else if (args.length >= 3) {
      var params = args.slice(2);
      const ignoreFile = options.ignoreUrl;
      var fileName = "./" + args[args.length - 1];

      //loop to allow the arguments to be at any position
      if (args.length > 3) {
        for (let i = 0; i < params.length; i++) {
          if (params[i].substring(0, 2) != "--") {
            fileName = params[i];
          }
        }
      }

      //start reading the file
      var ignoreList = [];
      if (ignoreFile) {
        fs.readFile(ignoreFile, "utf8", function (err, ignoreUrls) {
          if (err) {
            console.error(
              "An Error Occured While Reading Ignore URL File.".red
            );
            process.exit(1);
          }
          ignoreUrls = ignoreUrls.split("\n").filter((e) => !e.startsWith("#"));
          ignoreUrls.forEach((e) => {
            if (!["http://", "https://"].some((http) => e.startsWith(http))) {
              console.error(
                'Invaild urls. Please starts with "http:// or https://"'
              );
              process.exit(1);
            }
          });
          ignoreList = ignoreUrls;
        });
      }
      fs.readFile(fileName, "utf8", function (err, data) {
        if (err) {
          console.error("An Error Occured While Reading URL File.".red);
          process.exit(1);
        }
        console.log("\nValid URLs from '".yellow + fileName + "':\n".yellow);
        //start scanning the file, and display the results
        displayResult(data, options, ignoreList);
      });
    } else {
      console.log(args);
    }
  }
}

module.exports.cli = cli;
module.exports.versionOption = versionOption;
