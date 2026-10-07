import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link className="topbar__logo" href="/" aria-label="Team Anexo, inicio">
        <Logo />
      </Link>
      <nav className="topbar__nav" aria-label="Principal">
        <Link className="topbar__link topbar__link--smash" href="/premier">Premier</Link>
        <Link className="topbar__link" href="/torneos">Torneos</Link>
        <Link className="tag tag--p1" href="/jugadores"><span className="tag__p">P1</span> Jugadores</Link>
        <Link className="tag tag--p2" href="/#organizar"><span className="tag__p">P2</span> Organizar</Link>
      </nav>
    </header>
  );
}
