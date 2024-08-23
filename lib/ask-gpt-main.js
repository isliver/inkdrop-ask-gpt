"use babel";

import { useModal, actions } from "inkdrop";

let modal

const askFunction = () => {
    const { editingNote } = inkdrop.store.getState()
    const noteBody = editingNote.body

    modal.show()

    callGPT(noteBody, 'ask')
    .then((response) => {
        inkdrop.store.dispatch(actions.editingNote.update({ body: `${noteBody}\n\n----\n\n *gpt* \n\n${response}` }))
        inkdrop.store.dispatch(actions.editor.change(true))
        modal.close()
    })
    .catch((error) => {
        modal.close()
    })
}

const tableFunction = () => {
    const { editingNote } = inkdrop.store.getState()
    const noteBody = editingNote.body

    modal.show()

    callGPT(noteBody, 'table')
        .then((response) => {
            inkdrop.store.dispatch(actions.editingNote.update({ body: `${noteBody}\n\n${response}` }))
            inkdrop.store.dispatch(actions.editor.change(true))
            modal.close()
        })
        .catch((error) => {
            modal.close()
        })
}

const translateFunction = () => {
    const { editingNote } = inkdrop.store.getState()
    const noteBody = editingNote.body
    const { selection, text } = selectText(noteBody)

    modal.show()

    callGPT(text, 'translate')
        .then((response) => {
            const newNoteBody = selection ? `${noteBody}\n\n----\n\n *gpt* \n\n${response}` : response

            inkdrop.store.dispatch(actions.editingNote.update({ body: newNoteBody }))
            inkdrop.store.dispatch(actions.editor.change(true))
            modal.close()
        })
        .catch((error) => {
            modal.close()
        })
}

const spellCheckingFunction = () => {
    const { editingNote } = inkdrop.store.getState()
    const noteBody = editingNote.body
    const { text } = selectText(noteBody)

    modal.show()

    callGPT(text, 'spell')
    .then((response) => {
        inkdrop.store.dispatch(actions.editingNote.update({ body: `${noteBody}\n\n---\n *Spell Cheking* \n\n${response}` }))
        inkdrop.store.dispatch(actions.editor.change(true))
        modal.close()
    })
    .catch((error) => {
        modal.close()
    })
}

inkdrop.commands.add(document.body, {
    "ask-gpt:ask": askFunction,
})

inkdrop.commands.add(document.body, {
    "ask-gpt:table": tableFunction,
})

inkdrop.commands.add(document.body, {
    "ask-gpt:translate": translateFunction,
})

inkdrop.commands.add(document.body, {
    "ask-gpt:spellChecking": spellCheckingFunction,
})

const askGptMessageDialog = (props) => {
    modal = useModal();
    const { Dialog } = inkdrop.components.classes;

    return (
        <Dialog {...modal.state} onBackdropClick={modal.close} style="max-width: 300px;">
            <Dialog.Title>Ask GPT</Dialog.Title>
            <Dialog.Content>Processing the request. Please wait.</Dialog.Content>
            <Dialog.Actions>
                <button className="ui button" onClick={modal.close}>
                    Close
                </button>
            </Dialog.Actions>
        </Dialog>
    );
}

const callGPT = (noteBody, type) => {
    const OPENAI_API_KEY = inkdrop.config.get('ask-gpt.gptApiKey')
    const MODEL = inkdrop.config.get('ask-gpt.gptModel')
    const LANGUAGE = inkdrop.config.get('ask-gpt.language')
    const TIME_OUT = inkdrop.config.get('ask-gpt.timeout')
    const { editingNote } = inkdrop.store.getState()
    const idInitNote = editingNote._id

    let context

    if (type == "translate")
        context = `Translate user input to ${LANGUAGE} in markdown format. Avoid extra descriptions/comments. No changes needed if same language detected.`
    else if (type == "table")
        context = `Create a markdown summary table and brief description of the text using data provided by the user.`
    else if (type == "spell")
        context = `Revise the spelling of the paragraph in the respective language. Keep the paragraph unchanged.`
    else if (type == "ask")
        context = "Be a Markdown-based text editor assistant for the Inkdrop application. Use Markdown structure in your responses. If an answer is unknown, reply with 'Answer not found' in the corresponding language."

    let messages = [
        {
            "role": "system",
            "content": context
        }
    ]

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    }

    messages.push({
        "role": "user",
        "content": noteBody
    })

    const postData = JSON.stringify({
        "model": MODEL,
        "messages": messages
    })

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIME_OUT * 1000);

    return new Promise((resolve, reject) => {
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: postData,
            signal: controller.signal
        })
        .then((response) => response.json())
        .then((json) => {
            clearTimeout(id)

            const changeBTNotes = chekingNote(idInitNote)

            if (changeBTNotes) {
                inkdrop.notifications.addWarning('GPT Ask', { dismissable: true, detail: "Note change, request cancelled" })
                reject("Note change, request cancelled")
                return
            }
            
            
            if ('error' in json) {
                const errorResponse = json['error']['message']
                inkdrop.notifications.addError('GPT Ask', { dismissable: true, detail: errorResponse })
                reject(errorResponse)
                return
            }

            const tokens = json['usage']
            let gptAnswer = json['choices'][0]['message']

            resolve(gptAnswer['content'])
        })
        .catch((error) => {
            clearTimeout(id)
            inkdrop.notifications.addError('GPT Ask', { dismissable: true, detail: "Request time out" })
            reject("Request time out")
        })
    })
}

const selectText = (allText) => {
    const { cm } = inkdrop.getActiveEditor()
    const selectionText = cm.getSelection()
    const hasSelection = selectionText.length > 0

    return {
        selection: hasSelection,
        text: hasSelection ? selectionText : allText
    }
}

const chekingNote = (initIdNote) => {
    const { editingNote } = inkdrop.store.getState()
    const idFinishNote = editingNote._id

    return initIdNote != idFinishNote
}

export default askGptMessageDialog;
