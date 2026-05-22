-- =============================================================
-- Nvmcars — Storage buckets + policies
-- Paste AFTER 0001+0002 in the Supabase SQL Editor.
-- =============================================================

-- chat-media: photos and videos sent in chat (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  false,
  52428800, -- 50 MB cap
  array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime']
) on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- workshop-photos: public photos for workshop profile
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workshop-photos',
  'workshop-photos',
  true,
  10485760, -- 10 MB cap
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- avatars: public small avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB cap
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- -------------------------------------------------------------
-- chat-media: only conversation participants can read/write
-- Object path convention: {conversation_id}/{message_id}.{ext}
-- -------------------------------------------------------------
create policy chat_media_participants_read on storage.objects
  for select using (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (
          c.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = c.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

create policy chat_media_participants_write on storage.objects
  for insert with check (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (
          c.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = c.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

-- -------------------------------------------------------------
-- workshop-photos: public read, owner write
-- Path: {workshop_id}/{filename}
-- -------------------------------------------------------------
create policy workshop_photos_public_read on storage.objects
  for select using (bucket_id = 'workshop-photos');

create policy workshop_photos_owner_write on storage.objects
  for insert with check (
    bucket_id = 'workshop-photos'
    and exists (
      select 1 from public.workshops w
      where w.id::text = split_part(name, '/', 1) and w.owner_id = auth.uid()
    )
  );

create policy workshop_photos_owner_delete on storage.objects
  for delete using (
    bucket_id = 'workshop-photos'
    and exists (
      select 1 from public.workshops w
      where w.id::text = split_part(name, '/', 1) and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- avatars: public read, self write (path = {user_id}/...)
-- -------------------------------------------------------------
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

create policy avatars_self_write on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy avatars_self_update on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy avatars_self_delete on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );
