import { visit } from 'unist-util-visit'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('content:file:afterParse', (file: any) => {
    console.log('file', file)
    if (file._id.endsWith('.md') && !file.wordCount) {
      file.wordCount = 0;
      visit(file.body, (n: any) => n.type === 'text', (node) => {
        file.wordCount += node.value.trim().split(/\s+/).length
      })
      file.readingTime = Math.ceil(file.wordCount / 200)
    }
  });
});