process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://forge:forge@localhost:5432/forge_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_please_replace_1234567890';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';
