# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.5.5-10.3.13-MariaDB-1:10.3.13+maria~bionic)
# Database: xrings
# Generation Time: 2019-05-16 11:51:02 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table group_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `group_info`;

CREATE TABLE `group_info` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cuid` int(11) NOT NULL,
  `title` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `totalCal` double NOT NULL DEFAULT 0,
  `totalStep` int(11) NOT NULL DEFAULT 0,
  `totalClosed` int(11) NOT NULL DEFAULT 0,
  `headImg` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joinId` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createAt` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `valid` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  UNIQUE KEY `cuid` (`cuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `group_info` WRITE;
/*!40000 ALTER TABLE `group_info` DISABLE KEYS */;

INSERT INTO `group_info` (`id`, `cuid`, `title`, `totalCal`, `totalStep`, `totalClosed`, `headImg`, `joinId`, `createAt`, `valid`)
VALUES
	(1,1,'XDRINGS',10000,5000,30,'https://xrings.oss-cn-shanghai.aliyuncs.com/9648855ecb3c1cb01a0ed4b3e7c907c1.jpg?x-oss-process=style/small','n3b2','1557553348',1);

/*!40000 ALTER TABLE `group_info` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table ringsRank
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ringsRank`;

CREATE TABLE `ringsRank` (
  `year` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `month` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `day` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `weekday` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `userId` int(11) NOT NULL,
  `cal` double NOT NULL,
  `totalCal` double NOT NULL,
  `step` double NOT NULL,
  `totalStep` double NOT NULL DEFAULT 0,
  `closeTimes` int(11) NOT NULL,
  `info` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `refreshAt` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `ts` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`year`,`month`,`day`,`weekday`,`userId`),
  KEY `cal` (`cal`),
  KEY `totalCal` (`totalCal`),
  KEY `closeTimes` (`closeTimes`),
  KEY `ts` (`ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `ringsRank` WRITE;
/*!40000 ALTER TABLE `ringsRank` DISABLE KEYS */;

INSERT INTO `ringsRank` (`year`, `month`, `day`, `weekday`, `userId`, `cal`, `totalCal`, `step`, `totalStep`, `closeTimes`, `info`, `refreshAt`, `ts`)
VALUES
	('2019','4','29','2',1,283.556,283.556,3069.5323001001198,3069.5323001001198,0,'{\"activeEnergyBurned\":283.5560000000002,\"weekday\":2,\"activeEnergyBurnedGoal\":1000,\"appleStandHours\":6,\"month\":4,\"year\":2019,\"appleExerciseTimeGoal\":1800,\"day\":29,\"appleStandHoursGoal\":12,\"appleExerciseTime\":540}','1556522269','1556467200'),
	('2019','5','10','6',1,234.626,3695.3456,1975.3408514767289,42734.71143036323,2,'{\"activeEnergyBurned\":234.6260000000001,\"weekday\":6,\"activeEnergyBurnedGoal\":1000,\"appleStandHours\":5,\"month\":5,\"year\":2019,\"appleExerciseTimeGoal\":1800,\"day\":10,\"appleStandHoursGoal\":12,\"appleExerciseTime\":60}','1557488114','1557417600'),
	('2019','5','6','2',1,1303.817,3695.3456,13813.537562604342,42734.71143036323,2,'{\"activeEnergyBurned\":1303.816954922845,\"weekday\":2,\"activeEnergyBurnedGoal\":1000,\"appleStandHours\":12,\"month\":5,\"year\":2019,\"appleExerciseTimeGoal\":1800,\"day\":6,\"appleStandHoursGoal\":12,\"appleExerciseTime\":9060}','1557488114','1557072000'),
	('2019','5','7','3',1,686.9197,3695.3456,9081.978875353985,42734.71143036323,2,'{\"activeEnergyBurned\":686.9196575009419,\"weekday\":3,\"activeEnergyBurnedGoal\":1000,\"appleStandHours\":12,\"month\":5,\"year\":2019,\"appleExerciseTimeGoal\":1800,\"day\":7,\"appleStandHoursGoal\":12,\"appleExerciseTime\":3300}','1557488114','1557158400'),
	('2019','5','8','4',1,1115.967,3695.3456,9608.427378964941,42734.71143036323,2,'{\"activeEnergyBurned\":1115.9669999999994,\"weekday\":4,\"activeEnergyBurnedGoal\":1000,\"appleStandHours\":12,\"month\":5,\"year\":2019,\"appleExerciseTimeGoal\":1800,\"day\":8,\"appleStandHoursGoal\":12,\"appleExerciseTime\":5520}','1557488114','1557244800'),
	('2019','5','9','5',1,354.016,3695.3456,8255.42676196323,42734.71143036323,2,'{\"activeEnergyBurned\":354.01600000000025,\"weekday\":5,\"activeEnergyBurnedGoal\":1000,\"appleStandHours\":10,\"month\":5,\"year\":2019,\"appleExerciseTimeGoal\":1800,\"day\":9,\"appleStandHoursGoal\":12,\"appleExerciseTime\":600}','1557488114','1557331200');

