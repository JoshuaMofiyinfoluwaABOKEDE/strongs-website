/** A KJV reference that opens the passage in the King James Version. */
export function Ref({ r }: { r: string }) {
  return (
    <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(r)}&version=KJV`} target="_blank" rel="noopener" className="whitespace-nowrap">
      {r}
    </a>
  );
}
