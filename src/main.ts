import { setupCanvas } from './setupCanvas';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header>Zeuxis Software Renderer</header>
  <div id="root"></div>
  <footer><a target="_blank" href="https://github.com/utkusagocak/zeuxis">Utku Sağocak - 2023</a></footer>
`;

setupCanvas(document.querySelector('#root')!);
