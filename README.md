# Logistics TMS Sample Plugin

To test this plugin:

1. In Front, create an app from the Developers settings page with a plugin sidebar feature.
1. Point the plugin to http://127.0.0.1:5173/
1. Add a context link feature that matches with the pattern S[6 digists]. For example, S123456 or S654321.
1. In your terminal, clone this repository.
1. Run `npm install` to install dependencies.
1. Run `npm run dev` to start a development server.
1. Create a `.env` file in the project directory and fill it with the contents of the **TMS Logistics Env** secure note in 1Password.
1. In Front, add [context links](https://help.front.com/en/articles/2002) to the conversation with IDs S123456 and S654321.
1. Open your plugin.

## Features
The plugin loads data from Airtable. If there is a context link on the conversation with ID S123456 or S654321, then the data for that record loads from Airtable.

Additional features include:
* Switch between matching records with dropdown
* Search for TMS records
* Create a draft reply with relevant data from the TMS record
* Attach documents to draft
* View and add notes attached to record
