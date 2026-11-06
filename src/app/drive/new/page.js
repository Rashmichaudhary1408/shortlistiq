"use client";

import { useReducer } from "react";
import { ArrowLeft } from "lucide-react";
import Stepper from "@/components/wizard/Stepper.js";
import UploadStep from "@/components/wizard/UploadStep.js";
import SkillsStep from "@/components/wizard/SkillsStep.js";
import RulesStep from "@/components/wizard/RulesStep.js";
import {
  wizardReducer,
  createInitialState,
} from "@/lib/wizardReducer.js";

function RunPlaceholder({ onBack }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold">Step 4: Run</h2>
        <p className="mt-2 text-slate-600">
          Scoring the resumes arrives on Day 6.
        </p>
      </section>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium hover:bg-slate-100"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    </div>
  );
}

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
      {state.step === 4 && <RunPlaceholder onBack={() => go(3)} />}
    </div>
  );
}