### 1. Markdown Library ###

**Decision**: react-markdown

**Reasoning**
- Well-maintained a very active
- Basic but straightforward implementation
- Typescript out of the box
- Easy to extend

**Alternatives**
- marked: Extremely active and very popular, but more complicated and not built for React or Typescript out of the box.
- react-md-editor: Too complex for short assessment and too much overhead for this implementation

### 2. Editor Type ###

**Decision**: toggleable edit and preview mode

**Reasoning**: Simplicity vs a WYSIWYG editor

### 3. Dependencies ###

- react-testing-library: standard for UI based unit testing in React and very powerful for writing unit tests
- vitest: Chose this over jest because it is built specifically for vite and is very fast.

## Tradeoffs

  - Toggleable over WYSIWYG for simplicity of implementation.
  - Custom Dropdown and Popover based on radix for a better UI/UX rather than modifying existing components.
  - Regex over AST for the function placeholders and overall markdown approach. Less resilient and powerful but easier to implement for task.
  - Local React State. This is usually good enough and the most timely approach for a short assessment.

## Running Locally

  pnpm install

  pnpm dev

  http://localhost:5173/

## Completion Status

  1. Markdown rendering with full functionality of listed items.
  2. Interactive badges function as requested.
  3. Tooltips and popover allow for interaction with function badges.
  4. Round trip serialization is functional.
  5. Completed slash command stretch goal.

## Improvements

  1. More work on responsive design.
  2. More robust markdown renderer with AST and full markdown support.
  3. More investigation into which library to use.
  4. Syntax highlighting.
  5. Undo.
  6. More editor interactions like a component selector or rich text editing functionality.
  7. UI/UX enhancements.