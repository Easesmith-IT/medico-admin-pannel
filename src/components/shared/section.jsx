import { CardHeader, CardTitle } from "../ui/card";

export const Section = ({ title, children }) => {
  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      {children}
    </div>
  );
};
