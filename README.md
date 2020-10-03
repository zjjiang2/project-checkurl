# project-checkurl
My first repository on Github for Release 0.1


This is a CLI Tool made in Node.js to take a file name as argument, then scan each valid URL found within the document for their availability.

Features:
1. Color coded outputs, 🟢green for good links, 🔴red for bad links, 🟡yellow for links with errors and ⚫gray for unknown links.
2. Supports windows and unix arguments for version display.
3. Request timeout is set to 5 seconds to prevent program from freezing, other errors are catched and displayed back to the client.
Arguments available: 
1. --v (or --version, /v or /version to view the current tool's version.)
2. [filename] (will scan the file of URLs and determine their availability.)

# How to Use

Installing the package: ```npm install -g project-checkurl```

Check the current version: ```project-checkurl --v```

Scan file for working URLs: ```project-checkurl filename.txt```
