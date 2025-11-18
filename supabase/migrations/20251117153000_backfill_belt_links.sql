begin;

update public.belt_levels b
set next_level_id = sub.next_id
from (
  select current.id as id, next.id as next_id
  from public.belt_levels current
  left join public.belt_levels next on next.rank = current.rank + 1
) as sub
where sub.id = b.id
  and (b.next_level_id is distinct from sub.next_id);

commit;
