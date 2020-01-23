'use strict'

const { Command, flags } = require('@oclif/command')

const path = require('path')
const Main = require('../main')
const util = require('../main/util')
const fs = require('fs')

class InitCommand extends Command {
  async run () {
    const { flags } = this.parse(InitCommand)
    const confDir = path.join(flags.root, 'etc/nixos')
    const outDir = path.join(confDir, 'conf-tool')

    this.log(`Loading ${confDir}...`)

    const plugins = await Main(confDir)

    const templateSrc = path.join(__dirname, '..', 'template', flags.template)

    const templateFiles = fs.readdirSync(templateSrc)

    for (let i = 0; i < templateFiles.length; i++) {
      const file = templateFiles[i]

      this.log(`Creating/overwriting ${path.join(confDir, file)}`)

      fs.createReadStream(path.join(templateSrc, file))
        .pipe(fs.createWriteStream(path.join(confDir, file)))
    }

    if (flags.hwScan) {
      this.log('Running hw-scan...')
      await util.generateConfig(flags.root)
    }

    const files = await util.renderToFiles(plugins)
    await util.batchWriteFiles(outDir, files)
  }
}

InitCommand.description = `Initializes a new conf-tool configuration
...
test
`

InitCommand.flags = {
  root: flags.string({
    char: 'r',
    description: 'Filesystem-root to use',
    default: '/'
  }),
  template: flags.string({
    char: 't',
    description: 'Template to copy (meros, nixos)',
    default: 'meros'
  }),
  hwScan: flags.boolean({
    char: 'h',
    description: 'Do a hardware-scan with nixos-generate-config afterwards',
    default: true
  })
}

module.exports = InitCommand
