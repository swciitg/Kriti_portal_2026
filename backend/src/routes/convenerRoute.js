import { Router } from "express";
import { OnBoardUser } from "../controllers/convener/createUser.js";
import { createPS } from "../controllers/ps/convener/createPS.js";
import { updatePS } from "../controllers/ps/convener/updatePS.js";
import { deletePS } from "../controllers/ps/convener/deletePS.js";
import { getPendingRequests } from "../controllers/convener/getPendingRequests.js";
import { verifyJudgeRequest } from "../controllers/convener/verifyJudgeRequest.js";
import { getCompanyPendingRequests } from "../controllers/convener/getCompanyPendingRequests.js";
import { verifyCompanyRequest } from "../controllers/convener/verifyCompanyRequest.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/create-user").post(verifyJWT, handleRouteAccess, OnBoardUser);
router.route("/create-ps").post(verifyJWT, handleRouteAccess, createPS);
router.route("/update-ps/:id").put(verifyJWT, handleRouteAccess, updatePS);
router.route("/delete-ps/:id").delete(verifyJWT, handleRouteAccess, deletePS);
router.route("/get-pending-requests").get(verifyJWT, handleRouteAccess, getPendingRequests);
router.route("/verify-judge/:judgeId").post(verifyJWT, handleRouteAccess, verifyJudgeRequest);
router.route("/get-company-pending-requests").get(verifyJWT, handleRouteAccess, getCompanyPendingRequests);
router.route("/verify-company/:companyId").post(verifyJWT, handleRouteAccess, verifyCompanyRequest);

export default router;
