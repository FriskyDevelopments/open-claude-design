/** Site footer with the trademark disclaimer (keep on every page). */
export function SiteFooter({ lang = "en" }: { lang?: "en" | "es" }) {
  return (
    <footer className="mt-6 border-t border-white/10 pt-4 pb-2 font-mono text-[10px] leading-4 tracking-wide text-white/35">
      {lang === "es"
        ? "FR!SKY Design es un proyecto independiente. No está afiliado ni respaldado por Anthropic. Claude es una marca registrada de Anthropic."
        : "FR!SKY Design is an independent project. Not affiliated with or endorsed by Anthropic. Claude is a trademark of Anthropic."}
    </footer>
  );
}
