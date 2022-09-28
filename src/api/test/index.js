import Router from "koa-router";
import * as testCtrl from "./test.ctrl";

const test = new Router();

test.get("/test", testCtrl.test); // 로그인

export default test;
