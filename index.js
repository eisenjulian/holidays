'use strict';

process.env.DEBUG = 'actions-on-google:*';
const httpRequest = require('request');
const dateFormat = require('dateformat');
const App = require('actions-on-google').ApiAiApp;

const year = new Date().getYear() + 1900
const URL = 'http://nolaborables.com.ar/api/v2/feriados/' + (new Date().getYear() + 1900);
const URL2 = 'http://nolaborables.com.ar/api/v2/feriados/' + (new Date().getYear() + 1901);

const addDate = (h, y) => {
    h.date = new Date(y, h.mes - 1, h.dia);
    return h;
};

const withHolidays = (callback) => {
    httpRequest(URL, (error, response, body) => {
        const first = JSON.parse(body).map(h => addDate(h, year));
        httpRequest(URL2, (error, response, body) => {
            callback(first.concat(JSON.parse(body).map(h => addDate(h, year + 1))));
        });
    });
};

const negatives = [
    "Sadly it's not a holiday",
    "It's not a day off, get back to work!",
    "It is not a holiday, it would be nice though",
    "It is not a holiday that I know of",
    "It's not a day off, grab that shovel!"
];

const getImage = txt => 
    'https://placeholdit.imgix.net/~text?txtsize=100&w=200&h=200&bg=ffffff&txtclr=000000&txt=' + txt;

const getDaysAppart = holiday => Math.ceil((holiday.date - new Date()) / (24 * 60 * 60 * 1000));

const getFullDate = holiday => holiday.date.toDateString();

exports.holidayPal = (request, response) => {
    // console.log('Request headers: ' + JSON.stringify(request.headers));
    // console.log('Request body: ' + JSON.stringify(request.body));
    const app = new App({request, response});
    const actionMap = new Map();
    // console.log('Called intent: ' + app.getIntent());

    actionMap.set('today', app => {
        withHolidays(allHolidays => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const date = new Date(request.body.result.parameters.date);
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const holiday = allHolidays.find(h => h.mes == month && h.dia == day);
            const answer = holiday
                ? 'Hurray, it is a holiday called ' + holiday.motivo
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

    actionMap.set('listHolidays', app => {
        const period = request.body.result.parameters['date-period'].split('/');
        const beginDate = new Date(period[0]);
        const endDate = new Date(period[1]);
        withHolidays(allHolidays => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const holidays = allHolidays.filter(
                h => h.date >= beginDate && h.date <= endDate
            );
            console.log('=====', holidays);

            const list = app.buildList('Upcoming holidays');
            holidays.slice(0, 5).forEach(holiday => list.addItems(
                app.buildOptionItem(holiday.motivo)
                  .setTitle(holiday.motivo)
                  .setDescription(getFullDate(holiday))
                  .setImage(getImage(holiday.dia + '-' + holiday.mes), holiday.dia + '-' + holiday.mes)
            ));

            let expression = '';
            if (holidays.length == 0)
                expression = 'There are no holidays in that period, sorry';
            else if (holidays.length == 1)
                expression = 'There is just one holiday in that period. ' + 
                    holidays[0].motivo + ' is on ' + dateFormat(holidays[0].date, 'dddd, mmmm dS');
            else 
                expression = `There are ${holidays.length} holidays in that period`;
            
            const followUp = hasScreen? '' : ' Try asking about specific dates';
            const simpleResponse = expression + '.\nWhat\'s next?' + followUp;
            const richResponse = app.buildRichResponse();
            
            richResponse
                .addSimpleResponse({speech: simpleResponse, displayText: simpleResponse})
                .addSuggestions(['Is today a holiday?']);

            if (hasScreen && holidays.length > 1)
                app.askWithList(richResponse, list);
            else
                app.ask(richResponse);

        });
    });

    actionMap.set('nextHoliday', app => {
        withHolidays(allHolidays => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const date = new Date();
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const holidays = allHolidays.filter(h => h.mes > month || (h.mes == month && h.dia > day)).slice(0, 5);
            const difference = getDaysAppart(holidays[0]);

            const list = app.buildList('Upcoming holidays');
            holidays.forEach(holiday => list.addItems(
                app.buildOptionItem(holiday.motivo)
                  .setTitle(holiday.motivo)
                  .setDescription(getFullDate(holiday))
                  .setImage(getImage(holiday.dia + '-' + holiday.mes), holiday.dia + '-' + holiday.mes)
            ));

            const followUp = hasScreen? '' : ' Try asking about specific dates';
            let expression = '';
            if (difference == 0)
                expression = 'today';
            else if (difference == 1)
                expression = 'tomorrow';
            else 
                expression = `in ${difference} days`;

            const simpleResponse = 'The next holiday is ' + expression + 
                '.\nWhat\'s next?' + followUp;
            const richResponse = app.buildRichResponse();
            
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