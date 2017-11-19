'use strict';
const dateFormat = require('dateformat');

const en = {
	date: holiday => dateFormat(holiday.date, 'dddd, mmmm dS'),
	title: 'Upcoming holidays',
	a_holiday: (holiday) => `Hurray, it is a holiday called ${holiday.motivo}.`,
	not_a_holiday: [
	    "Sadly it's not a holiday.",
	    "It's not a day off, get back to work!",
	    "It is not a holiday, it would be nice though.",
	    "It is not a holiday that I know of.",
	    "It's not a day off, grab that shovel!"
	],
	next_holiday: 'When is the next holiday?',
	is_today: 'Is today a holiday?',
	followup: 'What\'s next?',
	today_followup_no_screen: 'What\'s next? Try asking when the next holiday is',
	list_followup_no_screen: 'What\'s next? Try asking about specific dates',
	next_followup_no_screen: 'What\'s next? Try asking about specific dates',
	list_holidays: (holidays) => {
		if (holidays.length == 0) return 'There are no holidays in that period, sorry';
        if (holidays.length == 1) return 'There is just one holiday in that period. ' + 
        	holidays[0].motivo + ' is on ' + dateFormat(holidays[0].date, 'dddd, mmmm dS');
        return `There are ${holidays.length} holidays in that period`;
	},
	next: difference => {
        if (difference == 0) return 'The next holiday is today';
        if (difference == 1) return 'The next holiday is tomorrow';
        return `The next holiday is in ${difference} days`;
	},
};

module.exports = en;