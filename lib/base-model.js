var r = require('request')
  , handleHttpError = require('./utils').handleHttpError

function BaseModel(options) {   
   this.options = options

   this.login = login
   this.jar = null
}

function login(cba) {
   
   var self = this

   if (self.options.skipLogin || this.jar) {
      cba()
      return
   }

   var url = this.options.url + 'api/cli-login'   
   var payload = {user: this.options.user, password: this.options.password}   

   r.post({url: url, json: payload, proxy: self.options.proxy}, function(err, res, body) {

      if (handleHttpError("login", err, res, cba)) return

      self.jar = getLoginCookieJar(self.options.url, body.toString())
      cba()
   })
   
}

function getLoginCookieJar(targetUrl, token) {
   var cookie, jar;
   cookie = r.cookie('LWSSO_COOKIE_KEY=' + token);
   jar = r.jar();
   jar.setCookie(cookie, targetUrl);   
   return jar;
}

module.exports = BaseModel
