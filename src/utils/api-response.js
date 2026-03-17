class ApiResponse{
    constructor(statusCode,data,message="Sucess"){
        this.statusCode=statusCode;
        this.data=data
        this.messge=message
        this.sucess=statusCode<400;
    }
}
 export {ApiResponse};