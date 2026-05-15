import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ActionButton = ({ tone = "primary", size = "default", className, ...props }) => {
  const variant = tone === "primary" ? "medico" : tone === "secondary" ? "outline" : tone === "danger" ? "destructive" : tone === "workflow" ? "secondary" : "ghost";

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("h-10 rounded-xl px-4 font-medium", className)}
      {...props}
    />
  );
};

export const PrimaryAction = (props) => <ActionButton tone="primary" {...props} />;
export const SecondaryAction = (props) => <ActionButton tone="secondary" {...props} />;
export const GhostAction = (props) => <ActionButton tone="ghost" {...props} />;
export const DangerousAction = (props) => <ActionButton tone="danger" {...props} />;
export const WorkflowAction = (props) => <ActionButton tone="workflow" {...props} />;
