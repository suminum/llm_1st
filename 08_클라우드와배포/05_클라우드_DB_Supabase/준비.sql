-- ============================================================
-- 준비.sql — 03단원 실습용 표 만들기
-- ------------------------------------------------------------
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run.
-- 이 단원의 모든 예제가 여기서 만든 표를 씁니다.
--
-- 다시 처음부터 하고 싶으면 그냥 한 번 더 Run 하세요.
-- 위에서 drop 하고 다시 만듭니다. (실습용이라 그렇게 합니다)
--
-- ★ 이것도 한 번만 해 두세요 (개념04 에서 필요합니다)
--   Authentication → Sign In / Providers → Email 에서
--   "Confirm email" 을 꺼 두세요.
--   켜져 있으면 회원가입을 해도 메일을 눌러 확인하기 전까지 로그인이 안 됩니다.
--   실습에서 메일함을 왔다 갔다 할 수는 없으니 꺼 둡니다.
--   ★ 진짜 서비스에서는 반드시 켜 두어야 합니다.
-- ============================================================

drop table if exists reviews;
drop table if exists memos;
drop table if exists products;


-- ── products ──────────────────────────────────────────────
-- 개념01 에서 만든 그 표에 price 를 더했습니다.

create table products (
  id         bigint generated always as identity primary key,
  name       text        not null unique,
  category   text        not null check (category in ('A','B','C')),
  status     text        not null default '품절'
                         check (status in ('판매중','품절','검토중')),
  price      integer,
  created_at timestamptz not null default now()
);

-- price 를 일부러 비워 둔 줄이 하나 있습니다.
-- NULL 정렬이 SQLite 와 반대라는 것을 개념02 에서 여기로 확인합니다.
insert into products (name, category, status, price) values
  ('USB 허브',      'A', '판매중',  23900),
  ('27인치 모니터', 'A', '품절',   189000),
  ('무선 마우스',   'B', '판매중',  null);


-- ── reviews ───────────────────────────────────────────────
-- 표를 이어서 가져오는 예제(중첩 select)와 N+1 이야기에 씁니다.

create table reviews (
  id         bigint  generated always as identity primary key,
  product_id bigint  not null references products(id) on delete cascade,
  score      integer not null check (score between 1 and 5)
);

insert into reviews (product_id, score) values (1, 5), (1, 4), (2, 3);


-- ── memos ─────────────────────────────────────────────────
-- 개념04 RLS 실습용. 정책은 일부러 안 겁니다.
--
-- user_id 기본값이 auth.uid() 입니다.
-- 로그인한 사람이 insert 하면 자기 id 가 알아서 들어갑니다.
-- ★ SQL Editor 에는 로그인 토큰이 없어서 auth.uid() 가 null 입니다.
--   memos 는 SQL Editor 로 넣지 말고 개념04 의 코드로 넣으세요.

create table memos (
  id      bigint generated always as identity primary key,
  user_id uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  content text   not null,
  phone   text
);


-- ── RLS ───────────────────────────────────────────────────
--
-- ★ 세 표 모두 RLS 를 켭니다. 안 켜면 anon key 로 다 털립니다. (개념04)
--
-- products·reviews 는 수업 진행용으로 전부 열어 둡니다.
-- 개념04 에서 이걸 제대로 조이는 것까지 합니다.
--
-- memos 는 정책을 아예 안 겁니다.
-- RLS 만 켜고 정책이 없으면 "아무도 아무것도 못 한다" 입니다.
-- 개념04 에서 정책을 한 줄씩 붙여 가며 확인합니다.

alter table products enable row level security;
alter table reviews  enable row level security;
alter table memos    enable row level security;

create policy "수업용 전체 허용" on products for all using (true) with check (true);
create policy "수업용 전체 허용" on reviews  for all using (true) with check (true);


-- ── 표를 만든 직후에 코드가 404 를 내면 ───────────────────
--
-- ★ PostgREST 는 어떤 표가 있는지 **캐시**해 둡니다.
--   방금 만든 표를 그 캐시가 아직 모를 수 있습니다.
--
--     code: PGRST205   Could not find the table 'public.products'
--     status: 404
--
--   표가 없는 게 아닙니다. 잠깐 기다렸다 다시 부르면 됩니다.
--   급하면 아래 한 줄로 캐시를 지금 새로 읽게 할 수 있습니다.

notify pgrst, 'reload schema';


-- ── 확인 ──────────────────────────────────────────────────
-- 아래를 같이 실행하면 3 / 3 / 0 이 나와야 합니다.

select
  (select count(*) from products) as products,
  (select count(*) from reviews)  as reviews,
  (select count(*) from memos)    as memos;
