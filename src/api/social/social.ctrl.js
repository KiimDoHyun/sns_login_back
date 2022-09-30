import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET, KAKAO_REDIRECT_URL } from "../../key";
import { generateToken } from "../../lib/jwtMiddleware";
import { compareUserInfo, kakaoInfo } from "../../userInfo";

/*
>> 참고

F: 프론트엔드
N: 네이버
K: 카카오
G: 구글
B: 백엔드

compareUserInfo : DB에서 사용자 정보를 찾아오는 역할을 하는 함수

ctx.body 구조
type: findResult.type,          // 성공 여부
message: findResult.message,    // 메세지
data: findResult.data,          // DB에 저장된 데이터
socialData: jwt_info,           // 각 소셜 네트워크 서비스에 저장된 사용자 데이터
*/

// 인코딩
const formUrlEncoded = (x) =>
    Object.keys(x).reduce(
        (p, c) => p + `&${c}=${encodeURIComponent(x[c])}`,
        ""
    );

/*

카카오 로그인 과정

[진행단계]
1. 프론트로부터 인가코드를 넘겨받는다.
>> F --(code)--> B

2. 넘겨받은 인가코드를 이용해서 사용자 정보에 접근할 수 있는 access_token을 카카오에 요청해서 받아온다.
>> B --(code)--> K --(access_token)--> B

3. 전달받은 access_token으로 카카오 정보를 불러온다.
>> B --(access_token)--> K --(userInfo)--> B

4. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다.
>> B --(userInfo) --> DB --(result)--> B

5. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
>> B --(token, ctx)--> F

*/

