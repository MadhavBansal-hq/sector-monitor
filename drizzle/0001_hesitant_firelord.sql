CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sector` enum('fintech','defence','biotech') NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`exchange` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`sourceUrl` text NOT NULL,
	`documentType` enum('earnings_call_transcript','investor_presentation','quarterly_financial_statement','annual_report','other') NOT NULL,
	`period` varchar(10) NOT NULL,
	`dateFetched` timestamp NOT NULL,
	`parseStatus` enum('pending','success','failed','partial') NOT NULL DEFAULT 'pending',
	`parseError` text,
	`rawContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`period` varchar(10) NOT NULL,
	`metricName` varchar(100) NOT NULL,
	`metricValue` decimal(18,4),
	`unit` varchar(50),
	`direction` enum('up','down','neutral'),
	`sourceDocumentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sector` enum('fintech','defence','biotech'),
	`runTimestamp` timestamp NOT NULL,
	`documentsChecked` int DEFAULT 0,
	`newDocumentsFound` int DEFAULT 0,
	`errors` text,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refresh_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `synthesis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sector` enum('fintech','defence','biotech') NOT NULL,
	`period` varchar(10) NOT NULL,
	`synthesisText` text NOT NULL,
	`investingLensText` text NOT NULL,
	`generatedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `synthesis_id` PRIMARY KEY(`id`)
);
