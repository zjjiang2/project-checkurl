
import arg from 'arg';

const fs = require('fs');
const colors = require('colors');
const axios = require('axios');

//setting regex expression for URLs
//const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,})/g;
//const urlRegex = /(https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,})/g;
const urlRegex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/;=]*))/g;


function versionOption(rawArgs) {
    const args = arg({
        '--version': Boolean,
        '--v': '--version'
    },
    { argv: rawArgs.slice(2)}
    );

    return {
        showVersion: args['--version'] || false
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function displayResult(data) {

    var goodLinks = 0;
    var badLinks = 0;
    var unknownLinks = 0;
    var unloadedLinks = 0;
    var totalLinks = 0;

    var doneMatch = false;

    let match = urlRegex.exec(data);
    while (match) {
        const siteName = match[1];
        //console.log(siteName);

        axios({
            method: 'GET',
            url: siteName,
            validateStatus: () => true
        }).then(res => {
            //console.log(res.status);

            if (res.status == 200) {
                console.log("|Good|\t\t".bgGreen.black + siteName.green);
                goodLinks++;
            }
            else if (res.status == 404 || res.status == 400) {
                console.log("|Bad|\t\t".bgRed.black + siteName.red);
                badLinks++;
            }
            else {
                console.log("|Unknown|\t".bgWhite.black + siteName.gray);
                unknownLinks++;
            }

        }).catch((error) => {
            //console.log({error})
            unloadedLinks++;
        });;
        totalLinks++;
        match = urlRegex.exec(data);
        if (!match){
            doneMatch = true;
        }
    }
    
    await sleep(3000);
    var links = {goodLinks, badLinks, unknownLinks, unloadedLinks, totalLinks}
    return Promise.resolve(links);

}

async function displayMsg(data){
    const a = await displayResult(data);
    
    // console.log("\nRESULTS:".yellow);
    // console.log("Good Links: ".bgGreen.black + a.goodLinks);
    // console.log("Bad Links: ".bgRed.black + a.badLinks);
    // console.log("Unknown Links: ".bgWhite.black + a.unknownLinks);
    // console.log("Unloaded Links: " + a.unloadedLinks);
    // console.log("Total Links: " + a.totalLinks);
}

export function cli(args) {

    let options = versionOption(args);

    if (options.showVersion == true || args.slice(2) == '/v' || args.slice(2) == '/version') {
        console.log("project-checkurl By Jason Jiang, Release 0.1, Version 1.0".blue);
    }
    else {

        if (args.length == 2) {
            console.log("Please enter a file name that resides in the same directory.".red);
        }
        else if (args.length == 3) {

            //convert args into file location string
            var fileName = './' + args[2];




            //start reading the file
            fs.readFile(fileName, 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                //data = text file contents
                //console.log(data);

                console.log("\nValid URLs from \'".yellow + args[2].yellow + "\':\n".yellow);

                //displayResult(data);
                displayMsg(data);

            });

        }
        else {
            console.log(args[2]);
        }



    }


}