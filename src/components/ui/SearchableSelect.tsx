import Select from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  placeholder?: string;
  isClearable?: boolean;
  onChange: (value: string) => void;
}

const styles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    borderColor: state.isFocused ? "#fcb61f" : "rgba(1, 49, 68, 0.12)",
    boxShadow: "none",
    backgroundColor: "rgba(1, 49, 68, 0.04)",
    "&:hover": {
      borderColor: "#fcb61f",
    },
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#fcb61f"
      : state.isFocused
        ? "rgba(1, 49, 68, 0.08)"
        : "#ffffff",
    color: "#013144",
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: "#013144",
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: "rgba(1, 49, 68, 0.45)",
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: 10,
    overflow: "hidden",
  }),
};

export default function SearchableSelect({
  options,
  value,
  placeholder,
  isClearable = true,
  onChange,
}: Props) {
  return (
    <Select
      isSearchable
      isClearable={isClearable}
      options={options}
      value={options.find((option) => option.value === value) ?? null}
      placeholder={placeholder}
      styles={styles}
      onChange={(nextValue) => onChange(nextValue?.value || "")}
    />
  );
}
