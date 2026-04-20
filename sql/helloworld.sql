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

 Date: 20/04/2026 16:33:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for review_rules
-- ----------------------------
DROP TABLE IF EXISTS `review_rules`;
CREATE TABLE `review_rules`  (
  `rule_name` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称(A-G)',
  `offset_days` int NOT NULL COMMENT '时间偏移量(天数)',
  `start_time` time NOT NULL COMMENT '开始时间',
  `end_time` time NOT NULL COMMENT '结束时间',
  PRIMARY KEY (`rule_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '复习规则表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of review_rules
-- ----------------------------
INSERT INTO `review_rules` VALUES ('A', 0, '14:00:00', '16:00:00');
INSERT INTO `review_rules` VALUES ('B', 0, '21:00:00', '23:59:00');
INSERT INTO `review_rules` VALUES ('C', 1, '00:00:00', '23:59:00');
INSERT INTO `review_rules` VALUES ('D', 2, '00:00:00', '23:59:00');
INSERT INTO `review_rules` VALUES ('E', 4, '00:00:00', '23:59:00');
INSERT INTO `review_rules` VALUES ('F', 7, '00:00:00', '23:59:00');
INSERT INTO `review_rules` VALUES ('G', 15, '00:00:00', '23:59:00');

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学习状态表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of word_study_records
-- ----------------------------
INSERT INTO `word_study_records` VALUES (1, 'develop', '2026-04-20 14:00:00-16:00:00', '2026-04-20 21:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-05 00:00:00-23:59:00', '{\"A\": \"已完成\", \"B\": \"已完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 16:20:33');
INSERT INTO `word_study_records` VALUES (2, 'beautiful', '2026-04-20 14:00:00-16:00:00', '2026-04-20 21:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-05 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 16:20:33');
INSERT INTO `word_study_records` VALUES (3, 'computer', '2026-04-20 14:00:00-16:00:00', '2026-04-20 21:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-05 00:00:00-23:59:00', '{\"A\": \"已完成\", \"B\": \"未完成\", \"C\": \"已完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 16:20:33');
INSERT INTO `word_study_records` VALUES (4, 'education', '2026-04-20 14:00:00-16:00:00', '2026-04-20 21:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-05 00:00:00-23:59:00', '{\"A\": \"已完成\", \"B\": \"已完成\", \"C\": \"已完成\", \"D\": \"已完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 16:20:33');
INSERT INTO `word_study_records` VALUES (5, 'apple', '2026-04-20 14:00:00-16:00:00', '2026-04-20 21:00:00-23:59:00', '2026-04-21 00:00:00-23:59:00', '2026-04-22 00:00:00-23:59:00', '2026-04-24 00:00:00-23:59:00', '2026-04-27 00:00:00-23:59:00', '2026-05-05 00:00:00-23:59:00', '{\"A\": \"未完成\", \"B\": \"未完成\", \"C\": \"未完成\", \"D\": \"未完成\", \"E\": \"未完成\", \"F\": \"未完成\", \"G\": \"未完成\"}', 0, '2026-04-20 16:20:33');

-- ----------------------------
-- Table structure for words
-- ----------------------------
DROP TABLE IF EXISTS `words`;
CREATE TABLE `words`  (
  `word` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '英文单词',
  `common_meanings` json NOT NULL COMMENT '常用释义(JSON格式: {\"n.\": [\"常用名词释义1\", \"常用名词释义2\"], \"v.\": [\"常用动词释义1\"]})',
  `uncommon_meanings` json NULL COMMENT '不常用释义(JSON格式: {\"n.\": [\"不常用名词释义1\"], \"adj.\": [\"不常用形容词释义1\"]})',
  `english_examples` json NOT NULL COMMENT '英文例句和中文释义(JSON格式: [{\"en\": \"英文例句\", \"cn\": \"中文释义\"}])',
  `synonyms` json NULL COMMENT '近义词(JSON格式: [{\"word\": \"近义词\", \"meaning\": \"释义\"}])',
  `antonyms` json NULL COMMENT '反义词(JSON格式: [{\"word\": \"反义词\", \"meaning\": \"释义\"}])',
  `derivatives` json NULL COMMENT '派生词(JSON格式: [{\"word\": \"派生词\", \"meaning\": \"释义\", \"type\": \"形容词/副词等\"}])',
  `prefixes` json NULL COMMENT '前缀(JSON格式: [{\"prefix\": \"前缀\", \"meaning\": \"前缀含义\"}])',
  `roots` json NULL COMMENT '词根(JSON格式: [{\"root\": \"词根\", \"meaning\": \"词根含义\"}])',
  `collocations` json NULL COMMENT '词组搭配(JSON格式: [{\"phrase\": \"词组\", \"meaning\": \"释义\"}])',
  `importance_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '重要等级(如: 高、中、低 或 1-5级)',
  `memory_aid` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '辅助记忆(记忆技巧、联想方法等)',
  `imported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '导入时间',
  PRIMARY KEY (`word`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '单词表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of words
-- ----------------------------
INSERT INTO `words` VALUES ('apple', '{\"n.\": [\"苹果\"]}', '{\"n.\": [\"苹果公司\", \"苹果树\"]}', '[{\"cn\": \"我每天早餐都吃一个苹果。\", \"en\": \"I eat an apple every day for breakfast.\"}, {\"cn\": \"苹果树上结满了红苹果。\", \"en\": \"The apple tree is full of red apples.\"}, {\"cn\": \"一天一苹果，医生远离我。\", \"en\": \"An apple a day keeps the doctor away.\"}]', '[{\"word\": \"fruit\", \"meaning\": \"水果\"}]', NULL, NULL, NULL, NULL, '[{\"phrase\": \"apple pie\", \"meaning\": \"苹果派\"}, {\"phrase\": \"apple juice\", \"meaning\": \"苹果汁\"}, {\"phrase\": \"red apple\", \"meaning\": \"红苹果\"}, {\"phrase\": \"green apple\", \"meaning\": \"青苹果\"}]', '低', '记忆技巧：简单水果单词，联想红苹果的形象。Apple公司的标志也是苹果。', '2026-04-20 08:04:00');
INSERT INTO `words` VALUES ('beautiful', '{\"adj.\": [\"美丽的\", \"漂亮的\", \"优美的\"]}', '{\"adj.\": [\"精美的\", \"绝妙的\"]}', '[{\"cn\": \"她是一个有着长发的美丽女孩。\", \"en\": \"She is a beautiful girl with long hair.\"}, {\"cn\": \"日落绝对美丽。\", \"en\": \"The sunset was absolutely beautiful.\"}, {\"cn\": \"今天天气多么美好啊！\", \"en\": \"What a beautiful day it is today!\"}]', '[{\"word\": \"pretty\", \"meaning\": \"漂亮的\"}, {\"word\": \"gorgeous\", \"meaning\": \"华丽的\"}, {\"word\": \"attractive\", \"meaning\": \"有吸引力的\"}, {\"word\": \"lovely\", \"meaning\": \"可爱的\"}]', '[{\"word\": \"ugly\", \"meaning\": \"丑陋的\"}, {\"word\": \"hideous\", \"meaning\": \"可怕的\"}, {\"word\": \"unattractive\", \"meaning\": \"不吸引人的\"}]', '[{\"type\": \"n.\", \"word\": \"beauty\", \"meaning\": \"美丽\"}, {\"type\": \"adv.\", \"word\": \"beautifully\", \"meaning\": \"美丽地\"}, {\"type\": \"v.\", \"word\": \"beautify\", \"meaning\": \"美化\"}, {\"type\": \"n.\", \"word\": \"beautician\", \"meaning\": \"美容师\"}]', NULL, '[{\"root\": \"beaut\", \"meaning\": \"美丽\"}]', '[{\"phrase\": \"beautiful scenery\", \"meaning\": \"美丽的风景\"}, {\"phrase\": \"beautiful weather\", \"meaning\": \"好天气\"}, {\"phrase\": \"beautiful music\", \"meaning\": \"优美的音乐\"}]', '中', '记忆技巧：beauty(美丽) + ful(充满) = 充满美丽的。联想：美女(beauty)充满(ful)魅力。', '2026-04-20 08:01:00');
INSERT INTO `words` VALUES ('computer', '{\"n.\": [\"计算机\", \"电脑\"]}', '{\"n.\": [\"计算者\", \"计算员\"]}', '[{\"cn\": \"我用电脑工作和娱乐。\", \"en\": \"I use my computer for work and entertainment.\"}, {\"cn\": \"电脑崩溃了，丢失了我所有的数据。\", \"en\": \"The computer crashed and lost all my data.\"}, {\"cn\": \"现代电脑比旧电脑快得多。\", \"en\": \"Modern computers are much faster than old ones.\"}]', '[{\"word\": \"PC\", \"meaning\": \"个人电脑\"}, {\"word\": \"laptop\", \"meaning\": \"笔记本电脑\"}, {\"word\": \"machine\", \"meaning\": \"机器\"}, {\"word\": \"desktop\", \"meaning\": \"台式机\"}]', NULL, '[{\"type\": \"n.\", \"word\": \"computing\", \"meaning\": \"计算\"}, {\"type\": \"v.\", \"word\": \"computerize\", \"meaning\": \"使电脑化\"}, {\"type\": \"adj.\", \"word\": \"computerized\", \"meaning\": \"电脑化的\"}]', NULL, '[{\"root\": \"comput\", \"meaning\": \"计算\"}]', '[{\"phrase\": \"computer science\", \"meaning\": \"计算机科学\"}, {\"phrase\": \"computer program\", \"meaning\": \"计算机程序\"}, {\"phrase\": \"personal computer\", \"meaning\": \"个人电脑\"}, {\"phrase\": \"computer graphics\", \"meaning\": \"计算机图形学\"}]', '高', '记忆技巧：compute(计算) + er(者) = 计算者。联想：会计算的机器就是电脑。', '2026-04-20 08:02:00');
INSERT INTO `words` VALUES ('develop', '{\"v.\": [\"开发\", \"发展\", \"培养\"]}', '{\"n.\": [\"显影剂\"], \"adj.\": [\"发达的\"]}', '[{\"cn\": \"我们需要为公司开发新软件。\", \"en\": \"We need to develop new software for our company.\"}, {\"cn\": \"儿童在第一年发展迅速。\", \"en\": \"Children develop rapidly during their first year.\"}, {\"cn\": \"这座城市正在发展成为主要的旅游目的地。\", \"en\": \"The city is developing into a major tourist destination.\"}]', '[{\"word\": \"create\", \"meaning\": \"创造\"}, {\"word\": \"build\", \"meaning\": \"建造\"}, {\"word\": \"grow\", \"meaning\": \"成长\"}, {\"word\": \"evolve\", \"meaning\": \"进化\"}]', '[{\"word\": \"destroy\", \"meaning\": \"破坏\"}, {\"word\": \"decline\", \"meaning\": \"衰退\"}, {\"word\": \"deteriorate\", \"meaning\": \"恶化\"}]', '[{\"type\": \"n.\", \"word\": \"development\", \"meaning\": \"发展\"}, {\"type\": \"n.\", \"word\": \"developer\", \"meaning\": \"开发者\"}, {\"type\": \"adj.\", \"word\": \"developed\", \"meaning\": \"发达的\"}, {\"type\": \"adj.\", \"word\": \"developing\", \"meaning\": \"发展中的\"}]', '[{\"prefix\": \"de-\", \"meaning\": \"向下，去除\"}]', '[{\"root\": \"velop\", \"meaning\": \"包裹，展开\"}]', '[{\"phrase\": \"develop into\", \"meaning\": \"发展成为\"}, {\"phrase\": \"develop a habit\", \"meaning\": \"养成习惯\"}, {\"phrase\": \"software development\", \"meaning\": \"软件开发\"}, {\"phrase\": \"personal development\", \"meaning\": \"个人发展\"}]', '高', '记忆技巧：de(去掉) + velop(包裹) = 去掉包裹，展开发展。联想：开发者(developer)去掉包裹展开新功能。', '2026-04-20 08:00:00');
INSERT INTO `words` VALUES ('education', '{\"n.\": [\"教育\", \"培养\"]}', '{\"n.\": [\"教育学\", \"学历\", \"教养\"]}', '[{\"cn\": \"教育是成功的关键。\", \"en\": \"Education is the key to success.\"}, {\"cn\": \"她在大学接受了良好的教育。\", \"en\": \"She received a good education at university.\"}, {\"cn\": \"政府应该在教育方面投入更多。\", \"en\": \"The government should invest more in education.\"}]', '[{\"word\": \"learning\", \"meaning\": \"学习\"}, {\"word\": \"teaching\", \"meaning\": \"教学\"}, {\"word\": \"instruction\", \"meaning\": \"指导\"}, {\"word\": \"schooling\", \"meaning\": \"学校教育\"}]', '[{\"word\": \"ignorance\", \"meaning\": \"无知\"}]', '[{\"type\": \"adj.\", \"word\": \"educational\", \"meaning\": \"教育的\"}, {\"type\": \"n.\", \"word\": \"educator\", \"meaning\": \"教育者\"}, {\"type\": \"v.\", \"word\": \"educate\", \"meaning\": \"教育\"}, {\"type\": \"adj.\", \"word\": \"educated\", \"meaning\": \"受过教育的\"}]', '[{\"prefix\": \"e-\", \"meaning\": \"出来，向外\"}]', '[{\"root\": \"duc\", \"meaning\": \"引导，领导\"}]', '[{\"phrase\": \"higher education\", \"meaning\": \"高等教育\"}, {\"phrase\": \"education system\", \"meaning\": \"教育系统\"}, {\"phrase\": \"quality education\", \"meaning\": \"优质教育\"}, {\"phrase\": \"adult education\", \"meaning\": \"成人教育\"}]', '高', '记忆技巧：e(出来) + duc(引导) + ation(名词后缀) = 把人引导出来的过程就是教育。', '2026-04-20 08:03:00');
INSERT INTO `words` VALUES ('important', '{\"adj.\": [\"重要的\", \"重大的\"]}', '{\"adj.\": [\"有影响力的\", \"显要的\", \"自负的\"]}', '[{\"cn\": \"这是一个非常重要的会议。\", \"en\": \"This is a very important meeting.\"}, {\"cn\": \"学好英语很重要。\", \"en\": \"It is important to learn English well.\"}, {\"cn\": \"健康比金钱更重要。\", \"en\": \"Health is more important than money.\"}]', '[{\"word\": \"significant\", \"meaning\": \"重要的\"}, {\"word\": \"crucial\", \"meaning\": \"关键的\"}, {\"word\": \"essential\", \"meaning\": \"必要的\"}, {\"word\": \"vital\", \"meaning\": \"至关重要的\"}]', '[{\"word\": \"unimportant\", \"meaning\": \"不重要的\"}, {\"word\": \"trivial\", \"meaning\": \"琐碎的\"}, {\"word\": \"insignificant\", \"meaning\": \"无关紧要的\"}]', '[{\"type\": \"n.\", \"word\": \"importance\", \"meaning\": \"重要性\"}, {\"type\": \"adv.\", \"word\": \"importantly\", \"meaning\": \"重要地\"}]', '[{\"prefix\": \"im-\", \"meaning\": \"进入，使成为\"}]', '[{\"root\": \"port\", \"meaning\": \"携带，运输\"}]', '[{\"phrase\": \"very important\", \"meaning\": \"非常重要\"}, {\"phrase\": \"important role\", \"meaning\": \"重要作用\"}, {\"phrase\": \"important decision\", \"meaning\": \"重要决定\"}]', '高', '记忆技巧：im(进入) + port(港口) + ant(形容词后缀) = 能进入港口的都是重要的货物。', '2026-04-20 08:05:00');
INSERT INTO `words` VALUES ('knowledge', '{\"n.\": [\"知识\", \"学问\"]}', '{\"n.\": [\"了解\", \"认识\", \"学识\"]}', '[{\"cn\": \"知识就是力量。\", \"en\": \"Knowledge is power.\"}, {\"cn\": \"他对计算机很有知识。\", \"en\": \"He has a lot of knowledge about computers.\"}, {\"cn\": \"分享知识帮助每个人学习。\", \"en\": \"Sharing knowledge helps everyone learn.\"}]', '[{\"word\": \"information\", \"meaning\": \"信息\"}, {\"word\": \"learning\", \"meaning\": \"学习\"}, {\"word\": \"wisdom\", \"meaning\": \"智慧\"}, {\"word\": \"expertise\", \"meaning\": \"专业知识\"}]', '[{\"word\": \"ignorance\", \"meaning\": \"无知\"}]', '[{\"type\": \"adj.\", \"word\": \"knowledgeable\", \"meaning\": \"知识渊博的\"}, {\"type\": \"v.\", \"word\": \"know\", \"meaning\": \"知道\"}, {\"type\": \"adj.\", \"word\": \"known\", \"meaning\": \"已知的\"}]', NULL, '[{\"root\": \"know\", \"meaning\": \"知道\"}]', '[{\"phrase\": \"general knowledge\", \"meaning\": \"常识\"}, {\"phrase\": \"knowledge base\", \"meaning\": \"知识库\"}, {\"phrase\": \"prior knowledge\", \"meaning\": \"先验知识\"}]', '高', '记忆技巧：know(知道) + ledge(边缘) = 知道的边缘就是知识的范围。', '2026-04-20 08:07:00');
INSERT INTO `words` VALUES ('understand', '{\"v.\": [\"理解\", \"明白\", \"懂得\"]}', '{\"v.\": [\"体谅\", \"谅解\", \"听说\"]}', '[{\"cn\": \"我明白你的意思。\", \"en\": \"I understand what you mean.\"}, {\"cn\": \"你理解这道数学题吗？\", \"en\": \"Do you understand this math problem?\"}, {\"cn\": \"很难理解他的行为。\", \"en\": \"It is hard to understand his behavior.\"}]', '[{\"word\": \"comprehend\", \"meaning\": \"理解\"}, {\"word\": \"grasp\", \"meaning\": \"掌握\"}, {\"word\": \"realize\", \"meaning\": \"意识到\"}, {\"word\": \"know\", \"meaning\": \"知道\"}]', '[{\"word\": \"misunderstand\", \"meaning\": \"误解\"}]', '[{\"type\": \"n.\", \"word\": \"understanding\", \"meaning\": \"理解\"}, {\"type\": \"adj.\", \"word\": \"understandable\", \"meaning\": \"可理解的\"}, {\"type\": \"adj.\", \"word\": \"understood\", \"meaning\": \"被理解的\"}]', '[{\"prefix\": \"under-\", \"meaning\": \"在...下面\"}]', '[{\"root\": \"stand\", \"meaning\": \"站立\"}]', '[{\"phrase\": \"understand clearly\", \"meaning\": \"清楚理解\"}, {\"phrase\": \"easy to understand\", \"meaning\": \"容易理解\"}, {\"phrase\": \"mutual understanding\", \"meaning\": \"相互理解\"}]', '高', '记忆技巧：under(在下面) + stand(站立) = 站在下面仰视，努力去理解。', '2026-04-20 08:06:00');

SET FOREIGN_KEY_CHECKS = 1;
