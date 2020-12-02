# project-checkurl
My first repository on Github for Release 0.1


This is a CLI Tool made in Node.js to take a file name as argument, then scan each valid URL found within the document for their availability.

Features:
1. Color coded outputs, 🟢green for good links, 🔴red for bad links, 🟡yellow for links with errors and ⚫gray for unknown links.
2. Supports windows and unix arguments for version display.
3. Request timeout is set to 5 seconds to prevent program from freezing, other errors are catched and displayed back to the client. 
4. Allows for JSON output format.

Arguments available: 
1. --v (or --version, /v or /version) to view the current tool's version.
2. --g (or --good) to list all good links.
3. --b (or --bad) to list all bad links.
4. --a (or --all) to view all links.
5. --j (or --json) to convert the output into JSON format.
6. [filename] (will scan the file of URLs and determine their availability.)
7. --i (or --ignore) [ignoreFile] ignores all listed URLs from the document.

# How to Use

Installing the package: ```npm install -g project-checkurl```

Check the current version: ```project-checkurl --v``` or ```project-checkurl --version```

Scan file for working URLs: ```project-checkurl filename.txt```

Filter good links only: ```project-checkurl --g filename.txt``` or ```project-checkurl --good filename.txt```

Filter bad links only: ```project-checkurl --b filename.txt``` or ```project-checkurl --bad filename.txt```

Show all links:  ```project-checkurl --a filename.txt``` or ```project-checkurl --all filename.txt```

JSON output format: ```project-checkurl --j filename.txt``` or ```project-checkurl --json filename.txt```

Ignore Urls from files: ```project-checkurl --i ignore-urls.txt filename.txt``` or ```project-checkurl --ignore ignore-urls.txt filename.txt```