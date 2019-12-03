'use babel'

import { CompositeDisposable } from 'atom'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const PARTIAL_REGEXP = /{{#?>\s*([^\s]+).*}}/
const HBS_EXTENSIONS = ['.hbs', '.handlebars']
const IGNORED_DIR_PATTERN = /node_modules|.git/

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

const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

async function findHandlebarsPartials(dir, root) {
  let files = await readdir(dir)
  files = await Promise.all(
    files.map(async file => {
      const filePath = path.join(dir, file)
      const stats = await stat(filePath)
      if (stats.isDirectory()) {
        if (IGNORED_DIR_PATTERN.test(filePath)) return {}
        return findHandlebarsPartials(filePath, root)
      } else if (stats.isFile()) {
        const ext = path.extname(filePath)
        if (HBS_EXTENSIONS.includes(ext)) {
          const relativePath = filePath.replace(root, '')
          return {
            [relativePath.replace(ext, '').slice(1)]: filePath,
          }
        }
        return {}
      }
    })
  )

  return files.reduce((agg, next) => {
    Object.keys(next).forEach(key => (agg[key] = next[key]))
    return agg
  }, {})
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

module.exports = {
  getProvider() {
    return {
      priority: 1,
      providerName: 'handlebars-hyperclick',
      grammarScopes: ['text.html.mustache'],
      async getSuggestionForWord(textEditor, text, range) {
        if (!this.partialsDir) {
          const [projectPath] = atom.project.relativizePath(
            textEditor.getPath()
          )

          this.partialsDir = getPartialsDir(projectPath)
          const root = path.join(projectPath, this.partialsDir)
          this.hbsFiles = await findHandlebarsPartials(root, root)
        }

        const { partialRange, partialFile } = getRange(textEditor, range)
        if (partialFile && partialRange && this.hbsFiles[partialFile]) {
          return {
            range: partialRange,
            callback: () => {
              atom.workspace.open(this.hbsFiles[partialFile])
            },
          }
        }
      },
    }
  },

  activate() {
    this.subscriptions = new CompositeDisposable()
  },

  deactivate() {
    this.subscriptions.dispose()
  },
}
