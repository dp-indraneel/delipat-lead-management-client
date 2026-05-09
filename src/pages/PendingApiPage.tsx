import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";

interface Props {
  title: string;
  description: string;
}

export default function PendingApiPage({ title, description }: Props) {
  return (
    <div className="space-y-5">
      <PageTitle title={title} subtitle={description} />
      <Card title="API Pending">
        <p className="text-sm text-[#013144]/65">
          This module is intentionally not integrated yet because you have not shared its API.
          Once you create it and send the response/request shape, I can wire it in without
          changing the rest of the app structure.
        </p>
      </Card>
    </div>
  );
}
