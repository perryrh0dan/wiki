const elasticsearch = require('elasticsearch')
const _ = require('lodash')

module.exports = {
  client: null,

  init() {
    let self = this

    if (this.active()) {
      try {
        global.winston.info(`Connecting to ElasticSearch Instance: ${global.appconfig.search}`)
        self.client = new elasticsearch.Client({
          host: global.appconfig.search,
          log: 'info'
        })
      } catch (error) {
        global.winston.error(error)
      }
    } else {
      global.winston.info("Search is disabled")
    }

    self.onReady = new Promise((resolve, reject) => {
      if (!this.active()) {
        return resolve()
      }

      self.client.indices.exists({
        index: 'wiki'
      }).then(exists => {
        if (!exists) {
          global.winston.info('Creating searchindex...')
          return self.client.indices.create({
              index: 'wiki',
              body: {
                settings: {
                  analysis: {
                    analyzer: {
                      autocomplete: {
                        tokenizer: 'autocomplete',
                        filter: [
                          'lowercase'
                        ]
                      },
                      autocomplete_search: {
                        tokenizer: 'lowercase'
                      }
                    },
                    tokenizer: {
                      autocomplete: {
                        type: 'edge_ngram',
                        min_gram: 2,
                        max_gram: 20,
                        token_chars: [
                          'letter'
                        ]
                      }
                    }
                  }
                },
                mappings: {
                  properties: {
                    title: {
                      type: 'text',
                      analyzer: 'autocomplete',
                      search_analyzer: 'autocomplete_search'
                    },
                    subtitle: {
                      type: 'text'
                    },
                    parent: {
                      type: 'text'
                    },
                    content: {
                      type: 'text'
                    },
                    tags: {
                      type: 'keyword'
                    }
                  }
                }
              }
            }).then(() => {
              return global.winston.info('Created searchindex successfull')
            })
            .catch(error => {
              return global.winston.error(error)
            })
        } else {
          global.winston.info('Searchindex already exists')
          return resolve()
        }
      }).catch(error => {
        return reject(error)
      })
    })

    return self
  },

  active() {
    if (!global.appconfig.search || global.appconfig.search === '') {
      return false
    }

    return true;
  },

  addEntry(document) {
    let self = this

    if (!this.active()) {
      return Promise.resolve()
    } else {
      global.winston.debug(
        'Added { title:' +
        document.title +
        ', path:' +
        document._id +
        ' } to search index'
      )
      return self.client
        .index({
          index: 'wiki',
          id: document._id,
          body: {
            title: document.title,
            subtitle: document.subtitle,
            parent: document.parentTitle,
            content: document.content,
            tags: document.tags
          }
        })
        .then(() => {
          global.winston.debug(
            'Added { title:' + document.title + ' } to Searchindex'
          )
        }).catch(error => {
          global.winston.error(error)
        })
    }
  },

  removeEntry(id) {
    let self = this

    if (!this.active()) {
      Promise.resolve()
    } else {
      return self.client.delete({
        index: 'wiki',
        id: id
      }).catch(error => {
        global.winston.error(error)
      })
    }
  },

  searchEntry(query) {
    let self = this

    if (!this.active()) {
      Promise.resolve({
        results: [],
        totalHits: 0
      })
    } else {
      return self.client
        .search({
          index: 'wiki',
          body: {
            query: {
              multi_match: {
                query: '*' + query + '*',
                type: 'bool_prefix',
                fields: ['title^10', 'title._2gram', 'title._3gram', 'tags^10', 'subtitle^7', 'parent^6', 'content'],
                fuzziness: 'AUTO',
                tie_breaker: 0.3
              }
            },
            from: 0,
            size: 10,
            _source: ['title', 'subtitle'],
            highlight: {
              fields: {
                subtitle: {
                  pre_tags: ['<span style="color: #1976d2">'],
                  post_tags: ['</span>']
                },
                title: {
                  pre_tags: ['<span style="color: #1976d2">'],
                  post_tags: ['</span>']
                }
              },
              require_field_match: false
            }
          }
        })
        .then(results => {
          return {
            results: _.get(results, 'hits.hits', []).map(r => ({
              id: r._id,
              title: r.highlight && r.highlight.title ? r.highlight.title[0] : r._source.title,
              subtitle: r.highlight && r.highlight.subtitle ? r.highlight.subtitle[0] : r._source.subtitle
            })),
            totalHits: results.hits.total
          }
        })
    }
  }
}
