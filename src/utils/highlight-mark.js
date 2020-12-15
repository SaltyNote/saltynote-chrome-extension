import Mark from 'mark.js';

const options = note => {
  return {
    acrossElements: true,
    exclude: ['.saltynote *'],
    separateWordSearch: false,
    each: node => {
      node.setAttribute('title', note.note);
      node.setAttribute('id', note.id);
      if (note.highlightColor) {
        node.setAttribute('style', 'background-color:' + note.highlightColor + ';');
      }
      node.setAttribute('data-v-highlight', '');
      if (note.clickCallback) {
        node.addEventListener('click', note.clickCallback.bind(this, note));
      }
    },
  };
};
const context = document.querySelector('body');
const instance = new Mark(context);

export function highlightAll(notes) {
  if (!notes || !notes.length) return;
  instance.unmark({
    done: () => {
      notes.forEach(note => {
        if (!note.isPageOnly) {
          instance.mark(note.text, options(note));
        }
      });
    },
  });
}

export function highlight(note) {
  instance.unmark({
    done: () => {
      instance.mark(note.text, options(note));
    },
  });
}

export function unmark() {
  instance.unmark();
}
