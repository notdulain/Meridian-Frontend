interface AssignmentStepperProps {
  activeStep: number;
}

const STEPS = [
  "Select Delivery",
  "Select Vehicle",
  "Select Driver",
  "Select Route",
  "Confirm Assignment",
];

export function AssignmentStepper({ activeStep }: AssignmentStepperProps) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-body" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === activeStep;
          const isDone = stepNumber < activeStep;
          return (
            <div
              key={step}
              className={`btn ${isActive || isDone ? "btn-primary" : "btn-secondary"}`}
              style={{ cursor: "default" }}
            >
              {stepNumber}. {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
