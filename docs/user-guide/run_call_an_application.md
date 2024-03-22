## Call an Application

You can Run a LinguFlow application using an asynchronous API.

## Prerequisites

You need to have a completed LinguFlow application with a [published version]() available.

When using the API to call an application, it is the published version of that application that is actually used.

## How to Call

1. Click the Connect App button within the App.
2. Follow the instructions to use the POST API to call the asynchronous interface, obtaining the interaction id for this interaction.
3. Use the GET API to query the previously obtained interaction id, retrieving the final response from the LinguFlow application.
