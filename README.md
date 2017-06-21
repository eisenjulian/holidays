# Holiday Pal
Google assistant bot that knows about holidays in Argentina based on [api.ai](api.ai) and Google Cloud Functions

## Requirements

1. Install [Node.js](https://nodejs.org/en/)
1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/)
1. Install [ngrok](https://ngrok.io/) to test locally
1. Create an [api.ai](api.ai) account
1. Have or create a Google Cloud Project with [Cloud Functions API](https://console.cloud.google.com/apis/api/cloudfunctions.googleapis.com/overview) and [billing](https://support.google.com/cloud/answer/6293499#enable-billing) enabled

## Setup

```bash
$ git clone https://github.com/eisenjulian/holidays.git
$ cd holidays
$ # install dependencies
$ npm install
$ # install cloud functions emulator
$ npm install -g @google-cloud/functions-emulator
$ gloud init
$ gcloud components update && gcloud components install beta
$ gcloud config set project <project_id>
$ # create a bucket in Google Cloud Storage to store files: if you use a different name update package.json
$ gsutil mb gs://holiday-bot-bucket
$ # deploy your cloud function
$ # in the logs you will get the URL for your cloud function to use in the api.ai integrations page
$ npm run deploy
```

1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing.
1. Click "Use API.AI" and then "Create Actions on API.AI" which will redirect you to api.ai.
1. Click "Save" to save the project.
1. Click on the gear icon to see the project settings.
1. Select "Export and Import".
1. Select "Restore from zip". Follow the directions to restore from the [holidayPal.zip](https://github.com/eisenjulian/holidays/raw/master/holidayPal.zip) in this repo.
1. In the Fulfillment page of the API.AI console, enable Webhook, set the URL to the hosting URL, then save.
1. Open API.AI's Integrations page, open the Settings menu for Actions on Google, then click Test.
1. Click View to open the Actions on Google simulator.
1. Type "Talk to my test app" in the simulator, or say "OK Google, talk to my test app" to any Actions on Google enabled device signed into your developer account.

### To update the Cloud Function

```bash
$ npm run deploy
```

### To test locally

```bash
$ functions start
$ npm run start
$ <ngrok_location>/ngrok http 8010
```

You will get a URL that looks like `https://XXXXXX.ngrok.io/<you-project>/<your-zone>/holidayPal` that points to your local server and where changes are updated immediately. Go to your api.ai agent integrations page and update the webhook. Don't forget to change it back when you're done testing

## Acknowledgements 
* The data of holidays in Argentina comes from [github.com/pjnovas/nolaborables](https://github.com/pjnovas/nolaborables)
* The code and documentation for this app are based on the [Google Actions samples](https://developers.google.com/actions/samples/)
