import { describe, it, expect } from 'vitest';
import { Button } from './Button';

/**
 * Util to render the button component in the DOM
 * 
 * @param {Object} props - The props to pass to the button component
 * 
 * @returns {HTMLElement} - The rendered button component
 */
const renderButton = (props) => {
  const html = Button(props);
  const container = document.createElement('div');
  container.innerHTML = html.trim();
  return container.firstChild;
};

describe('Button component', () => {
  it('should display the correct text', () => {
    const button = renderButton({ text: 'Cliquez ici' });
    expect(button.textContent).toBe('Cliquez ici');
  });

  it('should have the default base classes', () => {
    const button = renderButton({ text: 'Bouton' });

    expect(button.classList.contains('inline-block')).toBe(true);
    expect(button.classList.contains('cursor-pointer')).toBe(true);
  });

  it('should apply the secondary variant correctly', () => {
    const button = renderButton({ text: 'Secondaire', variant: 'secondary' });
    
    expect(button.classList.contains('bg-neutral-200')).toBe(true);
    expect(button.classList.contains('text-neutral-600')).toBe(true);

    expect(button.classList.contains('bg-primary-500')).toBe(false);
  });

  it('should apply the large size correctly', () => {
    const button = renderButton({ text: 'Large', size: 'lg' });
    
    expect(button.classList.contains('px-8')).toBe(true);
    expect(button.classList.contains('text-lg')).toBe(true);
  });
});