import { setupCanvas } from './setupCanvas';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="root"></div>
`;

setupCanvas(document.querySelector('#root')!);
