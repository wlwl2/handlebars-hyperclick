'use babel'

import fs from 'fs'
import path from 'path'

const PARTIAL_REGEXP = /{{#?>\s*([^\s]+).*}}/
const hbsExtensions = atom.config.get('handlebars-hyperclick.extensions') || [
  '.hbs',
  '.handlebars',
]

function getRange(textEditor, range) {
  const searchStart = [range.start.row, 0]
  const searchEnd = [range.end.row + 1, 0]
  const searchRange = [searchStart, searchEnd]

  let partialRange = null
  let partialFile = null

  textEditor.scanInBufferRange(PARTIAL_REGEXP, searchRange, found => {
    partialFile = found.match[1]
    partialRange = found.range
    found.stop()
  })
  return {
    partialRange,
    partialFile,
  }
}

function getPartialsDir(projectPath) {
  const packageJSON = path.join(projectPath, 'package.json')
  try {
    const { hbsPartialsDir = '' } = require(packageJSON)
    return hbsPartialsDir
  } catch (err) {
    return ''
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
        const [projectPath] = atom.project.relativizePath(textEditor.getPath())
        const partialsDir = getPartialsDir(projectPath)

        for (const ext of hbsExtensions) {
          const fullPath = path.join(
            projectPath,
            partialsDir,
            partialFile + ext
          )
          if (fs.existsSync(fullPath)) {
            return {
              range: partialRange,
              callback: () => {
                atom.workspace.open(fullPath)
              },
            }
          }
        }
      }
    },
  }
}

export const config = {
  extensions: {
    description:
      'Comma separated list of extensions to use for Handlebars partials files.',
    type: 'array',
    default: ['.hbs', '.handlebars'],
    items: { type: 'string' },
  },
}
