-- Settings mirrored from .vimrc
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.redrawtime = 10000
vim.opt.synmaxcol = 300
vim.cmd('syntax on')

-- Load plugins
vim.cmd('packadd nvim-treesitter')
vim.cmd('packadd fleet.nvim')

-- Set theme
require('fleet').setup({
  transparent_mode = true,
})
vim.cmd('colorscheme fleet')

-- Tree-sitter configuration
local ok, ts = pcall(require, "nvim-treesitter")
if ok then
  ts.setup {
    ensure_installed = { "lua", "vim", "vimdoc", "javascript", "typescript", "python" },
    highlight = {
      enable = true,
    },
  }
else
  local ok2, configs = pcall(require, "nvim-treesitter.configs")
  if ok2 then
    configs.setup {
      ensure_installed = { "lua", "vim", "vimdoc", "javascript", "typescript", "python" },
      highlight = {
        enable = true,
      },
    }
  end
end
