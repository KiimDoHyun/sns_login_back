// import { generateToken } from "../../lib/jwtMiddleware";
import axios from "axios";
import { generateToken } from "../../lib/jwtMiddleware";
import { compareUserInfo, kakaoInfo } from "../../userInfo";

export const login = async (ctx) => {
    const { ID, PW } = ctx.request.body;

    // 등록된 사용자인지 확인
    const result = compareUserInfo(ID, PW, "normal");

    if (result.type === "success") {
        // 로그인이 성공하면 토큰을 생성한다.
        // 토큰은 쿠키에 저장한다.

        const token = await generateToken(ID, "normal");

        // 테스트를 위해 토큰 이름 구분
        ctx.cookies.set("sns_login_token", token, { httpOnly: true });
    }

    ctx.status = 200;
    ctx.body = {
        type: result.type,
        message: result.message,
        data: result,
    };
};

/*
1. 넘어온 토큰을 받는다.
2. 토큰을 열어서 어떤 로그인이 되어있는지 확인한다.
3. 일반로그인이면 토큰 만료를, sns 로그인이면 해당 서비스 로그아웃 후, 토큰 만료를 진행한다.
*/
export const logout = async (ctx) => {
    // console.log(ctx.state.user.loginType);

    if (ctx.state.user.loginType === "kakao") {
        const [global_token, setToken] = kakaoInfo();
        console.log("카카오 토큰입니다.", global_token);
        // 카카오 계정 로그아웃 Test
        try {
            const kakaoLogout = await axios.post(
                "https://kapi.kakao.com/v1/user/logout",
                {},
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Bearer ${global_token}`,
                    },
                }
            );
            console.log(kakaoLogout);
            console.log("카카오 로그아웃 성공");
        } catch (e) {
            console.log(e);
            console.log("카카오 로그아웃 실패");
        }
    }

    ctx.cookies.set("sns_login_token");
    ctx.status = 200; // No Conent
    ctx.body = {
        type: "logout_success",
        message: "로그아웃했습니다.",
    };
};
