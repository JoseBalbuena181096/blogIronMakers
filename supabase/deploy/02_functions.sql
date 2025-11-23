-- 02_functions.sql
-- Database functions

-- Function for RAG vector search
-- Includes security fix: explicit search_path
CREATE OR REPLACE FUNCTION public.match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_entrada_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entrada_id UUID,
  content_chunk TEXT,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ev.id,
    ev.entrada_id,
    ev.content_chunk,
    1 - (ev.embedding <=> query_embedding) AS similarity
  FROM public.entradas_vectors ev
  WHERE 1 - (ev.embedding <=> query_embedding) > match_threshold
  AND (filter_entrada_id IS NULL OR ev.entrada_id = filter_entrada_id)
  ORDER BY ev.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
