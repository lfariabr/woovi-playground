import { render, screen, fireEvent } from '@testing-library/react';
import TransactionsAdminCheckpointPage from '../../pages/admin';

describe('TransactionsAdminCheckpointPage', () => {
  // Test #1
  it('renders the admin page heading and LOAD ACCOUNT button', () => {
    render(<TransactionsAdminCheckpointPage />);
    expect(
      screen.getByRole('heading', { name: /Transactions – Admin Checkpoint/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LOAD ACCOUNT/i })).toBeInTheDocument();
  });

  // Test #2
  it('renders the subtitle', () => {
    render(<TransactionsAdminCheckpointPage />);
    expect(
      screen.getByText(/Busque qualquer Account ID pra ver o saldo e transações/i)
    ).toBeInTheDocument();
  });

  // Test #3
  it('disables LOAD ACCOUNT button when Account ID is empty', () => {
    render(<TransactionsAdminCheckpointPage />);
    const button = screen.getByRole('button', { name: /LOAD ACCOUNT/i });
    expect(button).toBeDisabled();
  });

  // Test #4
  it('enables LOAD ACCOUNT button when Account ID is filled', () => {
    render(<TransactionsAdminCheckpointPage />);
    const input = screen.getByLabelText(/Account ID/i);
    const button = screen.getByRole('button', { name: /LOAD ACCOUNT/i });
    fireEvent.change(input, { target: { value: '123' } });
    expect(button).not.toBeDisabled();
  });
});