import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants";

const userRegisterValidator = () => {
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("email invalid"),

        body("username")
        .trim()
        .notEmpty()
        .withMessage("username is req")
        .isLowercase()
        .withMessage("must be in lowercase")
        .isLength({ min: 3 })
        .withMessage("username is small"),

        body("password")
        .trim()
        .notEmpty()
        .withMessage("password is req"),

        body("fullName")
        .optional()
        .trim()
    ];
};

const userLoginValidator=()=>{
    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is invalid"),
        body("password")
        .notEmpty()
        .withMessage("password is required")


    ]
}

const userChangeCurrentPasswordValidator=()=>{
    return [
        body("oldpasword")
        .notEmpty()
        .withMessage("old pasword is required"),
        body("newpasword")
        .notEmpty()
        .withMessage("new pasword is required")
        
    ]
}
const userForgotPasswordValidator=()=>{
    return [
        body("email")
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is invalid")

    ]
}
const userResetForgotPasswordValidator=()=>{
    return [
        body("newpassword")
        .notEmpty()
        .withMessage("Password is required")

    ]
}
const createProjectValidator=()=>{
    return [
        body("name")
        .notEmpty()
        .withMessage("name is required"),
        body("description")
        .optional(),
    ]
}
const addMembersToProjectValidator=()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is invalid"),
        body("role")
        .notEmpty()
        .withMessage("role is required")
        .isIn(AvailableUserRole)
        .withMessage("role is invalid")
    ]
}
export { userRegisterValidator,
        userLoginValidator,
        userChangeCurrentPasswordValidator,
        userForgotPasswordValidator,
        userResetForgotPasswordValidator,
        addMembersToProjectValidator,
        createProjectValidator
        };