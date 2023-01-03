# Handlebars Hyperclick

If I remember this correctly, this was made to fix @tmatek's fork.

A plugin for [Atom's Hyperclick package](https://github.com/facebook-atom/hyperclick) to support Handlebars partials.

![preview](https://user-images.githubusercontent.com/32510202/70080835-97779480-1607-11ea-93ee-12d9d8f7624a.gif)

This plugin will only work if partials are registered with the same name as their filename. Works well with
`express-handlebars` and supports nested directories (clicking `{{> foo/bar }}` opens file `partials-directory/foo/bar.handlebars`).

By default, the current project root directory is used as the partials directory. You can change this by specifying `"hbsPartialsDir": "./my-partials-dir"` in `package.json`.
