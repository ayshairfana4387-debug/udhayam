import { CheckCircle2 } from 'lucide-react';

export default function StepIndicator({ currentStep = 1, onSelectStep, text }) {
  const steps = [
    { number: 1, label: text.step1Short || 'Scheme & Bank', title: text.step1Title },
    { number: 2, label: text.step2Short || 'Docs & Form Guide', title: text.step2Title },
    { number: 3, label: text.step3Short || 'Sanction & Repayment', title: text.step3Title }
  ];

  return (
    <div className="step-indicator-container" aria-label="Step Progress">
      <div className="step-track">
        <div
          className="step-track-fill"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          return (
            <div
              key={step.number}
              className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isCompleted && onSelectStep && onSelectStep(step.number)}
              title={step.title}
              role="button"
              tabIndex={isCompleted ? 0 : -1}
            >
              <div className="step-circle">
                {isCompleted ? <CheckCircle2 size={18} /> : <span>{step.number}</span>}
              </div>
              <span className="step-label">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
