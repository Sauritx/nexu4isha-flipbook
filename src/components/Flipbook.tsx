import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import coverAsset from "@/assets/cover.webp.asset.json";
import page1 from "@/assets/page-1.png.asset.json";
import page2 from "@/assets/page-2.webp.asset.json";
import page3 from "@/assets/page-3.webp.asset.json";
import page4 from "@/assets/page-4.png.asset.json";
import page5 from "@/assets/page-5.png.asset.json";
import page6 from "@/assets/page-6.webp.asset.json";
import { cn } from "@/lib/utils";

const PAGES = [
  { url: coverAsset.url, label: "Cover" },
  { url: page1.url, label: "Things 1 – 3" },
  { url: page2.url, label: "Things 4 – 7" },
  { url: page3.url, label: "Things 8 – 10" },
  { url: page4.url, label: "Things 11 – 14" },
  { url: page5.url, label: "Things 15 – 17" },
  { url: page6.url, label: "Final Wishes" },
];

const LAST = PAGES.length - 1;
const FLIP_MS = 900;

const pageAt = (i: number) => PAGES[i] ?? PAGES[0]!;

export default function Flipbook() {
  const [flipped, setFlipped] = useState<boolean[]>(() => Array(LAST).fill(false));
  const [inFlight, setInFlight] = useState<number | null>(null);
  const [interacted, setInteracted] = useState(false);

  const busyRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const swipedRef = useRef(false);

  const current = flipped.filter(Boolean).length;
  const currentRef = useRef(current);
  currentRef.current = current;

  const settleTimer = useRef<number | null>(null);

  const animateLeaf = useCallback((index: number, toFlipped: boolean) => {
    busyRef.current = true;
    setInteracted(true);
    setInFlight(index);
    setFlipped((prev) => {
      if (prev[index] === toFlipped) return prev;
      const copy = [...prev];
      copy[index] = toFlipped;
      return copy;
    });
    if (settleTimer.current) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      setInFlight(null);
      busyRef.current = false;
    }, FLIP_MS + 60);
  }, []);

  const next = useCallback(() => {
    if (busyRef.current) return;
    const k = currentRef.current;
    if (k >= LAST) return;
    animateLeaf(k, true);
  }, [animateLeaf]);

  const prev = useCallback(() => {
    if (busyRef.current) return;
    const k = currentRef.current;
    if (k <= 0) return;
    animateLeaf(k - 1, false);
  }, [animateLeaf]);

  const goTo = useCallback(
    (target: number) => {
      if (busyRef.current || target === currentRef.current) return;
      setInteracted(true);
      // Instant, no-stagger jump with a quick fade of the whole book.
      const stage = stageRef.current;
      if (stage) {
        stage.style.transition = "opacity 0.18s ease";
        stage.style.opacity = "0.35";
        window.setTimeout(() => {
          stage.style.opacity = "1";
          window.setTimeout(() => {
            stage.style.transition = "";
          }, 200);
        }, 190);
      }
      const copy = Array(LAST).fill(false);
      for (let i = 0; i < target; i++) copy[i] = true;
      setFlipped(copy);
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (e.clientX - rect.left > rect.width * 0.5) next();
    else prev();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 36) return;
    swipedRef.current = true;
    window.setTimeout(() => (swipedRef.current = false), 400);
    if (delta < 0) next();
    else prev();
  };

  const baseIndex = Math.min(current, LAST);

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center px-3">
      {/* floating hearts */}
      <Heart className="fb-float left-[6%] top-[18%] h-5 w-5" style={{ animationDelay: "0s" }} />
      <Heart className="fb-float right-[8%] top-[26%] h-4 w-4" style={{ animationDelay: "1.4s" }} />
      <Heart className="fb-float left-[12%] bottom-[16%] h-4 w-4" style={{ animationDelay: "2.6s" }} />
      <Heart className="fb-float right-[14%] bottom-[22%] h-5 w-5" style={{ animationDelay: "3.8s" }} />

      <div
        ref={stageRef}
        className="flip-stage select-none"
        onClick={onStageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flip-book">
          {/* page revealed beneath every leaf */}
          <div className="flip-base">
            <img src={pageAt(baseIndex).url} alt={pageAt(baseIndex).label} draggable={false} />
          </div>

          {PAGES.slice(0, LAST).map((page, i) => {
            const isFlipped = flipped[i];
            const inFlightLeaf = inFlight === i;
            const zIndex = inFlightLeaf ? LAST + 3 : isFlipped ? i + 1 : LAST - i;
            return (
              <div
                key={i}
                className={cn(
                  "flip-leaf",
                  isFlipped && "flip-leaf--flipped",
                  isFlipped && !inFlightLeaf && "flip-leaf--settled",
                  inFlightLeaf && "flip-leaf--inflight"
                )}
                style={{ zIndex }}
              >
                <div className="leaf-face">
                  <img src={page.url} alt={page.label} draggable={false} />
                </div>
                <div className="leaf-face leaf-face--back">
                  <img src={pageAt(i + 1).url} alt={pageAt(i + 1).label} draggable={false} />
                </div>
              </div>
            );
          })}
        </div>

        {current > 0 && (
          <button aria-label="Previous page" className="flip-zone flip-zone--left" onClick={prev} tabIndex={-1} />
        )}
        {current < LAST && (
          <button aria-label="Next page" className="flip-zone flip-zone--right" onClick={next} tabIndex={-1} />
        )}
      </div>

      {/* controls */}
      <div className="mt-5 flex w-full max-w-md flex-col items-center gap-3">
        {!interacted ? (
          <p className="fb-hint font-hand text-lg text-primary">
            tap the page or swipe to turn it <Heart className="mb-1 inline h-4 w-4" />
          </p>
        ) : (
          <p className="font-hand text-lg text-muted-foreground">{pageAt(current).label}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            disabled={current === 0 || inFlight !== null}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {PAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to page ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === current ? "w-6 bg-primary" : "w-2 bg-border hover:bg-gold-deep"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current === LAST || inFlight !== null}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
          {current + 1} / {PAGES.length}
        </p>
      </div>
    </div>
  );
}
