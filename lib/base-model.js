/*
Copyright 2015 Hewlett-Packard Development Company, L.P.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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
