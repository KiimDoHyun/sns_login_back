import Router from "koa-router";
import * as socialCtrl from "./social.ctrl";

const social = new Router();

social.post("/kakao", socialCtrl.kakao); // 로그인

export default social;
