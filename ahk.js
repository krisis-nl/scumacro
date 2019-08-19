function makeStart(hotkey) {
    return `#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
; SendMode Event ; This is the default, don't use Input as it has no option for delays.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

${hotkey}::`
}

function makeEnd() {
    return `
Return
`
}

export default function generate(input, hotkey, defaultDelay = 24) {
    // Start the AHK Script.
    let content = makeStart(hotkey)
    
    // Iterate over every character in the input and add the events.
    _.each(input, (char, i) => {
        let delay = defaultDelay

        // Normalize chars.
        compChar = char.toLowerCase()

        // Handle multi-stroke and mapping elements (like Shift + 3 (#)).
        switch (compChar) {
            case '\r': return  // Ignore CRLF with a passion.
            // Add some extra delay on every line ending and set it back to default after.
            case '\n':
                content += `SetKeyDelay, ${defaultDelay*3}` + '\n'
                content += 'Send {Enter}' + '\n'
                content += `SetKeyDelay, ${defaultDelay}` + '\n'
                content += `Send ` // Start a new Send line to concatenate.
                break
            // The first `t` in the script opens the chat window, giving it more time to appear.
            case 't':
                
                if (i === 0) {
                    content += `SetKeyDelay, ${defaultDelay*3}` + '\n'
                    content += 'Send t' + '\n'
                    content += `SetKeyDelay, ${defaultDelay}` + '\n'
                }
                break
            // Translate reserved characters.
            case '#':
                content += '+3'
                break
            default:
                content += char
        }
    })
    // Finish up the file.
    content += makeEnd()
    return content
}
