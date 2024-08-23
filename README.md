# Ask GPT: inkdrop plugin

A plugin adds multiple functionalities using OpenAI GPT Chat

![](./assets/video_001.gif)

## Features
This plugin offers the following features:

* Text translation into the desired language.
* Paragraph spellchecking.
* Table creation based on data.
* General use of Chat GPT.


## Install

```bash
ipm install ask-gpt
```

To use the Chat GPT plugin for Inkdrop, you will need an OpenAI API key. Follow the steps below to obtain your API key and install the plugin:

1. Go to https://platform.openai.com/ and log in. If you don't have an account, create one.
2. Once you have an account, go to https://platform.openai.com/account/api-keys.
3. Click on "Create new secret key" to generate a new API key.
4. Copy the API key that is generated.
5. Open the Inkdrop app and go to 'Preferences -> Plugins -> ask-gpt'.
6. In the settings, paste your OpenAI API key into the 'Open AI API key'.

## Usage

### Translation and spellchecking

To use the translation or spellchecking function, select the text you want to translate or correct. If no text is selected, the function will be applied to the entire note.

![](./assets/image_001.png)
![](./assets/image_002.png)

To change the translation language to one other than the default language, simply add the request 'Translate to French', replacing 'French' with the desired language, at the end of the document.

### Table creation

To use the table creation function, make sure you have matching data. Once you have your data, simply type in the corresponding command and the table will be created automatically.

### Text Expansion

This tool takes brief notes or key ideas and develops them into complete paragraphs. It is useful for:

- Turning outlines into complete drafts
- Developing initial ideas into more elaborate content
- Helping to overcome writer's block

### Text Simplification

This tool reduces the complexity of the text to make it more accessible. It is useful for:

- Making technical texts understandable for a general audience
- Adapting content for different reading levels
- Improving the clarity of communication

### Keyword Extraction

This function identifies the most important or frequent terms in a text. It is useful for:

- Generating tags for articles or blog posts
- Identifying the main themes of a document
- Assisting in search engine optimization (SEO)

### Style Suggestions

This tool analyzes the text and offers recommendations to improve writing. It may include:

- Suggestions for varying sentence structure
- Identification of repetitive words and alternatives
- Recommendations to improve clarity and impact

### Question Generation

This function creates questions based on the content of the text. It is useful for:

- Creating study materials or exams
- Generating frequently asked questions (FAQ) for websites
- Encouraging deeper understanding of a text

### Paraphrasing

This tool rewrites the text while maintaining its original meaning. It is useful for:

- Avoiding plagiarism when citing sources
- Presenting the same information in different ways
- Improving fluency and variety in writing

### Format Conversion

This function adapts the style of the text to different formats or tones. It may include:

- Conversion between formal and informal styles
- Adapting text for different audiences (for example, technical to non-technical)
- Changing tone of voice (for example, professional, friendly, persuasive)

### General use of Chat GPT

To use the general chat function, simply add your request. If you wish to continue the conversation, add "---" and your next request to continue.

## Keybindings

| Keybinding     | Description                                |
| -------------- | ------------------------------------------ |
| **Ctrl-Alt-A** | Asks a prompt using GPT                    |
| **Ctrl-Alt-X** | Translates text using GPT                  |
| **Ctrl-Alt-S** | Performs spell checking using GPT          |
| **Ctrl-Alt-Q** | Generates questions using GPT              |
| **Ctrl-Alt-T** | Generates a table using GPT                |
| **Ctrl-Alt-R** | Provides a summary using GPT               |
| **Ctrl-Alt-P** | Extracts keywords using GPT                |
| **Ctrl-Alt-E** | Provides style suggestions using GPT       |
| **Ctrl-Alt-C** | Performs paraphrasing using GPT            |
| **Ctrl-Alt-W** | Expands text using GPT                     |
| **Ctrl-Alt-M** | Simplifies text using GPT                  |
| **Ctrl-Alt-F** | Converts text to formal style using GPT    |
| **Ctrl-Alt-I** | Converts text to informal style using GPT  |
| **Ctrl-Alt-N** | Converts text to technical style using GPT |


## Settings

| Config Key     | Description                                 | Default Value |
| -------------- | ------------------------------------------- | ------------- |
| **gptApiKey**  | Your OpenAI API key                         | 'None'        |
| **language**   | Language for translation                    | 'English'     |
| **timeout**    | Timeout for API requests in seconds         | 60            |
| **gptModel**   | Specifies which OpenAI model to use         | 'gpt-4o-mini' |
| **showTokens** | Whether to display used tokens in responses | false         |


### Settings UI

