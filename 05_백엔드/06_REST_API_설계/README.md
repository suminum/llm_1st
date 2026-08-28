# 설비 관리 API 문서

> 06단원 개념05 에서 말한 "문서 한 장" 의 실제 예시입니다.
> 여러분이 프로젝트를 만들 때 이 파일을 복사해서 고쳐 쓰세요.

---

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 기준 주소 | `http://localhost:3000/api/v1` |
| 형식 | JSON (`Content-Type: application/json; charset=utf-8`) |
| 인증 | `Authorization: Bearer <증표>` — 목록·조회는 없어도 됩니다 |

### 응답 형식

성공하면 `data` 가 있고 `error` 가 없습니다.

```json
{ "data": { }, "meta": { } }
```

실패하면 `error` 가 있고 `data` 가 없습니다.

```json
{ "error": { "code": "NOT_FOUND", "message": "설비를 찾을 수 없습니다" } }
```

`meta` 는 목록일 때만 있습니다. `details` 는 검증 실패일 때만 있습니다.

### 공통 에러

| 상태 | code | 언제 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | 입력값이 규칙에 안 맞음. `details` 에 항목별 이유 |
| 400 | `INVALID_JSON` | 본문이 JSON 형식이 아님 |
| 401 | `UNAUTHENTICATED` | 증표가 없거나 틀림 |
| 403 | `FORBIDDEN` | 증표는 맞는데 자격이 모자람 |
| 404 | `NOT_FOUND` | 그 자원이 없음 |
| 404 | `ROUTE_NOT_FOUND` | 그런 주소가 없음 |
| 409 | `DUPLICATED` | 이미 있는 것을 또 만들려 함 |
| 500 | `INTERNAL_ERROR` | 서버 잘못. 자세한 내용은 안 알려 줍니다 |

---

## GET /api/v1/equipments

설비 목록을 쪽 단위로 돌려줍니다.

| 쿼리 | 필수 | 기본 | 설명 |
| --- | --- | --- | --- |
| `page` | 아니오 | 1 | 쪽 번호. 이상한 값이면 1 |
| `limit` | 아니오 | 10 | 한 쪽 개수. 최대 100 |
| `sort` | 아니오 | - | `name` · `-id` · `line,-id` (앞에 `-` 면 내림차순) |
| `line` | 아니오 | - | `A` · `B` · `C`. 쉼표로 여러 개 (`A,B`) |
| `status` | 아니오 | - | `가동` · `정지` · `점검중` |
| `q` | 아니오 | - | 이름·라인·상태에서 검색. 대소문자 무시 |
| `fields` | 아니오 | - | 원하는 속성만 (`id,name`) |

### 요청

```
GET /api/v1/equipments?line=A&limit=2&sort=-id&fields=id,name
```

### 응답 200

```json
{
  "data": [
    { "id": 11, "name": "적재로봇 1호" },
    { "id": 7, "name": "검사기 1호" }
  ],
  "meta": { "page": 1, "limit": 2, "total": 4, "totalPages": 2 }
}
```

### 에러

없습니다. 조건에 맞는 것이 없으면 `data` 가 빈 배열이고 상태는 200 입니다.
쪽 번호가 범위를 넘어도 200 과 빈 배열입니다.

---

## GET /api/v1/equipments/:id

설비 하나를 돌려줍니다.

| 경로 | 설명 |
| --- | --- |
| `id` | 설비 번호. 숫자여야 합니다 |

### 요청

```
GET /api/v1/equipments/3
```

### 응답 200

```json
{
  "data": {
    "id": 3,
    "name": "프레스 1호",
    "line": "B",
    "status": "가동",
    "설치일": "2019-07-02"
  }
}
```

### 에러

| 상태 | code | 언제 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | `id` 가 숫자가 아님 |
| 404 | `NOT_FOUND` | 그 번호의 설비가 없음 |

---

## GET /api/v1/equipments/:id/logs

그 설비의 점검기록 목록입니다.

### 요청

```
GET /api/v1/equipments/1/logs
```

### 응답 200

