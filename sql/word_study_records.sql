/*
 Navicat Premium Data Transfer

 Source Server         : db
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43)
 Source Host           : localhost:3306
 Source Schema         : helloworld

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43)
 File Encoding         : 65001

 Date: 20/04/2026 22:28:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for word_study_records
-- ----------------------------
DROP TABLE IF EXISTS `word_study_records`;
CREATE TABLE `word_study_records`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `word` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '英文单词',
  `time_a` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'A时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `time_b` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'B时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `time_c` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'C时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `time_d` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'D时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `time_e` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'E时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `time_f` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'F时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `time_g` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'G时间段(格式: YYYY-MM-DD HH:MM:SS-HH:MM:SS)',
  `completion_status` json NOT NULL COMMENT '完成状态(JSON格式: {\"A\": \"已完成\"/\"未完成\"})',
  `reset_count` int NOT NULL DEFAULT 0 COMMENT '重置次数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `word`(`word` ASC) USING BTREE,
  CONSTRAINT `word_study_records_ibfk_1` FOREIGN KEY (`word`) REFERENCES `words` (`word`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学习状态表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of word_study_records
-- ----------------------------
INSERT INTO `word_study_records` VALUES (41, 'desperate', '2026-04-20 14:00:00-23:59:00', '2026-04-20 22:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-02 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 21:37:23');
INSERT INTO `word_study_records` VALUES (42, 'destination', '2026-04-20 14:00:00-23:59:00', '2026-04-20 22:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-02 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 21:37:23');
INSERT INTO `word_study_records` VALUES (43, 'destiny', '2026-04-20 14:00:00-23:59:00', '2026-04-20 22:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-02 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 21:37:23');
INSERT INTO `word_study_records` VALUES (44, 'destruction', '2026-04-20 14:00:00-23:59:00', '2026-04-20 22:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-02 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 21:37:23');
INSERT INTO `word_study_records` VALUES (45, 'weed', '2026-04-20 14:00:00-23:59:00', '2026-04-20 22:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-02 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 21:37:23');

SET FOREIGN_KEY_CHECKS = 1;
