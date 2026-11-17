/**
 * Os ícones do site, no traço do desenho original (feather-style).
 *
 * Portados de legado/assets/js/abrapesp.js sem mudar um ponto do
 * caminho: o visual tem de continuar idêntico ao que está no ar.
 */

const CAMINHOS: Record<string, string> = {
  home: `<path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>`,
  users: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  handshake: `<path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6a2 2 0 0 0 0-2.8l-4.6-4.6a2 2 0 0 0-1.4-.6H8L3 12"/><path d="m14 8-3.5 3.5a1.4 1.4 0 0 0 0 2 1.4 1.4 0 0 0 2 0L18 9"/><path d="m2 15 3 3"/><path d="m21 13 1-1"/>`,
  scroll: `<path d="M8 21h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7"/><path d="M5 3a2 2 0 0 0-2 2v3h4V5a2 2 0 0 0-2-2z"/><path d="M3 8v9a2 2 0 0 0 2 2h3"/><path d="M11 8h5M11 12h5M11 16h3"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
  news: `<path d="M4 4h13v16H5a2 2 0 0 1-2-2V4z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M7 8h6M7 12h6M7 16h4"/>`,
  pen: `<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>`,
  book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
  mail: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>`,
  phone: `<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.8 2.1z"/>`,
  pin: `<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  arrow: `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  ext: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>`,
  down: `<path d="M12 3v14"/><path d="m6 11 6 6 6-6"/><path d="M5 21h14"/>`,
  up: `<path d="m18 15-6-6-6 6"/>`,
  chev: `<path d="m6 9 6 6 6-6"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
  quote: `<path d="M10 11H6a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3M20 11h-4a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3"/>`,
  trophy: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>`,
  brain: `<path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 5.6V19a2 2 0 0 0 4 0M12 5a3 3 0 0 1 3 3 3 3 0 0 1 3 3 3 3 0 0 1-1 5.6V19a2 2 0 0 1-4 0M12 5v14"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>`,
  activity: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`,
  medal: `<circle cx="12" cy="15" r="6"/><path d="M12 12v3l2 1"/><path d="M8.5 9 5 2h5l2 4M15.5 9 19 2h-5l-2 4"/>`,
  star: `<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>`,
  heart: `<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>`,
  play: `<path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none"/>`,
  doc: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/>`,
  users2: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  lightbulb: `<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>`,
  ig: `<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>`,
  fb: `<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>`,
  yt: `<path d="M22 8a3 3 0 0 0-2.1-2.1C18 5.4 12 5.4 12 5.4s-6 0-7.9.5A3 3 0 0 0 2 8a31 31 0 0 0 0 8 3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5A3 3 0 0 0 22 16a31 31 0 0 0 0-8z"/><path d="m10 15 5-3-5-3z" fill="currentColor" stroke="none"/>`,
  linkedin: `<rect x="2" y="2" width="20" height="20" rx="4"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" stroke-width="2"/>`,
  x: `<path d="M4 3l7.5 9.5L4.5 21H7l6-6.8L18 21h2.5L13 11.5 19.5 3H17l-5.3 6.1L7 3z" fill="currentColor" stroke="none"/>`,
};

export type NomeDeIcone = keyof typeof CAMINHOS;

export default function Icone({
  nome,
  className,
}: {
  nome: string;
  className?: string;
}) {
  const caminho = CAMINHOS[nome];
  if (!caminho) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: caminho }}
    />
  );
}
