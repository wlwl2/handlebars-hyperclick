'use babel'

const partialRegexp = /{{>\s*([^\s]+).*}}/

const getRange = (textEditor, range) => {
  const searchStart = [range.start.row, 0]
  const searchEnd = [range.end.row + 1, 0]
  const searchRange = [searchStart, searchEnd]

  let partialRange = null
  let partialFile = null

  textEditor.scanInBufferRange(partialRegexp, searchRange, found => {
    partialFile = found.match[1]
    partialRange = found.range
    found.stop()
  })
  return {
    partialRange,
    partialFile,
  }
}

export function getProvider() {
  return {
    priority: 1,
    providerName: 'handlebars-hyperclick',
    grammarScopes: ['text.html.mustache'],
    async getSuggestionForWord(textEditor, text, range) {
      const { partialRange, partialFile } = getRange(textEditor, range)
      if (partialFile && partialRange) {
        return {
          range: partialRange,
        }
      }
    },
  }
}
