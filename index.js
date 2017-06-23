'use strict';

process.env.DEBUG = 'actions-on-google:*';
const httpRequest = require('request');
const App = require('actions-on-google').ApiAiApp;

const URL = 'http://nolaborables.com.ar/api/v2/feriados/' + (new Date().getYear() + 1900);

const negatives = [
    "Sadly no",
    "No, get back to work!",
    "Not really, it would be nice though",
    "Not that I know of",
    "Maybe in some weird religion"
];

const getImage = txt => 
    'https://placeholdit.imgix.net/~text?txtsize=100&w=200&h=200&bg=ffffff&txtclr=000000&txt=' + txt;

const getDaysAppart = holiday => {
    const nextDate = new Date();
    nextDate.setUTCDate(holiday.dia);
    nextDate.setUTCMonth(holiday.mes - 1);
    return Math.ceil((nextDate - new Date()) / (24 * 60 * 60 * 1000));
};

const getFullDate = holiday => {
    const nextDate = new Date();
    nextDate.setUTCDate(holiday.dia);
    nextDate.setUTCMonth(holiday.mes - 1);
    return nextDate.toDateString();
}

exports.holidayPal = (request, response) => {
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));
    const app = new App({request, response});
    const actionMap = new Map();

    actionMap.set('today', app => {
        httpRequest(URL, (error, response, body) => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const date = new Date(request.body.result.parameters.date);
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const holiday = JSON.parse(body).find(h => h.mes == month && h.dia == day);
            const answer = holiday
                ? 'Yes, it is ' + holiday.motivo
                : negatives[Math.floor(Math.random() * negatives.length)];

            const followUp = hasScreen? '' : ' Try asking when the next holiday is';
            const simpleResponse = answer + '.\nWhat would you like to do next?' + followUp;

            app.ask(
                app.buildRichResponse()
                    .addSimpleResponse({speech: simpleResponse, displayText: simpleResponse})
                    .addSuggestions(['When is the next holiday?'])
            );
        });
    });

    actionMap.set('nextHoliday', app => {
        httpRequest(URL, (error, response, body) => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const date = new Date();
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const holidays = JSON.parse(body).filter(h => h.mes > month || (h.mes == month && h.dia > day)).slice(0, 3);
            const difference = getDaysAppart(holidays[0]);

            const list = app.buildList('Upcoming holidays');
            holidays.forEach(holiday => list.addItems(
                app.buildOptionItem(holiday.motivo)
                  .setTitle(holiday.motivo)
                  .setDescription(getFullDate(holiday))
                  .setImage(getImage(holiday.dia + '-' + holiday.mes), holiday.dia + '-' + holiday.mes)
            ));

            const followUp = hasScreen? '' : ' Try asking about specific dates';
            const simpleResponse = 'The next holiday is in ' + difference + ' days.\n' + 
                'What do you want to do next?' + followUp;
            const richResponse = app.buildRichResponse();
            
            // For some reason the first message is not spoken by the assistant on the first time
            // Temorary hack to fix that
            if (!hasScreen && request.body.originalRequest.data.conversation.type == 'NEW')
                richResponse.addSimpleResponse('Sure!');

            richResponse
                .addSimpleResponse({speech: simpleResponse, displayText: simpleResponse})
                .addSuggestions(['Is today a holiday?']);

            if (hasScreen)
                app.askWithList(richResponse, list);
            else
                app.ask(richResponse);

        });
    });

    app.handleRequest(actionMap);
};