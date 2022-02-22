// function that takes in a piece of state: 
// any state  that has to do with alerts and 
// an action, an action is going
// to get dispatched from an actions file
import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

function alertReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
        // So we're going to use the spread operator and say state, which is this right here.
        // So if there's already an alert in there, we want to make sure that that we just basically copy it and
        // then add our alert, our new alert. 
        // And we can do that by just saying action and then we'll have the data inside of a payload.
      return [...state, payload]; 
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload); //payload is just the id
    default:
      return state;
  }
}

export default alertReducer;

