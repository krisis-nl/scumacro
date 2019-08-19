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

export default function generate(input, keymap, defaultDelay = 24) {
    let hid, mod

    // Start the XML.
    let content = makeStart(MACRO_NAME, MACRO_UUID)
    
    // Iterate over every character in the input and add the events.
    _.each(input, (char, i) => {
        let sequence = []
        let delay = defaultDelay

        // Normalize chars.
        compChar = char.toLowerCase()

        // Handle multi-stroke and mapping elements (like Shift + 3 (#)).
        switch (compChar) {
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
                        content += makeStroke(hid, mod, state, delay)
                    })
                }
                else {
                    let state = (i === 0)? 0 : 1
                    content += makeStroke(hid, mod, state, delay)
                }
            })
        }
        else {
            ({ hid, mod } = keymap[char])

            _.each([0,1], (state, i) => {
                content += makeStroke(hid, mod, state, delay)
            })
        }
    })
    // Finish up the XML.
    content += makeEnd()
    return content
}