import { Router } from "express";
import { body } from "express-validator";
import { createUserByAdmin, listUsers } from "../controllers/userController.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRoles("ADMIN", "DISTRICT", "DEPARTMENT"));

router.get("/", listUsers);
router.post(
  "/",
  [
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),

    body("email").isEmail(),
    body("district").optional({ checkFalsy: true }).trim(),
    body("state").optional({ checkFalsy: true }).trim(),
    body("role").isIn(["PUBLIC", "ADMIN", "DISTRICT", "DEPARTMENT", "OFFICER", "CONTRACTOR", "VENDOR"]),
    body("password").isLength({ min: 6 }),
  ],
  createUserByAdmin,
);

export default router;
