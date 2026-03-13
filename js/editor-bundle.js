// Editor Bundle - Re-exports CodeMirror modules from node_modules
// Using direct paths to node_modules via server

export { EditorView, basicSetup } from "../node_modules/@codemirror/view/dist/index.js";
export { EditorState } from "../node_modules/@codemirror/state/dist/index.js";
export { sql } from "../node_modules/@codemirror/lang-sql/dist/index.js";
export { oneDark } from "../node_modules/@codemirror/theme-one-dark/dist/index.js";
export { autocompletion } from "../node_modules/@codemirror/autocomplete/dist/index.js";
export { history } from "../node_modules/@codemirror/commands/dist/index.js";
