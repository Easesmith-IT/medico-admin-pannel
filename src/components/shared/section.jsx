import { CardHeader, CardTitle } from "../ui/card";

export const Section = ({ title, children }) => {
  return (
    <div className="space-y-4 rounded-[18px] border border-[#EAECEF] bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42_/_0.04)]">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold tracking-[-0.01em]">{title}</CardTitle>
      </CardHeader>
      {children}
    </div>
  );
};
