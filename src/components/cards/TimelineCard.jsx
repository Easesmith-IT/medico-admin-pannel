import { SectionCard } from "@/components/ui/SectionCard";
import { Timeline } from "@/components/ui/Timeline";

export const TimelineCard = ({ title = "Timeline", events = [] }) => (
  <SectionCard title={title}>
    <Timeline events={events} />
  </SectionCard>
);
