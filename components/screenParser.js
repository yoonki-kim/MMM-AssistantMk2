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
  constructor(config) {
    this.config = config
    var debug = (config.debug) ? config.debug : false
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

      /***Test HelpWord***/
      // reset helpbox answser
      response.screen.help = null
      response.screen.trysay = null
      response.screen.help = this.helpWord(str)
      response.screen.trysay = this.helpTrySay(str)
      /*******************/

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

  /** to eouia : how to simplify helpWord and HelpTrySay function !? **/

  /** research "try to say..." words **/
  helpWord(html) {
    var result = [];
    var exp1 = /(<div id="assistant-scroll-bar">[\s\S]*?<\/div>)/gi
    var exp2 = /(id="suggestion_[\s\S]*?<)/gi
    var exp3= /(>[\s\S]*?<)/gi
    if (!html.match(exp1)) return null
    html= html.match(exp1).toString()
    html= html.match(exp2)

    for (var i = 0; i < html.length; i++) {
      var str = html[i].match(exp3).toString()
      str = str.replace('<', "")
      str = str.replace('>', "")
      //log("HelpWord: ", str)
      result.push(str);
    }
    return result;
  }

  /** research "try to say..." translation **/
  helpTrySay(html) {
    var exp1 = /(<span class="assistant_response" id="suggestion_header">[\s\S]*?<\/span>)/gi
    var exp2= /(>[\s\S]*?<)/gi
    if (!html.match(exp1)) return null
    // search exp1 (try say section)
    html = html.match(exp1).toString()
    // extract "try to say" translation > return:  ">Try To Say...<"
    html = html.match(exp2).toString()
    // and delete < and >
    html = html.replace('<', "")
    html = html.replace('>', "")
    return html
  }
  /************************/

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
