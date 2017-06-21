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
    'https://placeholdit.imgix.net/~text?txtsize=120&w=200&h=200&bg=ffffff&txtclr=000000&txt=' + txt;

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
            const simpleResponse = holiday
                ? 'Yes, it is ' + holiday.motivo
                : negatives[Math.floor(Math.random() * negatives.length)];

            app.ask(
                app.buildRichResponse()
                    .addSimpleResponse(simpleResponse)
                    .addSimpleResponse(hasScreen
                        ? 'What would you like to do next?'
                        : 'What would you like to do next? Try asking when the next holiday is'
                    )
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

            app.askWithList(
                app.buildRichResponse()
                    .addSimpleResponse('The next holiday is in ' + difference + ' days')
                    .addSimpleResponse(hasScreen
                        ? 'What do you want to do next?'
                        : 'What do you want to do next? Try asking about specific dates'
                    )
                    .addSuggestions(['Is today a holiday?']),
                list
            );
        });
    });

    app.handleRequest(actionMap);
};