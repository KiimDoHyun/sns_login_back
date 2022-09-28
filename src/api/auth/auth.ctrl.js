// import { generateToken } from "../../lib/jwtMiddleware";
import { compareUserInfo } from "../../userInfo";

export const login = async (ctx) => {
    const { ID, PW } = ctx.request.body;

    // 아이디 비밀번호 확인
    const result = compareUserInfo(ID, PW, "normal");

    if (result.type === "fail") {
        ctx.status = 200;
        ctx.body = {
            type: result.type,
            message: result.message,
        };
    } else if (result.type === "success") {
        // 로그인이 성공하면 토큰을 생성한다.
        // 토큰은 쿠키에 저장한다.

        // const token = await generateToken(ID, "normal");

        ctx.status = 200;
        ctx.body = {
            type: result.type,
            message: result.message,
        };
    }
};

/*
1. 넘어온 토큰을 받는다.
2. 토큰을 열어서 어떤 로그인이 되어있는지 확인한다.
3. 일반로그인이면 토큰 만료를, sns 로그인이면 해당 서비스 로그아웃 후, 토큰 만료를 진행한다.
*/
export const logout = async (ctx) => {};
