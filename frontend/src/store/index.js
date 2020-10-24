import { createStore } from 'redux';

const INITIAL_STATE = {
	crons: [],
};

function cronsReducer(state = INITIAL_STATE, action) {
	switch (action.type) {
		case 'SET_CRONS':
			return { ...state, crons: action.crons };
		default:
			return state;
	}
}

const store = createStore(cronsReducer);

export default store;
