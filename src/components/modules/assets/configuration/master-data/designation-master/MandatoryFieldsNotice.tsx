

interface MandatoryFieldsNoticeProps {
  message: string;
}

export function MandatoryFieldsNotice({ message }: MandatoryFieldsNoticeProps) {
  return (
    <div className="text-xs text-slate-500 font-medium px-1">
      {message}
    </div>
  );
}
