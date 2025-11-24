export const Info = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-medium text-foreground">
        {value || "Not provided"}
      </p>
    </div>
  );
};
