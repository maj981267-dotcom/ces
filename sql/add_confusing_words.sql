-- 添加易混淆词字段到words表
ALTER TABLE words 
ADD COLUMN confusing_words JSON NULL COMMENT '易混淆词(JSON格式: [{"word": "易混淆的单词", "meaning": "释义", "difference": "区别说明"}])' 
AFTER collocations;