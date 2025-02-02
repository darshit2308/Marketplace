import { Router } from "express";
import { addInWhiteList, createToken } from "../controllers/tokenDetails.controller";

const router = Router();

router.post('/whitelist', addInWhiteList);
router.post('/create', createToken);

export default router;