/*!40000 ALTER TABLE `ringsRank` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sms
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sms`;

CREATE TABLE `sms` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `mobile` varchar(20) NOT NULL DEFAULT '',
  `smscode` varchar(6) NOT NULL DEFAULT '',
  `create_at` varchar(10) NOT NULL DEFAULT '',
  `verify_at` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `sms` WRITE;
/*!40000 ALTER TABLE `sms` DISABLE KEYS */;

INSERT INTO `sms` (`id`, `mobile`, `smscode`, `create_at`, `verify_at`)
VALUES
	(1,'13501801181','555166','1556444943','1557994650'),
	(2,'13501801181','259617','1556445024','1557994650'),
	(3,'13501801181','273508','1556446501','1557994650'),
	(4,'13501801181','406933','1556503724','1557994650'),
	(5,'13501801181','407611','1556504205','1557994650'),
	(6,'13501801181','818060','1556504278','1557994650'),
	(7,'13501801181','513642','1556527200','1557994650'),
	(8,'13501801181','169669','1557481323','1557994650'),
	(9,'13501801181','360198','1557482970','1557994650'),
	(10,'13501801181','179935','1557544495','1557994650'),
	(11,'13501801181','446495','1557994573','1557994650'),
	(12,'13501801181','885675','1557994641','1557994650'),
	(13,'13501801181','885675','1557994641','1557994650'),
	(14,'13501801181','885675','1557994641','1557994650');

/*!40000 ALTER TABLE `sms` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `mobile` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `nickname` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `headImg` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createAt` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `valid` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;

INSERT INTO `user` (`id`, `mobile`, `nickname`, `headImg`, `createAt`, `valid`)
VALUES
	(1,'13501801181','Lizi',NULL,'1556446104',1),
	(2,'13501801181','Lizi2','https://xrings.oss-cn-shanghai.aliyuncs.com/d5e6c237095adb188af9162d802fa5fc.jpg?x-oss-process=style/small','1556446104',1),
	(3,'13501801181','LiziLizi321',NULL,'',1),
	(4,'13501801181','Lizi3',NULL,'',1),
	(5,'13501801181','Lizi3',NULL,'',1),
	(6,'13501801181','Lizi3',NULL,'',1),
	(7,'13501801181','Lizi3321312',NULL,'',1),
	(8,'13501801181','Lizi3321312',NULL,'',1),
	(9,'13501801181','Lizi3321312',NULL,'',1),
	(10,'13501801181','Lizi3321312',NULL,'',1),
	(11,'13501801181','Lizi3321312',NULL,'',1),
	(12,'13501801181','Lizi3321312',NULL,'',1),
	(13,'13501801181','Lizi3321312',NULL,'',1),
	(14,'13501801181','Lizi3321312',NULL,'',1),
	(15,'13501801181','Lizi3321312',NULL,'',1),
	(16,'13501801181','Lizi3321312',NULL,'',1),
	(17,'13501801181','Lizi3321312',NULL,'',1),
	(18,'13501801181','Lizi3321312',NULL,'',1),
	(19,'13501801181','Lizi3321312',NULL,'',1);

/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_group`;

CREATE TABLE `user_group` (
  `userId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `joinAt` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`userId`,`groupId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `user_group` WRITE;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;

INSERT INTO `user_group` (`userId`, `groupId`, `joinAt`)
VALUES
	(1,1,'1557553348'),
	(2,1,'1557553348'),
	(3,1,''),
	(4,1,''),
	(5,1,''),
	(6,1,''),
	(7,1,''),
	(8,1,''),
	(9,1,''),
	(10,1,''),
	(11,1,''),
	(12,1,''),
	(13,1,''),
	(14,1,''),
	(15,1,''),
	(16,1,''),
	(17,1,''),
	(18,1,''),
	(19,1,'');

/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
