-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add educational_level to profiles for personalized AI context
alter table profiles 
add column if not exists educational_level text;

-- Create table to store lesson content embeddings
create table if not exists entradas_vectors (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid references entradas(id) on delete cascade,
  content_chunk text,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on the new table
alter table entradas_vectors enable row level security;

-- Create policy to allow public read access (or restrict as needed)
create policy "Public read access for vectors"
  on entradas_vectors for select
  using (true);

-- Create index for faster vector similarity search
create index on entradas_vectors using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
