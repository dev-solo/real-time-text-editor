const text_editor = document.getElementById('text_editor');

const ws = new WebSocket("ws://localhost:443/"); // listen our server

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message['action']) {
        case 'set_text':
            text_editor.value = message['data'];
            break;
        case 'patch':
            // any changes
            text_editor.value = patch(text_editor.value, message['position'], message['selection'], message['text']);
            break;
    }
}

text_editor.onkeydown = (event) => {
    let cursor_position = text_editor.selectionStart;
    let end_selection = text_editor.selectionEnd;
    let selection = end_selection - cursor_position;
    if ((event.key).length < 2 && !event.ctrlKey) { // All key which contains only digit, symbol, letter, space 
        const data = JSON.stringify({
            action: 'patch',
            position: cursor_position,
            selection: selection,
            text: event.key,
        });
        ws.send(data);
    }
    if (event.keyCode == 13) { //KeyCode 13 - Enter
        const data = JSON.stringify({
            action: 'patch',
            position: cursor_position,
            selection: selection,
            text: '\n',
        });
        ws.send(data);
    }
    if (event.keyCode == 46) { //KeyCode 46 - Delete
        if (selection < 1) {
            selection += 1;
        }
        const data = JSON.stringify({
            action: 'patch',
            position: cursor_position,
            selection: selection,
            text: ''
        });
        ws.send(data);
    }
    if (event.keyCode == 8) { //KeyCode 8 - Backspace
        if (selection < 1) {
            cursor_position -= 1;
            selection += 1;
        }
        const data = JSON.stringify({
            action: 'patch',
            position: cursor_position,
            selection: selection,
            text: ''
        });
        ws.send(data);
    }
    if (event.keyCode == 90 && event.ctrlKey) { //KeyCode 90 - Z
        event.preventDefault();
        return false;
    }
}

text_editor.onpaste = (event) => {
    let cursor_position = text_editor.selectionStart;
    let end_selection = text_editor.selectionEnd;
    let selection = end_selection - cursor_position;

    const data = JSON.stringify({
        action: 'patch',
        position: cursor_position,
        selection: selection,
        text: event.clipboardData.getData('text'),
    });
    ws.send(data);
}

text_editor.oncut = (event) => {
    let cursor_position = text_editor.selectionStart;
    let end_selection = text_editor.selectionEnd;
    let selection = end_selection - cursor_position;

    const data = JSON.stringify({
        action: 'patch',
        position: cursor_position,
        selection: selection,
        text: '',
    });
    ws.send(data);
}

// Simple patcher
/*
 _________________________     _______________________     ____________________________
|                         |   |                       |   |                            |
| Text before client's    | + | Text which client add | + | Text after client's        |
| cursor who send changes | + | or empty string "\0"  | + | cursor or end of selection |
|_________________________|   |_______________________|   |____________________________|
*/
const patch = (str, index, selection, value) => {
    return str.substr(0, index) + value + str.substr(index + selection);
}