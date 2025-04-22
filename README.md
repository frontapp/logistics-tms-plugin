# Logistics TMS Sample Plugin

This plugin demonstrates how to use the [Front Plugin SDK](https://dev.frontapp.com/docs/plugin-overview) to read and write data from an external system of record and display that additional context to the Front user. The example code demonstrates this within the context of reading data from a Transportation Management System (TMS) mocked in Airtable, effectively providing the Front user additional details about logistics shipments or transactions. You can adapt this code to a number of industries and use cases.

## Tutorial
To learn how to use this sample plugin, refer to the [tutorial](https://dev.frontapp.com/docs/logistics-tms-plugin) on the Front Developer Portal.

## Features
The plugin loads data from Airtable. If there is an application object on the conversation with ID S123456 or S654321 (example record-matching pattern for this sample code, but it can be adapted), then the data for that record loads from Airtable.

Additional features include:
* Loads the [Front Plugin SDK](https://dev.frontapp.com/reference/installation) through React context
* Reads data from a RESTful API and displays it in the Front sidebar
* Implements the [Front UI Kit](https://dev.frontapp.com/docs/front-ui-kit) to save time developing UI components
* Detects links attached to the selected Front conversation and loads record data related to those links
* Allows the user to search for a specific record by ID
* Lists documents attached to the record or conversation and allows users to attach those documents to the reply
* Lists notes related to the record and allows users to add new notes
* Drafts a reply to the recipient with pre-populated information (such as status and delivery date) from the external system
* Implements the plugin using React, Vite, and TypeScript.
