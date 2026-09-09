/**
 * Legenda fixa no canto inferior esquerdo, ocupando ~16–243px.
 *
 * A régua de competência (em `Home`) divide essa borda: enquanto era
 * centrada com `min(960px, 100vw-2rem)`, sua borda esquerda caía em
 * `(100vw-960)/2` e cobria a legenda em telas estreitas — 83px de
 * sobreposição a 1.280px. Lá a régua passou a ser ancorada à direita
 * com `min(960px, 100vw-18rem)`, reservando espaço para esta legenda.
 * Mexer na largura de uma exige conferir a outra.
 */
export function MapLegend({ drilldown }: { drilldown: boolean }) {
  const stops = ['#f3f0ff', '#c7b8ff', '#7856d2', '#463c6d', '#2a2241'];
  return (
    <div
      aria-hidden="true"
      className="border-border bg-card/95 pointer-events-none absolute bottom-6 left-4 z-10 rounded-lg border px-3 py-2 font-margem text-[11px] shadow-md backdrop-blur-sm"
    >
      <div className="text-muted-foreground mb-1">
        Volume de exames — {drilldown ? 'por município' : 'por UF'}
      </div>
      {/* A escala é por posição relativa (percentil), não proporcional ao
          volume — ver `buildPercentileScale` em `lib/map-layers.ts`. Dizer
          só "menor → maior" sugeriria proporcionalidade que a cor não tem. */}
      <div className="text-muted-foreground/80 mb-1.5 text-[10px]">
        posição relativa · valores absolutos no tooltip
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-[10px]">menor</span>
        <div className="flex h-2 w-32 overflow-hidden rounded-sm">
          {stops.map((c) => (
            <span key={c} className="h-full flex-1" style={{ background: c }} />
          ))}
        </div>
        <span className="text-muted-foreground text-[10px]">maior</span>
      </div>
    </div>
  );
}
