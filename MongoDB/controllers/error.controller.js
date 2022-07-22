exports.get500 = (req, res, next) => {
    res
        .status(500)
        .render('500-Error', {
            pageTitle: 'Internal Server Error - 500',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn
        });
};