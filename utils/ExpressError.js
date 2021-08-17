class ExpressError extends Error{
    constructor(message, statusCode){
        super(); //Calls Error constructor 
        this.message = message;
        this.statusCode = statusCode;

    }
}

module.exports = ExpressError;