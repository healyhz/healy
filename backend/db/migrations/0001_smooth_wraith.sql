CREATE TABLE "partner" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "partner_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;