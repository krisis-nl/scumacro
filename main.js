import yargs from 'yargs'
import fs from 'fs'
import _ from 'lodash'


const KEYMAP_FILE  = 'keymaps/synapse.json'
const INPUTS_DIR   = 'inputs/'
const INPUT_FILE   = INPUTS_DIR + 'NAME-OF-THE-FILE-YOU-NEED'
const MACRO_NAME   = 'MAKE-ONE-UP'
const MACRO_UUID   = 'INSERT-HERE-AFTER-CREATING-A-NEW-MACRO-IN-SYNAPSE'
const OUTPUT_DIR   = 'output/'
const OUTPUT_FILE  = OUTPUT_DIR + MACRO_UUID + '.xml'

let mode = null

import generator from `./${mode}`

function writeFile(file, data, enc = 'utf8') {
    return new Promise((resolve, reject) => {
        fs.writeFile('./' + file, data, enc, (err) => {
            if (err) reject(err)
            resolve(`File ${file} written to disk.`)
        })
    })
}

function readFile(file, enc = 'utf8') {
    return new Promise((resolve, reject) => {
        fs.readFile('./' + file, enc, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}

function makeStart(name, uuid) {
    return `<Macro>
    <MacroName>${name}</MacroName>
    <UUID>${uuid}</UUID>
    <EventList>`
}

function makeEnd() {
    return `
    </EventList>
</Macro>
`
}

function makeStroke(hid, mod, state, delay) {
    return `
        <Event id="KEYBOARD">
            <HID>${hid}</HID>
            <Mod>${mod}</Mod>
            <State>${state}</State>
        </Event>
        <Event id="DELAY">
            <Delay>${delay}</Delay>
        </Event>`
}

function buildXML(input, keymap, defaultDelay = 24) {
    let hid, mod

    // Start the XML.
    let contents = makeStart(MACRO_NAME, MACRO_UUID)
    
    // Iterate over every character in the input and add the events.
    _.each(input, (char, i) => {
        let sequence = []
        let delay = defaultDelay

        // Normalize chars.
        char = char.toLowerCase()

        // Handle multi-stroke and mapping elements (like Shift + 3 (#)).
        switch (char) {
            case '\r': return  // Ignore CRLF with a passion.
            case '\n':
                char = 'return'
                delay = defaultDelay*3
                break
            case '#':
                sequence.push('shift', '3', 'shift')
                break
            case '_':
                sequence.push('shift', '-', 'shift')
                break
            case 't':
                if (i === 0) delay = defaultDelay*3
        }

        if (_.size(sequence) > 0) {
            
        
            _.each(sequence, (char, i) => {
                ({ hid, mod } = keymap[char])

                if (char !== 'shift') {
                    _.each([0,1], (state, i) => {
                        contents += makeStroke(hid, mod, state, delay)
                    })
                }
                else {
                    let state = (i === 0)? 0 : 1
                    contents += makeStroke(hid, mod, state, delay)
                }
            })
        }
        else {
            ({ hid, mod } = keymap[char])

            _.each([0,1], (state, i) => {
                contents += makeStroke(hid, mod, state, delay)
            })
        }
    })
    // Finish up the XML.
    contents += makeEnd()
    return contents
}

function main() {
    return
    let input, keymap = null
    let content, file

    readFile(KEYMAP_FILE)
        .then(JSON.parse, console.error)
        .then((data) => { 
            keymap = data
            console.log(`Keymap ${KEYMAP_FILE} was loaded.`)
            return readFile(INPUT_FILE)
        }, console.error)
        .then((data) => {
            input = data
            console.log(`Input file ${INPUT_FILE} was loaded.`)
            content = buildXML(input, keymap)
            writeFile(OUTPUT_FILE, content)
                .then((data) => {
                    console.log(data)
                    console.log('Job\'s done!');
                }, console.error)
        }, console.error)
        .catch(console.error)
}

main()