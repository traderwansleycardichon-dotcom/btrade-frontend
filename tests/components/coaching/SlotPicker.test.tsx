import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { SlotPicker } from '@/components/coaching/SlotPicker';

const mockSlots = [
  { id: 'slot-1', datetime: '2026-06-10T14:00:00.000Z' },
  { id: 'slot-2', datetime: '2026-06-11T10:00:00.000Z' },
];

describe('SlotPicker', () => {
  it('affiche le message vide quand aucun créneau', () => {
    render(<SlotPicker slots={[]} selectedSlotId="" onChange={vi.fn()} />);
    expect(screen.getByText(/Aucun créneau disponible/)).toBeInTheDocument();
  });

  it('affiche un radio par créneau', () => {
    render(<SlotPicker slots={mockSlots} selectedSlotId="" onChange={vi.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('appelle onChange avec l\'id du créneau cliqué', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SlotPicker slots={mockSlots} selectedSlotId="" onChange={onChange} />);
    await user.click(screen.getAllByRole('radio')[0]);
    expect(onChange).toHaveBeenCalledWith('slot-1');
  });

  it('marque le créneau sélectionné comme checked', () => {
    render(<SlotPicker slots={mockSlots} selectedSlotId="slot-2" onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });
});
