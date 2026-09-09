import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/municipios', async (orig) => {
  const real = await orig<typeof import('@/lib/municipios')>();
  return {
    ...real,
    loadMunicipioNames: vi.fn(() =>
      Promise.resolve({
        '311360': 'Careaçu',
        '431060': 'Itaqui',
        '351500': 'Embu-Guaçu',
        '355030': 'São Paulo',
        '316700': 'Serranos',
      }),
    ),
  };
});

import { MunicipioSearch } from '@/components/MunicipioSearch';

function setup() {
  const onSelect = vi.fn();
  render(<MunicipioSearch onSelect={onSelect} />);
  return { input: screen.getByLabelText('Buscar município por nome'), onSelect };
}

beforeEach(() => vi.clearAllMocks());

describe('MunicipioSearch', () => {
  it('não filtra com menos de 3 caracteres', async () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'ca' } });
    await waitFor(() => expect(screen.queryByRole('option')).not.toBeInTheDocument());
  });

  it('lista resultados a partir de 3 caracteres, ignorando acentos', async () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'care' } });
    const op = await screen.findByRole('option');
    expect(op).toHaveTextContent('Careaçu');
    expect(op).toHaveTextContent('MG');
  });

  it('deriva a UF do prefixo do código IBGE', async () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'ita' } });
    const op = await screen.findByRole('option');
    expect(op).toHaveTextContent('Itaqui');
    expect(op).toHaveTextContent('RS');
  });

  it('seleciona no clique e devolve código, nome e UF', async () => {
    const { input, onSelect } = setup();
    fireEvent.change(input, { target: { value: 'serra' } });
    fireEvent.click(await screen.findByRole('option'));
    expect(onSelect).toHaveBeenCalledWith({ codigo: '316700', nome: 'Serranos', ufSigla: 'MG' });
  });

  it('navega com as setas e confirma no Enter', async () => {
    const { input, onSelect } = setup();
    fireEvent.change(input, { target: { value: 'a'.repeat(0) + 'emb' } });
    await screen.findByRole('option');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith({
      codigo: '351500',
      nome: 'Embu-Guaçu',
      ufSigla: 'SP',
    });
  });

  it('ArrowDown move a seleção antes do Enter', async () => {
    const { input, onSelect } = setup();
    fireEvent.change(input, { target: { value: 'sa' } });
    fireEvent.change(input, { target: { value: 'são' } });
    await screen.findByRole('option');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith({
      codigo: '355030',
      nome: 'São Paulo',
      ufSigla: 'SP',
    });
  });

  it('avisa quando nada casa', async () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(await screen.findByText(/Nenhum município encontrado/)).toBeInTheDocument();
  });
});
