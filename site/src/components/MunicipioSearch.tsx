import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MunicipioEntry } from '@/lib/municipios';
import { buildMunicipioIndex, loadMunicipioNames } from '@/lib/municipios';

/** Mínimo de caracteres antes de filtrar — busca em 5.571 nomes. */
const MIN_CHARS = 3;
const MAX_RESULTS = 8;

export interface MunicipioSearchProps {
  onSelect: (m: { codigo: string; nome: string; ufSigla: string }) => void;
}

/** Casa do início de qualquer palavra do nome, ignorando acentos. */
function filtrar(index: MunicipioEntry[], termo: string): MunicipioEntry[] {
  const out: MunicipioEntry[] = [];
  for (const m of index) {
    if (m.nomeBusca.startsWith(termo) || m.nomeBusca.includes(` ${termo}`)) {
      out.push(m);
      if (out.length === MAX_RESULTS) break;
    }
  }
  return out;
}

/**
 * Busca de município por nome, entre os painéis do topo.
 *
 * Filtra em memória sobre a tabela do IBGE já usada pelo mapa; o volume
 * de cada linha vem depois, numa consulta só para os resultados
 * visíveis, porque depende da faixa de competência selecionada e não
 * caberia num artefato estático.
 */
export function MunicipioSearch({ onSelect }: MunicipioSearchProps) {
  const [index, setIndex] = useState<MunicipioEntry[]>([]);
  const [termo, setTermo] = useState('');
  const [ativo, setAtivo] = useState(0);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelado = false;
    loadMunicipioNames().then(
      (names) => {
        if (!cancelado) setIndex(buildMunicipioIndex(names));
      },
      // eslint-disable-next-line no-console
      (e: unknown) => console.warn('[MunicipioSearch]', e),
    );
    return () => {
      cancelado = true;
    };
  }, []);

  const termoNormalizado = termo.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const resultados = useMemo(
    () => (termoNormalizado.length < MIN_CHARS ? [] : filtrar(index, termoNormalizado)),
    [index, termoNormalizado],
  );

  useEffect(() => setAtivo(0), [termoNormalizado]);

  const escolher = useCallback(
    (m: MunicipioEntry) => {
      onSelect({ codigo: m.codigo, nome: m.nome, ufSigla: m.uf });
      setTermo('');
      setAberto(false);
    },
    [onSelect],
  );

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (resultados.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAtivo((i) => (i + 1) % resultados.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAtivo((i) => (i - 1 + resultados.length) % resultados.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const m = resultados[ativo];
      if (m) escolher(m);
    } else if (e.key === 'Escape') {
      setAberto(false);
    }
  };

  const mostrarLista = aberto && termoNormalizado.length >= MIN_CHARS;

  return (
    <div className="relative" ref={containerRef}>
      <div className="border-border bg-card/95 flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-md">
        <Search aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
        <input
          aria-label="Buscar município por nome"
          autoComplete="off"
          className="placeholder:text-muted-foreground w-full bg-transparent font-margem text-sm outline-none"
          onBlur={() => setTimeout(() => setAberto(false), 120)}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar município…"
          type="text"
          value={termo}
        />
      </div>

      {mostrarLista && (
        <ul
          aria-label="Resultados da busca"
          className="border-border bg-card absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border py-1 shadow-lg"
          role="listbox"
        >
          {resultados.length === 0 ? (
            <li className="text-muted-foreground px-3 py-2 font-margem text-xs">
              Nenhum município encontrado
            </li>
          ) : (
            resultados.map((m, i) => (
              <li key={m.codigo}>
                <button
                  aria-selected={i === ativo}
                  className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left font-margem text-sm ${
                    i === ativo ? 'bg-muted' : ''
                  }`}
                  onClick={() => escolher(m)}
                  onMouseEnter={() => setAtivo(i)}
                  role="option"
                  type="button"
                >
                  <span className="truncate">{m.nome}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">— {m.uf}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
