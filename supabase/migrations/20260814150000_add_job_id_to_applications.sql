alter table public.applications
add column job_id uuid null;

alter table public.applications
add constraint applications_job_id_fkey
foreign key (job_id)
references public.jobs(id)
on delete set null;

create index idx_applications_job_id
on public.applications(job_id);
