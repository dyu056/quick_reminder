'use strict';
const search = document.querySelector('#search');
const cards = Array.from(document.querySelectorAll('.note-card'));
const counter = document.querySelector('#result-count');
const empty = document.querySelector('#empty');
const shortcut = document.querySelector('kbd');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
shortcut.textContent = isMac ? '⌘ K' : 'Ctrl K';
function update() {
  const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const card of cards) {
    const content = (card.textContent + ' ' + card.dataset.search).toLocaleLowerCase();
    const matches = terms.every(term => content.includes(term));
    card.hidden = !matches;
    if (matches) count++;
  }
  counter.textContent = terms.length ? `${count} 篇匹配` : `${cards.length} 篇公开笔记`;
  empty.hidden = count > 0;
}
search.addEventListener('input', update);
document.querySelector('#clear-search').addEventListener('click', () => {search.value='';update();search.focus();});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {event.preventDefault();search.focus();}
  if (event.key === 'Escape' && document.activeElement === search) {search.value='';update();}
});
update();
