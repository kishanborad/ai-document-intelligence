interface StepHeaderProps {
  title: string;
  description: string;
}

export default function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-surface">{title}</h2>
      <p className="text-xs text-dimmed mt-1">{description}</p>
    </div>
  );
}
