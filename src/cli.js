
import arg from 'arg';

const fs = require('fs');
const colors = require('colors');
const axios = require('axios');
const version = require('../package.json').version;

const urlRegex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/;=]*))/g;

function versionOption(rawArgs) {
    const args = arg({
        '--version': Boolean,
        '--v': '--version',
        '--all' : Boolean,
        '--good' : Boolean,
        '--bad' : Boolean
    },
    { argv: rawArgs.slice(2)}
    );

    return {
        showVersion: args['--version'] || false,
        showAll: args['--all'] || false,
        showGood: args['--good'] || false,
        showBad: args['--bad'] || false
    };
}


async function displayResult(data, options) {

    var goodLinks = 0;
    var badLinks = 0;
    var unknownLinks = 0;
    var unloadedLinks = 0;
    var totalLinks = 0;

    var doneMatch = false;

    var allShowing = true;

    if (options.showGood == true || options.showBad == true){
        allShowing = false;
    }

    let match = urlRegex.exec(data);
    return new Promise((resolve, reject) => {

        while (match) {
            const siteName = match[1];

            axios({
                method: 'GET',
                url: siteName,
                setTimeout: 5000,
                validateStatus: () => true
            })
            .then(res => {
                if (res.status == 200) {
                    if(options.showGood == true || allShowing == true){
                        console.log("|Good|\t\t".bgGreen.black + siteName.green);
                    }
                    goodLinks++;
                }
                else if (res.status == 404 || res.status == 400) {
                    if(options.showBad == true || allShowing == true){
                        console.log("|Bad|\t\t".bgRed.black + siteName.red);
                    }
                    badLinks++;
                }
                else {
                    if(allShowing == true){
                        console.log("|Unknown|\t".bgWhite.black + siteName.gray);
                    }
                    unknownLinks++;
                }
            })
            .catch((error) => {
                unloadedLinks++;
                if(allShowing == true){
                    console.log("|Error|\t\t".bgYellow.black + siteName.yellow + "\t" + error);
                }
            });

            totalLinks++;

            match = urlRegex.exec(data);
            if (!match){
                doneMatch = true;
            }
        }

        setTimeout(() => resolve(), 0)
    });

}

export function cli(args) {

    let options = versionOption(args);

    if (options.showVersion == true || args.slice(2) == '/v' || args.slice(2) == '/version') {
        console.log("project-checkurl By Jason Jiang, Release 0.1, Version ".blue + version.blue);
    }
    else {

        if (args.length == 2) {
            console.log("Please enter a file name that resides in the same directory.".red);
        }
        else if (args.length >= 3) {
            var params = args.slice(args.length-2, args.length);;
            var fileName = './' + args[args.length-1];

            //loop to allow the arguments to be at any
            if(options.showGood == true || options.showBad == true){
                for(var i = 0; i < params.length; i++){
                    if(params[i].substring(0,2) != '--'){
                        fileName = './' + params[i];
                    }
                }
            }
            
            const promises = []

            //start reading the file
            fs.readFile(fileName, 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                else{
                console.log("\nValid URLs from \'".yellow + args[args.length-1].yellow + "\':\n".yellow);

                promises.push(displayResult(data, options));
                Promise
                    .all(promises)
                    .then(console.log(""))
                    .catch(err => console.error(err));
                }
            });
        }
        else {
            console.log(args[2]);
        }
    }
    
}   