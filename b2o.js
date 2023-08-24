#! /usr/bin/node

/**
 * For converting Boostnote spaces to obsidian vaults.
 *
 * Get the arguments:
 * -o, --outdir: directory to output the converted notes
 * -v, --verbose: output a lot more info to the terminal. Handy for debugging
 * -s, --spaceDirectory: The directory containing the Boostote space to convert
 */

const fs = require('fs-extra')
const json2md = require("json2md")
const yargs = require('yargs/yargs')
json2md.converters.tags = function (tags, json2md) {
    return tags
}
json2md.converters.literal = function (literal, json2md) {
    return literal
}

const { hideBin } = require('yargs/helpers');
const arguments = yargs(hideBin(process.argv)).argv
let NEW_NOTES_OUTPUT_DIRECTORY
let VERBOSE
let SPACE_DIRECTORY
let CONTINUE = false;
if((typeof arguments.v != "undefined") || (typeof arguments.verbose != "undefined")) {
    VERBOSE = true
}
if ((typeof arguments.o != "undefined") || (typeof arguments.outdir != "undefined")) {
    NEW_NOTES_OUTPUT_DIRECTORY = arguments.o || arguments.outdir
    if(!fs.existsSync(NEW_NOTES_OUTPUT_DIRECTORY)) {
        console.error("Destination directory specified does not exist. Cannot continue.")
        CONTINUE = false
    } else {
        CONTINUE = true
    }
} else {
    console.error("No destination directory specified. Please specify a destination and try again.")
}

if((typeof arguments.s != "undefined") || (typeof arguments.spaceDirectory != "undefined")) {
    SPACE_DIRECTORY = arguments.s || arguments.spaceDirectory
    if(!fs.existsSync(SPACE_DIRECTORY)) {
        console.error("Directorry specified for current spaces not valid. Please correct and try again.")
    } else {
        CONTINUE = true
    }
} else {
    console.error("No directory specified for current boostnote space to convert too obsidian. Cannot continue.")
}
if(CONTINUE == true) {
    const boostnoteDataDirectory = fs.readdirSync(SPACE_DIRECTORY + "/notes");
    const files = boostnoteDataDirectory.filter( ( elm ) => elm.match(/.*\.(json?)/ig));
    //Now let's create and set the directory for any attachments
    if(fs.existsSync(SPACE_DIRECTORY+"/attachments")) {
        fs.ensureDir(NEW_NOTES_OUTPUT_DIRECTORY+"/attachments").then(function() {
            fs.copy(SPACE_DIRECTORY+"/attachments", NEW_NOTES_OUTPUT_DIRECTORY+"/attachments").then(function() {
                console.log('Attachments successfully copied to new Vault directory. Now setting new diretory as vault\'s attachment directory.')
                fs.ensureDir(NEW_NOTES_OUTPUT_DIRECTORY+"/.obsidian").then(function() {
                    let vaultConfiguration = new Object();
                    vaultConfiguration.attachmentFolderPath = "attachments"
                    //let's ignore the folder as well
                    vaultConfiguration.userIgnoreFilters = "attachments"
                    //While we're busy there, let's disable Wikilinks, shall we?
                    vaultConfiguration.useMarkdownLinks = true
                    vaultConfiguration.newLinkFormat = "absolute"
                    vaultConfiguration = JSON.stringify(vaultConfiguration, null, 2);
                    fs.writeFile(NEW_NOTES_OUTPUT_DIRECTORY+"/.obsidian/app.json", vaultConfiguration, (err) => {
                        if(err){
                            console.error("Failed to create file: "+ NEW_NOTES_OUTPUT_DIRECTORY+".obsidian/app.json" + ":\n" + err)
                        } else {
                                console.log("Successfully created " + NEW_NOTES_OUTPUT_DIRECTORY+".obsidian/app.json")
                        }
                    })
                }).catch(function() {
                    console.error("Unable to ensure existance of directory "+NEW_NOTES_OUTPUT_DIRECTORY+".obsidian")
                })
            }).catch(err => {
                console.error("There was an error while copying the attachments to the new directrory:")
                console.error(err)
            })
        }).catch(err => {
            console.error("There was an error ensuring the destination attachment directory exists:")
            console.error(err)
        })
    }
    files.forEach(file => {
        let filePath = SPACE_DIRECTORY + "/notes/" + file
        if(fs.existsSync(filePath)) {
            fs.readFile(filePath, "utf8", function (err, data) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let noteData = JSON.parse(data);
                let noteTags = "";
                if(typeof noteData.tags != "undefined") {
                    noteData.tags.forEach(function(element) {
                            noteTags += "#"+element + " "
                    })
                }
                let linesAmnt = 0
                let convertedContent = noteData.content.replace(/:::(note|warning|error|success|tip)\s(.+)\n\n(.*)\n\n:::/gi, function($1, $2, $3, $4) {
                    let linesAmnt =  $4.split(/\r\n|\r|\n/).length
                    if(linesAmnt > 1) {
                        $4.replace(/\n\n/gi, "\n> ")
                    }
                    let foldingIndicator = ""
                    if(linesAmnt > 1) {
                        foldingIndicator = "-"
                        $4.replace(/\n.+/gi, "\n> ").replace(/\n/g, "")
                    }
                    let returnValue = "> [!" + $2 + "]" + foldingIndicator + " " + $3 + "\n> " + $4
                    return returnValue
                });
                if(noteData.folderPathname.indexOf('FORUM') == -1) {
                    let noteObject = json2md([
                        { literal: convertedContent },
                        { hr: "" },
                        { h5: "Tags:" },
                        { tags: noteTags },
                    ])
                    if(!fs.existsSync(NEW_NOTES_OUTPUT_DIRECTORY)) {
                        console.error("The output directory, " + NEW_NOTES_OUTPUT_DIRECTORY + ", does not exist. Please ensure that exists, is writable and try again.")
                    } else {
                        let OUTPUT_DIRECTORY = NEW_NOTES_OUTPUT_DIRECTORY.replace(/\/+$/, '') + noteData.folderPathname
                        if(!fs.existsSync(OUTPUT_DIRECTORY)) {
                            if(fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true })) {
                                OUTPUT_DIRECTORY = OUTPUT_DIRECTORY + "/"
                            }
                        } else {
                            if(noteData.folderPathname != "/") {
                                OUTPUT_DIRECTORY = OUTPUT_DIRECTORY + "/"
                            }
                        }
                        let newNotefile = OUTPUT_DIRECTORY + noteData.title.replace(/[^a-zA-Z0-9 ]/g, '') + ".md"
                        fs.writeFile(newNotefile, noteObject, (err) => {
                            if(err){
                                console.error("Failed to create file: "+ newNotefile + ":\n" + err)
                            } else {
                                if(VERBOSE == true) {
                                    console.log("Successfully created file: " + newNotefile)
                                }
                        }})
                    }
                }
            })
        } else {
            console.error("I have no idea how to happened, but the note file "+filePath+" doesn't exist!`")
        }
    });
}