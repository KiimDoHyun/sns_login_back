import Router from "koa-router";
import * as authCtrl from "./auth.ctrl";

const auth = new Router();

auth.post("/login", authCtrl.login); // 로그인
auth.get("/logout", authCtrl.logout); // 로그아웃

export default auth;
