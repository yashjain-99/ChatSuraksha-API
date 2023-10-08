import { body } from "express-validator";

const validate = (method) => {
  switch (method) {
    case "login": {
      return [
        body("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Invalid email format"),

        body("password").notEmpty().withMessage("Password is required"),
      ];
    }
    case "signup": {
      return [
        body("name").notEmpty().withMessage("Name is required"),

        body("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Invalid email format"),

        body("password")
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long")
          .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).*$/)
          .withMessage(
            "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
          ),

        body("confirmPassword")
          .notEmpty()
          .withMessage("Confirm password is required")
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error("Passwords do not match");
            }
            return true;
          })
          .withMessage("Passwords must match"),
      ];
    }
  }
};

export default validate;
