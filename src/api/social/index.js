import Router from "koa-router";
import * as socialCtrl from "./social.ctrl";

const social = new Router();

social.post("/kakao", socialCtrl.kakao); // 카카오
social.post("/google", socialCtrl.google); // 구글
social.post("/naver", socialCtrl.naver); // 네이버

export default social;
