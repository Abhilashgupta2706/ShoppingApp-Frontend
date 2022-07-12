const path = require('path')

exports.pageNotFound = (req, res, next) => {
    res
        .status(404)
        .sendFile(path.join(__dirname, '..', 'views', '404-Error.html'))
}