import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders the provided label', () => {
    render(<Button text="Press" onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Press' })).toBeInTheDocument();
  });

  it('calls the handler on click', () => {
    const onClick = vi.fn();
    render(<Button text="Submit" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
