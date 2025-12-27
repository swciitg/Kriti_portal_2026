import { Router } from "express";
import { OnBoardUser } from "../controllers/convener/createUser.js";
import { createPS } from "../controllers/ps/convener/createPS.js";
import { updatePS } from "../controllers/ps/convener/updatePS.js";
import { deletePS } from "../controllers/ps/convener/deletePS.js";
import { 
  getPendingRequests, 
  getAccessRequests, 
  verifyJudgeRequest, 
  grantAccess 
} from "../controllers/convener/judgeManagement.js";
import { 
  getCompanyPendingRequests, 
  getCompanyAccessRequests, 
  verifyCompanyRequest, 
  grantCompanyAccess 
} from "../controllers/convener/companyManagement.js";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import { GetAllRequests } from "../controllers/convener/requests/getAllRequests.js";
import { GetRequestById } from "../controllers/convener/requests/getRequestById.js";
import { statusUpdate } from "../controllers/convener/requests/statusUpdate.js";
import { getAllUsers } from "../controllers/convener/getAllUsers.js";

const router = Router();

router.route("/create-user").post(verifyJWT, handleRouteAccess, OnBoardUser);
router.route("/get-all-users").get(verifyJWT , handleRouteAccess , getAllUsers);
router.route("/create-ps").post(verifyJWT, handleRouteAccess, createPS);
router.route("/update-ps/:id").put(verifyJWT, handleRouteAccess, updatePS);
router.route("/delete-ps/:id").delete(verifyJWT, handleRouteAccess, deletePS);
router.route("/get-pending-requests").get(verifyJWT, handleRouteAccess, getPendingRequests);
router.route("/verify-judge/:judgeId").post(verifyJWT, handleRouteAccess, verifyJudgeRequest);
router.route("/get-company-pending-requests").get(verifyJWT, handleRouteAccess, getCompanyPendingRequests);
router.route("/verify-company/:companyId").post(verifyJWT, handleRouteAccess, verifyCompanyRequest);
router.route("/get-access-requests").get(verifyJWT, handleRouteAccess, getAccessRequests);
router.route("/grant-access/:judgeId").post(verifyJWT, handleRouteAccess, grantAccess);
router.route("/get-company-access-requests").get(verifyJWT, handleRouteAccess, getCompanyAccessRequests);
router.route("/grant-company-access/:companyId").post(verifyJWT, handleRouteAccess, grantCompanyAccess);
router.route("/get-requests").get(verifyJWT, handleRouteAccess, GetAllRequests);
router.route("/get-requests/:id").get(verifyJWT, handleRouteAccess, GetRequestById);
router.route("/update-status/:id").put(verifyJWT, handleRouteAccess, statusUpdate);

export default router;
