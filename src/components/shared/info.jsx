export const Info = ({ label, value }) => {
  const displayValue =
    value === undefined || value === null || value === ""
      ? "Not provided"
      : String(value);

  return (
    <div className="min-w-0 flex flex-col gap-1">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="break-words text-[15px] font-medium leading-snug text-foreground">
        {displayValue}
      </p>
    </div>
  );
};
