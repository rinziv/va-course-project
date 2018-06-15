import {VIEW, CHEMICAL, MONTH, SENSOR, DAYHOUR, LOGLINEAR, DATA, WINDDATA, STATS} from './../actions/'
import {ALL, TEMPORAL, VECTORIAL} from "../constants";

const initialState = {
    view: VECTORIAL,
    chemical: null,
    month: ALL,
    sensor: 1,
    daily: true,
    linearly: true,
    data: null,
    winddata: null,
    stats: null
};

const rootReducer = (state = initialState, action) => {

    switch (action.type) {
        case VIEW:
            return {
                ...state,
                view: action.value
            };
        case CHEMICAL:
            return {
                ...state,
                chemical: action.value,
            };
        case MONTH:
            return {
                ...state,
                month: action.value,
            };
        case SENSOR:
            return {
                ...state,
                sensor: action.value,
            };
        case DAYHOUR:
            return {
                ...state,
                daily: action.value,
            };
        case LOGLINEAR:
            return {
                ...state,
                linearly: action.value,
            };
        case DATA:
            return {
                ...state,
                data: action.value,
            };
        case WINDDATA:
            return {
                ...state,
                winddata: action.value,
            };
        case STATS:
            return {
                ...state,
                stats: action.value,
            };
        default:
            return state;
    }
};

export default rootReducer;