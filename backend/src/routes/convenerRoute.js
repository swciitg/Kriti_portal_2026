import { Router } from "express";
import { OnBoardUser } from "../controllers/convener/createUser.js";
import { createPS } from "../controllers/ps/convener/createPS.js";
import { updatePS } from "../controllers/ps/convener/updatePS.js";
import { deletePS } from "../controllers/ps/convener/deletePS.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { GetAllRequests } from "../controllers/convener/requests/getAllRequests.js";
import { GetRequestById } from "../controllers/convener/requests/getRequestById.js";
import { statusUpdate } from "../controllers/convener/requests/statusUpdate.js";

const router = Router();

router.route("/create-user").post(verifyJWT, handleRouteAccess, OnBoardUser);
router.route("/create-ps").post(verifyJWT, handleRouteAccess, createPS);
router.route("/update-ps/:id").put(verifyJWT, handleRouteAccess, updatePS);
router.route("/delete-ps/:id").delete(verifyJWT, handleRouteAccess, deletePS);
router.route("/get-requests").get(verifyJWT, handleRouteAccess, GetAllRequests);
router.route("/get-requests/:id").get(verifyJWT, handleRouteAccess, GetRequestById);
router.route("/update-status/:id").put(verifyJWT, handleRouteAccess, statusUpdate);

export default router;
