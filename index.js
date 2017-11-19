'use strict';
const en = require('./i18n/en');
const es = require('./i18n/es');
const locales = {en, es};

process.env.DEBUG = 'actions-on-google:*';
const httpRequest = require('request');
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
}

const getImage = txt => 'https://placeholdit.imgix.net/~text?txtsize=100&w=200&h=200&bg=ffffff&txtclr=000000&txt=' + txt;
const getDaysAppart = holiday => Math.ceil((holiday.date - new Date()) / (24 * 60 * 60 * 1000));

exports.holidayPal = (request, response) => {
    // console.log('Request headers: ' + JSON.stringify(request.headers));
    // console.log('Request body: ' + JSON.stringify(request.body));
    const app = new App({request, response});
    const locale = locales[
        (request.body.lang || request.body.locale).substr(0, 2)
        // app.getUserLocale().substr(0, 2)
    ];
    const _ = (key, params) => {
        const t = params? locale[key](params) : locale[key];
        if (typeof t === 'string') return t;
        return t[Math.floor(Math.random() * t.length)];
    }
    const actionMap = new Map();
    // console.log('Called intent: ' + app.getIntent());

    actionMap.set('today', app => {
        withHolidays(allHolidays => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const date = new Date(request.body.result.parameters.date);
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const year = date.getFullYear();

            const holiday = allHolidays.find(h => h.mes == month && h.dia == day && h.date.getFullYear() == year);
            const answer = holiday? _('a_holiday', holiday) : _('not_a_holiday');
            const followUp = hasScreen? _('followup') : _('today_followup_no_screen');

            app.ask(
                app.buildRichResponse()
                    .addSimpleResponse({speech: answer, displayText: answer})
                    .addSimpleResponse({speech: followUp, displayText: followUp})
                    .addSuggestions([_('next_holiday')])
            );
        });
    });

    actionMap.set('listHolidays', app => {
        const period = request.body.result.parameters['date-period'].split('/');
        const beginDate = new Date(period[0]);
        const endDate = new Date(period[1]);
        withHolidays(allHolidays => {
            const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
            const holidays = allHolidays.filter(h => h.date >= beginDate && h.date <= endDate);

            const list = app.buildList(_('title'));
            holidays.slice(0, 6).forEach(holiday => list.addItems(
                app.buildOptionItem(holiday.motivo)
                  .setTitle(holiday.motivo)
                  .setDescription(_('date', holiday))
                  .setImage(getImage(holiday.dia + '-' + holiday.mes), holiday.dia + '-' + holiday.mes)
            ));

            const richResponse = app.buildRichResponse();
            const answer = _('list_holidays', holidays);
            const followUp = hasScreen? _('followup') : _('list_followup_no_screen');
            
            richResponse
                .addSimpleResponse({speech: answer, displayText: answer})
                .addSimpleResponse({speech: followUp, displayText: followUp})
                .addSuggestions([_('is_today')]);

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
            const holidays = allHolidays.filter(h => h.date >= date).slice(0, 5);

            const list = app.buildList(_('title'));
            holidays.forEach(holiday => list.addItems(
                app.buildOptionItem(holiday.motivo)
                  .setTitle(holiday.motivo)
                  .setDescription(_('date', holiday))
                  .setImage(getImage(holiday.dia + '-' + holiday.mes), holiday.dia + '-' + holiday.mes)
            ));

            const richResponse = app.buildRichResponse();
            const answer = _('next', getDaysAppart(holidays[0]));
            const followUp = hasScreen? _('followup') : _('next_followup_no_screen');
            
            richResponse
                .addSimpleResponse({speech: answer, displayText: answer})
                .addSimpleResponse({speech: followUp, displayText: followUp})
                .addSuggestions([_('is_today')]);

            if (hasScreen)
                app.askWithList(richResponse, list);
            else
                app.ask(richResponse);

        });
    });

    app.handleRequest(actionMap);
};