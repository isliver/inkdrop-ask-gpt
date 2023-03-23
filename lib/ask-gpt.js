"use babel";

import askGptMessageDialog from "./ask-gpt-main";

module.exports = {
    config : {
        gptApiKey: {
            title: 'Open AI API key',
            type: 'string',
            default: 'None'
        },
        language: {
            title: 'Language translation',
            type: 'string',
            default: 'English',
            enum: ["English", "Chinese", "Spanish", "Arabic", "Portuguese", "German", "French"]
        },
        timeout: {
            title: 'Time out for requests',
            type: 'integer',
            default: 60,
            minimum: 30
        }
    },

    activate() {
        inkdrop.components.registerClass(askGptMessageDialog);
        inkdrop.layouts.addComponentToLayout("modal", "askGptMessageDialog");
    },

    deactivate() {
        inkdrop.layouts.removeComponentFromLayout(
            "modal",
            "askGptMessageDialog"
        );
        inkdrop.components.deleteClass(askGptMessageDialog);
    },
};
