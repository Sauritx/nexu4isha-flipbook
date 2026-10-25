import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import Flipbook from "@/components/Flipbook";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "nexu4isha · A Birthday Flipbook for Didi" },
      {
        name: "description",
        content: "A little flipbook of birthday pages, made with love for Didi. Turn each page one by one.",
      },
      { property: "og:title", content: "nexu4isha · A Birthday Flipbook for Didi" },
      {
        property: "og:description",
        content: "Turn the pages of a little birthday flipbook made with love for Didi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <div className="fb-backdrop relative flex min-h-dvh flex-col overflow-x-hidden">
      <header className="flex flex-col items-center pt-6 pb-4">
        <h1 className="gold-text font-script text-5xl font-bold tracking-wide sm:text-6xl">nexu4isha</h1>
        <p className="mt-1 flex items-center gap-1.5 font-hand text-lg text-muted-foreground">
          a birthday flipbook for Didi
          <Heart className="h-4 w-4 fill-primary text-primary" />
        </p>
      </header>

      <main className="flex flex-1 flex-col">
        <Flipbook />
      </main>

      <footer className="pb-4 pt-2 text-center">
        <p className="font-hand text-base text-muted-foreground/80">from your (not-so) chota bacha ♡</p>
      </footer>
    </div>
  );
}
