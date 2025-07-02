```mermaid
sequenceDiagram
    participant browser
    participant server

    Note right of browser: User fills in the text field and clicks Save button

    browser->>browser: Add new note to local notes array and redraw notes list

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    activate server
    Note right of server: Server processes the JSON and adds the note
    server-->>browser: { "message": "note created" }
    deactivate server

    Note right of browser: No page reload; the new note appears immediately in
```