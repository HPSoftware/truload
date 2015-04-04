
function handleHttpError(context, err, res, cba) {

    var baseMsg = "error in " + context + ": "
    
    if (err) {
      cba(baseMsg+err)
      return true
    } 

    if (res.statusCode !=200) { 

      var msg = baseMsg     

      if (body) 
      {
         if (body.status_code) msg += body.status_code
         else msg += JSON.stringify(body)
      }
      
      msg += "\r\nstatus: " + res.statusCode
      
      cba(msg)
      return true
   }

   return false
}

exports.handleHttpError = handleHttpError
