
function handleHttpError(context, err, res, cba) {

    var baseMsg = "error in " + context + ": "
    
    if (err) {
      cba(baseMsg+err)
      return true
    } 

    if (res.statusCode !=200) { 

      var msg = baseMsg     

      if (res.body) 
      {
         if (res.body.status_code) msg += res.body.status_code
         else msg += JSON.stringify(res.body)
      }
      
      msg += "\r\nstatus: " + res.statusCode
      
      cba(msg)
      return true
   }

   return false
}

exports.handleHttpError = handleHttpError
