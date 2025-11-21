import { PixelatedCash } from "./pixelated-cash";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-400/15 liquid-blob" />
      <div
        className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-400/12 liquid-blob"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-pink-400/10 liquid-blob"
        style={{ animationDelay: "-10s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-400/8 liquid-blob"
        style={{ animationDelay: "-15s" }}
      />
      <div className="absolute inset-0 grid-pattern" />
      <PixelatedCash />
    </div>
  );
}
