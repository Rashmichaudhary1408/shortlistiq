"use client";

import { useEffect, useReducer } from "react";
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

  // Everything in this wizard lives in memory only, so warn before a reload or
  // closed tab throws away uploaded files and choices.
  const hasWork =
    state.students.length > 0 || state.jdText.trim().length > 0;
  useEffect(() => {
    if (!hasWork) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasWork]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New drive</h1>
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
