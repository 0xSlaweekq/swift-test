/* eslint-disable @typescript-eslint/naming-convention */
require('dotenv').config()

module.exports = {
  apps: [
    {
      name: 'server',
      script: 'node dist/apps/server/main.js',
      error_file: './logs/server-err.log',
      out_file: './logs/server-out.log',
      max_memory_restart: '512M',
      node_args: ['--max_old_space_size=512'],
    },
    {
      name: 'web',
      script: `serve -s dist/apps/web --listen ${Number(process.env.WEB_PORT) || 9001} --no-clipboard`,
      error_file: './logs/web-err.log',
      out_file: './logs/web-out.log',
      max_memory_restart: '512M',
      node_args: ['--max_old_space_size=512'],
    },
  ],
}
