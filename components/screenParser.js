const HTMLParser = require("node-html-parser")
const path = require("path")
const fs = require("fs")
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

var _log = function() {
    var context = "[AMK2:SP]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SCREENPARSER {
  constructor(config,debug) {
    this.config = config
    if (debug == true) log = _log
  }

  parse(response, endCallback=()=>{}) {
    if (response.screen) {
      var uri = this.config.screenOutputURI
      var filePath = path.resolve(__dirname, "..", uri)
      var str = response.screen.originalContent.toString("utf8")
      var disableTimeoutFromScreenOutput = (str) => {
        return str.replace(/document\.body,"display","none"/gim,(x)=>{
          return `document.body,"display","block"`
        })
      }
      str = disableTimeoutFromScreenOutput(str)

      var url = "/modules/MMM-AssistantMk2/" + this.config.screenOutputCSS + "?seed=" + Date.now()
      str = str.replace(/<style>html,body[^<]+<\/style>/gmi, `<link rel="stylesheet" href="${url}">`)

      response.screen = this.parseScreenLink(response.screen)
      var ret = HTMLParser.parse(response.screen.originalContent)
      var dom = ret.querySelector(".popout-content")
      if (dom) response.screen.text = dom.structuredText
      response.screen.photos = []
      var photos = ret.querySelectorAll(".photo_tv_image")
      if (photos) {
        for (var i=0; i < photos.length; i++) {
          response.screen.photos.push(photos[i].attributes["data-image-url"])
        }
      }

      response.screen.help = []
      var help = ret.querySelectorAll('.follow-up-query')
      if (help) {
        for (var i=0; i < help.length; i++) {
          response.screen.help.push(help[i].attributes["data-follow-up-query"])
          log("HELP:WORD", help[i].attributes["data-follow-up-query"])
        }
      }

      response.screen.trysay = null
      var trysay = ret.querySelectorAll(".assistant_response")
      if (trysay) {
        response.screen.trysay = trysay[0].rawText
        log("TRYSAY:TRANSLATE", trysay[0].rawText)
      }

      // it can't do this work this node-html-parser
      // because result ret.toString() != str
      // I am looking for another require without touching the original str
      // to just add this stupid link to the button class
      //<button class="suggestion follow-up-query" aria-labelledby="suggestion_header suggestion_0" data-follow-up-query="Et Chewbacca ?" id="suggestion_0">Et Chewbacca ?</button>

      var contents = fs.writeFile(filePath, str, (error) => {
        if (error) {
         log("CONVERSATION:SCREENOUTPUT_CREATION_ERROR", error)
         endCallback(error)
        } else {
          log("CONVERSATION:SCREENOUTPUT_CREATED")
          response.screen.path = filePath
          response.screen.uri = uri
          endCallback(response)
        }
      })
    }
  }

  parseScreenLink(screen) {
    var html = screen.originalContent
    screen.links = []
    var links = [
      /data-url=\"([^\"]+)\"/gmi,
      / (http[s]?\:\/\/[^ \)]+)[ ]?\)/gmi,
      /\: (http[s]?\:\/\/[^ <]+)/gmi,
    ]
    var r = null
    var res = []
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      while ((r = link.exec(html)) !== null) {
        res.push(entities.decode(r[1]))
      }
    }
    screen.links = res
    return screen
  }
}

module.exports = SCREENPARSER
