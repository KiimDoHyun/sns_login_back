import Router from "koa-router";
import auth from "./auth";
import social from "./social";
import test from "./test";

const api = new Router();
api.use("/auth", auth.routes());
api.use("/social", social.routes());
api.use("/test", test.routes());

export default api;
