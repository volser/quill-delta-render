import Quill from 'quill';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { parseQuillDelta } from '../src/parse-quill-delta';
import { QuillHtmlRenderer } from '../src/renderers/html/quill/quill-html-renderer';
import { SemanticHtmlRenderer } from '../src/renderers/html/semantic/semantic-html-renderer';
import { ReactRenderer } from '../src/renderers/react/react-renderer';
import { serializeReactNode } from './react-source-utils';
import './styles.css';
import 'quill/dist/quill.snow.css';

const INITIAL_DELTA = {
  ops: [
    { insert: 'Quill Delta Renderer Demo' },
    { insert: '\n', attributes: { header: 2 } },
    { insert: 'Type here to see live rendering into ' },
    { insert: 'Quill HTML', attributes: { bold: true } },
    { insert: ', ' },
    { insert: 'semantic HTML', attributes: { italic: true } },
    { insert: ', and React output.\n' },
    { insert: 'Try formatting: ' },
    { insert: 'bold', attributes: { bold: true } },
    { insert: ', ' },
    { insert: 'italic', attributes: { italic: true } },
    { insert: ', ' },
    { insert: 'underline', attributes: { underline: true } },
    { insert: ', links, lists, code blocks, and more.\n' },
    { insert: 'Nested bullet list example:\n' },
    { insert: 'Parent item 1' },
    { insert: '\n', attributes: { list: 'bullet' } },
    { insert: 'Child item 1.1' },
    { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
    { insert: 'Child item 1.2' },
    { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
    { insert: 'Parent item 2' },
    { insert: '\n', attributes: { list: 'bullet' } },
  ],
};

const app = document.querySelector('#app');

if (!app) {
  throw new Error('Missing #app container');
}

app.innerHTML = `
  <main class="demo">
    <h1>quill-delta-renderer live demo</h1>

    <section class="panel">
      <h2>Quill Editor</h2>
      <div id="editor"></div>
    </section>

    <section class="grid">
      <article class="panel">
        <h2>Quill HTML</h2>        
        <div class="preview-shell ql-container ql-snow">
          <div id="quill-html-preview" class="preview ql-editor"></div>
        </div>
        <pre id="quill-html-code"></pre>
      </article>

      <article class="panel">
        <h2>Semantic HTML</h2>        
        <div class="preview-shell ql-container ql-snow">
          <div id="semantic-html-preview" class="preview ql-editor"></div>
        </div>
        <pre id="semantic-html-code"></pre>
      </article>

      <article class="panel">
        <h2>React Render</h2>
        <div class="preview-shell ql-container ql-snow">
          <div id="react-preview" class="preview ql-editor"></div>
        </div>
        <pre id="react-code"></pre>
      </article>
    </section>
  </main>
`;

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block', 'link', 'clean'],
    ],
  },
});

quill.setContents(INITIAL_DELTA as never);

const quillHtmlCodeEl = document.querySelector('#quill-html-code');
const quillHtmlPreviewEl = document.querySelector('#quill-html-preview');
const semanticHtmlCodeEl = document.querySelector('#semantic-html-code');
const semanticHtmlPreviewEl = document.querySelector('#semantic-html-preview');
const reactPreviewEl = document.querySelector('#react-preview');
const reactCodeEl = document.querySelector('#react-code');

if (
  !quillHtmlCodeEl ||
  !quillHtmlPreviewEl ||
  !semanticHtmlCodeEl ||
  !semanticHtmlPreviewEl ||
  !reactPreviewEl ||
  !reactCodeEl
) {
  throw new Error('Missing output containers');
}

const quillHtmlRenderer = new QuillHtmlRenderer();
const semanticHtmlRenderer = new SemanticHtmlRenderer();
const reactRenderer = new ReactRenderer();
const reactRoot = createRoot(reactPreviewEl);

const renderOutputs = () => {
  const delta = quill.getContents();
  const ast = parseQuillDelta(delta as never);

  const quillHtml = quillHtmlRenderer.render(ast);
  const semanticHtml = semanticHtmlRenderer.render(ast);
  const reactNode = reactRenderer.render(ast);

  quillHtmlCodeEl.textContent = quillHtml;
  semanticHtmlCodeEl.textContent = semanticHtml;

  quillHtmlPreviewEl.innerHTML = quillHtml;
  semanticHtmlPreviewEl.innerHTML = semanticHtml;
  reactCodeEl.textContent = serializeReactNode(reactNode);

  reactRoot.render(React.createElement(React.Fragment, null, reactNode));
};

quill.on('text-change', renderOutputs);
renderOutputs();
