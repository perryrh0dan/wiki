'use strict'

const md = require('markdown-it')
const _ = require('lodash')
const mdRemove = require('remove-markdown')

module.exports = {
  parseTree (content) {
    content = content.replace(/<!--(.|\t|\n|\r)*?-->/g, '')
    let tokens = md().parse(content, {})
    let tocArray = []

    // -> Extract headings and their respective levels

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'heading_close') {
        continue
      }

      const heading = tokens[i - 1]
      const headingclose = tokens[i]

      if (heading.type === 'inline') {
        let content = ''
        let anchor = ''
        if (heading.children && heading.children.length > 0 && heading.children[0].type === 'link_open') {
          content = mdRemove(heading.children[1].content)
          anchor = _.kebabCase(content)
        } else {
          content = mdRemove(heading.content)
          anchor = _.kebabCase(heading.children.reduce((acc, t) => acc + t.content, ''))
        }

        tocArray.push({
          content,
          anchor,
          level: +headingclose.tag.substr(1, 1)
        })
      }
    }

    // -> Exclude levels deeper than 2

    _.remove(tocArray, (n) => {
      return n.level > 2
    })

    // -> Build tree from flat array

    return _.reduce(tocArray, (tree, v) => {
      let treeLength = tree.length - 1
      if (v.level < 2) {
        tree.push({
          content: v.content,
          anchor: v.anchor,
          nodes: []
        })
      } else {
        let lastNodeLevel = 1
        let GetNodePath = (startPos) => {
          lastNodeLevel++
          if (_.isEmpty(startPos)) {
            startPos = 'nodes'
          }
          if (lastNodeLevel === v.level) {
            return startPos
          } else {
            return GetNodePath(startPos + '[' + (_.at(tree[treeLength], startPos).length - 1) + '].nodes')
          }
        }
        let lastNodePath = GetNodePath()
        let lastNode = _.get(tree[treeLength], lastNodePath)
        if (lastNode) {
          lastNode.push({
            content: v.content,
            anchor: v.anchor,
            nodes: []
          })
          _.set(tree[treeLength], lastNodePath, lastNode)
        }
      }
      return tree
    }, [])
  },

  parseMeta (content) {
    let commentMeta = new RegExp('<!-- ?([a-zA-Z]+):(.*)-->', 'g')
    let results = {}
    let match
    while ((match = commentMeta.exec(content)) !== null) {
      results[_.toLower(match[1])] = _.trim(match[2])
    }
    if (results.tags && results.tags.replace(/\s/g, '').length > 0) {
      results.tags = results.tags.split(',').map(tag => { return tag.toLowerCase() })
    } else {
      results.tags = []
    }
    return results
  }
}
