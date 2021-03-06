export const VIEW = 'VIEW';
export const CHEMICAL = 'CHEMICAL';
export const MONTH = 'MONTH';
export const SENSOR = 'SENSOR';
export const DAYHOUR = 'DAYHOUR';
export const LOGLINEAR = 'LOGLINEAR';
export const DATA = 'DATA';
export const WINDDATA = 'WINDDATA';
export const STATS = 'STATS';

export const selectView = (view) => ({
    type: VIEW,
    value: view
});

export const selectChemical = (chemical) => ({
    type: CHEMICAL,
    value: chemical
});

export const selectMonth = (month) => ({
    type:  MONTH,
    value: month
});

export const selectSensor = (sensor) => ({
    type:  SENSOR,
    value: sensor
});

export const toggleDayHour = (daily) => ({
    type:  DAYHOUR,
    value: daily
});

export const toggleLogLinear = (linearly) => ({
    type:  LOGLINEAR,
    value: linearly
});

export const loadData = (data) => ({
    type:  DATA,
    value: data
});

export const loadWindData = (data) => ({
    type:  WINDDATA,
    value: data
});

export const saveStats = (data) => ({
    type:  STATS,
    value: data
});