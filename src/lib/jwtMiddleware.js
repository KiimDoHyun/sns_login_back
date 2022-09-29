const jwt = require("jsonwebtoken");

const TOKEN_EXPIRED = "jwt expired";

/*
토큰에 담는 값.
1. 로그인 타입 (일반, sns)
2. 아이디
3. 만료시간
*/

// 사용자 아이디로 사용자 이름을 가져오는 부분을 제거함.
export const generateToken = async (UserID, type) => {
    const token = jwt.sign(
        {
            UserID: UserID,
            loginType: type,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1m", // 60분동안 유효함 >> test: 1분
        }
    );

    return token;
};

const exceptionUrl = [
    "/api/auth/login",
    "/api/social/kakao",
    "/api/social/google",
    "/api/social/naver",
    "api/auth/logout",
];

export const jwtMiddleware = async (ctx, next) => {
    let token = ctx.cookies.get("sns_login_token");
    // 토큰이 없음
    if (!token) {
        if (exceptionUrl.includes(ctx.request.url)) {
            return next();
        } else {
            ctx.cookies.set("sns_login_token");
            ctx.status = 401;
            ctx.body = {
                type: "token expired",
                message: "로그인이 만료되었습니다.",
            };
        }
    }

    try {
        // 토큰 확인
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 만약 토큰 만료라면 catch로

        ctx.state.user = {
            UserID: decoded.UserID,
            loginType: decoded.loginType,
        };
        // 토큰 15분 미만 남으면 재발급 --> 일단 제거. 만료되면 끝.
        // const now = Math.floor(Date.now() / 1000);

        // if (decoded.exp - now < 60 * 60 * 0.5) {
        //     token = await generateToken(decoded.UserID);
        //     ctx.cookies.set("sns_login_token", token, {
        //         maxAge: 1000 * 60 * 60 * 1, // 1시간
        //         httpOnly: true,
        //     });
        // }

        return next();
    } catch (e) {
        const { message } = e;

        // 토큰 만료
        // access_token, refresh_token 이 없기 때문에 바로 만료 처리. (다시 로그인 유도)
        if (message === TOKEN_EXPIRED) {
            ctx.cookies.set("sns_login_token");
            ctx.status = 401;
            ctx.body = {
                type: "token expired",
                message: "로그인이 만료되었습니다.",
            };
        }
    }
};
