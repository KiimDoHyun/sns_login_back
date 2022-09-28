import Router from "koa-router";
import * as authCtrl from "./auth.ctrl";

const auth = new Router();

auth.post("/login", authCtrl.login); // 로그인

export default auth;
