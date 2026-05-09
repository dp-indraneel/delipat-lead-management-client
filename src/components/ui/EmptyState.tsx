interface Props {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-[#013144]/12 bg-[#013144]/[0.03] px-5 py-10 text-center">
      <h3 className="text-base font-semibold text-[#013144]">{title}</h3>
      <p className="mt-2 text-sm text-[#013144]/55">{description}</p>
    </div>
  );
}
