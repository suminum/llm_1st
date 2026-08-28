# MySQL vs PostgreSQL 실측 결과 (09단원 재료)

**측정 환경**: PostgreSQL 18.6 (docker postgres:18-alpine, 포트 5434) / MySQL 8.4.11 (docker mysql:8.4, 포트 3307)
**측정일**: 2026-08-26. 전부 실제로 돌려서 얻은 값입니다.

```
MySQL 8.4 기본 sql_mode:
  IGNORE_SPACE, ONLY_FULL_GROUP_BY, STRICT_TRANS_TABLES,
  NO_ZERO_IN_DATE, NO_ZERO_DATE, ERROR_FOR_DIVISION_BY_ZERO, NO_ENGINE_SUBSTITUTION
lower_case_table_names = 0   (macOS 인데도 대소문자를 구분합니다)
collation = utf8mb4_0900_ai_ci   (ai = 악센트 무시, ci = 대소문자 무시)
```

---

## ★★★ 가장 중요한 발견 — 예상이 뒤집혔습니다

**"MySQL 은 관대해서 이상한 값이 조용히 들어간다"는 말은 MySQL 8.4 에서는 대부분 틀렸습니다.**

옛날 MySQL(5.x) 이야기입니다. 8.0 부터 `STRICT_TRANS_TABLES` 와 `ONLY_FULL_GROUP_BY` 가 기본이 됐습니다.

| 시험 | PostgreSQL 18 | MySQL 8.4 | 같나 |
| --- | --- | --- | --- |
| INT 칸에 `'백개'` | ❌ 22P02 거절 | ❌ 거절 | **같음** |
| VARCHAR(5) 에 10글자 | ❌ 22001 거절 | ❌ 거절 | **같음** |
| INT 범위 초과 | ❌ 22003 거절 | ❌ 거절 | **같음** |
| 날짜 `'0000-00-00'` | ❌ 22008 거절 | ❌ 거절 | **같음** |
| GROUP BY 에 없는 칸 | ❌ 42803 거절 | ❌ 거절 | **같음** |
| CHECK 제약 | ❌ 23514 거절 | ❌ 거절 | **같음** (8.0.16+) |
| 트랜잭션 롤백 후 자동번호 | 1, 3 (건너뜀) | 1, 3 (건너뜀) | **같음** |
| UNIQUE 칸에 NULL 여러 개 | 2건 다 들어감 | 2건 다 들어감 | **같음** |
| 한글 정렬 | 가, 나, 하 | 가, 나, 하 | **같음** |

★ 자료에 이렇게 쓰세요: **"MySQL 이 허술하다고 배웠다면 그건 옛날 이야기입니다."**
낡은 정보를 가르치면 안 됩니다.

---

## ① 조용히 다른 결과가 나오는 것 — 진짜 위험한 것들

에러가 안 납니다. 그래서 옮길 때 사고가 납니다.

| 시험 | PostgreSQL | MySQL | 왜 위험한가 |
| --- | --- | --- | --- |
| `SELECT 'a' \|\| 'b'` | `'ab'` (문자열 연결) | `0` (**OR 로 해석**) | ★★★ 에러 없이 값이 완전히 달라집니다 |
| `'ABC' = 'abc'` | `false` | `true` (**대소문자 무시**) | ★★★ 로그인·중복확인이 다르게 동작 |
| `'a ' = 'a'` (뒤 공백) | `false` | `true` (**공백 무시**) | ★★ 중복 검사가 뚫립니다 |
| `SELECT 1/0` | ❌ 22012 거절 | `NULL` | ★★ 계산 결과가 조용히 NULL |
| `'' IS NULL` | `false` | `false` (0) | 같음 (Oracle 만 다름) |

★ MySQL 의 `||` 는 `PIPES_AS_CONCAT` 모드를 켜면 연결이 됩니다. 하지만 기본은 OR 입니다.
★ 대소문자 구분을 원하면 collation 을 `utf8mb4_0900_as_cs` 로 바꿔야 합니다.

---

## ② PostgreSQL 에만 있는 것

