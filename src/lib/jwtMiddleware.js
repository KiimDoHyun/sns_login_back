const jwt = require("jsonwebtoken");

/*
토큰에 들어가야 할 값.
1. 로그인 타입 (일반, sns)
2. 아이디
3. 만료시간
*/

const generateToken = async (UserID) => {
    // DB
    // let result = await MSREQ().query(
    //     `SELECT UserID UserID, UserName FROM Users WHERE UserID = '${UserID}'`
    // );

    if (result.recordset && Object.keys(result.recordset).length > 0) {
        const token = jwt.sign(
            {
                UserID: result.recordset[0].UserID,
                UserName: result.recordset[0].UserName,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "60m", // 60분동안 유효함
            }
        );

        return token;
    }

    return null;
};

const jwtMiddleware = async (ctx, next) => {
    let token = ctx.cookies.get("access_token");
    if (!token) return next(); // 토큰이 없음

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

module.exports = jwtMiddleware;
