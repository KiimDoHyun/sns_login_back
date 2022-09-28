const jwt = require("jsonwebtoken");

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

export const jwtMiddleware = async (ctx, next) => {
    let token = ctx.cookies.get("access_token");
    if (!token) return next(); // 토큰이 없음

    try {
        // 토큰 확인
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 만약 토큰 만료라면?

        ctx.state.user = {
            UserID: decoded.UserID,
            UserName: decoded.UserName,
        };
        // 토큰 15분 미만 남으면 재발급
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp - now < 60 * 60 * 0.5) {
            token = await generateToken(decoded.UserID);
            ctx.cookies.set("access_token", token, {
                maxAge: 1000 * 60 * 60 * 1, // 1시간
                httpOnly: true,
            });
        }

        return next();
    } catch (e) {
        // 토큰 검증 실패
        return next();
    }
};
