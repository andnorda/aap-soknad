import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import useSteps from '../hooks/useSteps';
import { StepType } from '../components/StepWizard/Step';

interface DispatchStepWizardAction {
  payload?: any;
  error?: any;
  type:
    | 'SET_STEP_LIST'
    | 'SET_ACTIVE_STEP'
    | 'COMPLETE_AND_GOTO_NEXT_STEP'
    | 'RESET_STEP_WIZARD'
    | 'GOTO_PREVIOUS_STEP';
}
type StepWizardState = {
  stepList: Array<StepType>;
};
type StepWizardContextState = {
  stepList: Array<StepType>;
  currentStepIndex: number;
  currentStep: StepType;
  stepWizardDispatch: Dispatch<DispatchStepWizardAction>;
};
const StepWizardContext = createContext<StepWizardContextState | undefined>(undefined);

function stateReducer(state: StepWizardState, action: DispatchStepWizardAction) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case 'SET_STEP_LIST': {
      return {
        ...state,
        stepList: [...action.payload],
      };
    }
    case 'SET_ACTIVE_STEP': {
      let newStepList = state.stepList.map((e) => ({ ...e, active: false }));
      const index = action.payload;
      return {
        ...state,
        stepList: [
          ...newStepList.slice(0, index),
          { ...newStepList[index], active: true },
          ...newStepList.slice(index + 1),
        ],
      };
    }
    case 'COMPLETE_AND_GOTO_NEXT_STEP': {
      const currentStepIndex = state.stepList.findIndex((e) => e.active);
      const nextStepIndex = currentStepIndex + 1;
      console.log('completeandgotonext', currentStepIndex, nextStepIndex);
      let newStepList = state.stepList.map((step, index) => ({
        ...step,
        ...(index === currentStepIndex ? { completed: true } : {}),
        active: index === nextStepIndex,
      }));
      return {
        ...state,
        stepList: newStepList,
      };
    }
    case 'RESET_STEP_WIZARD': {
      let newStepList = state.stepList.map((e) => ({ ...e, completed: false }));
      return {
        ...state,
        stepList: [{ ...newStepList[0], active: true }, ...newStepList.slice(1)],
      };
    }
    case 'GOTO_PREVIOUS_STEP': {
      const currentStepIndex = state.stepList.findIndex((e) => e.active);
      const prevIndex = currentStepIndex - 1;
      const newStepList = state.stepList.map((step, index) => ({
        ...step,
        active: index === prevIndex,
      }));
      return {
        ...state,
        stepList: newStepList,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
interface Props {
  children: ReactNode;
}
export const StepWizardProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(stateReducer, { stepList: [] });
  useEffect(() => console.log(state?.stepList), [state]);
  const indexIsLegal = useCallback(
    (index: number) => index > -1 && index < state.stepList.length,
    [state]
  );
  const currentStepIndex = useMemo(() => state.stepList.findIndex((step) => step.active), [state]);
  const currentStep = useMemo(() => state.stepList.find((step) => step.active), [state]);
  const nextStep = useMemo(() => {
    const nextIndex = currentStepIndex + 1;
    if (indexIsLegal(nextIndex)) return state.stepList[nextIndex];
  }, [currentStepIndex, state]);

  const contextValue = useMemo(() => {
    return {
      stepList: state.stepList,
      currentStepIndex,
      currentStep,
      stepWizardDispatch: dispatch,
    };
  }, [state, dispatch]);
  return <StepWizardContext.Provider value={contextValue}>{children}</StepWizardContext.Provider>;
};
export const useStepWizard = () => {
  const context = useContext(StepWizardContext);
  if (context === undefined) {
    throw new Error('useStepWizard must be used within a StepWizardProvider');
  }
  return context;
};

export const setStepList = async (
  stepList: StepType[],
  dispatch: Dispatch<DispatchStepWizardAction>
) => {
  dispatch({ type: 'SET_STEP_LIST', payload: stepList });
};
export const setCurrentStepIndex = async (
  index: number,
  dispatch: Dispatch<DispatchStepWizardAction>
) => {
  dispatch({ type: 'SET_ACTIVE_STEP', payload: index });
};
export const completeAndGoToNextStep = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'COMPLETE_AND_GOTO_NEXT_STEP' });
};
export const goToPreviousStep = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'GOTO_PREVIOUS_STEP' });
};
export const resetStepWizard = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'RESET_STEP_WIZARD' });
};
