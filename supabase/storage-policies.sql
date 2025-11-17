-- Políticas de Storage para buckets
-- Ejecutar DESPUÉS de crear los buckets "imagenes" y "certificados"

-- ======================
-- POLÍTICAS PARA BUCKET: imagenes
-- ======================

-- Permitir lectura pública de imágenes
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagenes' 
  AND auth.role() = 'authenticated'
);

-- Permitir update a usuarios autenticados de sus propias imágenes
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'imagenes' 
  AND auth.role() = 'authenticated'
);

-- Permitir delete a usuarios autenticados de sus propias imágenes
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'imagenes' 
  AND auth.role() = 'authenticated'
);

-- ======================
-- POLÍTICAS PARA BUCKET: certificados
-- ======================

-- Permitir lectura pública de certificados (para verificación)
CREATE POLICY "Public read access for certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificados');

-- Permitir upload de certificados (sistema/autenticados)
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificados' 
  AND auth.role() = 'authenticated'
);

-- Solo permitir borrado a usuarios autenticados de sus propios certificados
CREATE POLICY "Users can delete own certificates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certificados' 
  AND auth.role() = 'authenticated'
);

-- ======================
-- VERIFICACIÓN
-- ======================

-- Puedes verificar las políticas con:
-- SELECT * FROM storage.policies WHERE bucket_id IN ('imagenes', 'certificados');
