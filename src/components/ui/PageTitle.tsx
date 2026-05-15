interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageTitle({ title, subtitle, action }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-[#013144] sm:text-xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#013144]/50">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
