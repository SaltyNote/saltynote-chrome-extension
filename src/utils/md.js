import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import taskList from './markdown/task-list';
import MermaidPlugIn from './markdown/mermaid';

const md = new MarkdownIt({
  html: true,
  linkify: false, // should be false to fix b/156541739
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ''; // use external default escaping
  },
})
  .use(taskList)
  .use(MermaidPlugIn);

export const mdRender = mdContent => {
  return md.render(mdContent);
};
