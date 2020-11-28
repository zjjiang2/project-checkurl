// import arg from "arg";
// import { exit } from "process";
// import axios from "axios";
// import fs from "fs";
// import colors from "colors";
// import version from "../package.json";

const arg = require("arg");
const { exit } = require("process");
const { axiosRequest } = require("./axiosRequest");
const fs = require("fs");
const colors = require("colors");
const version = require("../package.json");

//function to handle all argument options
function versionOption(rawArgs) {
  const args = arg(
    {
      "--version": Boolean,
      "--v": "--version",
      "--ignore": String,
      "--i": "--ignore",
      "--all": Boolean,
      "--good": Boolean,
      "--bad": Boolean,
      "--json": Boolean,
      "--j": "--json",
      "--telescope": Boolean,
      "--t": "--telescope",
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
    telescope: args["--telescope"] || false,
  };
}

//displays the  final results
async function displayResult(data, options, ignoreUrls = []) {
  var regex
  if (options.telescope) {
    regex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/;=]*))/g;
  } else {
    regex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/;=]*))/g;
  }
  const urlRegex = regex;

  var showsAll = true;
  if (options.showGood == true || options.showBad == true) {
    showsAll = false;
  }

  let matching = urlRegex.exec(data);
  var promises = [];

  while (matching) {
    const siteName = matching[1];
    if (!ignoreUrls.some(url => siteName.startsWith(url))) {
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
    if (args.length == 2) {
      console.log(
        "Please enter a file name that resides in the same directory.".red
      );
    } else if (args.length >= 3) {
      var params = args.slice(2);

      if (options.telescope) {
        var urlName = args[args.length - 1];

        //loop to allow the arguments to be at any position
        if (args.length > 3) {
          for (let i = 0; i < params.length; i++) {
            if (params[i].substring(0, 2) != "--") {
              urlName = params[i];
            }
          }
        }

        //access the argument url
        axiosRequest(urlName)
          .then((obj) => {
            var data = "";
            //store data url into string
            for (let i = 0; i < obj.data.length; i++) {
              data = data + urlName + obj.data[i].url.slice(6) + "\n";
            }
            displayResult(data, options);
          })
          .catch((err) => {
            console.log("Invalid URL, Error:" + err);
          });
      } else {
        const ignoreFile = options.ignoreUrl;

        params = args.slice(2);
        var fileName = "./" + args[args.length - 1];

        //loop to allow the arguments to be at any position
        if (args.length > 3) {
          for (let i = 0; i < params.length; i++) {
            if (params[i].substring(0, 2) != "--") {
              fileName = "./" + params[i];
            }
          }
        }

        //start reading the file
        var ignoreList = [];
        if (ignoreFile) {
          fs.readFile(ignoreFile, "utf8", function (err, ignoreUrls) {
            if (err) {
              return console.log(err);
            }
            ignoreUrls = ignoreUrls
              .split("\n")
              .filter((e) => !e.startsWith("#"));
            ignoreUrls.forEach((e) => {
              if (!["http://", "https://"].some((http) => e.startsWith(http))) {
                console.log(
                  'Invaild urls. Please starts with "http:// or https://"'
                );
                exit(1);
              }
            });
            ignoreList = ignoreUrls;
          });
        }
        fs.readFile(fileName, "utf8", function (err, data) {
          if (err) {
            return console.log(err);
          }
          console.log("\nValid URLs from '".yellow + fileName + "':\n".yellow);
          //start scanning the file, and display the results
          console.log(ignoreList);
          displayResult(data, options, ignoreList);
        });
      }
    } else {
      console.log(args);
    }
  }
}

module.exports.cli = cli;
module.exports.versionOption = versionOption;