"use babel";

import { useModal, actions } from "inkdrop";

let modal

const standardFunction = (type, title) => {
    const { editingNote } = inkdrop.store.getState()
    const { cm } = inkdrop.getActiveEditor()

    const noteBody = editingNote.body
    let selectedText = cm.getSelection()

    if (selectedText.length <= 1)
        selectedText = noteBody
    
    modal.show()

    callGPT(selectedText, type)
        .then((response) => {
            inkdrop.store.dispatch(actions.editingNote.update({ body: `${noteBody}\n\n---\n *${title}* \n\n${response}` }))
            inkdrop.store.dispatch(actions.editor.change(true))
            modal.close()
        })
        .catch((error) => {
            modal.close()
        })
}

inkdrop.commands.add(document.body, {
    "ask-gpt:ask": () => standardFunction('ask', 'GPT'),
    "ask-gpt:translate": () => standardFunction('translate', 'Translated text'),
    "ask-gpt:spellChecking": () => standardFunction('spell', 'Spell Cheking'),
    "ask-gpt:table": () => standardFunction('table', 'Summary Table'),
    "ask-gpt:summary": () => standardFunction('summary', 'Summary'),
    "ask-gpt:textExpansion": () => standardFunction('textExpansion', 'Expanded text'),
    "ask-gpt:textSimplification": () => standardFunction('simplification', 'Simplified text'),
    "ask-gpt:keywordExtraction": () => standardFunction('keywordExtraction', 'Keywords'),
    "ask-gpt:styleSuggestions": () => standardFunction('styleSuggestions', 'Suggestions'),
    "ask-gpt:questionGeneration": () => standardFunction('questionGeneration', 'Questions'),
    "ask-gpt:paraphrasing": () => standardFunction('paraphrasing', 'New text'),
    "ask-gpt:formalConversion": () => standardFunction('formal', 'Formal text'),
    "ask-gpt:informalConversion": () => standardFunction('informal', 'Informal text'),
    "ask-gpt:technicalConversion": () => standardFunction('technical', 'Technical text'),
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
    const SHOW_TOKENS = inkdrop.config.get('ask-gpt.showTokens')
    const { editingNote } = inkdrop.store.getState()
    const idInitNote = editingNote._id

    let context

    if (type == "translate")
        context = `Translate user input to ${LANGUAGE} in markdown format. Avoid extra descriptions/comments. No changes needed if same language detected.`
    else if (type == "table")
        context = `Create a summary table of the following text. The table should include the key points, main ideas, and any important details or data. Only provide a table, without any additional text.`
    else if (type == "summary")
        context = `Provide a concise summary of the following text, focusing on the main ideas and key points. The summary should be brief and to the point, without any additional details.`
    else if (type == "textExpansion")
        context = `Expand the following key points into full paragraphs.`
    else if (type == "simplification")
        context = `Simplify this text to make it easier to understand.`
    else if (type == "keywordExtraction")
        context = `Extract the most important keywords from this text and responds as a markdown list.`
    else if (type == "styleSuggestions")
        context = `Provide suggestions to improve the writing style of this text respecting the original language. Responds a the suggested text and down in a markdown list suggestions`
    else if (type == "questionGeneration")
        context = `Generate comprehension questions based on this text.`
    else if (type == "paraphrasing")
        context = `Paraphrase the following text while maintaining its original meaning.`
    else if (type == "formal")
        context = `Rewrite the following text in a formal style. Use professional language, complete sentences, and a respectful tone. Ensure the text is suitable for an academic or professional setting.`
    else if (type == "informal")
        context = `Rewrite the following text in an informal style. Use casual language, contractions, and a friendly tone, as if speaking to a friend or on social media.`
    else if (type == "technical")
        context = `Rewrite the following text in a technical style. Use precise terminology and include detailed explanations, as if writing for a specialized audience or a technical document. Ensure the language is clear and concise.`
    else if (type == "spell")
        context = `Revise the spelling of the paragraph in the respective language. Keep the paragraph unchanged.`
    else if (type == "ask")
        context = "Be a Markdown-based text editor assistant for the Inkdrop application. Use Markdown structure in your responses. If an answer is unknown, reply with 'Answer not found' in the corresponding language."

    context += "Keep the response in the original language of the text provided."

    let messages = [
        {
            "role": "system",
            "content": context
        },
        {
            "role": "user",
            "content": noteBody
        }
    ]

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    }

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
            console.log("🚀 tokens:", tokens)

            const gptAnswer = json['choices'][0]['message']
            let response = gptAnswer['content']

            if ( SHOW_TOKENS ) {
                const textTokens = showTokens(tokens)
                response = `${textTokens} \n\n${response}`
            }
                
            resolve(response)
        })
        .catch((error) => {
            clearTimeout(id)
            inkdrop.notifications.addError('GPT Ask', { dismissable: true, detail: "Request time out" })
            reject("Request time out")
        })
    })
}

const chekingNote = (initIdNote) => {
    const { editingNote } = inkdrop.store.getState()
    const idFinishNote = editingNote._id

    return initIdNote != idFinishNote
}

const showTokens = (tokens) => {
    const {
        prompt_tokens,
        completion_tokens,
        total_tokens
    } = tokens

    return `> Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}`
}

export default askGptMessageDialog;
