import { SoknadActionKeys, SoknadAction } from './soknadActions';
import { SoknadContextState } from './soknadContext';

const soknadReducer = (state: SoknadContextState, action: SoknadAction): SoknadContextState => {
  console.log('soknadReducer', action.type, action.payload);
  switch (action.type) {
    case SoknadActionKeys.SET_STATE_FROM_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    case SoknadActionKeys.SET_SOKNAD_TYPE:
      return {
        ...state,
        type: action.payload,
      };
    case SoknadActionKeys.SET_SOKNAD:
      return {
        ...state,
        søknad: action.payload,
      };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};
export default soknadReducer;
