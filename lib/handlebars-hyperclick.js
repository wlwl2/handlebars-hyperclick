'use babel'

import fs from 'fs'
import path from 'path'
import { Range } from 'atom'

const PARTIAL_REGEXP = /{{#?>\s*([^\s]+).*?}}/gi
const hbsExtensions = atom.config.get('handlebars-hyperclick.extensions') || [
  '.hbs',
  '.handlebars',
]

function getLineRange(point) {
  const searchStart = [point.row, 0]
  const searchEnd = [point.row + 1, 0]
  return [searchStart, searchEnd]
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
    getSuggestion(textEditor, position) {
      const lineText = textEditor.getTextInBufferRange(getLineRange(position))
      const [projectPath] = atom.project.relativizePath(textEditor.getPath())
      const partialsDir = getPartialsDir(projectPath)

      const matches = []

      // find all matches in the current line
      let match
      while ((match = PARTIAL_REGEXP.exec(lineText))) matches.push(match)

      // find the match under cursor
      match = matches.find(
        m =>
          m.index < position.column && position.column < m.index + m[0].length
      )
      if (!match) return

      // check if partial exists before displaying a hyperlink
      for (const ext of hbsExtensions) {
        const fullPath = path.join(projectPath, partialsDir, match[1] + ext)
        if (fs.existsSync(fullPath)) {
          return {
            range: new Range(
              [position.row, match.index],
              [position.row, match.index + match[0].length]
            ),
            callback: () => atom.workspace.open(fullPath),
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
