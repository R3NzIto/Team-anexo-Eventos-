import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { REDES } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="footer">
      <Logo className="footer__logo" />
      <p>Productores de eventos de fighting games en Mendoza, Argentina.</p>
      <nav className="footer__nav" aria-label="Pie de página">
        <Link href="/premier">Premier Smash League</Link>
        <Link href="/torneos">Torneos</Link>
        <Link href="/jugadores">Jugadores</Link>
        <Link href="/#organizar">Organizar un evento</Link>
      </nav>
      <ul className="footer__redes">
        {REDES.map((r) => (
          <li key={r.nombre}>
            <a href={r.href} target="_blank" rel="noopener" aria-label={r.nombre}>
              <Icon name={r.icon} />
            </a>
          </li>
        ))}
      </ul>
      <p className="footer__copy">© Team Anexo</p>
    </footer>
  );
}
