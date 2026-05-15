interface Props {
  label?: string;
  fileName?: string;
  value: unknown;
  constrainHeight?: boolean;
}

export default function JsonCodeViewer({
  label,
  fileName = "payload.json",
  value,
  constrainHeight = true,
}: Props) {
  const json = JSON.stringify(value ?? {}, null, 2);
  const lines = json.split("\n");

  return (
    <div className="space-y-2">
      {label ? <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p> : null}
      <div className="overflow-hidden rounded-2xl border border-black/20 bg-[#111111] shadow-sm">
        <div className="flex h-10 items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="truncate font-mono text-xs text-white/70">{fileName}</span>
        </div>
        <div className={constrainHeight ? "max-h-96 overflow-auto" : "overflow-x-auto overflow-y-visible"}>
          <pre className="min-w-max py-3 font-mono text-xs leading-6 text-white">
            {lines.map((line, index) => (
              <div key={`${index}-${line}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)] px-4">
                <span className="select-none pr-4 text-right text-white/30">{index + 1}</span>
                <code className="whitespace-pre">{highlightJsonLine(line)}</code>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

function highlightJsonLine(line: string) {
  const keyMatch = line.match(/^(\s*)"([^"]+)":(.*)$/);

  if (!keyMatch) {
    return <span className="text-white">{line || " "}</span>;
  }

  return (
    <>
      <span className="text-white">{keyMatch[1]}</span>
      <span className="text-[#f59e0b]">"{keyMatch[2]}"</span>
      <span className="text-white">:</span>
      {highlightJsonValue(keyMatch[3])}
    </>
  );
}

function highlightJsonValue(value: string) {
  const trimmed = value.trim();
  const leading = value.slice(0, value.length - value.trimStart().length);
  const trailing = trimmed.endsWith(",") ? "," : "";
  const rawValue = trailing ? trimmed.slice(0, -1) : trimmed;

  if (!rawValue) {
    return <span className="text-white">{value}</span>;
  }

  if (rawValue.startsWith('"')) {
    return (
      <>
        <span className="text-white">{leading}</span>
        <span className="text-white">{rawValue}</span>
        <span className="text-white">{trailing}</span>
      </>
    );
  }

  return (
    <>
      <span className="text-white">{leading}</span>
      <span className="text-white">{rawValue}</span>
      <span className="text-white">{trailing}</span>
    </>
  );
}
