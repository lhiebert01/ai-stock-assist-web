# ai-stock-assist-web

Supabase (from Oct 30, 2026): every CREATE TABLE/VIEW in public must include, in the same migration, explicit GRANTs for the API roles it needs, ENABLE ROW LEVEL SECURITY, and its policies; serial sequences need GRANT USAGE, SELECT; RPC functions need GRANT EXECUTE. New objects get no API access by default. Run npm run check:grants before committing.
