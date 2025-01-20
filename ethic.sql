/*
 Navicat MySQL Dump SQL

 Source Server         : ethic
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : ethic

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 16/01/2025 17:32:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for committee
-- ----------------------------
DROP TABLE IF EXISTS `committee`;
CREATE TABLE `committee`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `pre_name_id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `surname` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `position_id` bigint UNSIGNED NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tel_no` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  INDEX `committee_pre_name_id_pre_name_id_fk`(`pre_name_id` ASC) USING BTREE,
  INDEX `committee_position_id_committee_position_id_fk`(`position_id` ASC) USING BTREE,
  CONSTRAINT `committee_position_id_committee_position_id_fk` FOREIGN KEY (`position_id`) REFERENCES `committee_position` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `committee_pre_name_id_pre_name_id_fk` FOREIGN KEY (`pre_name_id`) REFERENCES `pre_name` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of committee
-- ----------------------------
INSERT INTO `committee` VALUES (1, 1, 'Test', 'Committee', 2, 'Test Committee', '098-7654321', '2025-01-08 13:47:36', '2025-01-08 13:47:36');
INSERT INTO `committee` VALUES (2, 1, 'สมชาย', 'ขายดี', 1, 'กรรมการ', '097-6542314', '2025-01-15 17:09:41', '2025-01-15 17:09:41');

-- ----------------------------
-- Table structure for committee_position
-- ----------------------------
DROP TABLE IF EXISTS `committee_position`;
CREATE TABLE `committee_position`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of committee_position
-- ----------------------------
INSERT INTO `committee_position` VALUES (1, 'อนุกรรมการ');
INSERT INTO `committee_position` VALUES (2, 'กรรมการ');

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tel_no` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `faculty_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  INDEX `department_faculty_id_faculty_id_fk`(`faculty_id` ASC) USING BTREE,
  CONSTRAINT `department_faculty_id_faculty_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 55 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of department
-- ----------------------------
INSERT INTO `department` VALUES (1, 'นาฏศิลป์', '123-4567890', 1);
INSERT INTO `department` VALUES (2, 'คณิตศาสตร์', '123-4567891', 1);
INSERT INTO `department` VALUES (3, 'การศึกษาปฐมวัย', '123-4567892', 1);
INSERT INTO `department` VALUES (4, 'เทคโนโลยีและคอมพิวเตอร์เพื่อการศึกษา', '123-4567893', 1);
INSERT INTO `department` VALUES (5, 'สังคมศึกษา', '123-4567894', 1);
INSERT INTO `department` VALUES (6, 'ภาษาอังกฤษ', '123-4567895', 1);
INSERT INTO `department` VALUES (7, 'วิทยาศาสตร์ทั่วไป', '123-4567896', 1);
INSERT INTO `department` VALUES (8, 'ภาษาไทย', '123-4567897', 1);
INSERT INTO `department` VALUES (9, 'ศิลปศึกษา', '123-4567898', 1);
INSERT INTO `department` VALUES (10, 'ดนตรีศึกษา', '123-4567899', 1);
INSERT INTO `department` VALUES (11, 'พลศึกษา', '123-4567900', 1);
INSERT INTO `department` VALUES (12, 'ฟิสิกส์', '123-4567901', 1);
INSERT INTO `department` VALUES (13, 'การพัฒนาสังคม', '123-4567902', 2);
INSERT INTO `department` VALUES (14, 'ภาษาไทย', '123-4567903', 2);
INSERT INTO `department` VALUES (15, 'บรรณารักษ์ศาสตร์และสารสนเทศศาสตร์', '123-4567904', 2);
INSERT INTO `department` VALUES (16, 'ภาษาอังกฤษ', '123-4567905', 2);
INSERT INTO `department` VALUES (17, 'ภาษาอังกฤษธุรกิจ', '123-4567906', 2);
INSERT INTO `department` VALUES (18, 'ดนตรีสากล', '123-4567907', 2);
INSERT INTO `department` VALUES (19, 'ศิลปะดิจิทัล', '123-4567908', 2);
INSERT INTO `department` VALUES (20, 'รัฐประศาสนศาสตร์', '123-4567909', 2);
INSERT INTO `department` VALUES (21, 'นิติศาสตร์', '123-4567910', 2);
INSERT INTO `department` VALUES (22, 'การบัญชี', '123-4567911', 3);
INSERT INTO `department` VALUES (23, 'การสื่อสารมวลชน', '123-4567912', 3);
INSERT INTO `department` VALUES (24, 'การท่องเที่ยวและการโรงแรม', '123-4567913', 3);
INSERT INTO `department` VALUES (25, 'เศรษฐศาสตร์', '123-4567914', 3);
INSERT INTO `department` VALUES (26, 'การเงินและการธนาคาร', '123-4567915', 3);
INSERT INTO `department` VALUES (27, 'การจัดการ', '123-4567916', 3);
INSERT INTO `department` VALUES (28, 'การตลาด', '123-4567917', 3);
INSERT INTO `department` VALUES (29, 'การบริหารทรัพยากรมนุษย์', '123-4567918', 3);
INSERT INTO `department` VALUES (30, 'คอมพิวเตอร์ธุรกิจ', '123-4567919', 3);
INSERT INTO `department` VALUES (31, 'ภูมิสารสนเทศ', '123-4567920', 4);
INSERT INTO `department` VALUES (32, 'เคมี', '123-4567921', 4);
INSERT INTO `department` VALUES (33, 'วิทยาศาสตร์สิ่งแวดล้อม', '123-4567922', 4);
INSERT INTO `department` VALUES (34, 'สาธารณสุขศาสตร์', '123-4567923', 4);
INSERT INTO `department` VALUES (35, 'สถิติประยุกต์และวิทยาการสารสนเทศ', '123-4567924', 4);
INSERT INTO `department` VALUES (36, 'ชีววิทยา', '123-4567925', 4);
INSERT INTO `department` VALUES (37, 'เทคโนโลยีสารสนเทศ', '123-4567926', 4);
INSERT INTO `department` VALUES (38, 'วิทยาการคอมพิวเตอร์', '123-4567927', 4);
INSERT INTO `department` VALUES (39, 'คณิตศาสตร์', '123-4567928', 4);
INSERT INTO `department` VALUES (40, 'วิทยาศาสตร์การกีฬา', '123-4567929', 4);
INSERT INTO `department` VALUES (41, 'การออกแบบแฟชั่นและธุรกิจสิ่งทอ', '123-4567930', 4);
INSERT INTO `department` VALUES (42, 'ศิลปะและการออกแบบ', '123-4567931', 5);
INSERT INTO `department` VALUES (43, 'เทคโนโลยีสถาปัตยกรรม', '123-4567932', 5);
INSERT INTO `department` VALUES (44, 'วิศวกรรมการจัดการอุตสาหกรรม', '123-4567933', 5);
INSERT INTO `department` VALUES (45, 'เทคโนโลยีวิศวกรรมโยธา', '123-4567934', 5);
INSERT INTO `department` VALUES (46, 'เทคโนโลยีวิศวกรรมไฟฟ้า', '123-4567935', 5);
INSERT INTO `department` VALUES (47, 'เทคโนโลยีเซรามิกส์และการออกแบบ', '123-4567936', 5);
INSERT INTO `department` VALUES (48, 'เทคโนโลยีไฟฟ้าและอิเล็กทรอนิกส์', '123-4567937', 5);
INSERT INTO `department` VALUES (49, 'สาขาวิชาเกษตรศาสตร์ กลุ่มวิชานวัตกรรมการผลิตพืช', '123-4567938', 6);
INSERT INTO `department` VALUES (50, 'สาขาวิชาเกษตรศาสตร์ กลุ่มวิชาเทคโนโลยีการเพาะเลี้ยงสัตว์น้ำ', '123-4567939', 6);
INSERT INTO `department` VALUES (51, 'สาขาวิชานวัตกรรมอาหารและแปรรูป', '123-4567940', 6);
INSERT INTO `department` VALUES (52, 'สัตวศาสตร์', '123-4567941', 6);
INSERT INTO `department` VALUES (53, 'พยาบาลศาสตร์', '123-4567942', 7);
INSERT INTO `department` VALUES (54, 'บัณฑิตวิทยาลัย', '123-4567943', 8);

-- ----------------------------
-- Table structure for faculty
-- ----------------------------
DROP TABLE IF EXISTS `faculty`;
CREATE TABLE `faculty`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tel_no` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of faculty
-- ----------------------------
INSERT INTO `faculty` VALUES (1, 'คณะครุศาสตร์', '123-4567890');
INSERT INTO `faculty` VALUES (2, 'คณะมนุษยศาสตร์และสังคมศาสตร์', '234-5678901');
INSERT INTO `faculty` VALUES (3, 'คณะวิทยาการจัดการ', '345-6789012');
INSERT INTO `faculty` VALUES (4, 'คณะวิทยาศาสตร์', '456-7890123');
INSERT INTO `faculty` VALUES (5, 'คณะเทคโนโลยีอุตสาหกรรม', '567-8901234');
INSERT INTO `faculty` VALUES (6, 'คณะเทคโนโลยีการเกษตร', '678-9012345');
INSERT INTO `faculty` VALUES (7, 'พยาบาลศาสตร์', '789-0123456');
INSERT INTO `faculty` VALUES (8, 'บัณฑิตวิทยาลัย', '890-123-4567');

-- ----------------------------
-- Table structure for petition
-- ----------------------------
DROP TABLE IF EXISTS `petition`;
CREATE TABLE `petition`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `correspondence_no` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title_th` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `objective_id` bigint UNSIGNED NOT NULL,
  `objective_other` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `grant_id` bigint UNSIGNED NOT NULL,
  `grant_other` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `research_type_id` bigint UNSIGNED NULL DEFAULT NULL,
  `current_level_id` bigint UNSIGNED NOT NULL,
  `researcher_id` bigint UNSIGNED NOT NULL,
  `type_id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  INDEX `petition_objective_id_petition_objective_type_id_fk`(`objective_id` ASC) USING BTREE,
  INDEX `petition_grant_id_petition_grant_id_fk`(`grant_id` ASC) USING BTREE,
  INDEX `petition_research_type_id_petition_research_type_id_fk`(`research_type_id` ASC) USING BTREE,
  INDEX `petition_current_level_id_petition_level_id_fk`(`current_level_id` ASC) USING BTREE,
  INDEX `petition_type_id_petition_type_id_fk`(`type_id` ASC) USING BTREE,
  INDEX `petition_status_id_petition_status_id_fk`(`status_id` ASC) USING BTREE,
  INDEX `petition_staff_id_staff_id_fk`(`staff_id` ASC) USING BTREE,
  CONSTRAINT `petition_current_level_id_petition_level_id_fk` FOREIGN KEY (`current_level_id`) REFERENCES `petition_level` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_grant_id_petition_grant_id_fk` FOREIGN KEY (`grant_id`) REFERENCES `petition_grant` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_objective_id_petition_objective_type_id_fk` FOREIGN KEY (`objective_id`) REFERENCES `petition_objective_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_research_type_id_petition_research_type_id_fk` FOREIGN KEY (`research_type_id`) REFERENCES `petition_research_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_staff_id_staff_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_status_id_petition_status_id_fk` FOREIGN KEY (`status_id`) REFERENCES `petition_status` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_type_id_petition_type_id_fk` FOREIGN KEY (`type_id`) REFERENCES `petition_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 66 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition
-- ----------------------------
INSERT INTO `petition` VALUES (1, '100/1', 'ทดสอบคำร้อง', 'Test Petition', 3, 'test', 3, 'test', 1, 1, 1, 1, 1, 'เอกสารครบถ้วน รอการตรวจสอบจากคณะกรรมการ', 1, '2025-01-08 14:17:11', '2025-01-08 14:17:11');
INSERT INTO `petition` VALUES (64, '100/2', 'ทดสอบคำร้อง2', 'Test Petition2', 1, NULL, 2, NULL, NULL, 1, 1, 1, 1, '', 1, '2025-01-15 18:06:54', '2025-01-15 18:06:54');
INSERT INTO `petition` VALUES (65, '100/4', 'ฟวาหก', 'skfslfk', 1, NULL, 1, NULL, NULL, 1, 53, 1, 1, '', 1, '2025-01-16 10:18:18', '2025-01-16 10:18:18');

-- ----------------------------
-- Table structure for petition_committee
-- ----------------------------
DROP TABLE IF EXISTS `petition_committee`;
CREATE TABLE `petition_committee`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `petition_id` bigint UNSIGNED NOT NULL,
  `level_id` bigint UNSIGNED NULL DEFAULT NULL,
  `committee_id` bigint UNSIGNED NOT NULL,
  `status_id` bigint UNSIGNED NULL DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `approvedByStaff` bigint UNSIGNED NOT NULL,
  `appreoved_at` timestamp NOT NULL DEFAULT (now()),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  INDEX `petition_committee_petition_id_petition_id_fk`(`petition_id` ASC) USING BTREE,
  INDEX `petition_committee_level_id_petition_level_id_fk`(`level_id` ASC) USING BTREE,
  INDEX `petition_committee_committee_id_committee_id_fk`(`committee_id` ASC) USING BTREE,
  INDEX `petition_committee_status_id_petition_status_id_fk`(`status_id` ASC) USING BTREE,
  INDEX `petition_committee_approvedByStaff_staff_id_fk`(`approvedByStaff` ASC) USING BTREE,
  CONSTRAINT `petition_committee_approvedByStaff_staff_id_fk` FOREIGN KEY (`approvedByStaff`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_committee_committee_id_committee_id_fk` FOREIGN KEY (`committee_id`) REFERENCES `committee` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_committee_level_id_petition_level_id_fk` FOREIGN KEY (`level_id`) REFERENCES `petition_level` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_committee_petition_id_petition_id_fk` FOREIGN KEY (`petition_id`) REFERENCES `petition` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_committee_status_id_petition_status_id_fk` FOREIGN KEY (`status_id`) REFERENCES `petition_status` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_committee
-- ----------------------------
INSERT INTO `petition_committee` VALUES (1, 1, 2, 1, 2, 'ผ่านการพิจารณารอบแรก', 1, '2025-01-08 14:20:28', '2025-01-08 14:20:28');
INSERT INTO `petition_committee` VALUES (2, 1, 2, 1, 1, 'Test note', 1, '2025-01-08 16:42:25', '2025-01-08 16:42:25');

-- ----------------------------
-- Table structure for petition_document_type
-- ----------------------------
DROP TABLE IF EXISTS `petition_document_type`;
CREATE TABLE `petition_document_type`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_document_type
-- ----------------------------
INSERT INTO `petition_document_type` VALUES (1, 'แบบเสนอโครงการวิจัยเพื่อขอรับการรับรอง (protocol)');
INSERT INTO `petition_document_type` VALUES (2, 'ข้อเสนอโครงการวิจัยฉบับเต็ม (full Proposal)');
INSERT INTO `petition_document_type` VALUES (3, 'ประวัติส่วนตัว/ผลงานของผู้วิจัย');
INSERT INTO `petition_document_type` VALUES (4, 'เอกสารผ่านการอบรมจริยธรรมการวิจัยของผู้วิจัยและผู้ร่วมโครงการวิจัย');
INSERT INTO `petition_document_type` VALUES (5, 'แบบประเมินโครงการวิจัยด้วยตนเอง (Self-Assessment Form)');
INSERT INTO `petition_document_type` VALUES (6, 'การขัดแย้งทางผลประโยชน์ (Conflict of interest)');
INSERT INTO `petition_document_type` VALUES (7, 'เอกสารชี้แจงผู้เข้าร่วมการวิจัย (Participant information sheet)');
INSERT INTO `petition_document_type` VALUES (8, 'หนังสือแสดงเจตนายินยอมเข้าร่วมการวิจัย (Informed consent form)');
INSERT INTO `petition_document_type` VALUES (9, 'แบบบันทึกข้อมูลสำหรับการวิจัย (Case record form) (ถ้ามี)');
INSERT INTO `petition_document_type` VALUES (10, 'แบบสอบถาม (Questionnaire) (ถ้ามี)');
INSERT INTO `petition_document_type` VALUES (11, 'Investigator’s brochure / ทะเบียนและเอกสารกำกับยาหรือเครื่องมือ (ถ้ามี)');

-- ----------------------------
-- Table structure for petition_files
-- ----------------------------
DROP TABLE IF EXISTS `petition_files`;
CREATE TABLE `petition_files`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `extension` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `md5` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `petition_id` bigint UNSIGNED NOT NULL,
  `document_type_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  UNIQUE INDEX `petition_files_md5_unique`(`md5` ASC) USING BTREE,
  INDEX `petition_files_petition_id_petition_id_fk`(`petition_id` ASC) USING BTREE,
  INDEX `petition_files_document_type_id_petition_document_type_id_fk`(`document_type_id` ASC) USING BTREE,
  CONSTRAINT `petition_files_document_type_id_petition_document_type_id_fk` FOREIGN KEY (`document_type_id`) REFERENCES `petition_document_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `petition_files_petition_id_petition_id_fk` FOREIGN KEY (`petition_id`) REFERENCES `petition` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of petition_files
-- ----------------------------
INSERT INTO `petition_files` VALUES (33, '538795306691854718_โครงการรับหมวกและเข็มเลื่อนชั้นปี รุ่นที่13 - 2 พค 2567 ล่าสุด.docx  5 พ.ย.pdf', '.pdf', '99c21f236775c0127d88ed90a45b2f78', 64, 1, '2025-01-15 18:06:54');
INSERT INTO `petition_files` VALUES (34, 'รายชื่อนิสติพยาบาลศาสตรบัณฑิต-ชั้นปีที่-2.pdf', '.pdf', '2d9712c40883bb8b44fe2e40b7d9eaf2', 65, 1, '2025-01-16 10:18:18');
INSERT INTO `petition_files` VALUES (35, 'ใบงาน-Class#2.pdf', '.pdf', '524fde89af4ce952139d189670890326', 65, 2, '2025-01-16 10:18:18');

-- ----------------------------
-- Table structure for petition_grant
-- ----------------------------
DROP TABLE IF EXISTS `petition_grant`;
CREATE TABLE `petition_grant`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_grant
-- ----------------------------
INSERT INTO `petition_grant` VALUES (1, 'มรภ.บร.');
INSERT INTO `petition_grant` VALUES (2, 'ส่วนตัว');
INSERT INTO `petition_grant` VALUES (3, 'แหล่งทุนภายนอก (โปรดระบุ)');

-- ----------------------------
-- Table structure for petition_level
-- ----------------------------
DROP TABLE IF EXISTS `petition_level`;
CREATE TABLE `petition_level`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_level
-- ----------------------------
INSERT INTO `petition_level` VALUES (1, 'ขั้นอนุกรรมการ');
INSERT INTO `petition_level` VALUES (2, 'ขั้นกรรมการ');

-- ----------------------------
-- Table structure for petition_objective_type
-- ----------------------------
DROP TABLE IF EXISTS `petition_objective_type`;
CREATE TABLE `petition_objective_type`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_objective_type
-- ----------------------------
INSERT INTO `petition_objective_type` VALUES (1, 'การศึกษาวิจัย');
INSERT INTO `petition_objective_type` VALUES (2, 'การขอขึ้นทะเบียนยาในประเทศ');
INSERT INTO `petition_objective_type` VALUES (3, 'อื่น ๆ (โปรดระบุ)');

-- ----------------------------
-- Table structure for petition_research_type
-- ----------------------------
DROP TABLE IF EXISTS `petition_research_type`;
CREATE TABLE `petition_research_type`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_research_type
-- ----------------------------
INSERT INTO `petition_research_type` VALUES (1, 'ทั่วไป (เกี่ยวข้องกับมนุษย์โดยตรง)');
INSERT INTO `petition_research_type` VALUES (2, 'ความเสี่ยงต่ำ (เช่น ศึกษาข้อมูลย้อนหลังจากเวชระเบียน บทความ  บทสัมภาษณ์ \r\n		        แบบสอบถาม ศึกษาสิ่งส่งตรวจต่างๆ จากร่างกาย เป็นต้น)');
INSERT INTO `petition_research_type` VALUES (3, 'เข้าข่ายยกเว้นการรับรอง');

-- ----------------------------
-- Table structure for petition_status
-- ----------------------------
DROP TABLE IF EXISTS `petition_status`;
CREATE TABLE `petition_status`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_status
-- ----------------------------
INSERT INTO `petition_status` VALUES (1, 'รออนุมัติ');
INSERT INTO `petition_status` VALUES (2, 'อนุมัติแล้ว');
INSERT INTO `petition_status` VALUES (3, 'ไม่ผ่านการอนุมัติ');

-- ----------------------------
-- Table structure for petition_type
-- ----------------------------
DROP TABLE IF EXISTS `petition_type`;
CREATE TABLE `petition_type`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of petition_type
-- ----------------------------
INSERT INTO `petition_type` VALUES (1, 'งานวิจัย');
INSERT INTO `petition_type` VALUES (2, 'ทุนสนับสนุน');
INSERT INTO `petition_type` VALUES (3, 'อื่น ๆ (โปรดระบุ)');

-- ----------------------------
-- Table structure for pre_name
-- ----------------------------
DROP TABLE IF EXISTS `pre_name`;
CREATE TABLE `pre_name`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of pre_name
-- ----------------------------
INSERT INTO `pre_name` VALUES (1, 'นาย');
INSERT INTO `pre_name` VALUES (2, 'นาง');
INSERT INTO `pre_name` VALUES (3, 'นางสาว');
INSERT INTO `pre_name` VALUES (4, 'ดร.');
INSERT INTO `pre_name` VALUES (5, 'ศาสตราจารย์เกียรติคุณ (กิตติคุณ)');
INSERT INTO `pre_name` VALUES (6, 'ศาสตราจารย์');
INSERT INTO `pre_name` VALUES (7, 'รองศาสตราจารย์');
INSERT INTO `pre_name` VALUES (8, 'ผู้ช่วยศาสตราจารย์');

-- ----------------------------
-- Table structure for researcher
-- ----------------------------
DROP TABLE IF EXISTS `researcher`;
CREATE TABLE `researcher`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `pre_name_id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `surname` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `department_id` bigint UNSIGNED NOT NULL,
  `tel_no` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  INDEX `researcher_pre_name_id_pre_name_id_fk`(`pre_name_id` ASC) USING BTREE,
  INDEX `researcher_department_id_department_id_fk`(`department_id` ASC) USING BTREE,
  CONSTRAINT `researcher_department_id_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `researcher_pre_name_id_pre_name_id_fk` FOREIGN KEY (`pre_name_id`) REFERENCES `pre_name` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of researcher
-- ----------------------------
INSERT INTO `researcher` VALUES (1, 1, 'ปิยดนัย', 'โครงกลาง', 37, '0628658535', '650112418059@bru.ac.th', '2025-01-08 13:40:28', '2025-01-08 13:40:28');
INSERT INTO `researcher` VALUES (3, 1, 'อภิสิทธิ์', 'สุขคำชา', 4, '0643518554', 'J8boy04@gmail.com', '2025-01-12 17:31:25', '2025-01-12 17:31:25');
INSERT INTO `researcher` VALUES (53, 1, 'นพดล', 'คงกันเอง', 37, '0881038204', 'peesamgamer29@gmail.com', '2025-01-15 15:38:56', '2025-01-15 15:38:56');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'Admin');
INSERT INTO `roles` VALUES (2, 'Researcher');
INSERT INTO `roles` VALUES (3, 'committee');

-- ----------------------------
-- Table structure for staff
-- ----------------------------
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `surname` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tel_no` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE,
  UNIQUE INDEX `staff_email_unique`(`email` ASC) USING BTREE,
  INDEX `staff_role_id_roles_id_fk`(`role_id` ASC) USING BTREE,
  CONSTRAINT `staff_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of staff
-- ----------------------------
INSERT INTO `staff` VALUES (1, 'admin@gmail.com', 'Admin', 'Test', '081-1234567', 1, '2025-01-08 13:35:38');

SET FOREIGN_KEY_CHECKS = 1;
