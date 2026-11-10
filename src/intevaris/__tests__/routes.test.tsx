// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App.tsx';

beforeEach(() => { window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('INTEVARIS routes', () => {
  it.each([
    ['/', 'Clarity when'], ['/how', 'Designed for the whole conversation'],
    ['/security', 'Clear about what is connected'], ['/pricing', 'Pricing information is unavailable'],
    ['/customers', 'Customer information is unavailable'], ['/about', 'A more considered approach'],
    ['/demo', 'Contact is not connected'], ['/app', 'Command center'], ['/app/sessions', 'Sessions'],
    ['/app/interpreters', 'Interpreters'], ['/app/live', 'Live session'], ['/app/audit', 'Evidence & audit'],
    ['/app/quality', 'Quality'], ['/app/admin', 'Settings'], ['/app/policy', 'Policy engine'],
  ])('renders %s', async (path, heading) => {
    history.replaceState({}, '', path);
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: new RegExp(heading, 'i') })).toBeTruthy();
  });

  it('navigates, searches pages and performs only a local illustrative calculation', async () => {
    history.replaceState({}, '', '/app');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: /command center/i });
    const search = screen.getByRole('textbox', { name: /find a workspace page/i });
    await user.type(search, 'policy');
    await user.keyboard('{Enter}');
    await screen.findByRole('heading', { level: 1, name: /policy engine/i });
    expect(screen.getByText(/illustrative scoring rules are unvalidated/i)).toBeTruthy();
    const calculate = screen.getByRole('button', { name: /calculate preview/i });
    expect((calculate as HTMLButtonElement).disabled).toBe(true);
    await user.selectOptions(screen.getByLabelText('Setting'), 'Clinic');
    await user.click(screen.getByLabelText(/medication \/ dosage content/i));
    await user.click(calculate);
    expect(screen.getByText('44')).toBeTruthy();
    expect(screen.getByText(/must not be used to make operational or legal decisions/i)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    await user.selectOptions(screen.getByLabelText('Setting'), 'School');
    expect(screen.getByText(/no preview calculated/i)).toBeTruthy();
  });
  it('closes workspace navigation with Escape and restores keyboard focus', async () => {
    history.replaceState({}, '', '/app');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: /command center/i });
    const open = screen.getByRole('button', { name: 'Open navigation' });
    await user.click(open);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close navigation' }));
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(open);
    expect(open.getAttribute('aria-expanded')).toBe('false');
  });
  it('closes the public menu with Escape and restores keyboard focus', async () => {
    history.replaceState({}, '', '/');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: /clarity when/i });
    const open = screen.getByRole('button', { name: 'Open menu' });
    await user.click(open);
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(open);
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
  });
  it('does not offer a simulated contact submission', async () => {
    history.replaceState({}, '', '/demo');
    render(<App />);
    await screen.findByRole('heading', { name: /contact is not connected/i });
    expect(screen.queryByRole('button', { name: /submit|send|request/i })).toBeNull();
  });
});
