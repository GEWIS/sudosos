/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;
DROP TABLE IF EXISTS `assigned_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigned_role` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `IDX_f51f7a75fd982f5f757dc76a24` (`createdAt`),
  KEY `FK_f498caac8c930b8cd0532cca7c0` (`roleId`),
  CONSTRAINT `FK_32eef7ed7f4c9e41ce2df201a8c` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_f498caac8c930b8cd0532cca7c0` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `balance` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `lastTransactionId` int(11) DEFAULT NULL,
  `lastTransferId` int(11) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_0e771013275fb121dce75e6022` (`createdAt`),
  KEY `FK_7ea7cc133e5c70f1f80ebeaf194` (`lastTransactionId`),
  KEY `FK_a52ad6295abc075ef0b25ff2711` (`lastTransferId`),
  CONSTRAINT `FK_7ea7cc133e5c70f1f80ebeaf194` FOREIGN KEY (`lastTransactionId`) REFERENCES `transaction` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_9297a70b26dc787156fa49de26b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a52ad6295abc075ef0b25ff2711` FOREIGN KEY (`lastTransferId`) REFERENCES `transfer` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `banner` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `duration` int(11) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 0,
  `startDate` datetime NOT NULL DEFAULT current_timestamp(),
  `endDate` datetime NOT NULL,
  `imageId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_6a6cc2453a0675d3e2cad3070c` (`imageId`),
  KEY `IDX_98c7dae97e53e193244b6e695a` (`createdAt`),
  CONSTRAINT `FK_6a6cc2453a0675d3e2cad3070c0` FOREIGN KEY (`imageId`) REFERENCES `banner_image` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `banner_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `banner_image` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_3fa8a4d985319d91f18bc11ed3` (`createdAt`),
  KEY `FK_2f6cb6fb09229237f0542a00b50` (`createdById`),
  CONSTRAINT `FK_2f6cb6fb09229237f0542a00b50` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `base_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `base_file` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_91f19c398debec3f46e7ef5f4b` (`createdAt`),
  KEY `FK_e3163d85b9568a2e2356dbf3780` (`createdById`),
  CONSTRAINT `FK_e3163d85b9568a2e2356dbf3780` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `container` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currentRevision` int(11) DEFAULT NULL,
  `public` tinyint(4) NOT NULL DEFAULT 0,
  `ownerId` int(11) NOT NULL,
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_2bde964cf68f4124873433e906` (`createdAt`),
  KEY `FK_2e7a0befc04b14d4b22960a7438` (`ownerId`),
  CONSTRAINT `FK_2e7a0befc04b14d4b22960a7438` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `container_revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `container_revision` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `containerId` int(11) NOT NULL,
  `revision` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`containerId`,`revision`),
  KEY `IDX_91faf9dd42af7b6891b50b98c6` (`createdAt`),
  CONSTRAINT `FK_c68449032c093b4b1ac0a715500` FOREIGN KEY (`containerId`) REFERENCES `container` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `container_revision_products_product_revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `container_revision_products_product_revision` (
  `containerRevisionContainerId` int(11) NOT NULL,
  `containerRevisionRevision` int(11) NOT NULL,
  `productRevisionProductId` int(11) NOT NULL,
  `productRevisionRevision` int(11) NOT NULL,
  PRIMARY KEY (`containerRevisionContainerId`,`containerRevisionRevision`,`productRevisionProductId`,`productRevisionRevision`),
  KEY `IDX_1ebf86226729e5e2ebcead3005` (`containerRevisionContainerId`,`containerRevisionRevision`),
  KEY `IDX_0aff363152e31f6795fadc45d5` (`productRevisionProductId`,`productRevisionRevision`),
  CONSTRAINT `FK_0crppr_productrev` FOREIGN KEY (`productRevisionProductId`, `productRevisionRevision`) REFERENCES `product_revision` (`productId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_1crppr_containerrev` FOREIGN KEY (`containerRevisionContainerId`, `containerRevisionRevision`) REFERENCES `container_revision` (`containerId`, `revision`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ean_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ean_authenticator` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `eanCode` varchar(255) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_de87f2e595ba08f5800d334f59` (`createdAt`),
  CONSTRAINT `FK_36cdeedf28dd4a53fdce6b63d45` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `type` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_77b45e61f3194ba2be468b0778` (`createdAt`),
  KEY `FK_1d5a6b5f38273d74f192ae552a6` (`createdById`),
  CONSTRAINT `FK_1d5a6b5f38273d74f192ae552a6` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `event_shift`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_shift` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deletedAt` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_cdb1fdd9afd869277e2d754818` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `event_shift_answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_shift_answer` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `availability` varchar(255) DEFAULT NULL,
  `selected` tinyint(4) NOT NULL DEFAULT 0,
  `shiftId` int(11) NOT NULL,
  `eventId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`shiftId`,`eventId`),
  KEY `IDX_cde8d23385a9e5db4b82ec3b36` (`createdAt`),
  KEY `FK_0f619764862ac181f7ebb2eed27` (`shiftId`),
  KEY `FK_a6887f089a4dd5fe71c41526695` (`eventId`),
  CONSTRAINT `FK_0f619764862ac181f7ebb2eed27` FOREIGN KEY (`shiftId`) REFERENCES `event_shift` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_1e20b4b670a4b781ebb26671098` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a6887f089a4dd5fe71c41526695` FOREIGN KEY (`eventId`) REFERENCES `event` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `event_shift_roles_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_shift_roles_role` (
  `eventShiftId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`eventShiftId`,`roleId`),
  KEY `FK_ac36ca9f11e4cebf7a7fc4fd1e1` (`roleId`),
  CONSTRAINT `FK_ac36ca9f11e4cebf7a7fc4fd1e1` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_b7bc5f8d015ac4ab0fa9353cea0` FOREIGN KEY (`eventShiftId`) REFERENCES `event_shift` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `event_shifts_event_shift`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_shifts_event_shift` (
  `eventId` int(11) NOT NULL,
  `eventShiftId` int(11) NOT NULL,
  PRIMARY KEY (`eventId`,`eventShiftId`),
  KEY `IDX_4a5816ad85f83216ff9358452e` (`eventId`),
  KEY `IDX_f37c7de1e636e65e2d45290cf9` (`eventShiftId`),
  CONSTRAINT `FK_4a5816ad85f83216ff9358452e8` FOREIGN KEY (`eventId`) REFERENCES `event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_f37c7de1e636e65e2d45290cf91` FOREIGN KEY (`eventShiftId`) REFERENCES `event_shift` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `fine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fine` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` int(11) NOT NULL,
  `fineHandoutEventId` int(11) NOT NULL,
  `userFineGroupId` int(11) NOT NULL,
  `transferId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_dfd5d8c8fe1b3a4df17be3497d` (`transferId`),
  KEY `IDX_f218ae3b59a59b93ca62c683db` (`createdAt`),
  KEY `FK_93bc0945de8a9c712f46bd23fce` (`fineHandoutEventId`),
  KEY `FK_f66ed973a3f01de948b908d632e` (`userFineGroupId`),
  CONSTRAINT `FK_93bc0945de8a9c712f46bd23fce` FOREIGN KEY (`fineHandoutEventId`) REFERENCES `fine_handout_event` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_dfd5d8c8fe1b3a4df17be3497d6` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f66ed973a3f01de948b908d632e` FOREIGN KEY (`userFineGroupId`) REFERENCES `user_fine_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `fine_handout_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fine_handout_event` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `referenceDate` datetime NOT NULL,
  `createdById` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_3a87bd6247b8ef17621a3fdc1b` (`createdAt`),
  KEY `FK_70f9f6498f6c166943cbb494724` (`createdById`),
  CONSTRAINT `FK_70f9f6498f6c166943cbb494724` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `inactive_administrative_cost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inactive_administrative_cost` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `transferId` int(11) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `FK_InactiveAdministrativeCost_from` (`fromId`),
  KEY `FK_InactiveAdministrativeCost_transfer` (`transferId`),
  CONSTRAINT `FK_InactiveAdministrativeCost_from` FOREIGN KEY (`fromId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_InactiveAdministrativeCost_transfer` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `inv_sub_tra_row_del_inv_sub_tra_row`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inv_sub_tra_row_del_inv_sub_tra_row` (
  `invoiceId` int(11) NOT NULL,
  `subTransactionRowId` int(11) NOT NULL,
  PRIMARY KEY (`invoiceId`,`subTransactionRowId`),
  KEY `FK_4de5e0dbf807e44ea9a27b78640` (`subTransactionRowId`),
  CONSTRAINT `FK_4de5e0dbf807e44ea9a27b78640` FOREIGN KEY (`subTransactionRowId`) REFERENCES `sub_transaction_row` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_d9eda7c96531aa0fa3d8a6faf4e` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `toId` int(11) NOT NULL,
  `addressee` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `transferId` int(11) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `street` varchar(255) NOT NULL,
  `postalCode` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `pdfId` int(11) DEFAULT NULL,
  `attention` varchar(255) DEFAULT '',
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `creditTransferId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_f1af5bbf5baeb15ee911f2c54c` (`transferId`),
  UNIQUE KEY `IDX_fd48ffbca7ab422836aaf73af5` (`pdfId`),
  KEY `IDX_31aef0453df6db5015712eb2d2` (`createdAt`),
  KEY `FK_a0c7a052a624e9a630272fe96c6` (`toId`),
  KEY `FK_ad265ea872d0ffc7d4ea17447ee` (`creditTransferId`),
  CONSTRAINT `FK_a0c7a052a624e9a630272fe96c6` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ad265ea872d0ffc7d4ea17447ee` FOREIGN KEY (`creditTransferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f1af5bbf5baeb15ee911f2c54ca` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fd48ffbca7ab422836aaf73af5c` FOREIGN KEY (`pdfId`) REFERENCES `invoice_pdf` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `invoice_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_pdf` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `hash` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2c0caa648b45955e5b813fcd155` (`createdById`),
  CONSTRAINT `FK_2c0caa648b45955e5b813fcd155` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `invoice_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_status` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` int(11) NOT NULL,
  `invoiceId` int(11) NOT NULL,
  `changedById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_773375711d0c5eb97a33b7af75` (`createdAt`),
  KEY `FK_c671f173f08dbe75d91ebd616c7` (`invoiceId`),
  KEY `FK_a2332a63bc6a70d33b320ddbf2d` (`changedById`),
  CONSTRAINT `FK_a2332a63bc6a70d33b320ddbf2d` FOREIGN KEY (`changedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c671f173f08dbe75d91ebd616c7` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `invoice_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_user` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `automatic` tinyint(4) NOT NULL DEFAULT 0,
  `street` varchar(255) NOT NULL,
  `postalCode` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `REL_273e5b37f9b184fd56e7f2cb08` (`userId`),
  KEY `IDX_1f527d9878bdf21e83a72dddd2` (`createdAt`),
  CONSTRAINT `FK_273e5b37f9b184fd56e7f2cb08a` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `key_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `key_authenticator` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `hash` varchar(128) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_13b1ced93790bf87059147e25d` (`createdAt`),
  CONSTRAINT `FK_dd2cfdfc47f968d2b43f679085a` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ldap_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ldap_authenticator` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `UUID` varchar(32) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_0f425d81525960879043858973` (`createdAt`),
  CONSTRAINT `FK_078b5c39c4f95284b2432659cfd` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `local_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `local_authenticator` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `hash` varchar(128) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_54496afaf5d75195e91453a312` (`createdAt`),
  CONSTRAINT `FK_78485f0182144860f880119e819` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `local_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `local_user` (
  `userId` int(11) NOT NULL,
  `passwordHash` varchar(128) NOT NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `FK_0a390f6d32bff639d6d6790f79c` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `member_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_user` (
  `userId` int(11) NOT NULL,
  `memberId` int(11) NOT NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `FK_368b9b3cfb2dca8cf322b4253c0` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `nfc_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nfc_authenticator` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `nfcCode` varchar(128) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_b744672f9037239c8fd00223ec` (`createdAt`),
  CONSTRAINT `FK_dbfd146b964e7ef3a956281162e` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notification_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `handler` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_notification_log_userId` (`userId`),
  CONSTRAINT `FK_notification_log_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `organ_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `organ_membership` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `organId` int(11) NOT NULL,
  `index` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`,`organId`),
  KEY `IDX_112ec3dbc844271676f7314547` (`createdAt`),
  KEY `FK_fea77569c345a5a518244172a2c` (`organId`),
  CONSTRAINT `FK_ea8df2e9f3086d44908d75ac8bf` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fea77569c345a5a518244172a2c` FOREIGN KEY (`organId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payment_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_request` (
  `id` varchar(36) NOT NULL,
  `forId` int(11) NOT NULL,
  `createdById` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `cancelledById` int(11) DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `fulfilledById` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `IDX_payment_request_createdAt` (`createdAt`),
  KEY `IDX_payment_request_createdById` (`createdById`),
  KEY `IDX_payment_request_cancelledById` (`cancelledById`),
  KEY `IDX_payment_request_fulfilledById` (`fulfilledById`),
  KEY `IDX_payment_request_expiresAt` (`expiresAt`),
  KEY `IDX_payment_request_paidAt` (`paidAt`),
  KEY `IDX_payment_request_forId_paidAt` (`forId`,`paidAt`),
  CONSTRAINT `FK_37becb5210d553864235f1ce6b1` FOREIGN KEY (`cancelledById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_7218a3773a77d8c645b9247c418` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_af73996de792f37ee0e89d5a6b3` FOREIGN KEY (`forId`) REFERENCES `user` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_d59e68d1bfb59834025e500eca0` FOREIGN KEY (`fulfilledById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payment_request_attempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_request_attempt` (
  `paymentRequestUuid` varchar(36) NOT NULL,
  `paymentIntentId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`paymentRequestUuid`,`paymentIntentId`),
  UNIQUE KEY `IDX_payment_request_attempt_paymentIntentId` (`paymentIntentId`),
  CONSTRAINT `FK_0d435d292118c1b2848ccf82581` FOREIGN KEY (`paymentRequestUuid`) REFERENCES `payment_request` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_bc5079b87bfe66b034d866a6bcd` FOREIGN KEY (`paymentIntentId`) REFERENCES `stripe_payment_intent` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payout_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payout_request` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` int(11) NOT NULL,
  `bankAccountNumber` varchar(255) NOT NULL,
  `bankAccountName` varchar(255) NOT NULL,
  `requestedById` int(11) NOT NULL,
  `transferId` int(11) DEFAULT NULL,
  `approvedById` int(11) DEFAULT NULL,
  `pdfId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_956cef8545f8bc1944809f69c2` (`transferId`),
  KEY `IDX_d2436d4c1075edd6ac1df10860` (`createdAt`),
  KEY `FK_5ff1718fd7ef4b1314c279124fb` (`requestedById`),
  KEY `FK_b48700107cc13b06f601a7332ec` (`approvedById`),
  KEY `FK_c54ab0d505973c4a37a9d1ddeb0` (`pdfId`),
  CONSTRAINT `FK_5ff1718fd7ef4b1314c279124fb` FOREIGN KEY (`requestedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_956cef8545f8bc1944809f69c24` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b48700107cc13b06f601a7332ec` FOREIGN KEY (`approvedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c54ab0d505973c4a37a9d1ddeb0` FOREIGN KEY (`pdfId`) REFERENCES `payout_request_pdf` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payout_request_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payout_request_pdf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hash` varchar(255) NOT NULL,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ea897a3fed381cb32d4ba81fd5c` (`createdById`),
  CONSTRAINT `FK_ea897a3fed381cb32d4ba81fd5c` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payout_request_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payout_request_status` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` varchar(255) NOT NULL,
  `payoutRequestId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_cc029c5b23ea4b7d34d77e0921` (`createdAt`),
  KEY `FK_8f370d8326498ec78ba1679f332` (`payoutRequestId`),
  CONSTRAINT `FK_8f370d8326498ec78ba1679f332` FOREIGN KEY (`payoutRequestId`) REFERENCES `payout_request` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `roleId` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `relation` varchar(255) NOT NULL,
  `entity` varchar(255) NOT NULL,
  `attributes` varchar(255) NOT NULL,
  PRIMARY KEY (`roleId`,`action`,`relation`,`entity`),
  CONSTRAINT `FK_cdb4db95384a1cf7a837c4c683e` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pin_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pin_authenticator` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `hash` varchar(128) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_052778557e67f46df4a55e3670` (`createdAt`),
  CONSTRAINT `FK_c1d1f7d7798b4163ccc4834f5fe` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `point_of_sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_of_sale` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currentRevision` int(11) DEFAULT NULL,
  `ownerId` int(11) NOT NULL,
  `deletedAt` datetime(6) DEFAULT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_ec4298708311ae8ca1a574aac4` (`createdAt`),
  KEY `IDX_a0ccf55f761fcc887394bf4309` (`userId`),
  KEY `FK_24fb8a721a293ac72c10ac5de61` (`ownerId`),
  CONSTRAINT `FK_24fb8a721a293ac72c10ac5de61` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a0ccf55f761fcc887394bf4309b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `point_of_sale_cashier_roles_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_of_sale_cashier_roles_role` (
  `pointOfSaleId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`pointOfSaleId`,`roleId`),
  KEY `FK_424767742bed3867b8edfb4c14e` (`roleId`),
  CONSTRAINT `FK_424767742bed3867b8edfb4c14e` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_d9c043a3957a31d7f699b0932f0` FOREIGN KEY (`pointOfSaleId`) REFERENCES `point_of_sale` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `point_of_sale_revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_of_sale_revision` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `useAuthentication` tinyint(4) NOT NULL DEFAULT 0,
  `pointOfSaleId` int(11) NOT NULL,
  `revision` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`pointOfSaleId`,`revision`),
  KEY `IDX_271eb7e95de682b69cbe72429f` (`createdAt`),
  CONSTRAINT `FK_cf563b738966171e8680239ffe3` FOREIGN KEY (`pointOfSaleId`) REFERENCES `point_of_sale` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `point_of_sale_revision_containers_container_revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_of_sale_revision_containers_container_revision` (
  `pointOfSaleRevisionPointOfSaleId` int(11) NOT NULL,
  `pointOfSaleRevisionRevision` int(11) NOT NULL,
  `containerRevisionContainerId` int(11) NOT NULL,
  `containerRevisionRevision` int(11) NOT NULL,
  PRIMARY KEY (`pointOfSaleRevisionPointOfSaleId`,`pointOfSaleRevisionRevision`,`containerRevisionContainerId`,`containerRevisionRevision`),
  KEY `IDX_33376b1706747cf7c1aa3f875f` (`pointOfSaleRevisionPointOfSaleId`,`pointOfSaleRevisionRevision`),
  KEY `IDX_beba133c317de33aa612f6737e` (`containerRevisionContainerId`,`containerRevisionRevision`),
  CONSTRAINT `FK_33376b1706747cf7c1aa3f875f2` FOREIGN KEY (`pointOfSaleRevisionPointOfSaleId`, `pointOfSaleRevisionRevision`) REFERENCES `point_of_sale_revision` (`pointOfSaleId`, `revision`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_beba133c317de33aa612f6737e6` FOREIGN KEY (`containerRevisionContainerId`, `containerRevisionRevision`) REFERENCES `container_revision` (`containerId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currentRevision` int(11) DEFAULT NULL,
  `ownerId` int(11) NOT NULL,
  `imageId` int(11) DEFAULT NULL,
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_b1b332c0f436897f21a960f26c` (`imageId`),
  KEY `IDX_6b71c587b0fd3855fa23b759ca` (`createdAt`),
  KEY `FK_cbb5d890de1519efa20c42bcd52` (`ownerId`),
  CONSTRAINT `FK_b1b332c0f436897f21a960f26c7` FOREIGN KEY (`imageId`) REFERENCES `product_image` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_cbb5d890de1519efa20c42bcd52` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `product_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_category` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `parentId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_96152d453aaea425b5afde3ae9` (`name`),
  KEY `IDX_f0495180538f78a4b0c975e405` (`createdAt`),
  KEY `FK_569b30aa4b0a1ad42bcd30916aa` (`parentId`),
  CONSTRAINT `FK_569b30aa4b0a1ad42bcd30916aa` FOREIGN KEY (`parentId`) REFERENCES `product_category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `product_category_closure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_category_closure` (
  `id_ancestor` int(11) NOT NULL,
  `id_descendant` int(11) NOT NULL,
  PRIMARY KEY (`id_ancestor`,`id_descendant`),
  KEY `FK_cb4a5e74ae032bac3f614096ebd` (`id_descendant`),
  CONSTRAINT `FK_cb4a5e74ae032bac3f614096ebd` FOREIGN KEY (`id_descendant`) REFERENCES `product_category` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_da967ccb3697d66f43122eec2f0` FOREIGN KEY (`id_ancestor`) REFERENCES `product_category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `product_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_image` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_d7de3082fc3416e669e5032738` (`createdAt`),
  KEY `FK_b184df3290d5052115eb3e9e3dc` (`createdById`),
  CONSTRAINT `FK_b184df3290d5052115eb3e9e3dc` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `product_ordering`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_ordering` (
  `posId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`posId`,`productId`),
  UNIQUE KEY `IDX_f34b7832069ef698d2eb6d7b50` (`posId`,`productId`,`order`),
  KEY `FK_9e85b9443e2cdbcbd60fc5c3daf` (`productId`),
  CONSTRAINT `FK_9e85b9443e2cdbcbd60fc5c3daf` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c301bcdbc96620a03407969c377` FOREIGN KEY (`posId`) REFERENCES `point_of_sale` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `product_revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_revision` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `priceInclVat` int(11) NOT NULL,
  `alcoholPercentage` decimal(5,2) NOT NULL,
  `productId` int(11) NOT NULL,
  `revision` int(11) NOT NULL DEFAULT 1,
  `vatId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `featured` tinyint(4) NOT NULL DEFAULT 0,
  `preferred` tinyint(4) NOT NULL DEFAULT 0,
  `priceList` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`productId`,`revision`),
  KEY `IDX_83a955d71e12c919cc0cb0d53b` (`createdAt`),
  KEY `FK_98524ea1462e06ea2e49f98fb41` (`vatId`),
  KEY `FK_4c2b27e9edcada5b7c32a1bba4f` (`categoryId`),
  CONSTRAINT `FK_4c2b27e9edcada5b7c32a1bba4f` FOREIGN KEY (`categoryId`) REFERENCES `product_category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_98524ea1462e06ea2e49f98fb41` FOREIGN KEY (`vatId`) REFERENCES `vat_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d0bf413994264a323d914f1c767` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `qr_authenticator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_authenticator` (
  `sessionId` varchar(36) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `cancelled` tinyint(1) NOT NULL DEFAULT 0,
  `expiresAt` datetime NOT NULL,
  `confirmedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`sessionId`),
  KEY `IDX_qr_authenticator_createdAt` (`createdAt`),
  KEY `IDX_qr_authenticator_expiresAt` (`expiresAt`),
  KEY `IDX_qr_authenticator_cancelled` (`cancelled`),
  KEY `IDX_qr_authenticator_userId` (`userId`),
  CONSTRAINT `FK_7be34c309eac13a093d8e9e56e4` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `reset_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reset_token` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `hash` varchar(128) NOT NULL,
  `expires` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`userId`),
  KEY `IDX_6a6b2774850a62749860e15e5b` (`createdAt`),
  CONSTRAINT `FK_1d61419c157e5325204cbee7a28` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `systemDefault` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_ae4578dcaed5adff96595e61660` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `role_user_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_user_type` (
  `roleId` int(11) NOT NULL,
  `userType` varchar(64) NOT NULL,
  PRIMARY KEY (`roleId`,`userType`),
  CONSTRAINT `FK_618acabb65230c8f4f1dc431523` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `seller_payout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_payout` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requestedById` int(11) NOT NULL,
  `transferId` int(11) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `startDate` datetime(6) NOT NULL,
  `endDate` datetime(6) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `pdfId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ba291220bb8a8198b41af5b3fc7` (`requestedById`),
  KEY `FK_878c15e23faca012e8279d296a8` (`transferId`),
  KEY `FK_57f50cd5e7f8f80414395fdde40` (`pdfId`),
  CONSTRAINT `FK_57f50cd5e7f8f80414395fdde40` FOREIGN KEY (`pdfId`) REFERENCES `seller_payout_pdf` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_878c15e23faca012e8279d296a8` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ba291220bb8a8198b41af5b3fc7` FOREIGN KEY (`requestedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `seller_payout_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_payout_pdf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hash` varchar(255) NOT NULL,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `createdById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bb5ce24f6db4174ef68b12a94a2` (`createdById`),
  CONSTRAINT `FK_bb5ce24f6db4174ef68b12a94a2` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `server_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `server_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_47b83d413b2f2d6684c10468650` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stripe_deposit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stripe_deposit` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `toId` int(11) NOT NULL,
  `transferId` int(11) DEFAULT NULL,
  `stripePaymentIntentId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_30003949e49a55ddef927ac3ea9` (`toId`),
  KEY `FK_e3de95c17c9760e68b9d2ac9409` (`transferId`),
  KEY `FK_996daa2cc2a7322684f827fa030` (`stripePaymentIntentId`),
  CONSTRAINT `FK_30003949e49a55ddef927ac3ea9` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_996daa2cc2a7322684f827fa030` FOREIGN KEY (`stripePaymentIntentId`) REFERENCES `stripe_payment_intent` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_e3de95c17c9760e68b9d2ac9409` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stripe_payment_intent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stripe_payment_intent` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stripeId` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `cancelledWithAPI` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3107e59c1952213436dcbb6c5a` (`stripeId`),
  KEY `IDX_f5e3d623477dca34bba9a77cb8` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stripe_payment_intent_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stripe_payment_intent_status` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` int(11) NOT NULL,
  `stripePaymentIntentId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_e4b29bd67e51ff6d4a5d82738d` (`createdAt`),
  KEY `FK_8f454dd76a0725b815a5c046aae` (`stripePaymentIntentId`),
  CONSTRAINT `FK_8f454dd76a0725b815a5c046aae` FOREIGN KEY (`stripePaymentIntentId`) REFERENCES `stripe_payment_intent` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sub_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_transaction` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `toId` int(11) NOT NULL,
  `containerContainerId` int(11) NOT NULL,
  `containerRevision` int(11) NOT NULL,
  `transactionId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_4d38ed98b11cab29cbf5704495` (`createdAt`),
  KEY `FK_b52f0bfde289a856a1676e4e438` (`toId`),
  KEY `FK_6a979da149afbd5b55fe95d8441` (`containerContainerId`,`containerRevision`),
  KEY `FK_865e795ceccbf5a980afa6340e5` (`transactionId`),
  CONSTRAINT `FK_6a979da149afbd5b55fe95d8441` FOREIGN KEY (`containerContainerId`, `containerRevision`) REFERENCES `container_revision` (`containerId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_865e795ceccbf5a980afa6340e5` FOREIGN KEY (`transactionId`) REFERENCES `transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_b52f0bfde289a856a1676e4e438` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sub_transaction_row`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_transaction_row` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` int(11) NOT NULL,
  `productProductId` int(11) NOT NULL,
  `productRevision` int(11) NOT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `subTransactionId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_0a365df9c0df420ecf9a3be41e` (`createdAt`),
  KEY `FK_08486ddd45c1b59aac61c902057` (`productProductId`,`productRevision`),
  KEY `FK_43ce16296a2fb07d50c417bbf23` (`subTransactionId`),
  KEY `FK_f3b08edb69ad5d07a66d8772672` (`invoiceId`),
  CONSTRAINT `FK_08486ddd45c1b59aac61c902057` FOREIGN KEY (`productProductId`, `productRevision`) REFERENCES `product_revision` (`productId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_43ce16296a2fb07d50c417bbf23` FOREIGN KEY (`subTransactionId`) REFERENCES `sub_transaction` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_f3b08edb69ad5d07a66d8772672` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `terminal_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `terminal_payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stripePaymentIntentId` int(11) NOT NULL,
  `transferId` int(11) DEFAULT NULL,
  `finalTransactionId` int(11) DEFAULT NULL,
  `temporaryTransactionId` int(11) DEFAULT NULL,
  `createdById` int(11) NOT NULL,
  `processedByTerminal` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_terminal_payment_stripePaymentIntentId` (`stripePaymentIntentId`),
  UNIQUE KEY `IDX_terminal_payment_transferId` (`transferId`),
  UNIQUE KEY `IDX_terminal_payment_finalTransactionId` (`finalTransactionId`),
  UNIQUE KEY `IDX_terminal_payment_temporaryTransactionId` (`temporaryTransactionId`),
  KEY `FK_10d30fe8fe313a975ecfa57a209` (`createdById`),
  KEY `IDX_terminal_payment_createdAt` (`createdAt`),
  CONSTRAINT `FK_10d30fe8fe313a975ecfa57a209` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8dfcc5580692510792fc1419349` FOREIGN KEY (`stripePaymentIntentId`) REFERENCES `stripe_payment_intent` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_97fcf5e5efeed018ea456a9186f` FOREIGN KEY (`finalTransactionId`) REFERENCES `transaction` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a477a6f74ea28a91f52ab7bdcdd` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_bfe4edc6ccdf4644aa1b042ad3b` FOREIGN KEY (`temporaryTransactionId`) REFERENCES `tmp_transaction` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `terms_of_service_acceptance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `terms_of_service_acceptance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `versionNumber` varchar(16) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_terms_of_service_acceptance_userId_versionNumber` (`userId`,`versionNumber`),
  CONSTRAINT `FK_terms_of_service_acceptance_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tmp_sub_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tmp_sub_transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `toId` int(11) NOT NULL,
  `containerContainerId` int(11) NOT NULL,
  `containerRevision` int(11) NOT NULL,
  `transactionId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `FK_6b15915a8935197c4395273fa42` (`toId`),
  KEY `FK_7a04fa885a1813b612f038c1bb5` (`containerContainerId`,`containerRevision`),
  KEY `FK_a36f62e0f838ad91bfdf77762be` (`transactionId`),
  KEY `IDX_tmp_sub_transaction_createdAt` (`createdAt`),
  CONSTRAINT `FK_6b15915a8935197c4395273fa42` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_7a04fa885a1813b612f038c1bb5` FOREIGN KEY (`containerContainerId`, `containerRevision`) REFERENCES `container_revision` (`containerId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a36f62e0f838ad91bfdf77762be` FOREIGN KEY (`transactionId`) REFERENCES `tmp_transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tmp_sub_transaction_row`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tmp_sub_transaction_row` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` int(11) NOT NULL,
  `productProductId` int(11) NOT NULL,
  `productRevision` int(11) NOT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `subTransactionId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `FK_5933b71a8c55b3b71d05bc3f9c2` (`productProductId`,`productRevision`),
  KEY `FK_a568d7b166da7a1bcb6c2f1946a` (`invoiceId`),
  KEY `FK_c9d8458db72c3cbbd070549e516` (`subTransactionId`),
  KEY `IDX_tmp_sub_transaction_row_createdAt` (`createdAt`),
  CONSTRAINT `FK_5933b71a8c55b3b71d05bc3f9c2` FOREIGN KEY (`productProductId`, `productRevision`) REFERENCES `product_revision` (`productId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a568d7b166da7a1bcb6c2f1946a` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_c9d8458db72c3cbbd070549e516` FOREIGN KEY (`subTransactionId`) REFERENCES `tmp_sub_transaction` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tmp_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tmp_transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromId` int(11) NOT NULL,
  `createdById` int(11) NOT NULL,
  `pointOfSalePointOfSaleId` int(11) DEFAULT NULL,
  `pointOfSaleRevision` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `FK_e9fcaf920fa76ccbc699ae007e4` (`fromId`),
  KEY `FK_3489526b51e81bb18f6e78524e5` (`createdById`),
  KEY `FK_5c2bd8b3c872da6c2ef38bbb8bd` (`pointOfSalePointOfSaleId`,`pointOfSaleRevision`),
  KEY `IDX_tmp_transaction_createdAt` (`createdAt`),
  CONSTRAINT `FK_3489526b51e81bb18f6e78524e5` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_5c2bd8b3c872da6c2ef38bbb8bd` FOREIGN KEY (`pointOfSalePointOfSaleId`, `pointOfSaleRevision`) REFERENCES `point_of_sale_revision` (`pointOfSaleId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e9fcaf920fa76ccbc699ae007e4` FOREIGN KEY (`fromId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromId` int(11) NOT NULL,
  `createdById` int(11) NOT NULL,
  `pointOfSalePointOfSaleId` int(11) DEFAULT NULL,
  `pointOfSaleRevision` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_83cb622ce2d74c56db3e0c29f1` (`createdAt`),
  KEY `FK_ac3d6711c8adf322a76c0d1a227` (`fromId`),
  KEY `FK_d2c2c2e40cf2e32e72bb111f6a0` (`createdById`),
  KEY `FK_928a8e95de543fca4327cd47877` (`pointOfSalePointOfSaleId`,`pointOfSaleRevision`),
  CONSTRAINT `FK_928a8e95de543fca4327cd47877` FOREIGN KEY (`pointOfSalePointOfSaleId`, `pointOfSaleRevision`) REFERENCES `point_of_sale_revision` (`pointOfSaleId`, `revision`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ac3d6711c8adf322a76c0d1a227` FOREIGN KEY (`fromId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d2c2c2e40cf2e32e72bb111f6a0` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `transfer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromId` int(11) DEFAULT NULL,
  `toId` int(11) DEFAULT NULL,
  `amountInclVat` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `vatId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_ad898da19a2036169276bec8c1` (`createdAt`),
  KEY `FK_9bc2f01e5bc90eab1015548b5ab` (`fromId`),
  KEY `FK_06b33ebdc8919ff5d34646c6fe3` (`toId`),
  KEY `FK_982efd15d8f524a263dc0dacd1c` (`vatId`),
  CONSTRAINT `FK_06b33ebdc8919ff5d34646c6fe3` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_982efd15d8f524a263dc0dacd1c` FOREIGN KEY (`vatId`) REFERENCES `vat_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9bc2f01e5bc90eab1015548b5ab` FOREIGN KEY (`fromId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `updated_container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `updated_container` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `containerId` int(11) NOT NULL,
  PRIMARY KEY (`containerId`),
  UNIQUE KEY `REL_aed61f0ebbe447d8133a68b5dc` (`containerId`),
  KEY `IDX_973e5010e226f69bb1402281a7` (`createdAt`),
  CONSTRAINT `FK_aed61f0ebbe447d8133a68b5dcb` FOREIGN KEY (`containerId`) REFERENCES `container` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `updated_container_products_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `updated_container_products_product` (
  `updatedContainerContainerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  PRIMARY KEY (`updatedContainerContainerId`,`productId`),
  KEY `IDX_6c25f3b3c37db9812e3ae2db23` (`updatedContainerContainerId`),
  KEY `IDX_00bacabbad03567d6b290aa15d` (`productId`),
  CONSTRAINT `FK_00bacabbad03567d6b290aa15d3` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_6c25f3b3c37db9812e3ae2db239` FOREIGN KEY (`updatedContainerContainerId`) REFERENCES `updated_container` (`containerId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `updated_point_of_sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `updated_point_of_sale` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `useAuthentication` tinyint(4) NOT NULL DEFAULT 0,
  `pointOfSaleId` int(11) NOT NULL,
  PRIMARY KEY (`pointOfSaleId`),
  UNIQUE KEY `REL_05265354a3b84f882fe68349f4` (`pointOfSaleId`),
  KEY `IDX_23023f77294bff8abe57ab6ab6` (`createdAt`),
  CONSTRAINT `FK_05265354a3b84f882fe68349f4f` FOREIGN KEY (`pointOfSaleId`) REFERENCES `point_of_sale` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `updated_point_of_sale_containers_container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `updated_point_of_sale_containers_container` (
  `updatedPointOfSalePointOfSaleId` int(11) NOT NULL,
  `containerId` int(11) NOT NULL,
  PRIMARY KEY (`updatedPointOfSalePointOfSaleId`,`containerId`),
  KEY `IDX_7d0d7f029a07d3133137bc0eec` (`updatedPointOfSalePointOfSaleId`),
  KEY `IDX_18e428547adff0f47d2e91b5dc` (`containerId`),
  CONSTRAINT `FK_18e428547adff0f47d2e91b5dc6` FOREIGN KEY (`containerId`) REFERENCES `container` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_7d0d7f029a07d3133137bc0eecc` FOREIGN KEY (`updatedPointOfSalePointOfSaleId`) REFERENCES `updated_point_of_sale` (`pointOfSaleId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `updated_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `updated_product` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `priceInclVat` int(11) NOT NULL,
  `alcoholPercentage` decimal(5,2) NOT NULL,
  `productId` int(11) NOT NULL,
  `vatId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  PRIMARY KEY (`productId`),
  KEY `IDX_d0e7a0935cce6da8f78b8011d2` (`createdAt`),
  KEY `FK_41d61434f1a90cb169674f2bfd2` (`vatId`),
  KEY `FK_ea95a6e5f0b010f862aaa119435` (`categoryId`),
  CONSTRAINT `FK_41d61434f1a90cb169674f2bfd2` FOREIGN KEY (`vatId`) REFERENCES `vat_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_43e680991b2168755292d2280ed` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ea95a6e5f0b010f862aaa119435` FOREIGN KEY (`categoryId`) REFERENCES `product_category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(64) NOT NULL,
  `lastName` varchar(64) NOT NULL DEFAULT '',
  `active` tinyint(4) NOT NULL DEFAULT 0,
  `ofAge` tinyint(4) NOT NULL DEFAULT 0,
  `email` varchar(64) NOT NULL DEFAULT '',
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `type` varchar(64) NOT NULL,
  `extensiveDataProcessing` tinyint(4) NOT NULL DEFAULT 0,
  `nickname` varchar(64) DEFAULT NULL,
  `currentFinesId` int(11) DEFAULT NULL,
  `canGoIntoDebt` tinyint(4) NOT NULL DEFAULT 0,
  `inactiveNotificationSend` tinyint(1) NOT NULL DEFAULT 0,
  `lastSeen` datetime(6) DEFAULT NULL,
  `expiryDate` datetime(6) DEFAULT NULL,
  `expiryNotificationSent` tinyint(1) NOT NULL DEFAULT 0,
  `tosRequired` tinyint(1) NOT NULL DEFAULT 1,
  `productSelfService` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_e11e649824a45d8ed01d597fd9` (`createdAt`),
  KEY `IDX_b42ca95830a90a240d46c70572` (`currentFinesId`),
  CONSTRAINT `FK_b42ca95830a90a240d46c70572c` FOREIGN KEY (`currentFinesId`) REFERENCES `user_fine_group` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_fine_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_fine_group` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `waivedTransferId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_287aa509b39d191a3447a9fe00` (`createdAt`),
  KEY `FK_69128dd1516a60ba9b89e83ef21` (`userId`),
  KEY `FK_81d497d07c08c585214949267a4` (`waivedTransferId`),
  CONSTRAINT `FK_69128dd1516a60ba9b89e83ef21` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_81d497d07c08c585214949267a4` FOREIGN KEY (`waivedTransferId`) REFERENCES `transfer` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_notification_preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_preference` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_user_channel_type` (`userId`,`channel`,`type`),
  CONSTRAINT `FK_user_notification_preference_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `key` varchar(64) NOT NULL,
  `value` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_user_setting_userId_key` (`userId`,`key`),
  CONSTRAINT `FK_user_setting_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_voucher_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_voucher_group` (
  `userId` int(11) NOT NULL,
  `voucherGroupId` int(11) NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `REL_e8a6a3a59081155d48fcb8e854` (`userId`),
  KEY `FK_17f2cfbf1f58c50f2bf43315b22` (`voucherGroupId`),
  CONSTRAINT `FK_17f2cfbf1f58c50f2bf43315b22` FOREIGN KEY (`voucherGroupId`) REFERENCES `voucher_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e8a6a3a59081155d48fcb8e8540` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `vat_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vat_group` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `percentage` double NOT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `hidden` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_9b50121f931a09b932f6d1382f` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `voucher_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_group` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `activeStartDate` datetime NOT NULL DEFAULT current_timestamp(),
  `activeEndDate` datetime NOT NULL,
  `amount` int(11) NOT NULL,
  `balance` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_afb774509fb3d1c802647d86f7` (`name`),
  KEY `IDX_392326af17f0b4115bea11e749` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `wrapped`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `wrapped` (
  `userId` int(11) NOT NULL,
  `transactionCount` int(11) NOT NULL DEFAULT 0,
  `transactionPercentile` float NOT NULL DEFAULT 0,
  `transactionMaxDate` datetime DEFAULT NULL,
  `transactionMaxAmount` int(11) NOT NULL DEFAULT 0,
  `transactionHeatmap` text NOT NULL DEFAULT '[]',
  `spentPercentile` float NOT NULL DEFAULT 0,
  `syncedFrom` datetime DEFAULT NULL,
  `syncedTo` datetime DEFAULT NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `FK_bf97b592237dc6150e64517cbe8` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `wrapped_organ_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `wrapped_organ_member` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `organId` int(11) NOT NULL,
  `ordinalTransactionCreated` int(11) NOT NULL DEFAULT 0,
  `ordinalTurnoverCreated` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`,`organId`),
  KEY `IDX_wrapped_organ_member_createdAt` (`createdAt`),
  KEY `FK_wrapped_organ_member_organId_user` (`organId`),
  CONSTRAINT `FK_wrapped_organ_member_organId_user` FOREIGN KEY (`organId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_wrapped_organ_member_userId_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_wrapped_organ_member_userId_wrapped` FOREIGN KEY (`userId`) REFERENCES `wrapped` (`userId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `write_off`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `write_off` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transferId` int(11) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `toId` int(11) NOT NULL,
  `pdfId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c53ae318ca3a0ac0859a79fd5b7` (`transferId`),
  KEY `FK_3d97c38c0e0e53c323c8353dece` (`toId`),
  KEY `FK_e9033ba76807efc3e10682bab1a` (`pdfId`),
  CONSTRAINT `FK_3d97c38c0e0e53c323c8353dece` FOREIGN KEY (`toId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c53ae318ca3a0ac0859a79fd5b7` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e9033ba76807efc3e10682bab1a` FOREIGN KEY (`pdfId`) REFERENCES `write_off_pdf` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `write_off_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `write_off_pdf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hash` varchar(255) NOT NULL,
  `downloadName` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `createdById` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `version` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e6c374b0d0b9d90697820ba88c9` (`createdById`),
  CONSTRAINT `FK_e6c374b0d0b9d90697820ba88c9` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

