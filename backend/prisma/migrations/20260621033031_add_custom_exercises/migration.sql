-- CreateTable
CREATE TABLE "custom_exercises" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "custom_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_exercises_userId_bodyPart_name_key" ON "custom_exercises"("userId", "bodyPart", "name");

-- AddForeignKey
ALTER TABLE "custom_exercises" ADD CONSTRAINT "custom_exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
