import Router from "koa-router";
import auth from "./auth";
import social from "./social";

const api = new Router();
api.use("/auth", auth.routes());
api.use("/social", social.routes());

export default api;
