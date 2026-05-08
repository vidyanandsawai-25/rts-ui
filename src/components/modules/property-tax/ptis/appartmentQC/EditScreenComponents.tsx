

export const CompactInput = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-[10px] font-medium text-gray-600 mb-0.5">{label}</label>
    <input
      type="text"
      value={value}
      readOnly
      aria-label={label}
      title={label}
      className="h-7 px-2 text-xs border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
    />
  </div>
);

export const CompactSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  onDropdownClick,
  isLoading = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  onDropdownClick?: () => void;
  isLoading?: boolean;
}) => {
  const handleClick = () => {
    if (onDropdownClick && options.length === 0 && !isLoading) {
      onDropdownClick();
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className="h-6 px-1 text-[10px] border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition w-full min-w-[80px] cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
    >
      <option value="">{isLoading ? "Loading..." : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export const CompactCellInput = ({
  value,
  onChange,
  placeholder = "Enter",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="h-6 px-1 text-[10px] border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition w-full min-w-[60px]"
  />
);
