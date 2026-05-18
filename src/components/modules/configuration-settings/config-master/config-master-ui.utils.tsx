

/**
 * Highlights matches within a string using the <mark> tag.
 */
export const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) return text;
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-100 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};
