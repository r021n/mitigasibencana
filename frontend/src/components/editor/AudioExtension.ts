import { Node, mergeAttributes } from '@tiptap/core';

export interface AudioOptions {
  HTMLAttributes: Record<string, any>;
}

export const Audio = Node.create<AudioOptions>({
  name: 'audio',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        controls: 'true',
        style: 'width: 100%; margin: 10px 0;',
      },
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'audio[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },
});