| 기능 | PostgreSQL | MySQL 8.4 |
| --- | --- | --- |
| `INSERT ... RETURNING` | ○ | ✗ 문법 오류 |
| 부분 색인 (`CREATE INDEX ... WHERE`) | ○ | ✗ 문법 오류 |
| 배열 타입 (`ARRAY[1,2,3]`) | ○ | ✗ 문법 오류 |
| 트랜잭션 안의 DDL 롤백 | ○ (롤백됨) | ✗ **암묵적 커밋** — 롤백해도 표가 남습니다 |
| 진짜 `BOOLEAN` 타입 | ○ (`true`) | 흉내만 (TINYINT(1) → `1`) |
| 표현식 색인 | ○ | ○ (8.0.13+) |

★ **트랜잭션 DDL** 은 마이그레이션에서 결정적입니다.
Postgres 는 스키마 변경이 실패하면 통째로 되돌아갑니다. MySQL 은 중간에 멈춘 채로 남습니다.

---

## ③ 문법·설정이 다른 것

| | PostgreSQL | MySQL |
| --- | --- | --- |
| 파라미터 | `$1, $2` | `?, ?` |
| 자동 번호 | `SERIAL` / `GENERATED ... AS IDENTITY` | `AUTO_INCREMENT` |
| 기본 격리수준 | `read committed` | `REPEATABLE-READ` |
| 표 이름 대소문자 | 따옴표 없으면 **소문자로 접음** (`MyTable` → `mytable` 로 찾힘) | **그대로 구분** (`MyTable` ≠ `mytable`) |
| autocommit 설정 | 그런 설정이 없음 | `@@autocommit = 1` |
| 문자열 이어붙이기 | `\|\|` 또는 `concat()` | `concat()` (`\|\|` 는 OR) |
| 현재 시각 | `now()`, `current_timestamp` | `now()`, `current_timestamp` (같음) |

★ 표 이름 대소문자: MySQL 은 **OS 에 따라 달라집니다.** 리눅스 서버는 구분하고,
윈도우는 안 합니다. macOS 는 설정에 따릅니다(이 실측에서는 `lower_case_table_names=0` 이라 구분함).
**개발은 맥에서 하고 배포는 리눅스에 하는 팀이 여기서 터집니다.**

---

## ④ 그래서 어느 쪽을 고르나 — 정직한 결론

**이 자료가 PostgreSQL 을 고른 이유** (실측 후 정리한 것)

1. **설치가 0 입니다.** PGlite 로 `npm install` 만 하면 진짜 Postgres 18 이 돕니다.
   MySQL 은 반드시 서버나 Docker 가 필요합니다. 수업 첫 시간을 설치로 날리지 않습니다
2. **표준 SQL 준수도가 높습니다.** 여기서 배운 것이 다른 DB 에서 통합니다
3. **기능이 넓습니다.** 부분 색인·배열·RETURNING·트랜잭션 DDL — 배울 것이 더 많습니다
4. **신규 프로젝트에서 우세합니다.** Supabase·Neon·Vercel·Railway 가 전부 Postgres 입니다

**MySQL 을 무시하면 안 되는 이유**

1. **국내 SI·제조·공공 현장에 여전히 많습니다.** 이 자료의 도메인(제조)이 특히 그렇습니다
2. **MySQL 8.4 는 이제 엄격합니다.** "허술하다"는 평가는 낡았습니다
3. 회사에 이미 깔려 있으면 그걸 씁니다. DB 를 바꾸는 건 큰 결정입니다

★ **결론**: Postgres 로 배우고, MySQL 로 옮길 때 위 ①②③ 표만 확인하면 됩니다.
반대 방향(MySQL 로 배우고 Postgres 로 가기)이 더 어렵습니다.
MySQL 에만 있는 습관(`||` 를 OR 로 쓰기, 대소문자 무시에 기대기)이 몸에 배기 때문입니다.

---

## ⑤ 아직 안 잰 것 (09단원에서 재세요)

- 격리수준별 실제 동작 차이 (팬텀 읽기가 MySQL 에서는 안 나는 것 — 갭 락)
- 같은 데이터·같은 색인에서 실행계획 비교 (`EXPLAIN` 출력 형식이 다름)
- `utf8` vs `utf8mb4` 함정 (이모지·일부 한자가 안 들어감)
- 대량 INSERT 속도
- `ON DUPLICATE KEY UPDATE` vs `ON CONFLICT DO UPDATE`
- 스키마 변경 중 표가 잠기는지 (MySQL 8.0 온라인 DDL vs Postgres)
