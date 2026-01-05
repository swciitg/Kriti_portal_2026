import { Router } from "express";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { registerTeam } from "../controllers/techSecy/registerTeam.js";
import { GetTeamsForProblemStatement } from "../controllers/teams/getByProblemStatement.js";
import { editRegisteredTeam } from "../controllers/techSecy/editRegisteredTeam.js";
import { updateRegisterTeam } from "../controllers/techSecy/updateRegisterTeam.js";
import { DeleteRequest } from "../controllers/convener/requests/deleteRequest.js";
import { GetRequestById } from "../controllers/techSecy/getRequestByID.js";
import { getPS } from "../controllers/ps/public/getPS.js";

const router = Router();

router
  .route("/register-team/:psId")
  .post(verifyJWT, handleRouteAccess, registerTeam);
router
  .route("/get-team/:psId")
  .get(verifyJWT, handleRouteAccess, GetTeamsForProblemStatement);
router
  .route("/edit-registered-team/:psId")
  .post(verifyJWT, handleRouteAccess, editRegisteredTeam);
router
  .route("/update-registered-team/:psId")
  .put(verifyJWT, handleRouteAccess, updateRegisterTeam);
router.route("/delete/:id").delete(verifyJWT, handleRouteAccess, DeleteRequest);
router
  .route("/get-requests/:psId")
  .get(verifyJWT, handleRouteAccess, GetRequestById);

router.route("/getps").get(verifyJWT, handleRouteAccess, getPS);

export default router;
