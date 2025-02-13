import { Router } from "express";
import {
  addInWhiteList,
  createToken,
  addContributor,
  getDetails,
} from "../controllers/tokenDetails.controller";
import startSession from "../controllers/zkvSessionController";

const router = Router();

router.post("/whitelist", addInWhiteList);
router.post("/create", createToken);
router.post("/contributor", addContributor);
router.post("/zkvSession", startSession);
router.get("/details", getDetails);

export default router;
