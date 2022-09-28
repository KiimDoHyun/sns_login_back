require("dotenv").config(); // 환경변수 접근

import Koa from "koa";
import Router from "koa-router";
import api from "./api";
import bodyParser from "koa-bodyparser";

const { PORT } = process.env;
const app = new Koa();
const router = new Router();

router.use("/api", api.routes());

app.use(bodyParser());

// app.use(jwtMiddleware);
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4500;
app.listen(port, "0.0.0.0");
console.log("Listenig to port %d", port);

/*
그냥 로그인했을때, 카카오 로그인 했을때 모두 토큰이 발급되어야 함.

백엔드에서 직접 발급한 토큰으로 로그인을 허용함.

*/