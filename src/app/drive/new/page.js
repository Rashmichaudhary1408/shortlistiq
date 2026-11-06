"use client";

import { useReducer } from "react";
import Stepper from "@/components/wizard/Stepper.js";
import UploadStep from "@/components/wizard/UploadStep.js";
import SkillsStep from "@/components/wizard/SkillsStep.js";
import RulesStep from "@/components/wizard/RulesStep.js";
import RunStep from "@/components/wizard/RunStep.js";
import {
  wizardReducer,
  createInitialState,
} from "@/lib/wizardReducer.js";

export default function NewDrivePage() {
  const [state, dispatch] = useReducer(
    wizardReducer,
    undefined,
    createInitialState
  );
  const go = (step) => dispatch({ type: "GO_TO_STEP", payload: { step } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New drive</h1>
      <Stepper current={state.step} />

      {state.step === 1 && (
        <UploadStep state={state} dispatch={dispatch} onNext={() => go(2)} />
      )}
      {state.step === 2 && (
        <SkillsStep
          state={state}
          dispatch={dispatch}
          onBack={() => go(1)}
          onNext={() => go(3)}
        />
      )}
      {state.step === 3 && (
        <RulesStep
          state={state}
          dispatch={dispatch}
          onBack={() => go(2)}
          onNext={() => go(4)}
        />
      )}
      {state.step === 4 && <RunStep state={state} onBack={() => go(3)} />}
    </div>
  );
}