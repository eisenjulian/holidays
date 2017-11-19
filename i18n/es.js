'use strict';
const dateFormat = require('dateformat');
dateFormat.i18n = {
    dayNames: [
        'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab',
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ],
    monthNames: [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
};

const es = {
	date: holiday => dateFormat(holiday.date, 'dddd, mmmm d'),
	title: 'Próximos feriados',
	a_holiday: (holiday) => `Siii, es el ${holiday.motivo}.`,
	not_a_holiday: [
	    "No es feriado, tristemente.",
	    "No es un feriado, vuelve a trabajar.",
	    "No es feriado, pero sería genial.",
	    "Que yo conozca no es feriado.",
	    "No es feriado, agarrá la pala!"
	],
	next_holiday: '¿Próximo feriado?',
	is_today: '¿El lunes es feriado?',
	followup: '¿Cómo seguimos?',
	today_followup_no_screen: '¿Y ahora? Puedes preguntarme por los próximos feriados`',
	list_followup_no_screen: '¿Algo más? Preguntame sobre fechas específicas',
	next_followup_no_screen: '¿Algo más? Preguntame sobre fechas específicas',
	list_holidays: (holidays) => {
		if (holidays.length == 0) return 'No hay feriados en esas fechas, perdón';
        if (holidays.length == 1) return 'Hay un sólo feriado en esas fechas. El ' + 
        	holidays[0].motivo + ' es el ' + dateFormat(holidays[0].date, 'dddd, mmmm d');
        return `Hay ${holidays.length} feriados en esas fechas`;
	},
	next: difference => {
        if (difference == 0) return '¡Hoy es feriado!';
        if (difference == 1) return '¡El próximo feriado es mañana!';
        return `El próximo feriado es en ${difference} días.`;
	},
};

module.exports = es;