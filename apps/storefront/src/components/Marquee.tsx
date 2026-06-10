const TEXT = 'NO EXCUSES · NO LIMITS · NO MERCY · NMRC · ';

export function Marquee() {
  const chunk = TEXT.repeat(6);
  return (
    <div className="overflow-hidden border-y border-bone/10 bg-coal py-5 select-none" aria-hidden>
      <div className="flex w-max animate-marquee">
        <span className="font-varsity text-xl md:text-2xl uppercase tracking-[0.25em] text-bone/60 whitespace-nowrap">
          {chunk}
        </span>
        <span className="font-varsity text-xl md:text-2xl uppercase tracking-[0.25em] text-bone/60 whitespace-nowrap">
          {chunk}
        </span>
      </div>
    </div>
  );
}
