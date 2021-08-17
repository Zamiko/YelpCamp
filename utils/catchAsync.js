//we return a function that accepts a function and executes that function
//but catches any error and passes it to next, if there is an error. 
module.exports = func => {
    return(req, res, next) => {
        func(req, res, next).catch(next);
    }
}