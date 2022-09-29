import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET, KAKAO_REDIRECT_URL } from "../../key";
import { generateToken } from "../../lib/jwtMiddleware";
import { compareUserInfo, kakaoInfo } from "../../userInfo";

const formUrlEncoded = (x) =>
    Object.keys(x).reduce(
        (p, c) => p + `&${c}=${encodeURIComponent(x[c])}`,
        ""
    );

export const kakao = async (ctx) => {
    // 인가 코드를 받는다 (사용자정보에 접근 가능한 권한을 가진 코드)
    // const code = ctx.query.code;
    const { code } = ctx.request.body;
    // code 가 있으면 토큰받기 요청
    // error || error_description 이 있으면 에러 원인별 서비스페이지, 안내문구 처리필요.

    try {
        // 사용자 접근 토큰 얻기.
        const response = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            formUrlEncoded({
                grant_type: "authorization_code",
                client_id: CLIENT_ID,
                redirect_uri: KAKAO_REDIRECT_URL,
                code: code,
                client_secret: CLIENT_SECRET,
            }),
            {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token } = response.data; // 인가코드로 얻은 사용자 정보에 접근할수 있는 토큰.

        // 사용자의 동의내역 확인하기
        const userScope = await axios.get(
            "https://kapi.kakao.com/v2/user/scopes",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const [global_token, setToken] = kakaoInfo();
        setToken(access_token);
        // 사용자 정보 가져오기.
        const userInfo = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        if (userInfo.data) {
            // 회원가입이 되어있는 사용자인지 체크
            const findResult = compareUserInfo(userInfo.data.id, "", "kakao");

            // 토큰 생성
            const token = await generateToken(userInfo.data.id, "kakao");
            ctx.cookies.set("sns_login_token", token, { httpOnly: true });

            ctx.status = 200;
            ctx.body = {
                type: findResult.type,
                message: findResult.message,
                data: findResult.data,
                socialData: userInfo.data,
            };
        } else {
            ctx.status = 400;
            ctx.body = {
                type: "fail",
                message: "사용자 카카오 정보 가져오기 실패",
            };
        }
        /*
        token_type: bearer (고정)
        access_token: 사용자 액세스 토큰 값
        refresh_token: 사용자 리프레시 토큰 값
        expires_in 만료시간
        refresh_token_expires_in: 리프레시토큰 만료 시간
        
        */
    } catch (e) {
        console.log("error", e);
        ctx.status = 400;
        ctx.body = {
            type: "fail",
            message: "사용자 카카오 정보 가져오기 실패",
        };
    }
};

export const google = async (ctx) => {
    const { token } = ctx.request.body;

    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );

    // 여기에 토큰 정보가 담겨있다.
    const result = JSON.parse(jsonPayload);

    // 회원가입이 되어있는 사용자인지 체크
    const findResult = compareUserInfo(result.sub, "", "google");

    const token_google = await generateToken(result.sub, "google");
    ctx.cookies.set("sns_login_token", token_google, { httpOnly: true });

    // sub가 고유 아이디다.
    // 토큰을 발급한다. (data엔 일단 다 담아본다.)

    ctx.status = 200;
    ctx.body = {
        type: findResult.type,
        message: findResult.message,
        data: findResult.data,
        socialData: result,
    };
};

export const naver = async (ctx) => {
    // 정보 받아서
    console.log("네이버 정보", ctx.request.body);
    // 회원가입 되어있는 정보가 있는지 확인하고
    const result = compareUserInfo(ID, "", "naver");
    // 토큰 만들어서
    const token = await generateToken(ID, "naver");
    ctx.cookies.set("sns_login_token", token, { httpOnly: true });
    // 리턴.
    ctx.status = 200;
    ctx.body = {
        type: result.type,
        message: result.message,
        data: result,
        socialData: null,
    };
};