```json
{
  "data": [
    { "id": 1, "equipmentId": 1, "result": "정상", "점검일": "2026-08-01", "담당자": "김민준" },
    { "id": 2, "equipmentId": 1, "result": "이상", "점검일": "2026-08-08", "담당자": "이서연" }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

### 에러

| 상태 | code | 언제 |
| --- | --- | --- |
| 404 | `NOT_FOUND` | 그 설비가 없음 (기록이 0건인 것과 다릅니다) |

> 설비는 있는데 기록이 없으면 200 과 빈 배열입니다.
> 설비 자체가 없으면 404 입니다. 이 둘을 꼭 구별하세요.

---

## POST /api/v1/equipments

설비를 새로 등록합니다. **`admin` 만 할 수 있습니다.**

### 요청

```
POST /api/v1/equipments
Authorization: Bearer key-admin-1
Content-Type: application/json

{ "name": "용접로봇 3호", "line": "C" }
```

| 본문 | 필수 | 규칙 |
| --- | --- | --- |
| `name` | 예 | 글자, 2~20자 |
| `line` | 예 | `A` · `B` · `C` 중 하나 |
| `status` | — | **받지 않습니다.** 언제나 `정지` 로 시작합니다 |

### 응답 201

```
Location: /api/v1/equipments/13
```

```json
{ "data": { "id": 13, "name": "용접로봇 3호", "line": "C", "status": "정지" } }
```

### 에러

| 상태 | code | 언제 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | 아래 예시 참고 |
| 401 | `UNAUTHENTICATED` | 증표 없음 |
| 403 | `FORBIDDEN` | `user` 가 요청함 |

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "입력값이 올바르지 않습니다",
    "details": [
      { "키": "name", "이유": "2글자 이상이어야 합니다" },
      { "키": "line", "이유": "A, B, C 중 하나여야 합니다" }
    ]
  }
}
```

---

## PATCH /api/v1/equipments/:id

상태만 바꿉니다. 로그인하면 누구나 할 수 있습니다.

### 요청

```
PATCH /api/v1/equipments/3
Authorization: Bearer key-user-1

{ "status": "점검중" }
```

| 본문 | 필수 | 규칙 |
| --- | --- | --- |
| `status` | 예 | `가동` · `정지` · `점검중` 중 하나 |

### 응답 200

```json
{ "data": { "id": 3, "name": "프레스 1호", "line": "B", "status": "점검중" } }
```

### 에러

| 상태 | code | 언제 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | `status` 가 셋 중 하나가 아님 |
| 401 | `UNAUTHENTICATED` | 증표 없음 |
| 404 | `NOT_FOUND` | 그 설비가 없음 |

---

## DELETE /api/v1/equipments/:id

설비를 지웁니다. **`admin` 만 할 수 있습니다.**

### 요청

```
DELETE /api/v1/equipments/13
Authorization: Bearer key-admin-1
```

### 응답 204

본문이 없습니다.

### 에러

| 상태 | code | 언제 |
| --- | --- | --- |
| 401 | `UNAUTHENTICATED` | 증표 없음 |
| 403 | `FORBIDDEN` | `user` 가 요청함 |
| 404 | `NOT_FOUND` | 그 설비가 없음 |

> 자격이 없는 사람에게는 404 보다 403 이 먼저 나갑니다.
> 있는지 없는지를 알려 주지 않기 위해서입니다.

---

## 버전

현재 `v1` 입니다.

깨지는 변경(필드 삭제·이름 변경·타입 변경·응답 형식 변경)이 필요하면
`v2` 를 새로 만들고 `v1` 은 그대로 둡니다.

없앨 예정인 주소에는 이런 헤더가 붙습니다.

```
Deprecation: true
Sunset: Wed, 31 Dec 2026 00:00:00 GMT
Link: </api/v2/equipments>; rel="successor-version"
```

---

## 시험해 보기

```bash
# 목록
curl "http://localhost:3000/api/v1/equipments?limit=3"

# 하나
curl "http://localhost:3000/api/v1/equipments/3"

# 등록 (macOS·Git Bash 에서 한 줄로 실행합니다)
curl -X POST "http://localhost:3000/api/v1/equipments" -H "Content-Type: application/json" -H "Authorization: Bearer key-admin-1" -d '{"name":"용접로봇 3호","line":"C"}'
```

윈도우 cmd·PowerShell 은 따옴표 규칙이 달라 위 명령이 그대로 안 됩니다.
Postman 을 쓰면 따옴표 때문에 고생할 일이 없습니다. 그쪽을 권합니다.
