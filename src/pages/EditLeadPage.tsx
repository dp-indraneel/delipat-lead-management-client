import LeadFormPage from "./LeadFormPage";

interface Props {
  leadId: number;
}

export default function EditLeadPage({ leadId }: Props) {
  return <LeadFormPage mode="edit" leadId={leadId} />;
}
