import Router from "koa-router";
import * as socialCtrl from "./social.ctrl";

const social = new Router();

social.post("/kakao", socialCtrl.kakao); // 카카오
social.post("/google", socialCtrl.google); // 구글

export default social;