// Kakao
export const kakao = async (ctx) => {
    // ▷────────────────────────────────────────────────────────────────────
    // [진행단계] 1. 프론트로부터 인가코드를 넘겨받는다. --------------
    const { code } = ctx.request.body;
    // -------------- [진행단계] 1. 프론트로부터 인가코드를 넘겨받는다.
    // ────────────────────────────────────────────────────────────────────◁

    // ▷─────────────────────────────────────────────────────────────────────
    // [진행단계] 2. 넘겨받은 인가코드를 이용해서 사용자 정보에 접근할 수 있는 access_token을 카카오에 요청해서 받아온다. --------------
    try {
        const response = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            // 인코딩이 없으면 KOE010 에러 발생.
            // post로 body에 항목을 전달할때 인코딩이 필요함.
            formUrlEncoded({
                grant_type: "authorization_code",
                client_id: CLIENT_ID, // 앱 키
                redirect_uri: KAKAO_REDIRECT_URL, // 요청이 성공한 경우 이동할 주소
                code: code, // 인가코드
                client_secret: CLIENT_SECRET, // 보안용 코드
            }),
            {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded", // 고정
                },
            }
        );
        // -------------- [진행단계] 2. 넘겨받은 인가코드를 이용해서 사용자 정보에 접근할 수 있는 access_token을 카카오에 요청해서 받아온다.
        // ─────────────────────────────────────────────────────────────────────◁

        // ▷─────────────────────────────────────────────────────────────────────
        /* 인가 코드를 전달했을때 받아오는 결과값 -------------- 
        
        token_type: bearer (고정)
        access_token: 사용자 액세스 토큰 값
        refresh_token: 사용자 리프레시 토큰 값
        expires_in 만료시간
        refresh_token_expires_in: 리프레시토큰 만료 시간
        
        -------------- 인가 코드를 전달했을때 받아오는 결과값 */
        // ─────────────────────────────────────────────────────────────────────◁

        // ▷─────────────────────────────────────────────────────────────────────
        const { access_token } = response.data; // 인가코드로 얻은 사용자 정보에 접근할수 있는 토큰.
        // ─────────────────────────────────────────────────────────────────────◁

        // ▷─────────────────────────────────────────────────────────────────────
        // 사용자의 동의내역 확인하기 (선택) --------------
        // const userScope = await axios.get(
        //     "https://kapi.kakao.com/v2/user/scopes",
        //     {
        //         headers: {
        //             Authorization: `Bearer ${access_token}`,
        //         },
        //     }
        // );
        // console.log("사용자 동의 내역", userScope)
        // -------------- 사용자의 동의내역 확인하기 (선택)
        // ─────────────────────────────────────────────────────────────────────◁

        // ▷─────────────────────────────────────────────────────────────────────
        // Kakao access_token 저장 (카카오 로그아웃에서 사용) --------------
        const [global_token, setToken] = kakaoInfo();
        setToken(access_token);
        // -------------- Kakao access_token 저장 (카카오 로그아웃에서 사용)
        // ─────────────────────────────────────────────────────────────────────◁

        // ▷─────────────────────────────────────────────────────────────────────
        // [진행단계] 3. 전달받은 access_token으로 카카오 정보를 불러온다. --------------
        const userInfo = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        // -------------- [진행단계] 3. 전달받은 access_token으로 카카오 정보를 불러온다.
        // ─────────────────────────────────────────────────────────────────────◁

        // ▷─────────────────────────────────────────────────────────────────────
        // 사용자 정보를 성공적으로 가져온 경우 --------------
        if (userInfo.data) {
            // [진행단계] 4. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다.
            const findResult = compareUserInfo(userInfo.data.id, "", "kakao");

            // [진행단계] 5. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
            const token = await generateToken(userInfo.data.id, "kakao");
            ctx.cookies.set("sns_login_token", token, { httpOnly: true });

            // 로그인 처리
            ctx.status = 200;
            ctx.body = {
                type: findResult.type,
                message: findResult.message,
                data: findResult.data,
                socialData: userInfo.data,
            };
        }
        // -------------- 사용자 정보를 성공적으로 가져온 경우
        // 카카오에서 사용자 정보를 가져오지 못한 경우 --------------
        else {
            ctx.status = 400;
            ctx.body = {
                type: "fail",
                message: "사용자 카카오 정보 가져오기 실패",
            };
        }
        // -------------- 카카오에서 사용자 정보를 가져오지 못한 경우
        // ─────────────────────────────────────────────────────────────────────◁
    } catch (e) {
        // ▷─────────────────────────────────────────────────────────────────────
        // -------------- 카카오 api와 통신연결이 실패하는 경우
        console.log("error", e);
        ctx.status = 400;
        ctx.body = {
            type: "fail",
            message: "사용자 카카오 api 실패",
        };
        //  카카오 api와 통신연결이 실패하는 경우 --------------
        // ─────────────────────────────────────────────────────────────────────◁
    }
};

/*

구글 로그인 과정

[진행단계]
1. 프론트로부터 사용자 정보가 담긴 JWT 토큰을 받는다.
>> F --(jwt)--> B

2. JWT 토큰을 해독해서 사용자 정보를 확인한다.
>> B --(jwt)--> B --(userInfo)--> B

3. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다.
>> B --(userInfo) --> DB --(result)--> B

5. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
>> B --(token, ctx)--> F

*/

// Google
export const google = async (ctx) => {
    // ▷────────────────────────────────────────────────────────────────────
    // [진행단계] 1. 프론트로부터 사용자 정보가 담긴 JWT 토큰을 받는다. --------------
    const { token } = ctx.request.body;
    // -------------- [진행단계] 1. 프론트로부터 사용자 정보가 담긴 JWT 토큰을 받는다.
    // ────────────────────────────────────────────────────────────────────◁

    // ▷────────────────────────────────────────────────────────────────────
    // [진행단계] 2. JWT 토큰을 해독해서 사용자 정보를 확인한다.--------------

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
    const jwt_info = JSON.parse(jsonPayload);
    // -------------- [진행단계] 2. JWT 토큰을 해독해서 사용자 정보를 확인한다.
    // ────────────────────────────────────────────────────────────────────◁

    // ▷────────────────────────────────────────────────────────────────────
    // [진행단계] 3. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다. --------------
    const findResult = compareUserInfo(jwt_info.sub, "", "google");
    // -------------- [진행단계] 3. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다.
    // ────────────────────────────────────────────────────────────────────◁

    // ▷────────────────────────────────────────────────────────────────────
    // -------------- [진행단계] 4. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
    const token_google = await generateToken(jwt_info.sub, "google");
    ctx.cookies.set("sns_login_token", token_google, { httpOnly: true });

    // 구글 로그인 api 에서 sub가 고유 아이디에 해당함.

    ctx.status = 200;
    ctx.body = {
        type: findResult.type,
        message: findResult.message,
        data: findResult.data,
        socialData: jwt_info,
    };
    // -------------- [진행단계] 4. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
    // ────────────────────────────────────────────────────────────────────◁
};

