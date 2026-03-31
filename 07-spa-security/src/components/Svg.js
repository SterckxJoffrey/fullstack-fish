export class SvgIcon extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');
    const response = await fetch(src, {
      headers: {
        'Accept': 'image/svg+xml'
      }
    });
    const svg = await response.text();
    
    this.innerHTML = svg;
    
    const paths = this.querySelectorAll('path, circle, rect, polygon');
    paths.forEach(path => {
      path.removeAttribute('fill');
      path.removeAttribute('style');
    });
    
    this.updateDimensions();
    this.updateColors();
  }
  
  updateDimensions() {
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    
    if (width) {
      this.style.setProperty('--width', width + 'px');
    }
    if (height) {
      this.style.setProperty('--height', height + 'px');
    }
  }
  
  updateColors() {
    const color = this.getAttribute('color');
    const hoverColor = this.getAttribute('hover-color');
    
    if (color) {
      this.style.setProperty('--color', color);
    }
    if (hoverColor) {
      this.style.setProperty('--hover-color', hoverColor);
    }
  }
  
  static get observedAttributes() {
    return ['color', 'hover-color', 'width', 'height'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'width' || name === 'height') {
      this.updateDimensions();
    } else {
      this.updateColors();
    }
  }
}

customElements.define('svg-icon', SvgIcon);