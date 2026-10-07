"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { separarCuenta, unirCuentas } from "../acciones";

type Cuenta = { id: string; gamerTag: string; torneos: number };

/** "Trinki76 · 3 torneos · sgg:2389294": el id ayuda a distinguir cuentas con el mismo nombre. */
const etiqueta = (c: Cuenta) => `${c.gamerTag} · ${c.torneos} ${c.torneos === 1 ? "torneo" : "torneos"} · ${c.id}`;

export function CuentasAdmin({ cuentas, alias }: { cuentas: Cuenta[]; alias: { secundario: string; principal: string }[] }) {
  const router = useRouter();
  const [secundaria, setSecundaria] = useState("");
  const [principal, setPrincipal] = useState("");
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [ocupado, startTransition] = useTransition();
  const porId = new Map(cuentas.map((c) => [c.id, c]));
  const secundarias = new Set(alias.map((a) => a.secundario));
  const nombre = (id: string) => porId.get(id)?.gamerTag ?? id;

  function correr(accion: () => ReturnType<typeof unirCuentas>, exito: string) {
    setMensaje(null);
    startTransition(async () => {
      const r = await accion();
      setMensaje(r.ok ? { ok: true, texto: exito } : { ok: false, texto: r.mensaje });
      if (r.ok) { setSecundaria(""); setPrincipal(""); router.refresh(); }
    });
  }

  return (
    <div className="admin-cuentas">
      <form className="admin-form" onSubmit={(e) => {
        e.preventDefault();
        correr(() => unirCuentas(secundaria, principal), `${nombre(secundaria)} quedó unida a ${nombre(principal)}.`);
      }}>
        <label className="campo campo--ancho">
          <span>Cuenta secundaria (desaparece)</span>
          <select className="admin-select" required value={secundaria} onChange={(e) => setSecundaria(e.target.value)}>
            <option value="">Elegí una cuenta…</option>
            {cuentas.filter((c) => !secundarias.has(c.id)).map((c) => <option key={c.id} value={c.id}>{etiqueta(c)}</option>)}
          </select>
        </label>
        <label className="campo campo--ancho">
          <span>Cuenta principal (se queda con todo)</span>
          <select className="admin-select" required value={principal} onChange={(e) => setPrincipal(e.target.value)}>
            <option value="">Elegí una cuenta…</option>
            {cuentas.filter((c) => !secundarias.has(c.id) && c.id !== secundaria).map((c) => <option key={c.id} value={c.id}>{etiqueta(c)}</option>)}
          </select>
        </label>
        <button className="btn btn--p2" type="submit" disabled={ocupado || !secundaria || !principal}>Unir</button>
      </form>
      {mensaje && <p className={mensaje.ok ? "admin-ok" : "aviso"} role={mensaje.ok ? "status" : "alert"}>{mensaje.texto}</p>}

      {alias.length > 0 && (
        <table className="history__table">
          <thead>
            <tr>
              <th scope="col">Secundaria</th>
              <th scope="col">Unida a</th>
              <th scope="col"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {alias.map((a) => (
              <tr key={a.secundario}>
                <td>{nombre(a.secundario)} <span className="admin-nota">{a.secundario}</span></td>
                <td>{nombre(a.principal)} <span className="admin-nota">{a.principal}</span></td>
                <td className="admin-torneos__acciones">
                  <button type="button" className="admin-boton" disabled={ocupado}
                    onClick={() => correr(() => separarCuenta(a.secundario), `${nombre(a.secundario)} volvió a ser una cuenta aparte.`)}>
                    Separar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