/*

네이버 로그인 과정

[진행단계]
1. 프론트로부터 사용자 정보에 접근할 수 있는 access_token을 전달받는다.
>> F --(jwt)--> B

2. 전달받은 access_token으로 네이버 정보를 불러온다.
>> B --(jwt)--> G --(userInfo)--> B

3. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다.
>> B --(userInfo) --> DB --(result)--> B

5. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
>> B --(token, ctx)--> F

*/

// Naver
export const naver = async (ctx) => {
    // ▷────────────────────────────────────────────────────────────────────
    // [진행단계] 1. 프론트로부터 사용자 정보에 접근할 수 있는 access_token을 전달받는다. --------------
    const { access_token } = ctx.request.body;
    // -------------- [진행단계] 1. 프론트로부터 사용자 정보에 접근할 수 있는 access_token을 전달받는다.
    // ────────────────────────────────────────────────────────────────────◁

    try {
        // ▷────────────────────────────────────────────────────────────────────
        // [진행단계] 2. 전달받은 access_token으로 네이버 정보를 불러온다. --------------
        const { data } = await axios.get(
            "https://openapi.naver.com/v1/nid/me",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );
        // -------------- [진행단계] 2. 전달받은 access_token으로 네이버 정보를 불러온다.
        // ────────────────────────────────────────────────────────────────────◁

        // ▷────────────────────────────────────────────────────────────────────
        // [진행단계] 3. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다. --------------
        const result = compareUserInfo(data.response.id, "", "naver");
        // -------------- [진행단계] 3. 개발하고자 하는 서비스에 등록되어있는 사용자인지 확인한다.
        // ────────────────────────────────────────────────────────────────────◁

        // ▷────────────────────────────────────────────────────────────────────
        // -------------- [진행단계] 4. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
        // 토큰 만들어서
        const token = await generateToken(data.response.id, "naver");
        ctx.cookies.set("sns_login_token", token, { httpOnly: true });
        // 리턴.
        ctx.status = 200;
        ctx.body = {
            type: result.type,
            message: result.message,
            data: result.data,
            socialData: data.response,
        };
        // -------------- [진행단계] 4. 적절한 로그인 처리를 한다. (로그인 / 회원가입)
        // ────────────────────────────────────────────────────────────────────◁
    } catch (e) {
        // ▷─────────────────────────────────────────────────────────────────────
        // 네이버 api와 통신연결이 실패하는 경우 --------------
        console.log(e);
        console.log("실패");
        ctx.status = 200;
        ctx.body = {
            type: result.type,
            message: "사용자 네이버 정보 가져오기 실패",
        };
        // -------------- 네이버 api와 통신연결이 실패하는 경우
        // ────────────────────────────────────────────────────────────────────◁
    }

    // 정보 받아서
    // const { user } = ctx.request.body;
    // console.log("네이버 정보", user);
    // 회원가입 되어있는 정보가 있는지 확인하고
    // const result = compareUserInfo(user.id, "", "naver");
    // // 토큰 만들어서
    // const token = await generateToken(user.id, "naver");
    // ctx.cookies.set("sns_login_token", token, { httpOnly: true });
    // // 리턴.
    // ctx.status = 200;
    // ctx.body = {
    //     type: result.type,
    //     message: result.message,
    //     data: result.data,
    //     socialData: user,
    // };
};
